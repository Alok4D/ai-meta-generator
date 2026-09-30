"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { updateCredits } from "@/lib/feature/auth/authSlice";
import { useUploadVideoMutation, useRegenerateVideoMetadataMutation } from "@/lib/feature/upload/uploadApi";
import Swal from "sweetalert2";

import { VideoSettingsSidebar } from "./_components/VideoSettingsSidebar";
import { VideoUploadSection } from "./_components/VideoUploadSection";
import { VideoGeneratedResults } from "./_components/VideoGeneratedResults";

export default function VideoMetaPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [videoDetails, setVideoDetails] = useState<{ duration: number; width: number; height: number; resolution: string } | null>(null);
  const [metadata, setMetadata] = useState<any>(null);

  // Settings State
  const [platform, setPlatform] = useState('universal');
  const [titleLength, setTitleLength] = useState([120]);
  const [descriptionLength, setDescriptionLength] = useState([200]);
  const [keywordCount, setKeywordCount] = useState([49]);
  const [selectedShotType, setSelectedShotType] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [usePrefix, setUsePrefix] = useState(false);
  const [prefix, setPrefix] = useState('');
  const [useSuffix, setUseSuffix] = useState(false);
  const [suffix, setSuffix] = useState('');
  const [useNegativeTitle, setUseNegativeTitle] = useState(false);
  const [negativeTitleWords, setNegativeTitleWords] = useState('');
  const [useNegativeKeywords, setUseNegativeKeywords] = useState(false);
  const [negativeKeywords, setNegativeKeywords] = useState('');

  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const [uploadVideo, { isLoading: uploading }] = useUploadVideoMutation();
  const [regenerateVideoMetadata, { isLoading: isRegenerating }] = useRegenerateVideoMetadataMutation();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Load video settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('metaGenVideoSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.platform) setPlatform(parsed.platform);
        if (parsed.titleLength) setTitleLength([parsed.titleLength]);
        if (parsed.descriptionLength) setDescriptionLength([parsed.descriptionLength]);
        if (parsed.keywordCount) setKeywordCount([parsed.keywordCount]);
        if (parsed.selectedShotType) setSelectedShotType(parsed.selectedShotType);
        if (parsed.selectedMood) setSelectedMood(parsed.selectedMood);
        if (parsed.prefix) setPrefix(parsed.prefix);
        if (parsed.suffix) setSuffix(parsed.suffix);
        if (parsed.negativeTitleWords) setNegativeTitleWords(parsed.negativeTitleWords);
        if (parsed.negativeKeywords) setNegativeKeywords(parsed.negativeKeywords);
      } catch (e) {
        console.error("Failed to parse video settings");
      }
    }
  }, []);

  // Save video settings to localStorage
  useEffect(() => {
    const settings = {
      platform,
      titleLength: titleLength[0],
      descriptionLength: descriptionLength[0],
      keywordCount: keywordCount[0],
      selectedShotType,
      selectedMood,
      prefix, suffix,
      negativeTitleWords, negativeKeywords
    };
    localStorage.setItem('metaGenVideoSettings', JSON.stringify(settings));
  }, [platform, titleLength, descriptionLength, keywordCount, selectedShotType, selectedMood, prefix, suffix, negativeTitleWords, negativeKeywords]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0]!;
      setFile(selectedFile);
      setMetadata(null);

      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl && !previewUrl.startsWith('http')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: (fileRejections) => {
      if (fileRejections.length > 0) {
        const err = fileRejections[0]?.errors[0];
        if (err?.code === 'file-too-large') {
          toast.error("Video file is too large. Maximum allowed size is 2GB.");
        } else {
          toast.error(err?.message || "File format not supported. Please upload MP4, MOV, WEBM, AVI or MKV.");
        }
      }
    },
    accept: {
      'video/*': ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v', '.mts', '.m2ts', '.ts', '.quicktime', '.qt'],
      'video/quicktime': ['.mov', '.qt'],
      'video/mp4': ['.mp4', '.m4v'],
      'video/webm': ['.webm'],
      'video/x-matroska': ['.mkv'],
      'video/x-msvideo': ['.avi'],
      'video/avi': ['.avi']
    },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024 * 1024 // 2GB
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please upload a video file first.");
      return;
    }

    const REQUIRED_CREDITS = 2;
    if (user && user.credits < REQUIRED_CREDITS) {
      const result = await Swal.fire({
        title: 'Credits Empty!',
        text: `You need at least ${REQUIRED_CREDITS} credits to generate video metadata.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Buy Credits'
      });
      if (result.isConfirmed) {
        router.push("/dashboard/pricing");
      }
      return;
    }

    const hasSeenWarning = localStorage.getItem("hasSeenVideoGenerateWarning");
    if (!hasSeenWarning) {
      const result = await Swal.fire({
        title: 'Generate Video Metadata?',
        html: `Video metadata analysis will cost <strong>2 credits</strong> from your account.<br/><br/>
               <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px;">
                 <input type="checkbox" id="dontShowVideoAgain" style="cursor: pointer; width: 16px; height: 16px;" />
                 <label for="dontShowVideoAgain" style="cursor: pointer; font-size: 14px;">Don't show this again</label>
               </div>`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, proceed',
        preConfirm: () => {
          const checkbox = document.getElementById('dontShowVideoAgain') as HTMLInputElement;
          return checkbox?.checked;
        }
      });

      if (!result.isConfirmed) return;

      if (result.value) {
        localStorage.setItem("hasSeenVideoGenerateWarning", "true");
      }
    }

    const formData = new FormData();
    formData.append("video", file);
    formData.append("platform", platform);
    formData.append("titleLength", (titleLength[0] || 120).toString());
    formData.append("descriptionLength", (descriptionLength[0] || 200).toString());
    formData.append("keywordCount", (keywordCount[0] || 49).toString());
    if (selectedShotType) formData.append("selectedShotType", selectedShotType);
    if (selectedMood) formData.append("selectedMood", selectedMood);
    if (prefix) formData.append("prefix", prefix);
    if (suffix) formData.append("suffix", suffix);
    if (negativeTitleWords) formData.append("negativeTitleWords", negativeTitleWords);
    if (negativeKeywords) formData.append("negativeKeywords", negativeKeywords);
    if (videoDetails) {
      formData.append("duration", Math.round(videoDetails.duration).toString());
      formData.append("resolution", videoDetails.resolution);
    }

    try {
      const data = await uploadVideo(formData).unwrap();
      toast.success("Video metadata generated successfully!");
      setMetadata(data.metadata);
      dispatch(updateCredits(data.creditsRemaining));
    } catch (error: any) {
      toast.error(error.data?.error || "Video analysis failed. Please check server.");
    }
  };

  const handleRegenerate = async () => {
    if (!metadata) {
      toast.error("No video metadata found to regenerate");
      return;
    }

    if (user && user.credits < 2) {
      toast.error("Not enough credits. Regenerating costs 2 credits.");
      return;
    }

    const result = await Swal.fire({
      title: 'Regenerate Video Metadata?',
      text: "This action will cost 2 credits from your account.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, regenerate!'
    });

    if (result.isConfirmed) {
      try {
        const payload = {
          videoUrl: metadata.videoUrl,
          platform,
          titleLength: titleLength[0] || 120,
          descriptionLength: descriptionLength[0] || 200,
          keywordCount: keywordCount[0] || 49,
          selectedShotType: selectedShotType || metadata.shotType || '',
          selectedMood: selectedMood || metadata.mood || '',
          prefix: prefix || '',
          suffix: suffix || '',
          negativeTitleWords: negativeTitleWords || '',
          negativeKeywords: negativeKeywords || ''
        };
        const data = await regenerateVideoMetadata(payload).unwrap();
        toast.success("Video metadata regenerated successfully!");
        setMetadata(data.metadata);
        dispatch(updateCredits(data.creditsRemaining));
      } catch (error: any) {
        toast.error(error.data?.error || "Failed to regenerate video metadata");
      }
    }
  };

  const handleDownloadTXT = () => {
    if (!metadata) return;
    const filename = file?.name?.split('.')[0] || 'video-metadata';
    let content = `Action Title:\n${metadata.title}\n\n`;
    content += `Description:\n${metadata.description}\n\n`;
    content += `Camera Movement / Shot Type: ${metadata.shotType || 'Cinematic'}\n`;
    content += `Lighting / Mood: ${metadata.mood || 'Natural Light'}\n`;
    content += `Adobe Category: ${metadata.adobeCategory || metadata.category}\n`;
    content += `Shutterstock Category: ${metadata.shutterstockCategory || metadata.category}\n`;
    content += `Pond5 Category: ${metadata.pond5Category || metadata.category}\n\n`;
    content += `Keywords (${metadata.keywords?.length || 49}):\n${metadata.keywords?.join(", ")}`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = (preset = 'universal') => {
    if (!metadata) return;
    const filename = file?.name || 'video.mp4';
    const safeTitle = metadata.title ? metadata.title.replace(/"/g, '""') : '';
    const safeDesc = metadata.description ? metadata.description.replace(/"/g, '""') : '';
    const safeKeywords = metadata.keywords ? metadata.keywords.join(",").replace(/"/g, '""') : '';

    let csvContent = `Filename,Title,Description,Keywords,Adobe Category,Shutterstock Category,Pond5 Category,Shot Type\n`;
    csvContent += `"${filename}","${safeTitle}","${safeDesc}","${safeKeywords}","${metadata.adobeCategory || metadata.category}","${metadata.shutterstockCategory || metadata.category}","${metadata.pond5Category || metadata.category}","${metadata.shotType || ''}"\n`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file?.name?.split('.')[0] || 'video-metadata'}-${preset}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = (text: string | undefined, label: string) => {
    if (!text) {
      toast.error(`Nothing to copy for ${label}`);
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard!`);
    }).catch(() => {
      toast.error(`Failed to copy ${label}`);
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-medium tracking-tight">Stock Video Generator</h2>
          <p className="text-muted-foreground text-sm">Upload stock footage clips (5s-60s) to generate 4-layer action titles & 49 commercial keywords.</p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Settings Sidebar */}
        <VideoSettingsSidebar 
          platform={platform} setPlatform={setPlatform}
          titleLength={titleLength} setTitleLength={setTitleLength} maxTitleLength={200} minTitleLength={20}
          descriptionLength={descriptionLength} setDescriptionLength={setDescriptionLength}
          keywordCount={keywordCount} setKeywordCount={setKeywordCount} maxKeywords={49} minKeywords={5}
          selectedShotType={selectedShotType} setSelectedShotType={setSelectedShotType}
          selectedMood={selectedMood} setSelectedMood={setSelectedMood}
          prefix={prefix} setPrefix={setPrefix}
          suffix={suffix} setSuffix={setSuffix}
          negativeTitleWords={negativeTitleWords} setNegativeTitleWords={setNegativeTitleWords}
          negativeKeywords={negativeKeywords} setNegativeKeywords={setNegativeKeywords}
        />

        {/* Right Video Area + Results */}
        <div className="flex-1 flex flex-col gap-6">
          <VideoUploadSection 
            file={file} setFile={setFile}
            previewUrl={previewUrl} setPreviewUrl={setPreviewUrl}
            videoDetails={videoDetails} setVideoDetails={setVideoDetails}
            metadata={metadata} setMetadata={setMetadata}
            uploading={uploading} handleUpload={handleUpload}
            dropzone={{ getRootProps, getInputProps, isDragActive } as any}
          />
          
          <VideoGeneratedResults 
            metadata={metadata}
            handleDownloadTXT={handleDownloadTXT}
            handleDownloadCSV={handleDownloadCSV}
            handleCopy={handleCopy}
            handleRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
          />
        </div>
      </div>
    </div>
  );
}
