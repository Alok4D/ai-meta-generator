import { NextResponse } from 'next/server';

function extractNumericId(input: string): string | null {
    if (!input) return null;
    const trimmed = input.trim();
    
    // Check if it's already a plain number
    if (/^\d{5,20}$/.test(trimmed)) {
        return trimmed;
    }
    
    // Check URL pattern: contributor/213239991/...
    const contribMatch = trimmed.match(/contributor\/(\d+)/i);
    if (contribMatch && contribMatch[1]) return contribMatch[1];
    
    // Check URL pattern: stock.adobe.com/.../2248162728 or /images/.../2248162728
    const assetMatch = trimmed.match(/\/(\d{6,20})(?:[/?#]|$)/);
    if (assetMatch && assetMatch[1]) return assetMatch[1];
    
    // Extract any sequence of 6-20 digits in the string
    const anyDigits = trimmed.match(/\b\d{6,20}\b/);
    if (anyDigits && anyDigits[0]) return anyDigits[0];
    
    return null;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            mode = 'contributor', // 'contributor' | 'asset'
            query,
            sortBy = 'downloads', // 'downloads' | 'relevance' | 'creation'
            fileType = 'all',     // 'all' | 'photo' | 'illustration' | 'vector' | 'video' | 'template' | '3d'
            aiContent = 'all',    // 'all' | 'only' | 'exclude'
            maxItems = 14,
            apiKey
        } = body;

        const token = (apiKey && apiKey.trim()) || process.env.APIFY_API_KEY;
        if (!token) {
            return NextResponse.json({
                error: 'Apify API key is required. Please add your key in API Settings.'
            }, { status: 400 });
        }

        const numericId = extractNumericId(query);
        if (!numericId) {
            return NextResponse.json({
                error: mode === 'contributor' 
                    ? 'Please provide a valid Adobe Contributor ID or profile link (e.g. 213239991 or https://stock.adobe.com/contributor/213239991/...)'
                    : 'Please provide a valid Adobe Stock File ID or link (e.g. 2248162728)'
            }, { status: 400 });
        }

        // Build Apify Actor input
        const actorInput: Record<string, any> = {
            maxItems: mode === 'asset' ? 1 : Math.min(Math.max(Number(maxItems) || 14, 1), 100),
            sortBy: sortBy === 'creation' ? 'creation' : (sortBy === 'relevance' ? 'relevance' : 'downloads'),
            trackChanges: false,
            premium: 'all',
            orientation: 'all',
            releases: 'all',
            isolatedOnly: false,
            transparentOnly: false,
            copySpaceOnly: false,
            iconType: 'all',
            videoDuration: 'all',
            loopsOnly: false,
            includeOffensive: false,
            language: 'en_US'
        };

        if (mode === 'contributor') {
            actorInput.creatorIds = [numericId];
        } else {
            actorInput.assetIds = [numericId];
        }

        // Content types & premium filter
        if (fileType && fileType !== 'all') {
            const lowerType = fileType.toLowerCase();
            if (lowerType === 'images') {
                actorInput.contentTypes = ['photo', 'vector', 'illustration'];
            } else if (lowerType === 'free') {
                actorInput.premium = 'free';
            } else if (lowerType === 'premium') {
                actorInput.premium = 'premium';
            } else if (lowerType === 'audio') {
                actorInput.contentTypes = ['audio'];
            } else {
                const typeMap: Record<string, string> = {
                    photos: 'photo',
                    photo: 'photo',
                    vectors: 'vector',
                    vector: 'vector',
                    illustrations: 'illustration',
                    illustration: 'illustration',
                    videos: 'video',
                    video: 'video',
                    templates: 'template',
                    template: 'template',
                    '3d': '3d'
                };
                const mapped = typeMap[lowerType] || fileType;
                actorInput.contentTypes = [mapped];
            }
        }

        // AI generated filter
        if (aiContent === 'only') {
            actorInput.aiGenerated = 'only';
        } else if (aiContent === 'exclude') {
            actorInput.aiGenerated = 'exclude';
        } else {
            actorInput.aiGenerated = 'all';
        }

        // Run Apify Actor synchronously
        const actorEndpoint = `https://api.apify.com/v2/acts/clearpath~adobe-stock-scraper/run-sync-get-dataset-items?token=${token}&timeout=120`;
        
        const apifyRes = await fetch(actorEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(actorInput)
        });

        if (!apifyRes.ok) {
            const errText = await apifyRes.text();
            let parsedErr: any = {};
            try { parsedErr = JSON.parse(errText); } catch (_) {}
            const msg = parsedErr.error?.message || errText || 'Apify run failed';
            
            if (apifyRes.status === 401) {
                return NextResponse.json({ error: 'Apify API key is invalid or expired. Please check your API Settings.' }, { status: 401 });
            }
            if (apifyRes.status === 403 || msg.includes('credit') || msg.includes('limit')) {
                return NextResponse.json({ error: 'Apify monthly usage limit reached. Please verify your Apify credit in API Settings.' }, { status: 403 });
            }
            return NextResponse.json({ error: msg }, { status: apifyRes.status });
        }

        const rawItems = await apifyRes.json();
        const items = Array.isArray(rawItems) ? rawItems : [];

        if (items.length === 0) {
            return NextResponse.json({
                mode,
                query: numericId,
                items: [],
                summary: {
                    creatorName: mode === 'contributor' ? `Contributor #${numericId}` : undefined,
                    creatorId: numericId,
                    totalAssets: 0,
                    sampleDownloads: 0,
                    avgDownloads: 0,
                    medianDownloads: 0
                },
                message: mode === 'contributor' 
                    ? 'No assets found for this contributor with the selected filters.'
                    : 'Asset not found with ID ' + numericId
            });
        }

        // Extract and aggregate creator info
        const first = items[0] || {};
        const creatorName = first.creatorName || `Contributor ${numericId}`;
        const creatorCountry = first.creatorCountry || '';
        const creatorUrl = first.creatorUrl || `https://stock.adobe.com/contributor/${numericId}`;
        
        // Calculate downloads analytics
        const downloadsArr = items
            .map(i => Number(i.downloads))
            .filter(d => Number.isFinite(d) && d >= 0)
            .sort((a, b) => a - b);
        
        const totalSampleDownloads = downloadsArr.reduce((sum, d) => sum + d, 0);
        const avgDownloads = downloadsArr.length ? Math.round(totalSampleDownloads / downloadsArr.length) : 0;
        
        let medianDownloads = 0;
        if (downloadsArr.length > 0) {
            const mid = Math.floor(downloadsArr.length / 2);
            const val1 = downloadsArr[mid] ?? 0;
            const val0 = downloadsArr[mid - 1] ?? val1;
            medianDownloads = downloadsArr.length % 2 !== 0 ? val1 : Math.round((val0 + val1) / 2);
        }

        // Clean & normalize items
        const normalizedItems = items.map((item, index) => {
            const dl = Number(item.downloads) || 0;
            let demandTag = 'Average';
            let demandTone = 'avg'; // 'top', 'strong', 'avg', 'low'

            if (medianDownloads > 0) {
                if (dl >= medianDownloads * 3 || dl >= 10) {
                    demandTag = 'Top Performer';
                    demandTone = 'top';
                } else if (dl >= medianDownloads * 1.5) {
                    demandTag = 'Strong Demand';
                    demandTone = 'strong';
                } else if (dl === 0) {
                    demandTag = 'New / Zero DL';
                    demandTone = 'low';
                }
            } else if (dl > 0) {
                demandTag = 'Has Downloads';
                demandTone = 'strong';
            }

            return {
                id: item.id,
                stockId: item.stockId,
                title: item.title || 'Untitled Asset',
                url: item.url || `https://stock.adobe.com/${item.id}`,
                mediaType: item.mediaType || (item.isVector ? 'Vector' : item.isVideo ? 'Video' : item.is3d ? '3D' : 'Photo'),
                fileFormat: item.fileFormat || item.fileExtension || '',
                creatorId: item.creatorId || numericId,
                creatorName: item.creatorName || creatorName,
                categoryName: item.categoryName || 'General',
                keywords: Array.isArray(item.keywords) ? item.keywords : [],
                downloads: Number(item.downloads) ?? 0,
                views: Number(item.views) ?? 0,
                width: item.width,
                height: item.height,
                createdAt: item.createdAt,
                thumbnailUrl: item.thumbnailLargeUrl || item.thumbnailUrl || (item.thumbnails && item.thumbnails['500']?.url),
                isGenerativeAi: Boolean(item.isGenerativeAi || item.isFireflyGenerated),
                isVector: Boolean(item.isVector),
                isVideo: Boolean(item.isVideo),
                isPurchasable: item.isPurchasable !== false,
                demandTag,
                demandTone,
                position: index + 1
            };
        });

        return NextResponse.json({
            mode,
            query: numericId,
            items: normalizedItems,
            summary: {
                creatorName,
                creatorId: numericId,
                creatorCountry,
                creatorUrl,
                totalLoaded: normalizedItems.length,
                totalSampleDownloads,
                avgDownloads,
                medianDownloads
            }
        });

    } catch (error: any) {
        console.error('Adobe Tracker API Error:', error);
        return NextResponse.json({
            error: error.message || 'Internal server error while searching Adobe Stock'
        }, { status: 500 });
    }
}
