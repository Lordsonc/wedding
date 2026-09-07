import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// ======================================================
// UI COMPONENTS
// ======================================================

import HeroSection from './HeroSection';
import FrameCards from './FrameCards';
import UploadZone from './UploadZone';
import CelebrationDetails from './CelebrationDetails';
import Footer from './Footer';
import BackgroundSlideshow from './BackgroundSlideshow';

// ======================================================
// UTILITIES & ASSETS
// ======================================================

import {
  generatePreviews,
  revokePreviews,
} from './fileHelpers';

import groomImg from './assets/groom.webp';
import brideImg from './assets/bride.webp';

import bg1 from './assets/wedding.webp';
import bg2 from './assets/wedding1.jpeg.webp';
import bg3 from './assets/wedding3.jpeg.webp';
import bg4 from './assets/wedding4.jpeg.webp';

// ======================================================
// CONFIGURATION
// ======================================================

const slideshowImages = [
  bg1,
  bg2,
  bg3,
  bg4,
].filter(Boolean);

const MAX_FILES = 5;
const MAX_FILE_SIZE = 40 * 1024 * 1024; // 40 MB

// Allow enough time for large video uploads.
// 5 minutes = 300,000 ms.
const UPLOAD_TIMEOUT = 300000;

// ======================================================
// APP
// ======================================================

export default function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState({
    text: '',
    isError: false,
  });

  // ====================================================
  // BACKGROUND SLIDESHOW
  // ====================================================

  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    if (slideshowImages.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentBg(
        (previous) =>
          (previous + 1) % slideshowImages.length
      );
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  // ====================================================
  // CLEAN UP PREVIEW URLS WHEN COMPONENT UNMOUNTS
  // ====================================================

  useEffect(() => {
    return () => {
      if (previews.length > 0) {
        revokePreviews(previews);
      }
    };
  }, [previews]);

  // ====================================================
  // FILE SELECTION
  // ====================================================

  const handleFilesSelected = useCallback(
    (filesArray) => {
      const files = Array.from(filesArray || []);

      // -----------------------------------------------
      // NO FILES
      // -----------------------------------------------

      if (files.length === 0) {
        return;
      }

      // -----------------------------------------------
      // MAXIMUM FILE COUNT
      // -----------------------------------------------

      if (files.length > MAX_FILES) {
        setMessage({
          text: `You can only upload up to ${MAX_FILES} files at once.`,
          isError: true,
        });

        return;
      }

      // -----------------------------------------------
      // FILE SIZE VALIDATION
      // -----------------------------------------------

      const oversizedFile = files.find(
        (file) => file.size > MAX_FILE_SIZE
      );

      if (oversizedFile) {
        const sizeInMB = (
          oversizedFile.size /
          (1024 * 1024)
        ).toFixed(1);

        setMessage({
          text: `"${oversizedFile.name}" is ${sizeInMB} MB. Maximum file size is 40 MB.`,
          isError: true,
        });

        return;
      }

      // -----------------------------------------------
      // FILE TYPE VALIDATION
      // -----------------------------------------------

      const invalidFile = files.find(
        (file) =>
          !file.type.startsWith('image/') &&
          !file.type.startsWith('video/')
      );

      if (invalidFile) {
        setMessage({
          text: `"${invalidFile.name}" is not a supported image or video file.`,
          isError: true,
        });

        return;
      }

      // -----------------------------------------------
      // CLEAN OLD PREVIEWS
      // -----------------------------------------------

      if (previews.length > 0) {
        revokePreviews(previews);
      }

      // -----------------------------------------------
      // CREATE NEW PREVIEWS
      // -----------------------------------------------

      const previewObjects = generatePreviews(files);

      setSelectedFiles(files);
      setPreviews(previewObjects);

      setMessage({
        text: '',
        isError: false,
      });
    },
    [previews]
  );

  // ====================================================
  // REMOVE SINGLE FILE
  // ====================================================

  const handleRemoveFile = useCallback(
    (idToRemove) => {
      setPreviews((previousPreviews) => {
        const targetIndex =
          previousPreviews.findIndex(
            (item) => item.id === idToRemove
          );

        if (targetIndex === -1) {
          return previousPreviews;
        }

        const targetPreview =
          previousPreviews[targetIndex];

        // ---------------------------------------------
        // RELEASE OBJECT URL
        // ---------------------------------------------

        if (targetPreview?.url) {
          URL.revokeObjectURL(
            targetPreview.url
          );
        }

        // ---------------------------------------------
        // REMOVE MATCHING FILE
        // ---------------------------------------------

        setSelectedFiles(
          (previousFiles) =>
            previousFiles.filter(
              (_, index) =>
                index !== targetIndex
            )
        );

        return previousPreviews.filter(
          (item) =>
            item.id !== idToRemove
        );
      });

      setMessage({
        text: '',
        isError: false,
      });
    },
    []
  );

  // ====================================================
  // UPLOAD FILES
  // ====================================================

  const handleUpload = useCallback(
    async () => {
      // ---------------------------------------------
      // PREVENT EMPTY UPLOAD
      // ---------------------------------------------

      if (selectedFiles.length === 0) {
        setMessage({
          text: 'Please select at least one image or video.',
          isError: true,
        });

        return;
      }

      // ---------------------------------------------
      // PREVENT DOUBLE CLICK / DUPLICATE UPLOAD
      // ---------------------------------------------

      if (uploading) {
        return;
      }

      setUploading(true);

      setMessage({
        text: 'Uploading your memories...',
        isError: false,
      });

      // ---------------------------------------------
      // API URL
      // ---------------------------------------------

      const backendUrl =
        import.meta.env.VITE_API_URL?.trim();

      if (!backendUrl) {
        setUploading(false);

        setMessage({
          text:
            'Upload service is not configured. Please try again later.',
          isError: true,
        });

        return;
      }

      // Remove trailing slash if one exists.
      const cleanBackendUrl =
        backendUrl.replace(/\/+$/, '');

      // ---------------------------------------------
      // FORM DATA
      // ---------------------------------------------

      const formData = new FormData();

      selectedFiles.forEach((file) => {
        if (file.type.startsWith('image/')) {
          formData.append(
            'images',
            file
          );
        } else if (
          file.type.startsWith('video/')
        ) {
          formData.append(
            'videos',
            file
          );
        }
      });

      try {
        // -------------------------------------------
        // UPLOAD
        // -------------------------------------------

        const response =
          await axios.post(
            `${cleanBackendUrl}/api/upload`,
            formData,
            {
              // IMPORTANT:
              // Do NOT manually set Content-Type.
              // Axios/browser automatically creates the
              // correct multipart boundary.
              timeout: UPLOAD_TIMEOUT,

              maxContentLength: Infinity,
              maxBodyLength: Infinity,

              onUploadProgress:
                (progressEvent) => {
                  if (
                    progressEvent.total
                  ) {
                    const percentage =
                      Math.round(
                        (progressEvent.loaded /
                          progressEvent.total) *
                          100
                      );

                    setMessage({
                      text: `Uploading your memories... ${percentage}%`,
                      isError: false,
                    });
                  }
                },
            }
          );

        // -------------------------------------------
        // SUCCESS
        // -------------------------------------------

        setMessage({
          text:
            response.data?.message ||
            'Your memories were uploaded successfully!',
          isError: false,
        });

        // -------------------------------------------
        // CLEAN UP PREVIEWS
        // -------------------------------------------

        if (previews.length > 0) {
          revokePreviews(previews);
        }

        setSelectedFiles([]);
        setPreviews([]);
      } catch (error) {
        console.error(
          'Upload error:',
          error
        );

        // -------------------------------------------
        // BACKEND ERROR
        // -------------------------------------------

        if (error.response) {
          setMessage({
            text:
              error.response.data?.error ||
              'The server could not process your upload.',
            isError: true,
          });

          return;
        }

        // -------------------------------------------
        // TIMEOUT
        // -------------------------------------------

        if (
          error.code ===
          'ECONNABORTED'
        ) {
          setMessage({
            text:
              'The upload is taking too long. Please try again with fewer or smaller files.',
            isError: true,
          });

          return;
        }

        // -------------------------------------------
        // NETWORK ERROR
        // -------------------------------------------

        if (
          error.message ===
          'Network Error'
        ) {
          setMessage({
            text:
              'Unable to connect to the upload server. Please try again.',
            isError: true,
          });

          return;
        }

        // -------------------------------------------
        // GENERAL ERROR
        // -------------------------------------------

        setMessage({
          text:
            error.message ||
            'Upload failed. Please try again.',
          isError: true,
        });
      } finally {
        setUploading(false);
      }
    },
    [
      selectedFiles,
      previews,
      uploading,
    ]
  );

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="relative min-h-screen text-white flex flex-col font-serif overflow-x-hidden selection:bg-pink-500 selection:text-white">

      {/* ==============================================
          BACKGROUND SLIDESHOW
      ============================================== */}

      <BackgroundSlideshow
        images={slideshowImages}
        current={currentBg}
      />

      {/* ==============================================
          HERO SECTION
      ============================================== */}

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

      {/* ==============================================
          UPLOAD SECTION
      ============================================== */}

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

      {/* ==============================================
          FOOTER
      ============================================== */}

      <div className="relative z-10 bg-transparent mt-auto">

        <Footer
          developerTag="TECH_AGBERO"
        />

      </div>

    </div>
  );
}
