export interface AdobeAssetItem {
    id: number | string;
    stockId?: string;
    title: string;
    url: string;
    mediaType: string;
    fileFormat?: string;
    creatorId: number | string;
    creatorName: string;
    categoryName?: string;
    keywords: string[];
    downloads: number;
    views: number;
    width?: number;
    height?: number;
    createdAt?: string;
    thumbnailUrl: string;
    isGenerativeAi?: boolean;
    isVector?: boolean;
    isVideo?: boolean;
    isPurchasable?: boolean;
    demandTag?: string;
    demandTone?: 'top' | 'strong' | 'avg' | 'low';
    position?: number;
}

export interface ContributorSummary {
    creatorName: string;
    creatorId: string | number;
    creatorCountry?: string;
    creatorUrl?: string;
    totalLoaded: number;
    totalSampleDownloads: number;
    avgDownloads: number;
    medianDownloads: number;
}

export interface ApifyKeyRecord {
    id: string;
    token: string;
    label: string;
    username?: string;
    plan?: string;
    monthlyCredits?: number;
    health: 'active' | 'invalid' | 'unknown';
    verifiedAt?: string;
}

export type SearchMode = 'contributor' | 'asset';
export type FileTypeFilter = 'all' | 'photo' | 'illustration' | 'vector' | 'video' | 'template' | '3d';
export type AiFilter = 'all' | 'only' | 'exclude';
export type SortOption = 'downloads' | 'creation' | 'relevance';
