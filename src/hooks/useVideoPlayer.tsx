"use client"
import { useCallback, useEffect, useRef, useState } from "react";
import videojs from "video.js";
import Hls from "hls.js"

// Extend the Window interface to include Hls
declare global {
  interface Window {
    Hls: typeof Hls;
  }
}
import "video.js/dist/video-js.css";
import "videojs-hls-quality-selector";

export const useVideoPlayer = (
  playlist: { title: string; src: string; isWatched: boolean }[]
) => {
  const videoRef = useRef<HTMLDivElement | null>(null);
  // @ts-expect-error: video.js Player type is not fully compatible with TypeScript
  const playerRef = useRef<videojs.Player | null>(null);
  const progressIntervals = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const convertToM3u8 = useCallback((url: string): string => {
    return url.replace(/\.html(\?|$)/, '.m3u8$1');
  }, []);
  const updateProgressBar = (videoIndex: number, progress: number) => {
    const progressBar = document.getElementById(`progress-${videoIndex}`);
    if (progressBar) {
      progressBar.style.width = `${progress * 100}%`;
      if (progress >= 0.8) {
        document
          .querySelectorAll(".playlist-item")
          [videoIndex].classList.add("watched");
        playlist[videoIndex].isWatched = true;
      }
    }
  };

  const checkIfWatched = (videoIndex: number) => {
    if (progressIntervals.current[videoIndex]) {
      clearInterval(progressIntervals.current[videoIndex]);
    }

    progressIntervals.current[videoIndex] = setInterval(() => {
      if (playerRef.current?.duration() > 0) {
        const progress =
          playerRef.current.currentTime() / playerRef.current.duration();
        updateProgressBar(videoIndex, progress);

        if (progress >= 0.8) {
          clearInterval(progressIntervals.current[videoIndex]);
        }
      }
    }, 1000);
  };

  const handleVideoEnd = () => {
    if (currentVideoIndex < playlist.length - 1) {
      setCurrentVideoIndex((prevIndex) => prevIndex + 1);
    }
  };

  const setVideoByIndex = (index: number) => {
    if (index >= 0 && index < playlist.length) {
      setCurrentVideoIndex(index);
    }
  };
  useEffect(()=>{
    const script = document.createElement("script");
    script.src = "https://static.publit.io/js/hls.js";
    script.async = true;
    script.onload = () => {
      console.log("Video.js script loaded");
    }
    document.body.appendChild(script);
  },[])
  useEffect(() => {
    let player = playerRef.current;

    if (!player && videoRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      
      const options = {
        techOrder: ['html5'],
        fill: true,
        controlBar: { pictureInPictureToggle: false },
        loop: false,
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        html5: {
          vhs: {
            overrideNative: true,
            withCredentials: false,
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
          },
          hls: {
            overrideNative: true, 
            enableWorker: true,
            debug: false,
          },
          nativeAudioTracks: false,
          nativeVideoTracks: false,
        },
        textTrackSettings: false,
        autoplay: false,
        controls: true,
        responsive: true,
        preload: "auto",
        fluid: true,
        crossOrigin: 'anonymous',
        sources: [
          {
            src: playlist[currentVideoIndex].src,
            type: "application/x-mpegURL",
            withCredentials: false,
          },
        ],
      };

      videoRef.current.innerHTML = "";
      videoRef.current.appendChild(videoElement);

      player = playerRef.current = videojs(videoElement, options, () => {
        console.log("Player is ready");
      });

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls();
        hls.loadSource(convertToM3u8(playlist[currentVideoIndex].src));
        hls.attachMedia(videoRef.current);
        
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          player.play();
          // handleDuration(player.duration());
        });
      player.on("error", () => {
        console.error("Player error:", player?.error());
      });
      hls.on(window.Hls.Events.ERROR, (event: any, data: any) => {
        console.error("HLS.js Error", data);
        if (data.fatal) {
          switch (data.type) {
            case window.Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case window.Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              console.error("Unrecoverable error:", data);
          }
        }
        player.hlsQualitySelector({
          displayCurrentQuality: true,
        });
  
      });


      player.on("ended", handleVideoEnd);
      
      if (player.qualityLevels) {
        player.qualityLevels();
        player.hlsQualitySelector({ displayCurrentQuality: true });
      }

      player.on("loadedmetadata", () => {
        console.log("Video metadata loaded");
      });
      console.log("Video source:", playlist[currentVideoIndex].src);
    } else if (player) {
      console.log("Video source:", playlist[currentVideoIndex].src);
      player.pause();
      player.currentTime(0);
      player.src({
        src: playlist[currentVideoIndex].src,
        type: "application/x-mpegURL",
        withCredentials: false,
      });
      player.load();
    }}

    return () => {
      Object.values(progressIntervals.current).forEach(clearInterval);
    };
  }, [currentVideoIndex]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const handlePlay = () => {
      checkIfWatched(currentVideoIndex);
    };

    player.on("play", handlePlay);

    return () => {
      player.off("play", handlePlay);
      if (progressIntervals.current[currentVideoIndex]) {
        clearInterval(progressIntervals.current[currentVideoIndex]);
      }
    };
  }, [currentVideoIndex]);

  return {
    videoRef,
    playerRef,
    currentVideoIndex,
    setCurrentVideoIndex,
    setVideoByIndex,
  };
};