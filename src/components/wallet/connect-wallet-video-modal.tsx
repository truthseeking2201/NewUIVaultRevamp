import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { useState } from "react";

type ConnectWalletVideoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoPlay?: boolean;
};

const VIDEOS = [
  {
    url: "https://d2g8s4wkah5pic.cloudfront.net/nodo-ai/how-to-connect-slush.mp4",
    value: "slush",
    title: "Slush",
  },
  {
    url: "https://d2g8s4wkah5pic.cloudfront.net/nodo-ai/how-to-connect-phantom.mp4",
    value: "phantom",
    title: "Phantom",
  },
];

const ConnectWalletVideoModal = (props: ConnectWalletVideoModalProps) => {
  const { open, onOpenChange, autoPlay = true } = props;
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<"phantom" | "slush">(
    VIDEOS[0].value as "phantom" | "slush"
  );

  const videoUrl = VIDEOS.find((video) => video.value === selectedVideo)?.url;

  const handleVideoError = () => {
    setVideoError(true);
    setIsLoading(false);
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideIconClose
        className="py-6 px-4 md:py-8 gap-6 bg-[#141517] rounded-2xl border-white/10"
      >
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle className="text-center text-lg font-bold mb-0">
            How to Connect Wallet
          </DialogTitle>
          <Button
            variant="icon"
            className="w-8 h-8 bg-white/5 p-2 text-gray-400 !mt-0"
            onClick={() => onOpenChange(false)}
          >
            <X size={20} className="text-white" />
          </Button>
        </DialogHeader>
        <DialogDescription>
          <div className="flex mb-4">
            <Tabs
              className="w-full"
              value={selectedVideo}
              onValueChange={(value) => {
                setSelectedVideo(value as "phantom" | "slush");
                setVideoError(false);
                setIsLoading(true);
              }}
            >
              <TabsList className="w-full">
                {VIDEOS.map((video) => (
                  <TabsTrigger
                    key={video.value}
                    value={video.value}
                    className="text-xs font-medium h-[40px] w-full"
                  >
                    <img
                      src={`/wallets/${video.value}-wallet.png`}
                      alt={video.title}
                      className="w-5 h-5 mr-2"
                    />
                    {video.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
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
              key={videoUrl}
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

export default ConnectWalletVideoModal;
