export type BatchItem = {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  metadata?: any;
  error?: string;
  size?: number;
  dimensions?: { width: number, height: number } | null;
};
