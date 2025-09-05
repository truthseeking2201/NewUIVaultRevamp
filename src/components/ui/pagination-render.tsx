import { Button } from "@/components/ui/button";
import {
  ChevronLast,
  ChevronFirst,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationRenderProps {
  current: number;
  pageSize: number;
  total: number;
  handlePageChange: (value: number) => void;
  className?: string;
  hideShowing?: boolean;
  templateShowing?: string;
  disabled?: boolean;
}

export function PaginationRender({
  current = 0,
  pageSize = 10,
  total = 0,
  handlePageChange = () => {},
  className = "",
  hideShowing = false,
  templateShowing = "Showing {min}-{max} of {total} transactions",
  disabled = false,
}: PaginationRenderProps) {
  const displayTotalPages = Math.max(1, Math.ceil(total / pageSize));
  const formatStringShowing = (
    template: string,
    values: Record<string, string | number>
  ) => template.replace(/{(.*?)}/g, (_, key) => `${values[key] ?? ""}`);
  /**
   * RENDER
   */
  return (
    <div
      className={cn(
        "flex justify-between items-start flex-col md:flex-row flex-wrap gap-3",
        className
      )}
    >
      {hideShowing ? (
        <div></div>
      ) : (
        <div className="text-white text-xs">
          {formatStringShowing(templateShowing ?? "", {
            min: pageSize * (current - 1) + 1,
            max: Math.min(pageSize * current, total),
            total: total,
          })}
        </div>
      )}
      <div
        className={cn(
          "flex justify-center md:justify-end items-center gap-2 w-full md:w-fit",
          disabled ? "pointer-events-none cursor-not-allowed	" : ""
        )}
      >
        <Button
          onClick={() => handlePageChange(1)}
          disabled={current === 1}
          variant="pagination-default"
          size="pagination"
        >
          <ChevronFirst size={12} />
        </Button>
        <Button
          onClick={() => handlePageChange(current - 1)}
          disabled={current === 1}
          variant="pagination-default"
          size="pagination"
        >
          <ChevronLeft size={12} />
        </Button>
        <div className="flex space-x-2">
          {displayTotalPages === 0 ? (
            <Button
              key={1}
              onClick={() => handlePageChange(1)}
              variant="web3"
              size="pagination"
            >
              1
            </Button>
          ) : displayTotalPages <= 5 ? (
            Array.from({ length: displayTotalPages }, (_, i) => (
              <Button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                variant={current === i + 1 ? "web3" : "pagination-default"}
                size="pagination"
              >
                {i + 1}
              </Button>
            ))
          ) : (
            <>
              {current <= 3 ? (
                <>
                  {[1, 2, 3, 4, 5]
                    .filter((page) => page <= displayTotalPages)
                    .map((page) => (
                      <Button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        variant={
                          current === page ? "web3" : "pagination-default"
                        }
                        size="pagination"
                      >
                        {page}
                      </Button>
                    ))}
                  {displayTotalPages > 5 && (
                    <span className="px-2 text-white/60 select-none">...</span>
                  )}
                </>
              ) : current >= displayTotalPages - 2 ? (
                <>
                  <span className="px-2 text-white/60 select-none">...</span>
                  {Array.from(
                    { length: 5 },
                    (_, i) => displayTotalPages - 4 + i
                  )
                    .filter((page) => page >= 1 && page <= displayTotalPages)
                    .map((page) => (
                      <Button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        variant={
                          current === page ? "web3" : "pagination-default"
                        }
                        size="pagination"
                      >
                        {page}
                      </Button>
                    ))}
                </>
              ) : (
                <>
                  <span className="px-2 text-white/60 select-none">...</span>
                  {[current - 1, current, current + 1]
                    .filter((page) => page >= 1 && page <= displayTotalPages)
                    .map((page) => (
                      <Button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        variant={
                          current === page ? "web3" : "pagination-default"
                        }
                        size="pagination"
                      >
                        {page}
                      </Button>
                    ))}
                  <span className="px-2 text-white/60 select-none">...</span>
                </>
              )}
            </>
          )}
        </div>
        <Button
          onClick={() => handlePageChange(current + 1)}
          disabled={current === displayTotalPages}
          variant="pagination-default"
          size="pagination"
        >
          <ChevronRight size={12} />
        </Button>
        <Button
          onClick={() => handlePageChange(displayTotalPages)}
          disabled={current === displayTotalPages}
          variant="pagination-default"
          size="pagination"
        >
          <ChevronLast size={12} />
        </Button>
      </div>
    </div>
  );
}
