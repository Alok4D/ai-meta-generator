import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
    try {
        const { search, page = 1, filterType = "all", sortBy = "nb_downloads" } = await req.json();

        if (!search) {
            return NextResponse.json({ error: "Please provide a contributor URL or ID" }, { status: 400 });
        }

        // Extract ID if URL is provided
        let contributorId = search;
        let contributorSlug = "";
        
        // e.g., https://stock.adobe.com/contributor/204780517/alok-visuals
        const urlMatch = search.match(/contributor\/(\d+)(?:\/([^/?]+))?/);
        if (urlMatch) {
            contributorId = urlMatch[1];
            contributorSlug = urlMatch[2] || "";
        }

        // Remove @ if they just typed the ID
        contributorId = contributorId.replace('@', '').trim();

        // Pagination setup
        const limit = 100;

        // Base URL with sorting order (e.g. nb_downloads for Most Downloaded)
        const orderParam = sortBy === "creation" ? "creation" : (sortBy === "relevance" ? "relevance" : "nb_downloads");
        let targetUrl = `https://stock.adobe.com/search?creator_id=${contributorId}&order=${orderParam}&load_type=author&limit=${limit}&search_page=${page}`;

        // Append filters
        if (filterType === "photos") {
            targetUrl += "&filters%5Bcontent_type%3Aphoto%5D=1";
        } else if (filterType === "vectors") {
            targetUrl += "&filters%5Bcontent_type%3Azip_vector%5D=1";
        } else if (filterType === "illustrations") {
            targetUrl += "&filters%5Bcontent_type%3Aillustration%5D=1";
        } else if (filterType === "videos") {
            targetUrl += "&filters%5Bcontent_type%3Avideo%5D=1";
        }

        const scraperApiKey = (process.env.SCRAPER_API_KEY || "").replace(/[^a-zA-Z0-9]/g, "");
        console.log("DEBUG: SCRAPER_API_KEY is:", scraperApiKey);
        if (!scraperApiKey) {
            return NextResponse.json({ error: "ScraperAPI Key is missing in .env.local" }, { status: 500 });
        }

        // Fetch using ScraperAPI via native http with render=true to bypass Adobe Stock bot protection
        const scraperUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&render=true&country_code=us&url=${encodeURIComponent(targetUrl)}`;
        
        const html = await new Promise<string>((resolve, reject) => {
            const http = require('http');
            http.get(scraperUrl, (res: any) => {
                let data = '';
                res.on('data', (chunk: any) => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 404) {
                        resolve(''); // Empty HTML for 404 to handle below
                    } else if (res.statusCode !== 200) {
                        reject(new Error(`ScraperAPI returned status ${res.statusCode}: ${data.substring(0, 100)}`));
                    } else {
                        resolve(data);
                    }
                });
            }).on('error', reject);
        });

        if (!html) {
            return NextResponse.json({ error: "Contributor profile not found. Please check the URL or ID." }, { status: 404 });
        }

        // Parse with Cheerio
        const $ = cheerio.load(html);

        const pageTitle = $('title').text();
        if (pageTitle.toLowerCase().includes("page not found") || pageTitle.toLowerCase().includes("404")) {
            return NextResponse.json({ error: "Contributor profile not found. Please check the URL or ID." }, { status: 404 });
        }
        
        // Fallbacks for Name
        let name = contributorSlug ? (contributorSlug.charAt(0).toUpperCase() + contributorSlug.slice(1).replace(/-/g, ' ')) : "Unknown Contributor";
        
        // Try to find the creator name in the search HTML if available
        const nameMatch = html.match(/"creator_name"\s*:\s*"([^"]+)"/i);
        if (nameMatch && nameMatch[1]) {
            name = nameMatch[1];
        } else {
            const pageNameMatch = $('.creator-name').text().trim() || $('.profile-name').text().trim();
            if (pageNameMatch) name = pageNameMatch;
        }
        
        // Assets Count
        let assetsCount = "0";
        const totalResultsMatch = html.match(/"total_results"\s*:\s*(\d+)/i) || html.match(/"total_items"\s*:\s*(\d+)/i);
        const titleMatches = pageTitle.match(/Browse\s+([\d,]+)/i) || pageTitle.match(/([\d,]+)\s+results/i);
        
        if (totalResultsMatch && totalResultsMatch[1]) {
            assetsCount = Number(totalResultsMatch[1]).toLocaleString();
        } else if (titleMatches && titleMatches[1]) {
            assetsCount = titleMatches[1];
        } else {
            const countText = $('.search-result-count, .js-search-result-count').text().trim();
            if (countText) {
                const matches = countText.match(/([\d,]+)/);
                if (matches && matches[1]) assetsCount = matches[1];
            }
        }

        // Avatar
        let avatarUrl = $('.creator-avatar img, .profile-avatar img').attr('src');
        if (!avatarUrl) {
            avatarUrl = "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=random";
        }

        // Location
        let location = $('.creator-location, .profile-location').text().trim() || "";

        // Thumbnails
        const latestAssets: any[] = [];
        $('.search-result-cell').each((i, el) => {
            const assetEl = $(el);
            const frame = assetEl.find('.thumb-frame');
            const link = assetEl.find('a.js-search-result-thumbnail, a[href*="asset_id"], a').first();
            const imgEl = assetEl.find('picture img, img, video').first();
            
            let idStr = link.attr('data-content-id') || link.attr('name');
            const href = link.attr('href') || '';
            if (!idStr && href) {
                const idMatch = href.match(/asset_id=(\d+)/) || href.match(/\/(\d{7,12})/);
                if (idMatch) idStr = idMatch[1];
            }

            let thumbnailUrl = assetEl.find('meta[itemprop="thumbnailUrl"]').attr('content') || imgEl.attr('data-lazy') || imgEl.attr('data-src') || imgEl.attr('src') || imgEl.attr('poster');
            
            if (!idStr && thumbnailUrl) {
                const thumbMatch = thumbnailUrl.match(/_F_(\d+)_/) || thumbnailUrl.match(/\/(\d{7,12})/);
                if (thumbMatch) idStr = thumbMatch[1];
            }

            const id = idStr ? parseInt(idStr) : null;
            const title = assetEl.find('meta[itemprop="name"]').attr('content') || imgEl.attr('title') || imgEl.attr('alt') || "Asset";
            
            let width = parseInt(frame.attr('data-width') || assetEl.find('meta[itemprop="width"]').attr('content') || "0");
            let height = parseInt(frame.attr('data-height') || assetEl.find('meta[itemprop="height"]').attr('content') || "0");
            
            // If the src is a relative spacer.gif, try to find the real one
            if (thumbnailUrl && (thumbnailUrl.includes('spacer.gif') || thumbnailUrl.startsWith('/'))) {
                thumbnailUrl = imgEl.attr('data-lazy') || imgEl.attr('data-src') || imgEl.attr('poster');
            }

            const assetUrl = href.startsWith('http') ? href : `https://stock.adobe.com${href}`;
            const isGenTech = assetEl.html()?.includes('ai-generated') || assetEl.html()?.includes('Generative AI') || false;
            const isPurchasable = true; // All Adobe Stock indexed assets are purchasable
            
            if (thumbnailUrl && !thumbnailUrl.includes('data:image') && !thumbnailUrl.includes('spacer.gif')) {
                const largePreviewUrl = thumbnailUrl.replace('360_F', '500_F').replace('240_F', '500_F');
                
                // Infer content type
                let contentType = 1; // Default to photo
                const titleLower = title.toLowerCase();
                if (titleLower.includes('vector') || assetUrl?.includes('vector')) contentType = 3;
                else if (titleLower.includes('illustration') || assetUrl?.includes('illustration')) contentType = 2;
                else if (titleLower.includes('video') || assetUrl?.includes('video')) contentType = 4;

                // Auto-generate keywords from title since Adobe Stock search page hides them
                const keywords = titleLower.replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 2);

                latestAssets.push({ 
                    id,
                    title,
                    thumbnailUrl,
                    src: thumbnailUrl, // keeping for backwards compatibility
                    largePreviewUrl,
                    width,
                    height,
                    assetUrl,
                    isGenTech,
                    isPurchasable: true,
                    contentType,
                    keywords // Fallback keywords
                });
            }
        });

        // Some assets might be embedded differently. Let's do a fallback if latestAssets is empty
        if (latestAssets.length === 0) {
            $('img.thumb').each((i, el) => {
                const src = $(el).attr('src');
                const title = $(el).attr('alt') || "Asset";
                if (src) latestAssets.push({ src, title });
            });
        }

        return NextResponse.json({
            name,
            avatarUrl,
            location,
            assetsCount,
            latestAssets,
            sourceUrl: `https://stock.adobe.com/contributor/${contributorId}/${contributorSlug || ''}`
        });

    } catch (error: any) {
        console.error("Error in contributor profile search:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
