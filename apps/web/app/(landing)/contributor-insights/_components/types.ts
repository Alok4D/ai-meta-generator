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
    videoPreviewUrl?: string | null;
    videoSmallPreviewUrl?: string | null;
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
    avatarUrl?: string | null;
    coverUrl?: string | null;
    totalAssets?: number;
    totalLoaded: number;
    totalSampleDownloads: number;
    avgDownloads?: number;
    medianDownloads?: number;
    typeDownloads?: {
        photo?: number;
        vector?: number;
        illustration?: number;
        video?: number;
        audio?: number;
        template?: number;
        '3d'?: number;
        [key: string]: number | undefined;
    };
    currentPage?: number;
    totalPages?: number;
    hasNextPage?: boolean;
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
export type FileTypeFilter = 'all' | 'images' | 'photo' | 'vector' | 'illustration' | 'video' | 'audio' | 'template' | '3d' | 'free' | 'premium';
export type AiFilter = 'all' | 'only' | 'exclude';
export type SortOption = 'downloads' | 'creation' | 'relevance';
export type DateRangePreset = 'all' | '7d' | '14d' | '1m' | '3m' | '6m' | 'custom';
