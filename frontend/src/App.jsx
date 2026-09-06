import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// 1. UI COMPONENTS
import HeroSection from './HeroSection';
import FrameCards from './FrameCards';
import UploadZone from './UploadZone';
import CelebrationDetails from './CelebrationDetails';
import Footer from './Footer';
import BackgroundSlideshow from './BackgroundSlideshow';

// 2. UTILITIES & ASSETS
import { generatePreviews, revokePreviews } from './fileHelpers';
import groomImg from './assets/groom.webp';
import brideImg from './assets/bride.webp';

// Direct slideshow image imports
import bg1 from './assets/wedding.webp';
import bg2 from './assets/wedding1.jpeg.webp';
import bg3 from './assets/wedding3.jpeg.webp';
import bg4 from './assets/wedding4.jpeg.webp';

const slideshowImages = [bg1, bg2, bg3, bg4].filter(Boolean);

export default function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  // 3. SLIDESHOW TIMER
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    if (!slideshowImages.length) return;

    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % slideshowImages.length);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (previews.length > 0) {
        revokePreviews(previews);
      }
    };
  }, [previews]);

  // 4. FILE HANDLING LOGIC
  const handleFilesSelected = useCallback((filesArray) => {
    const files = Array.from(filesArray);

    if (files.length > 5) {
      setMessage({ text: 'You can only upload up to 5 files at once.', isError: true });
      return;
    }

    revokePreviews(previews);
    const previewObjects = generatePreviews(files);
    setSelectedFiles(files);
    setPreviews(previewObjects);
    setMessage({ text: '', isError: false });
  }, [previews]);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setMessage({ text: '', isError: false });

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const backendUrl = import.meta.env.VITE_API_URL;

      if (!backendUrl) {
        throw new Error('API URL configuration missing.');
      }

      const response = await axios.post(`${backendUrl}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 90000,
      });

      setMessage({ text: response.data.message || 'Photos uploaded successfully!', isError: false });
      revokePreviews(previews);
      setSelectedFiles([]);
      setPreviews([]);
    } catch (err) {
      setMessage({
        text: err.response?.data?.error || err.message || 'Upload failed. Check your network connection.',
        isError: true,
      });
    } finally {
      setUploading(false);
    }
  }, [selectedFiles, previews]);

  return (
    <div className="relative min-h-screen text-white flex flex-col font-serif overflow-x-hidden selection:bg-pink-500 selection:text-white">
      
      {/* 1. FIXED BACKGROUND SLIDESHOW COVERING FULL VIEWPORT */}
      <BackgroundSlideshow 
        images={slideshowImages} 
        current={currentBg} 
      />

      {/* 2. SCROLLABLE TRANSPARENT CONTENT LAYERS */}
      
      {/* SECTION 1: HERO CONTAINER */}
      <div className="relative z-10 min-h-[85vh] sm:min-h-[90vh] md:min-h-screen flex flex-col items-center justify-between py-6 sm:py-10 md:py-12 px-3 sm:px-6 bg-transparent">
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-between gap-6 sm:gap-8 md:gap-10">
          <HeroSection
            title="Capture Our Day"
            subtitle="Lets Make A Collection Of Our Wedding Memories"
          />
          <FrameCards groomImg={groomImg} brideImg={brideImg} />
        </div>
      </div>

      {/* SECTION 2: UPLOADER & CELEBRATION DETAILS */}
      <div className="relative z-10 bg-transparent py-8 sm:py-12 md:py-16 px-3 sm:px-6 flex flex-col items-center text-center gap-6 sm:gap-10">
        <UploadZone
          previews={previews}
          onFilesSelected={handleFilesSelected}
          uploading={uploading}
          onUpload={handleUpload}
          message={message}
        />
        <CelebrationDetails
          coupleNames="ESTHER & LAWRENCE'S"
          dateText="October 24, 2026"
          hashtag="#THELAW♥STORY26"
        />
      </div>

      {/* SECTION 3: FOOTER */}
      <div className="relative z-10 bg-transparent mt-auto">
        <Footer developerTag="TECH_AGBERO" />
      </div>
    </div>
  );
}