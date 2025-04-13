"use client"
import { useEffect, useRef, useState } from "react"
import Hls from "hls.js"

export const useHLSVideoPlayer = (
  playlist: { title: string; src: string; isWatched: boolean }[]
) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)
  const progressIntervals = useRef<{ [key: number]: NodeJS.Timeout }>({})
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const updateProgressBar = (videoIndex: number, progress: number) => {
    const progressBar = document.getElementById(`progress-${videoIndex}`)
    if (progressBar) {
      progressBar.style.width = `${progress * 100}%`
      if (progress >= 0.8) {
        document
          .querySelectorAll(".playlist-item")
          [videoIndex].classList.add("watched")
        playlist[videoIndex].isWatched = true
      }
    }
  }

  const checkIfWatched = (videoIndex: number) => {
    if (progressIntervals.current[videoIndex]) {
      clearInterval(progressIntervals.current[videoIndex])
    }

    progressIntervals.current[videoIndex] = setInterval(() => {
      if (videoRef.current && videoRef.current.duration > 0) {
        const progress = videoRef.current.currentTime / videoRef.current.duration
        updateProgressBar(videoIndex, progress)

        if (progress >= 0.8) {
          clearInterval(progressIntervals.current[videoIndex])
        }
      }
    }, 1000)
  }

  const handleVideoEnd = () => {
    if (currentVideoIndex < playlist.length - 1) {
      setCurrentVideoIndex((prevIndex) => prevIndex + 1)
    }
  }

  const setVideoByIndex = (index: number) => {
    if (index >= 0 && index < playlist.length) {
      setCurrentVideoIndex(index)
    }
  }

  const loadVideo = (src: string) => {
    if (!videoRef.current) return;
  
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }
  
    const video = videoRef.current;
  
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('ended', handleVideoEnd);
      video.addEventListener('error', (e) => {
        console.error('Native video error:', e);
      });
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        debug: true, // تمكين وضع التصحيح
      });
      hlsRef.current = hls;
  
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error Event:', event);
        console.error('HLS Error Details:', {
          type: data.type,
          details: data.details,
          fatal: data.fatal,
          error: data.error,
          url: data.url,
          reason: data.reason,
        });
  
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Network Error - Trying to recover');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Media Error - Trying to recover');
              hls.recoverMediaError();
              break;
            default:
              console.error('Unrecoverable Error - Reloading video');
              hls.destroy();
              setTimeout(() => loadVideo(src), 1000);
              break;
          }
        }
      });
  
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('Manifest parsed - video ready');
      });
    } else {
      console.error('HLS not supported in this browser');
    }
  };

  useEffect(() => {
    loadVideo(playlist[currentVideoIndex].src)

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
      Object.values(progressIntervals.current).forEach(clearInterval)
    }
  }, [currentVideoIndex])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => {
      setIsPlaying(true)
      checkIfWatched(currentVideoIndex)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)

    return () => {
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      if (progressIntervals.current[currentVideoIndex]) {
        clearInterval(progressIntervals.current[currentVideoIndex])
      }
    }
  }, [currentVideoIndex])

  const playPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  return {
    videoRef,
    currentVideoIndex,
    setCurrentVideoIndex,
    setVideoByIndex,
    isPlaying,
    playPause,
    seekTo,
    hlsInstance: hlsRef.current
  }
}