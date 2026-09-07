import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// UI COMPONENTS
import HeroSection from './HeroSection';
import FrameCards from './FrameCards';
import UploadZone from './UploadZone';
import CelebrationDetails from './CelebrationDetails';
import Footer from './Footer';
import BackgroundSlideshow from './BackgroundSlideshow';

// UTILITIES & ASSETS
import { generatePreviews, revokePreviews } from './fileHelpers';
import groomImg from './assets/groom.webp';
import brideImg from './assets/bride.webp';

// Background images
import bg1 from './assets/wedding.webp';
import bg2 from './assets/wedding1.jpeg.webp';
import bg3 from './assets/wedding3.jpeg.webp';
import bg4 from './assets/wedding4.jpeg.webp';

const slideshowImages = [bg1, bg2, bg3, bg4].filter(Boolean);

// ============================================================
// UPLOAD CONFIGURATION
// ============================================================

const MAX_FILE_SIZE = 40 * 1024 * 1024; // 40 MB
const MAX_FILES = 10;

const API_URL = import.meta.env.VITE_API_URL;

// Supported file types
const isSupportedFile = (file) => {
  return (
    file.type.startsWith('image/') ||
    file.type.startsWith('video/')
  );
};

export default function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState({
    text: '',
    isError: false,
  });

  // ============================================================
  // BACKGROUND SLIDESHOW
  // ============================================================

  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    if (!slideshowImages.length) return;

    const interval = setInterval(() => {
      setCurrentBg(
        (prev) => (prev + 1) % slideshowImages.length
      );
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  // ============================================================
  // CLEAN UP PREVIEWS WHEN COMPONENT UNMOUNTS
  // ============================================================

  useEffect(() => {
    return () => {
      revokePreviews(previews);
    };
  }, [previews]);

  // ============================================================
  // FILE SELECTION
  // ============================================================

  const handleFilesSelected = useCallback(
    (filesArray) => {
      const files = Array.from(filesArray);

      if (files.length === 0) {
        return;
      }

      // --------------------------------------------------------
      // CHECK MAXIMUM NUMBER OF FILES
      // --------------------------------------------------------

      if (files.length > MAX_FILES) {
        setMessage({
          text: `You can select a maximum of ${MAX_FILES} files at once.`,
          isError: true,
        });

        return;
      }

      // --------------------------------------------------------
      // CHECK FILE SIZE
      // --------------------------------------------------------

      const oversizedFiles = files.filter(
        (file) => file.size > MAX_FILE_SIZE
      );

      if (oversizedFiles.length > 0) {
        const fileNames = oversizedFiles
          .map((file) => file.name)
          .join(', ');

        setMessage({
          text: `These files exceed the 40MB limit: ${fileNames}`,
          isError: true,
        });

        return;
      }

      // --------------------------------------------------------
      // CHECK FILE TYPE
      // --------------------------------------------------------

      const invalidFiles = files.filter(
        (file) => !isSupportedFile(file)
      );

      if (invalidFiles.length > 0) {
        setMessage({
          text: 'Only image and video files are allowed.',
          isError: true,
        });

        return;
      }

      // --------------------------------------------------------
      // CLEAN OLD PREVIEWS
      // --------------------------------------------------------

      revokePreviews(previews);

      // --------------------------------------------------------
      // CREATE NEW PREVIEWS
      // --------------------------------------------------------

      const previewObjects = generatePreviews(files);

      setSelectedFiles(files);
      setPreviews(previewObjects);

      setMessage({
        text: `${files.length} file${
          files.length > 1 ? 's' : ''
        } ready to upload.`,
        isError: false,
      });
    },
    [previews]
  );

  // ============================================================
  // REMOVE SINGLE FILE
  // ============================================================

  const handleRemoveFile = useCallback((idToRemove) => {
    setPreviews((prevPreviews) => {
      const targetIndex = prevPreviews.findIndex(
        (item) => item.id === idToRemove
      );

      if (targetIndex === -1) {
        return prevPreviews;
      }

      // Revoke the specific preview URL
      const targetPreview = prevPreviews[targetIndex];

      if (targetPreview?.url) {
        URL.revokeObjectURL(targetPreview.url);
      }

      // Remove matching File
      setSelectedFiles((prevFiles) =>
        prevFiles.filter(
          (_, index) => index !== targetIndex
        )
      );

      return prevPreviews.filter(
        (item) => item.id !== idToRemove
      );
    });

    setMessage({
      text: '',
      isError: false,
    });
  }, []);

  // ============================================================
  // UPLOAD FILES
  // ============================================================

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      setMessage({
        text: 'Please select at least one file.',
        isError: true,
      });

      return;
    }

    if (!API_URL) {
      setMessage({
        text: 'Upload service is not configured.',
        isError: true,
      });

      console.error(
        'VITE_API_URL is missing from environment variables.'
      );

      return;
    }

    // ----------------------------------------------------------
    // FINAL SIZE CHECK
    // ----------------------------------------------------------

    const oversizedFiles = selectedFiles.filter(
      (file) => file.size > MAX_FILE_SIZE
    );

    if (oversizedFiles.length > 0) {
      setMessage({
        text: 'One or more files exceed the 40MB limit.',
        isError: true,
      });

      return;
    }

    // ----------------------------------------------------------
    // START UPLOAD
    // ----------------------------------------------------------

    setUploading(true);

    setMessage({
      text: 'Uploading your memories...',
      isError: false,
    });

    const formData = new FormData();

    // IMPORTANT:
    // Backend expects the field name "files"
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      console.log(
        `Uploading ${selectedFiles.length} file(s) to:`,
        `${API_URL}/api/upload`
      );

      const response = await axios.post(
        `${API_URL}/api/upload`,
        formData,
        {
          // DO NOT manually set Content-Type.
          // Axios/browser will set multipart/form-data
          // with the correct boundary automatically.

          timeout: 10 * 60 * 1000, // 10 minutes

          onUploadProgress: (progressEvent) => {
            if (!progressEvent.total) {
              return;
            }

            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) /
                progressEvent.total
            );

            setMessage({
              text: `Uploading... ${percentCompleted}%`,
              isError: false,
            });
          },
        }
      );

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      if (response.data?.success) {
        setMessage({
          text:
            response.data.message ||
            'Your memories were uploaded successfully!',
          isError: false,
        });

        // Clean up preview URLs
        revokePreviews(previews);

        // Clear selected files
        setSelectedFiles([]);
        setPreviews([]);
      } else {
        throw new Error(
          response.data?.error ||
            'Upload was not completed.'
        );
      }
    } catch (error) {
      console.error('Upload Error:', error);

      let errorMessage =
        'Upload failed. Please try again.';

      // Server returned an error
      if (error.response) {
        errorMessage =
          error.response.data?.error ||
          `Upload failed with status ${error.response.status}.`;
      }

      // Request was sent but no response received
      else if (error.request) {
        errorMessage =
          'The upload may have completed, but the server response could not be received. Please check your connection and Google Drive before trying again.';
      }

      // Something went wrong before request
      else if (error.message) {
        errorMessage = error.message;
      }

      setMessage({
        text: errorMessage,
        isError: true,
      });
    } finally {
      setUploading(false);
    }
  }, [selectedFiles, previews]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="relative min-h-screen text-white flex flex-col font-serif overflow-x-hidden selection:bg-pink-500 selection:text-white">

      {/* BACKGROUND SLIDESHOW */}
      <BackgroundSlideshow
        images={slideshowImages}
        current={currentBg}
      />

      {/* HERO SECTION */}
      <div className="relative z-10 min-h-[85vh] sm:min-h-[90vh] md:min-h-screen flex flex-col items-center justify-between py-6 sm:py-10 md:py-12 px-3 sm:px-6 bg-transparent">

        <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-between gap-6 sm:gap-8 md:gap-10">

          <HeroSection
            title="Capture Our Day"
            subtitle="Lets Make A Collection Of Our Wedding Memories"
          />

          <FrameCards
            groomImg={groomImg}
            brideImg={brideImg}
          />

        </div>
      </div>

      {/* UPLOAD SECTION */}
      <div className="relative z-10 bg-transparent py-8 sm:py-12 md:py-16 px-3 sm:px-6 flex flex-col items-center text-center gap-6 sm:gap-10">

        <UploadZone
          previews={previews}
          onFilesSelected={handleFilesSelected}
          onRemoveFile={handleRemoveFile}
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

      {/* FOOTER */}
      <div className="relative z-10 bg-transparent mt-auto">
        <Footer developerTag="TECH_AGBERO" />
      </div>

    </div>
  );
}