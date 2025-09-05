import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type DetailWrapperProps = {
  title: string;
  titleComponent?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  loadingStyle?: string;
};

export const DetailWrapper = ({
  title,
  titleComponent,
  children,
  className = "",
  isLoading = false,
  loadingStyle = "default",
}: DetailWrapperProps) => {
  return (
    <div className="rounded-lg bg-[#1C1C1C]">
      {isLoading ? (
        <>
          <div
            className={cn(
              "flex items-center justify-between p-4",
              titleComponent ? "h-[81px]" : "h-[68px]"
            )}
          >
            <Skeleton className="w-[200px] h-6 " />
            {titleComponent && <Skeleton className="w-[300px] h-6" />}
          </div>
          <div
            className={cn(
              className,
              "bg-black rounded-b-lg border border-white/15 border-t-0 md:p-5 p-4"
            )}
          >
            <Skeleton className={cn("h-6 w-[200px]", loadingStyle)} />
          </div>
        </>
      ) : (
        <>
          <div
            className={cn(
              "md:flex block items-center justify-between md:flex-row flex-col gap-2 md:p-5 py-3 px-4"
            )}
          >
            <div className={cn("text-white font-bold md:text-lg text-base")}>
              {title}
            </div>
            {titleComponent && (
              <div
                className={cn("md:flex items-center gap-2 block mt-4 md:mt-0")}
              >
                {titleComponent}
              </div>
            )}
          </div>
          <div
            className={cn(
              className,
              "bg-black md:p-5 p-4 rounded-b-lg border border-white/15 border-t-0"
            )}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
};
