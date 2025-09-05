import ChartNoDataImg from "@/assets/images/details/chart-no-data.png";
import { motion } from "framer-motion";

const ChartNoData = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <img
        src={ChartNoDataImg}
        alt="No data available"
        className="md:w-1/2 mt-[-48px] mb-6"
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ChartNoData;
