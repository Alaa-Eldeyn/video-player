import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export const useVideoPlayer = (
  playlist: { title: string; src: string; isWatched: boolean }[]
) => {
  const videoRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<videojs.Player | null>(null);
  const progressIntervals = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

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
    console.log("Video has ended. Going to next video.");
    if (currentVideoIndex < playlist.length - 1) {
      setCurrentVideoIndex((prevIndex) => prevIndex + 1);
    }
  };

  const setVideoByIndex = (index: number) => {
    if (index >= 0 && index < playlist.length) {
      setCurrentVideoIndex(index);
    }
  };

  useEffect(() => {
    let player = playerRef.current;

    if (!player) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");

      if (videoRef.current) {
        videoRef.current.appendChild(videoElement);
      }

      player = playerRef.current = videojs(videoElement, {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [{ src: playlist[currentVideoIndex].src }],
        html5: {
          hls: {
            overrideNative: true,
          },
        },
        
      });
      player.qualityLevels();
      player.on("ended", handleVideoEnd);
    } else {
      player.src({ src: playlist[currentVideoIndex].src });
      player.qualityLevels();
      player.currentTime(0);
      player.load();
      const handleCanPlay = () => {
        player
          .play()
          .catch((error: Error) => console.error("Playback error:", error));
      };

      player.on("canplay", handleCanPlay);

      return () => {
        player.off("canplay", handleCanPlay);
      };
    }

    return () => {
      Object.values(progressIntervals.current).forEach(clearInterval);
    };
  }, [currentVideoIndex]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    player.off("play");

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
