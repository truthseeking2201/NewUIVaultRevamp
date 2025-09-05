import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import DemoVideo from "@/assets/demo.mp4"; // Replace with the actual path to your video

type DemoVideoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DemoVideoModal = (props: DemoVideoModalProps) => {
  const { open, onOpenChange } = props;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold mb-0">
            Demo Video
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <video controls className="w-full h-auto" autoPlay>
            <source
              src="https://d2g8s4wkah5pic.cloudfront.net/demo-nodo-vaults.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default DemoVideoModal;
