const VideoPlayer = ({
  videoRef,
}: {
  videoRef: React.RefObject<HTMLVideoElement  | null>;
}) => {
  return (
    <div data-vjs-player>
     <video ref={videoRef} controls />
    </div>
  );
};

export default VideoPlayer;
