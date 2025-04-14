const VideoPlayer = ({
  videoRef,
}: {
  videoRef: React.RefObject<HTMLDivElement  | null>;
}) => {
  return (
    <div data-vjs-player>
     <div ref={videoRef} />
    </div>
  );
};

export default VideoPlayer;
