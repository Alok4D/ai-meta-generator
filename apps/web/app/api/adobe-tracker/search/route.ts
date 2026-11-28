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

async function fetchAssetViaScraperApi(assetId: string) {
    const scraperApiKey = (process.env.SCRAPER_API_KEY || '').replace(/[^a-zA-Z0-9]/g, '');
    if (!scraperApiKey) return null;

    try {
        const targetUrl = `https://stock.adobe.com/Ajax/MediaData/${assetId}?full=1`;
        const scraperUrl = `https://api.scraperapi.com?api_key=${scraperApiKey}&render=true&country_code=us&url=${encodeURIComponent(targetUrl)}`;

        const res = await fetch(scraperUrl, { signal: AbortSignal.timeout(45000) });
        if (!res.ok) return null;

        const rawData = await res.text();
        const cleaned = rawData.replace(/<[^>]+>/g, '').trim();
        const d = JSON.parse(cleaned);
        if (!d || !d.content_id) return null;

        const rawKeywords = Array.isArray(d.keywords)
            ? d.keywords.map((k: any) => (typeof k === 'string' ? k : k?.name || '')).filter(Boolean)
            : [];

        const isVideo = Boolean(d.is_video || String(d.media_type_label || d.asset_type || '').toLowerCase().includes('video'));
        const contentUrl = d.content_url
            ? (d.content_url.startsWith('http') ? d.content_url : `https://stock.adobe.com${d.content_url}`)
            : `https://stock.adobe.com/${assetId}`;

        return {
            id: d.content_id || assetId,
            stockId: String(d.content_id || assetId),
            title: d.title || 'Untitled Asset',
            url: contentUrl,
            mediaType: d.media_type_label || d.asset_type || (isVideo ? 'Video' : 'Image'),
            fileFormat: d.format || d.file_extension || '',
            creatorId: d.creator_id || '',
            creatorName: d.author || 'Adobe Stock Contributor',
            categoryName: d.category?.name || d.category_hierarchy || 'General',
            keywords: rawKeywords,
            downloads: Number(d.nb_downloads) || 0,
            views: Number(d.nb_views) || 0,
            width: Number(d.content_original_width || d.content_width) || undefined,
            height: Number(d.content_original_height || d.content_height) || undefined,
            createdAt: d.creation_date || undefined,
            thumbnailUrl: d.content_thumb_large_url || d.content_thumb_extra_large_url || d.thumbnail_url || '',
            videoPreviewUrl: d.video_preview_url || d.video_small_preview_url || null,
            videoSmallPreviewUrl: d.video_small_preview_url || d.video_preview_url || null,
            isGenerativeAi: Boolean(d.is_gentech),
            isVector: String(d.media_type_label || d.asset_type || '').toLowerCase().includes('vector'),
            isVideo,
            isPurchasable: d.is_purchasable !== false
        };
    } catch {
        return null;
    }
}

function resolveDateWindow(
    dateRange: string,
    startDate?: string,
    endDate?: string
): { fromMs: number; toMs: number } | null {
    if (!dateRange || dateRange === 'all') return null;

    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    if (dateRange === '7d') return { fromMs: now - 7 * DAY_MS, toMs: now };
    if (dateRange === '14d') return { fromMs: now - 14 * DAY_MS, toMs: now };
    if (dateRange === '1m') return { fromMs: now - 30 * DAY_MS, toMs: now };
    if (dateRange === '3m') return { fromMs: now - 90 * DAY_MS, toMs: now };
    if (dateRange === '6m') return { fromMs: now - 180 * DAY_MS, toMs: now };

    if (dateRange === 'custom') {
        const fromMs = startDate ? new Date(`${startDate}T00:00:00`).getTime() : 0;
        const toMs = endDate ? new Date(`${endDate}T23:59:59.999`).getTime() : now;
        if (Number.isFinite(fromMs) && Number.isFinite(toMs) && fromMs <= toMs) {
            return { fromMs, toMs };
        }
    }

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
            dateRange = 'all',    // 'all' | '7d' | '14d' | '1m' | '3m' | '6m' | 'custom'
            startDate,
            endDate,
            maxItems = 100,
            page = 1,
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
        const pageNum = Math.max(Number(page) || 1, 1);
        const pageSize = 100;
        const dateWindow = mode === 'contributor' ? resolveDateWindow(dateRange, startDate, endDate) : null;
        const isFreeFilter = mode === 'contributor' && String(fileType).toLowerCase() === 'free';
        // When filtering by recent upload date range, fetch newest items first (min 200 to cover recent batches)
        const targetMaxItems = mode === 'asset' ? 10 : (dateWindow ? Math.max(pageNum * pageSize, 200) : pageNum * pageSize);

        let actorInput: Record<string, any>;

        if (mode === 'asset') {
            // Minimal clean payload for single asset ID lookup
            actorInput = {
                assetIds: [numericId],
                maxItems: targetMaxItems,
                language: 'en_US'
            };
        } else if (isFreeFilter) {
            // Adobe Stock Free Collection uses filters[free_collection]=1 via /search/free
            const freeOrder = dateWindow || sortBy === 'creation' ? 'creation' : (sortBy === 'relevance' ? 'relevance' : 'nb_downloads');
            const freeUrl = `https://stock.adobe.com/search/free?creator_id=${numericId}&filters%5Bfree_collection%5D=1&filters%5Bcontent_type%3Aimage%5D=1&filters%5Bcontent_type%3Aphoto%5D=1&filters%5Bcontent_type%3Aillustration%5D=1&filters%5Bcontent_type%3Azip_vector%5D=1&filters%5Bcontent_type%3Avideo%5D=1&filters%5Bcontent_type%3Atemplate%5D=1&filters%5Bcontent_type%3A3d%5D=1&order=${freeOrder}`;
            actorInput = {
                startUrls: [{ url: freeUrl }],
                maxItems: targetMaxItems,
                language: 'en_US'
            };
        } else {
            actorInput = {
                creatorIds: [numericId],
                maxItems: targetMaxItems,
                sortBy: dateWindow ? 'newest' : (sortBy === 'creation' ? 'newest' : (sortBy === 'relevance' ? 'relevance' : 'downloads')),
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

            // Content types & premium filter
            if (fileType && fileType !== 'all') {
                const lowerType = fileType.toLowerCase();
                if (lowerType === 'images') {
                    actorInput.contentTypes = ['photo', 'vector', 'illustration'];
                } else if (lowerType === 'free') {
                    // Apify schema supports 'standard' (core + free), not 'free'
                    actorInput.premium = 'standard';
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
        }

        // Run Apify Actor synchronously
        const actorEndpoint = `https://api.apify.com/v2/acts/clearpath~adobe-stock-scraper/run-sync-get-dataset-items?token=${token}&timeout=120`;
        
        let allItems: any[] = [];
        let apifyRes: Response | null = null;
        let apifyNetworkError: any = null;

        try {
            apifyRes = await fetch(actorEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(actorInput)
            });
        } catch (err) {
            apifyNetworkError = err;
        }

        if (!apifyRes || !apifyRes.ok) {
            // In asset lookup mode, try ScraperAPI fallback before returning an Apify error
            if (mode === 'asset') {
                const fallbackItem = await fetchAssetViaScraperApi(numericId);
                if (fallbackItem) {
                    allItems = [fallbackItem];
                }
            }

            if (allItems.length === 0) {
                if (!apifyRes) {
                    throw apifyNetworkError || new Error('Failed to connect to Apify API');
                }
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
        } else {
            const rawItems = await apifyRes.json();
            allItems = Array.isArray(rawItems) ? rawItems : [];

            if (mode === 'asset' && allItems.length === 0) {
                const fallbackItem = await fetchAssetViaScraperApi(numericId);
                if (fallbackItem) {
                    allItems = [fallbackItem];
                }
            }
        }

        // Attempt to fetch creator's total portfolio size and total downloads from Key-Value Store
        let totalPortfolioAssets = allItems.length;
        let totalPortfolioDownloads = 0;
        let portfolioAvgDownloads = 0;
        let hasPortfolioDownloads = false;

        if (mode === 'contributor' && allItems.length > 0) {
            try {
                const runsRes = await fetch(`https://api.apify.com/v2/acts/clearpath~adobe-stock-scraper/runs?limit=1&desc=true&token=${token}`).then(r => r.json());
                const run = runsRes.data?.items?.[0];
                if (run?.defaultKeyValueStoreId) {
                    const portfolios = await fetch(`https://api.apify.com/v2/key-value-stores/${run.defaultKeyValueStoreId}/records/PORTFOLIOS?token=${token}`).then(r => r.json()).catch(() => null);
                    if (Array.isArray(portfolios) && portfolios[0]) {
                        const p = portfolios[0];
                        if (p.portfolioSize) {
                            totalPortfolioAssets = Number(p.portfolioSize) || allItems.length;
                        }
                        if (p.downloads !== undefined && p.downloads !== null) {
                            totalPortfolioDownloads = Number(p.downloads) || 0;
                            hasPortfolioDownloads = true;
                        }
                        if (p.averageDownloads !== undefined && p.averageDownloads !== null) {
                            portfolioAvgDownloads = Math.round(Number(p.averageDownloads)) || 0;
                        }
                    }
                }
            } catch (_) {}
        }

        // Preserve creator profile info even if filters leave 0 items
        const creatorSample = allItems[0] || {};

        // Filter to strictly free assets when 'Free' is selected
        if (isFreeFilter && allItems.length > 0) {
            allItems = allItems.filter((item) => Boolean(item.isFree));
            totalPortfolioAssets = allItems.length;
        }

        // Apply upload-date window filter & rank by Most Downloaded when a date range is active
        if (mode === 'contributor' && dateWindow && allItems.length > 0) {
            allItems = allItems
                .filter((item) => {
                    if (!item.createdAt) return false;
                    const ts = new Date(item.createdAt).getTime();
                    return Number.isFinite(ts) && ts >= dateWindow.fromMs && ts <= dateWindow.toMs;
                })
                .sort((a, b) => {
                    const dlDiff = (Number(b.downloads) || 0) - (Number(a.downloads) || 0);
                    if (dlDiff !== 0) return dlDiff;
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                });
            totalPortfolioAssets = allItems.length;
        } else if (mode === 'contributor' && sortBy === 'downloads' && allItems.length > 0) {
            // Ensure items (e.g., Templates) are strictly ordered by downloads descending when 'Most Downloaded' is active
            allItems = [...allItems].sort((a, b) => (Number(b.downloads) || 0) - (Number(a.downloads) || 0));
        }

        // Slice items specifically for the requested page
        const startIndex = mode === 'asset' ? 0 : (pageNum - 1) * pageSize;
        const items = mode === 'asset' ? allItems : allItems.slice(startIndex, startIndex + pageSize);

        if (items.length === 0 && allItems.length === 0) {
            return NextResponse.json({
                mode,
                query: numericId,
                items: [],
                summary: {
                    creatorName: mode === 'contributor' ? (creatorSample.creatorName || `Contributor #${numericId}`) : undefined,
                    creatorId: numericId,
                    creatorCountry: creatorSample.creatorCountry || '',
                    creatorUrl: creatorSample.creatorUrl || `https://stock.adobe.com/contributor/${numericId}`,
                    totalAssets: dateWindow ? 0 : totalPortfolioAssets,
                    currentPage: pageNum,
                    totalPages: 1,
                    hasNextPage: false,
                    totalLoaded: 0,
                    totalSampleDownloads: 0,
                    avgDownloads: 0,
                    medianDownloads: 0,
                    typeDownloads: { photo: 0, vector: 0, illustration: 0, video: 0, audio: 0, template: 0, '3d': 0 }
                },
                message: mode === 'contributor' 
                    ? (dateWindow ? 'No uploads found in the selected date range.' : 'No assets found for this contributor with the selected filters.')
                    : 'Asset not found with ID ' + numericId
            });
        }

        // Extract and aggregate creator info
        const first = items[0] || allItems[0] || creatorSample;
        const creatorName = first.creatorName || `Contributor ${numericId}`;
        const creatorCountry = first.creatorCountry || '';
        const creatorUrl = first.creatorUrl || `https://stock.adobe.com/contributor/${numericId}`;
        const avatarUrl = first.creatorAvatarUrl || (items[0] && (items[0].thumbnailLargeUrl || items[0].thumbnailUrl)) || (allItems[0] && (allItems[0].thumbnailLargeUrl || allItems[0].thumbnailUrl)) || null;
        const coverUrl = (items[0] && (items[0].thumbnailLargeUrl || items[0].thumbnailUrl)) || (allItems[0] && (allItems[0].thumbnailLargeUrl || allItems[0].thumbnailUrl)) || null;
        
        // Calculate downloads analytics over all contributor items retrieved
        const allDownloadsArr = allItems
            .map(i => Number(i.downloads))
            .filter(d => Number.isFinite(d) && d >= 0)
            .sort((a, b) => a - b);
        
        const totalScrapedDownloads = allDownloadsArr.reduce((sum, d) => sum + d, 0);
        // If a category/mediaType or date-range filter is active, calculate downloads specifically for that filter's items;
        // if viewing 'all' without filtering, prioritize total portfolio downloads from Apify PORTFOLIOS record.
        const isFiltered = (fileType && fileType !== 'all') || (aiContent && aiContent !== 'all') || Boolean(dateWindow);
        const finalTotalDownloads = isFiltered
            ? totalScrapedDownloads
            : (hasPortfolioDownloads && totalPortfolioDownloads > 0 ? totalPortfolioDownloads : totalScrapedDownloads);

        const effectiveAvgDownloads = portfolioAvgDownloads > 0 && !isFiltered
            ? portfolioAvgDownloads
            : (allDownloadsArr.length ? Math.round(finalTotalDownloads / (totalPortfolioAssets || allDownloadsArr.length)) : 0);

        let medianDownloads = 0;
        if (allDownloadsArr.length > 0) {
            const mid = Math.floor(allDownloadsArr.length / 2);
            const val1 = allDownloadsArr[mid] ?? 0;
            const val0 = allDownloadsArr[mid - 1] ?? val1;
            medianDownloads = allDownloadsArr.length % 2 !== 0 ? val1 : Math.round((val0 + val1) / 2);
        }

        // Calculate breakdown of downloads by media type (photo, vector, illustration, video, etc.)
        const typeDownloads: {
            photo: number;
            vector: number;
            illustration: number;
            video: number;
            audio: number;
            template: number;
            '3d': number;
        } = {
            photo: 0,
            vector: 0,
            illustration: 0,
            video: 0,
            audio: 0,
            template: 0,
            '3d': 0
        };

        allItems.forEach(it => {
            const mediaType = (it.mediaType || '').toLowerCase().trim();
            const dl = Number(it.downloads) || 0;
            if (mediaType.includes('photo')) {
                typeDownloads.photo += dl;
            } else if (mediaType.includes('vector')) {
                typeDownloads.vector += dl;
            } else if (mediaType.includes('illustration')) {
                typeDownloads.illustration += dl;
            } else if (mediaType.includes('video')) {
                typeDownloads.video += dl;
            } else if (mediaType.includes('audio')) {
                typeDownloads.audio += dl;
            } else if (mediaType.includes('template')) {
                typeDownloads.template += dl;
            } else if (mediaType.includes('3d')) {
                typeDownloads['3d'] += dl;
            }
        });

        // Clean & normalize items
        const normalizedItems = items.map((item, index) => {
            const dl = Number(item.downloads) || 0;
            let demandTag = 'Average';
            let demandTone = 'avg'; // 'top', 'strong', 'avg', 'low'

            if (dl === 0) {
                demandTag = 'New / Zero DL';
                demandTone = 'low';
            } else if (medianDownloads > 0) {
                if (dl >= medianDownloads * 3 || dl >= 10) {
                    demandTag = 'Top Performer';
                    demandTone = 'top';
                } else if (dl >= medianDownloads * 1.5) {
                    demandTag = 'Strong Demand';
                    demandTone = 'strong';
                } else {
                    demandTag = 'Average';
                    demandTone = 'avg';
                }
            } else {
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
                videoPreviewUrl: item.videoPreviewUrl || item.videoSmallPreviewUrl || null,
                videoSmallPreviewUrl: item.videoSmallPreviewUrl || item.videoPreviewUrl || null,
                isGenerativeAi: Boolean(item.isGenerativeAi || item.isFireflyGenerated),
                isVector: Boolean(item.isVector),
                isVideo: Boolean(item.isVideo),
                isPurchasable: item.isPurchasable !== false,
                demandTag,
                demandTone,
                position: index + 1
            };
        });

        const totalPages = totalPortfolioAssets > 0 ? Math.ceil(totalPortfolioAssets / pageSize) : 1;
        const hasNextPage = mode === 'contributor' && (
            (allItems.length >= targetMaxItems && (totalPortfolioAssets === 0 || targetMaxItems < totalPortfolioAssets)) ||
            (pageNum < totalPages)
        );

        return NextResponse.json({
            mode,
            query: numericId,
            items: normalizedItems,
            summary: {
                creatorName,
                creatorId: numericId,
                creatorCountry,
                creatorUrl,
                avatarUrl,
                coverUrl,
                totalAssets: totalPortfolioAssets,
                currentPage: pageNum,
                totalPages,
                hasNextPage,
                totalLoaded: normalizedItems.length,
                totalSampleDownloads: finalTotalDownloads,
                avgDownloads: effectiveAvgDownloads,
                medianDownloads,
                typeDownloads
            }
        });

    } catch (error: any) {
        console.error('Adobe Tracker API Error:', error);
        return NextResponse.json({
            error: error.message || 'Internal server error while searching Adobe Stock'
        }, { status: 500 });
    }
}
