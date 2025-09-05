import { useWhiteListModalStore } from "@/hooks/use-store";
import WhiteListModal from "../white-list-modal/white-list-modal";

const RegisterForWhiteListLayout = () => {
  const { isOpen, setIsOpen } = useWhiteListModalStore();

  const handleClose = () => {
    setIsOpen(false);
  };
  return <WhiteListModal open={isOpen} onClose={handleClose} />;
};

export default RegisterForWhiteListLayout;
