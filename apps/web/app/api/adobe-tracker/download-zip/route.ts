import { NextResponse } from 'next/server';
import JSZip from 'jszip';

interface DownloadAssetInput {
    id: string | number;
    title: string;
    downloads: number;
    mediaType?: string;
    categoryName?: string;
    keywords?: string[];
    url?: string;
    thumbnailUrl?: string;
}

function sanitizeFilename(name: string, maxLen = 48): string {
    return (name || 'asset')
        .replace(/[^a-zA-Z0-9\s_-]/g, '')
        .trim()
        .replace(/\s+/g, '_')
        .slice(0, maxLen) || 'asset';
}

function escapeCsvField(val: string | number | undefined): string {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function getExtensionFromContentType(contentType: string | null, url: string): string {
    if (contentType) {
        if (contentType.includes('png')) return 'png';
        if (contentType.includes('webp')) return 'webp';
        if (contentType.includes('svg')) return 'svg';
        if (contentType.includes('gif')) return 'gif';
    }
    const match = url.match(/\.(png|jpg|jpeg|webp|gif)(?:[?#]|$)/i);
    if (match && match[1]) {
        return match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
    }
    return 'jpg';
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            creatorName = 'contributor',
            creatorId = '',
            items = []
        }: {
            creatorName?: string;
            creatorId?: string | number;
            items?: DownloadAssetInput[];
        } = body;

        const downloadedItems = (Array.isArray(items) ? items : [])
            .filter((item) => Number(item.downloads) > 0 && Boolean(item.thumbnailUrl))
            .sort((a, b) => Number(b.downloads) - Number(a.downloads));

        if (downloadedItems.length === 0) {
            return NextResponse.json(
                { error: 'No downloaded assets (downloads > 0) found to export.' },
                { status: 400 }
            );
        }

        const zip = new JSZip();
        const csvRows: string[] = [
            'Rank,Asset ID,Title,Downloads,Media Type,Category,Keywords,Adobe Stock URL'
        ];

        const BATCH_SIZE = 10;
        let successCount = 0;

        for (let i = 0; i < downloadedItems.length; i += BATCH_SIZE) {
            const batch = downloadedItems.slice(i, i + BATCH_SIZE);

            await Promise.all(
                batch.map(async (item, batchIdx) => {
                    const rank = i + batchIdx + 1;
                    const safeTitle = sanitizeFilename(item.title);
                    const prefix = `${String(rank).padStart(3, '0')}_${item.downloads}DL_${safeTitle}_${item.id}`;

                    csvRows.push([
                        rank,
                        escapeCsvField(item.id),
                        escapeCsvField(item.title),
                        Number(item.downloads) || 0,
                        escapeCsvField(item.mediaType || ''),
                        escapeCsvField(item.categoryName || ''),
                        escapeCsvField(Array.isArray(item.keywords) ? item.keywords.join(', ') : ''),
                        escapeCsvField(item.url || `https://stock.adobe.com/${item.id}`)
                    ].join(','));

                    if (!item.thumbnailUrl) return;

                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 15000);

                        const imgRes = await fetch(item.thumbnailUrl, {
                            signal: controller.signal,
                            headers: {
                                'User-Agent': 'Mozilla/5.0'
                            }
                        });
                        clearTimeout(timeoutId);

                        if (!imgRes.ok) return;

                        const contentType = imgRes.headers.get('content-type');
                        const ext = getExtensionFromContentType(contentType, item.thumbnailUrl);
                        const arrayBuffer = await imgRes.arrayBuffer();
                        zip.file(`${prefix}.${ext}`, arrayBuffer);
                        successCount++;
                    } catch {
                        // Skip individual failed image fetch without failing entire archive
                    }
                })
            );
        }

        if (successCount === 0) {
            return NextResponse.json(
                { error: 'Failed to fetch asset preview files from Adobe Stock CDN.' },
                { status: 502 }
            );
        }

        // Add UTF-8 BOM CSV with full metadata & keywords
        zip.file('metadata.csv', '\uFEFF' + csvRows.join('\n'));

        const zipBuffer = await zip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });

        const safeCreator = sanitizeFilename(creatorName, 30);
        const filename = `${safeCreator}${creatorId ? `_${creatorId}` : ''}_downloaded_files.zip`;

        return new NextResponse(new Uint8Array(zipBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'X-Downloaded-Count': String(successCount)
            }
        });
    } catch (error: any) {
        console.error('Adobe Tracker ZIP Download Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate ZIP archive' },
            { status: 500 }
        );
    }
}
