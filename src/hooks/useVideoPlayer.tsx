import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

export const useVideoPlayer = (
  playlist: { title: string; src: string; isWatched: boolean }[]
) => {
  const videoRef = useRef<HTMLDivElement | null>(null);
  // @ts-ignore
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
      const options = {
        fill: true,
        controlBar: { pictureInPictureToggle: false },
        loop: false,
        playbackRates: [
          0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75,
          4,
        ],
        html5: {
          nativeTextTracks: false,
          hls: { overrideNative: true },
        },
        textTrackSettings: false,
        autoplay: false,
        controls: true,
        responsive: true,
        preload: "auto",
        poster:
          "https://media.publit.io/file/w_1280/CSharp/Variables/1-Declare-Variables.jpg",
        fluid: true,
        sources: [
          {
            src: playlist[currentVideoIndex].src,
            type: "application/x-mpegURL",
          },
        ],
      };
      console.log("Video source:", playlist[currentVideoIndex].src);
      
      if (videoRef.current) {
        videoRef.current.innerHTML = "";
        videoRef.current.appendChild(videoElement);
      }

      player = playerRef.current = videojs(videoElement, options);

      player.on("ended", handleVideoEnd);
      player.qualityLevels();
      // player.hlsQualitySelector({ displayCurrentQuality: true });
      // const levels = player.qualityLevels();
      // levels.on("change", () => {
      //   const currentTime = player.currentTime();
      //   player.one("loadedmetadata", () => {
      //     player.currentTime(currentTime);
      //   });
      // });
    } else {
      console.log("Video source:", playlist[currentVideoIndex].src);
      player.pause();
      player.src({ src: playlist[currentVideoIndex].src });
      player.load();
    }

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
