import { Skeleton } from "@/components/ui/skeleton";

function DualDepositSkeleton() {
  return (
    <div>
      <div className="p-4 deposit_input_v2_wrapper rounded-t-lg">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="w-24 h-[42px]" />
          <div className="flex items-center">
            <Skeleton className="w-6 h-6 mr-2 rounded-full" />
            <Skeleton className="w-12 h-6 " />
          </div>
        </div>
        <div className="flex justify-between items-center space-x-2">
          <Skeleton className="w-16 h-5" />
          <div className="flex items-center space-x-2">
            <Skeleton className="w-16 h-5" />
            <Skeleton className="w-16 h-5" />
          </div>
        </div>
      </div>
      <div className="p-4 deposit_input_v2_wrapper">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="w-24 h-[42px]" />
          <div className="flex items-center">
            <Skeleton className="w-6 h-6 mr-2 rounded-full" />
            <Skeleton className="w-12 h-6 " />
          </div>
        </div>
        <div className="flex justify-between items-center space-x-2">
          <Skeleton className="w-16 h-5" />
          <div className="flex items-center space-x-2">
            <Skeleton className="w-16 h-5" />
            <Skeleton className="w-16 h-5" />
          </div>
        </div>
      </div>
      <div className="p-4 border border-white/20 rounded-[12px] rounded-t-none">
        <Skeleton className="w-[138px] h-6 mb-2 bg-white/20" />
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="w-32 h-[42px] bg-white/20" />
          <div className="flex items-center">
            <Skeleton className="w-6 h-6 mr-2 rounded-full bg-white/20" />
            <Skeleton className="w-12 h-6  bg-white/20" />
          </div>
        </div>
        <hr className="w-full border-t border-white/15 my-2"></hr>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="w-16 h-[26px] bg-white/20" />
          <Skeleton className="w-[200px] h-[26px] bg-white/20" />
        </div>
      </div>
      <Skeleton className="w-full h-[52px] mt-4 mb-3 bg-white/20" />
      <Skeleton className="w-full h-4 bg-white/20" />
    </div>
  );
}

export default DualDepositSkeleton;
