import VideoPage from "@/pages/VideoPage";
import Script from "next/script";

export default function Home() {
  return (
    <>
      <VideoPage />;
      <Script src="/player.min.js" />
    </>
  );
}
