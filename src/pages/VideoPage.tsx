"use client";
import PlayList from "@/components/PlayList";
import VideoPlayer from "@/components/VideoPlayer";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";

const playlist = [
  {
    title: "What is .NET",
    isWatched: false,
    src: "https://media.publit.io/file/CSharp/Variables/12-Print-Full-Name.m3u8",
  },
  {
    title: "History",
    isWatched: false,
    src: "https://media.publit.io/file/CSharp/GetStarted/3-History.m3u8",
  },
  {
    title: "Road Map",
    isWatched: false,
    src: "https://media.publit.io/file/CSharp/GetStarted/4-Road-Maps.m3u8",
  },
  {
    title: "Install Visual Studio",
    isWatched: false,
    src: "https://media.publit.io/file/CSharp/GetStarted/5-Install-Visual-Studio-2022.m3u8",
  },
];

function VideoPage() {
  const { videoRef, setVideoByIndex, currentVideoIndex, setCurrentVideoIndex } =
    useVideoPlayer(playlist);
  return (
    <>
      <main className="min-h-screen bg-gray-900 text-white p-5">
        <div className="border border-gray-700 rounded-lg p-4 bg-gray-800 mb-6">
          <h1 className="text-2xl font-bold text-center ">
            🎓 C# Course Playlist Player
          </h1>
        </div>

        <div className="container max-w-7xl mx-auto flex flex-col md:flex-row gap-5">
          <div className="flex-1 min-w-0">
            <VideoPlayer videoRef={videoRef} />
          </div>

          <div className="w-full md:w-80 flex-shrink-0 border border-gray-700 rounded-lg p-4 bg-gray-800">
            <PlayList
              list={playlist}
              setCurrentVideoIndex={setCurrentVideoIndex}
              setVideoByIndex={setVideoByIndex}
              currentVideoIndex={currentVideoIndex}
            />
          </div>
        </div>
      </main>
    </>
  );
}
export default VideoPage;
