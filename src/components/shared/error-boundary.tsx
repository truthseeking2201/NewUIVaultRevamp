import React from "react";
import { motion } from "framer-motion";
import disconnectedImg from "../../assets/images/disconnected.png";
import errorBg from "../../assets/images/bg-error.png";
import * as Sentry from "@sentry/react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureReactException(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex min-h-screen w-screen flex-col md:flex-row items-center justify-center gap-6 p-4"
          style={{
            backgroundImage: `url(${errorBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <motion.img
            src={disconnectedImg}
            alt="Error"
            className="w-48 md:w-auto"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              duration: 0.8,
            }}
          />
          <motion.div
            className="flex flex-col items-center md:items-start justify-center gap-2 p-4 text-center md:text-left"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              duration: 0.8,
            }}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white max-w-xs">
              Oops, something went wrong on our end.
            </h1>
            <p className="text-sm md:text-base text-white max-w-md">
              The system encountered an unexpected issue and couldn't complete
              your request
            </p>
            <p className="text-sm md:text-base text-white max-w-md">
              We're already working to fix it — please try again shortly.
            </p>
            <motion.div
              className="flex rounded-[12px] bg-gradient-to-tr from-[#0090FF] via-[#FF6D9C] to-[#FB7E16] p-px hover:opacity-70 transition-all duration-300 w-full md:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => window.location.reload()}
                className="bg-black text-white hover:text-white m-[1px] h-[40px] rounded-[12px] text-md font-semibold px-8 w-full md:w-auto"
              >
                Reload Page
              </button>
            </motion.div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
