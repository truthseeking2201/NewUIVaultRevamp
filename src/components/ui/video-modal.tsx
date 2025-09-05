import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

type DemoVideoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  videoUrl: string;
  autoPlay?: boolean;
};

const VideoModal = (props: DemoVideoModalProps) => {
  const { open, onOpenChange, title, videoUrl, autoPlay = true } = props;
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleVideoError = () => {
    setVideoError(true);
    setIsLoading(false);
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold mb-0">
            {title}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {isLoading && (
            <div className="w-full h-64 flex items-center justify-center bg-gray-900 rounded">
              <div className="text-white">Loading video...</div>
            </div>
          )}
          {videoError ? (
            <div className="w-full h-64 flex flex-col items-center justify-center bg-gray-900 rounded text-white">
              <p className="mb-4">
                Unable to load video. You can watch it directly:
              </p>
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Open Video in New Tab
              </a>
            </div>
          ) : (
            <video
              controls
              className={`w-full h-auto ${isLoading ? "hidden" : ""}`}
              autoPlay={autoPlay}
              onError={handleVideoError}
              onLoadedData={handleVideoLoad}
              preload="metadata"
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
