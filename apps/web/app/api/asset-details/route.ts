import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { assetId } = await req.json();

        if (!assetId) {
            return NextResponse.json({ error: "Please provide an assetId" }, { status: 400 });
        }

        const scraperApiKey = (process.env.SCRAPER_API_KEY || "").replace(/[^a-zA-Z0-9]/g, "");
        if (!scraperApiKey) {
            return NextResponse.json({ error: "ScraperAPI Key is missing in .env.local" }, { status: 500 });
        }

        const targetUrl = `https://stock.adobe.com/Ajax/MediaData/${assetId}?full=1`;
        const scraperUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&render=true&country_code=us&url=${encodeURIComponent(targetUrl)}`;

        const rawData = await new Promise<string>((resolve, reject) => {
            const http = require('http');
            http.get(scraperUrl, (res: any) => {
                let data = '';
                res.on('data', (chunk: any) => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 404) {
                        resolve('');
                    } else if (res.statusCode !== 200) {
                        reject(new Error(`ScraperAPI returned status ${res.statusCode}: ${data.substring(0, 100)}`));
                    } else {
                        resolve(data);
                    }
                });
            }).on('error', reject);
        });

        if (!rawData) {
            return NextResponse.json({ error: "Asset details not found." }, { status: 404 });
        }

        // Clean any HTML wrapper tags if rendered inside <pre> or <body>
        const cleaned = rawData.replace(/<[^>]+>/g, '').trim();
        let parsedData: any;
        try {
            parsedData = JSON.parse(cleaned);
        } catch (e) {
            return NextResponse.json({ error: "Failed to parse asset data." }, { status: 500 });
        }

        return NextResponse.json({
            contentId: parsedData.content_id || assetId,
            title: parsedData.title || "Untitled Asset",
            keywords: parsedData.keywords || [],
            category: parsedData.category?.name || parsedData.category_hierarchy || "General",
            assetType: parsedData.asset_type || parsedData.media_type_label || "Image",
            format: parsedData.format || parsedData.file_extension || "jpg",
            isGenTech: parsedData.is_gentech ?? false,
            isPurchasable: parsedData.is_purchasable ?? true,
            isCommercial: parsedData.is_standard ?? true,
            isFree: parsedData.is_free ?? false,
            isPremium: parsedData.is_premium ?? false,
            originalWidth: parsedData.content_original_width || parsedData.content_width || 0,
            originalHeight: parsedData.content_original_height || parsedData.content_height || 0,
            thumbLargeUrl: parsedData.content_thumb_large_url || parsedData.content_thumb_extra_large_url || parsedData.thumbnail_url,
            author: parsedData.author || "Adobe Stock Contributor",
            creatorId: parsedData.creator_id,
            metaDescription: parsedData.meta_description || "",
            contentUrl: parsedData.content_url ? (parsedData.content_url.startsWith('http') ? parsedData.content_url : `https://stock.adobe.com${parsedData.content_url}`) : `https://stock.adobe.com/${assetId}`,
            licenseDetails: parsedData.license_details || null,
            raw: parsedData
        });

    } catch (error: any) {
        console.error("Error in asset-details route:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
