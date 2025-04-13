import { useEffect } from "react";

function PlayList({
  list,
  setVideoByIndex,
  setCurrentVideoIndex,
  currentVideoIndex,
}: {
  list: { title: string; src: string; isWatched: boolean }[];
  setVideoByIndex: (index: number) => void;
  setCurrentVideoIndex: (index: number) => void;
  currentVideoIndex: number;
}) {


  function handleVideoClick(index: number) {
    if (index !== currentVideoIndex) {
      setVideoByIndex(index);
      setCurrentVideoIndex(index);
    }
  }

  function updatePlaylistUI() {
    document.querySelectorAll(".playlist-item").forEach((item, index) => {
      item.classList.toggle("active", index === currentVideoIndex);
      if (index === currentVideoIndex) {
        item.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }
    
  useEffect(() => {
    updatePlaylistUI();
  }, [currentVideoIndex]);

  return (
    <div id="playlistItems" className="flex flex-col gap-1">
      {list.map((video, index) => (
        <div
          key={index}
          className={`playlist-item rounded-xl px-5 py-4 transition duration-200 cursor-pointer flex justify-center items-center ${
            index === currentVideoIndex ? "active" : ""
          } ${video.isWatched ? "watched" : ""}`}
          onClick={() => handleVideoClick(index)}
        >
          <span className="video-number me-3">{index + 1}</span>
          <span className="video-title">{video.title}</span>
          <div className="progress-indicator ms-auto w-16 h-1 rounded-xl relative bg-gray-200 overflow-hidden">
            <div className="progress-bar absolute top-0 left-0 bottom-0 w-0 rounded-xl bg-green-600" id={`progress-${index}`}></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PlayList;
