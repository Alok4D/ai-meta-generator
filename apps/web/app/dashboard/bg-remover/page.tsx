"use client";

import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Download, Loader2, ArrowRight, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

export default function BackgroundRemoverPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [originalPreview, setOriginalPreview] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [downloadFormat, setDownloadFormat] = useState('png');
    const [filePrefix, setFilePrefix] = useState('removebg-');
    
    // Advanced AI Settings
    const [aiModel, setAiModel] = useState('isnet-general-use');
    const [alphaMatting, setAlphaMatting] = useState(true);
    const [fgThreshold, setFgThreshold] = useState(240);
    const [bgThreshold, setBgThreshold] = useState(10);
    const [erodeSize, setErodeSize] = useState(10);
    const [showAdvanced, setShowAdvanced] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error("Please upload an image file");
            return;
        }
        setSelectedFile(file);
        setOriginalPreview(URL.createObjectURL(file));
        setProcessedImage(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleRemoveBackground = async () => {
        if (!selectedFile) return;

        setIsProcessing(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("model_name", aiModel);
        formData.append("alpha_matting", alphaMatting.toString());
        formData.append("foreground_threshold", fgThreshold.toString());
        formData.append("background_threshold", bgThreshold.toString());
        formData.append("erode_size", erodeSize.toString());

        try {
            // Use environment variable for production, fallback to localhost for development
            const apiUrl = process.env.NEXT_PUBLIC_BG_REMOVER_API_URL 
                ? `${process.env.NEXT_PUBLIC_BG_REMOVER_API_URL}/api/remove-bg`
                : "http://localhost:8000/api/remove-bg";
                
            const response = await fetch(apiUrl, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to process image");
            }

            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setProcessedImage(imageUrl);
            toast.success("Background removed successfully!");
        } catch (error: any) {
            console.error("Error removing background:", error);
            toast.error(error.message || "An error occurred while processing the image. Make sure the Python service is running.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!processedImage) return;
        
        const originalName = selectedFile?.name.split('.')[0] || "image";
        const finalFilename = `${filePrefix}${originalName}.${downloadFormat}`;

        if (downloadFormat !== 'png') {
            const img = new window.Image();
            img.crossOrigin = 'Anonymous';
            img.src = processedImage;
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    if (downloadFormat === 'jpg') {
                        // JPG doesn't support transparency, fill with white
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }
                    ctx.drawImage(img, 0, 0);
                    
                    const mimeType = downloadFormat === 'jpg' ? 'image/jpeg' : 'image/webp';
                    const dataUrl = canvas.toDataURL(mimeType, 0.9);
                    
                    const a = document.createElement("a");
                    a.href = dataUrl;
                    a.download = finalFilename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }
            };
        } else {
            const a = document.createElement("a");
            a.href = processedImage;
            a.download = finalFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    return (
        <div className="max-w-full mx-auto p-4 md:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ImageIcon className="w-8 h-8 text-blue-500" />
                    AI Background Remover
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Upload any image to instantly remove its background with pixel-perfect accuracy.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
                {!originalPreview ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750'}`}
                    >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Click or drag image to upload</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Supports JPG, PNG, WEBP</p>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden" 
                        />
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
                            
                            {/* Original Image */}
                            <div className="flex flex-col items-center">
                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Original</span>
                                <div className="w-full aspect-square bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center relative shadow-inner border border-gray-200 dark:border-gray-700">
                                    <img src={originalPreview} alt="Original" className="max-w-full max-h-full object-contain" />
                                </div>
                            </div>

                            {/* Divider Arrow */}
                            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 items-center justify-center z-10">
                                <ArrowRight className="w-6 h-6 text-blue-500" />
                            </div>

                            {/* Result Image */}
                            <div className="flex flex-col items-center">
                                <span className="text-sm font-semibold text-blue-500 uppercase tracking-wider mb-3">Result</span>
                                <div className="w-full aspect-square bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center relative shadow-inner border border-blue-200 dark:border-blue-900/50">
                                    {isProcessing ? (
                                        <div className="flex flex-col items-center text-blue-500">
                                            <Loader2 className="w-10 h-10 animate-spin mb-3" />
                                            <span className="font-medium">Removing Background...</span>
                                            <span className="text-xs text-gray-500 mt-2 text-center max-w-[200px]">This might take a few seconds...<br/>(If this is the first time, downloading the AI model takes longer)</span>
                                        </div>
                                    ) : processedImage ? (
                                        <img src={processedImage} alt="Processed" className="max-w-full max-h-full object-contain" />
                                    ) : (
                                        <div className="text-gray-400 flex flex-col items-center">
                                            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                                            <span className="text-sm">Ready to process</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={`flex flex-col items-center mt-4 pt-6 border-t border-gray-100 dark:border-gray-700`}>
                            
                            {!processedImage ? (
                                <div className="flex flex-col items-center w-full">
                                    <div className="flex gap-4 mb-6">
                                        <button 
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setOriginalPreview(null);
                                                setProcessedImage(null);
                                            }}
                                            className="px-6 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            Upload Another
                                        </button>
                                        <button 
                                            onClick={handleRemoveBackground}
                                            disabled={isProcessing}
                                            className="px-8 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-blue-500/20"
                                        >
                                            {isProcessing ? "Processing..." : "Remove Background"}
                                        </button>
                                    </div>

                                    {/* Advanced Settings Accordion */}
                                    <div className="w-full max-w-2xl border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/50">
                                        <button 
                                            onClick={() => setShowAdvanced(!showAdvanced)}
                                            className="w-full flex items-center justify-between p-4 font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Settings className="w-5 h-5 text-blue-500" />
                                                Advanced AI Settings
                                            </span>
                                            {showAdvanced ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </button>
                                        
                                        {showAdvanced && (
                                            <div className="p-5 border-t border-gray-200 dark:border-gray-700 space-y-5 bg-white dark:bg-gray-800 text-left">
                                                {/* Model Selection */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">AI Model</label>
                                                    <select 
                                                        value={aiModel}
                                                        onChange={(e) => setAiModel(e.target.value)}
                                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                                    >
                                                        <option value="isnet-general-use">IS-Net General Use (Good default)</option>
                                                        <option value="birefnet-general">BiRefNet (Best for complex edges & hair)</option>
                                                        <option value="u2net_human_seg">U2Net Human (Best for portraits)</option>
                                                        <option value="u2net_cloth_seg">U2Net Cloth (Best for clothing)</option>
                                                    </select>
                                                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5">Note: Selecting a new model for the first time will take 1-2 minutes to download.</p>
                                                </div>

                                                {/* Alpha Matting Toggle */}
                                                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Alpha Matting</h4>
                                                        <p className="text-xs text-gray-500">Improves edge quality and transparency</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" className="sr-only peer" checked={alphaMatting} onChange={(e) => setAlphaMatting(e.target.checked)} />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                    </label>
                                                </div>

                                                {/* Thresholds */}
                                                {alphaMatting && (
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Foreground Threshold: {fgThreshold}</label>
                                                            <input type="range" min="0" max="255" value={fgThreshold} onChange={(e) => setFgThreshold(parseInt(e.target.value))} className="w-full" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Background Threshold: {bgThreshold}</label>
                                                            <input type="range" min="0" max="255" value={bgThreshold} onChange={(e) => setBgThreshold(parseInt(e.target.value))} className="w-full" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Erode Size: {erodeSize}</label>
                                                            <input type="range" min="0" max="50" value={erodeSize} onChange={(e) => setErodeSize(parseInt(e.target.value))} className="w-full" />
                                                            <p className="text-[10px] text-gray-500 mt-1 text-center">Decrease if object gets cut off</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row gap-6 w-full justify-center">
                                    <div className="flex items-start">
                                        <button 
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setOriginalPreview(null);
                                                setProcessedImage(null);
                                            }}
                                            className="px-6 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            Upload Another
                                        </button>
                                    </div>
                                    
                                    <div className="w-full max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm text-left">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Download Settings</h3>
                                        <p className="text-sm text-gray-500 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">Configure export options for 1 image</p>

                                        <div className="space-y-5">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Format</label>
                                                <select 
                                                    value={downloadFormat}
                                                    onChange={(e) => setDownloadFormat(e.target.value)}
                                                    className="w-full border-2 border-blue-500 rounded-xl p-3 outline-none focus:ring-4 focus:ring-blue-500/20 bg-white dark:bg-gray-900 text-gray-900 dark:text-white cursor-pointer appearance-none"
                                                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                                                >
                                                    <option value="png">PNG (Transparent)</option>
                                                    <option value="jpg">JPG</option>
                                                    <option value="webp">WebP</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">File Prefix</label>
                                                <input 
                                                    type="text" 
                                                    value={filePrefix}
                                                    onChange={(e) => setFilePrefix(e.target.value)}
                                                    className="w-full border border-gray-200 dark:border-gray-600 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                                />
                                                <p className="text-xs text-gray-500 mt-2">Optional prefix for downloaded files</p>
                                            </div>

                                            <button 
                                                onClick={handleDownload}
                                                className="w-full py-3.5 rounded-xl font-bold text-white bg-[#5b5bfa] hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-4"
                                            >
                                                <Download className="w-5 h-5" />
                                                Download Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
