import styles from "./register-for-white-list-button.module.css";
import { cn } from "@/lib/utils";

type RegisterForWhiteListButtonProps = {
  onClick?: () => void;
  label?: string;
  icon?: React.ReactNode;
  customClassName?: string;
};
const RegisterForWhiteListButton = ({
  onClick,
  label = "Register for Whitelist",
  icon,
  customClassName,
}: RegisterForWhiteListButtonProps) => {
  return (
    <div className={cn(customClassName, styles.buttonWrapper)}>
      {/* Blur gradient layer */}
      <div className={cn(customClassName, styles.blurEffect)} />
      {/* Button */}
      <button
        className={cn(customClassName, styles.whitelistButton)}
        onClick={onClick}
      >
        {" "}
        {icon && icon}
        {label}
        {!icon && (
          <svg
            className={styles.arrowIcon}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 16L18 12L14 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 12H18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

export default RegisterForWhiteListButton;
