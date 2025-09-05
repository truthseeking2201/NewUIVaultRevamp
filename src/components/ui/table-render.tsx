import React, { ReactNode } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { SORT_TYPE } from "@/config/constants-types.ts";

interface ColumnsTable {
  title?: string | ReactNode;
  classTitle?: string;
  keySort?: string;
  dataIndex: string;
  classCell?: string;
  classHead?: string;
  render?: (value?: any, record?: any) => ReactNode;
}
interface rowsColspanTable {
  dataIndex: string;
  className?: string;
  checkHidden?: (record?: any) => boolean;
  render: (value?: any, record?: any) => ReactNode;
}

interface TableRenderProps {
  data: any[];
  columns: ColumnsTable[];
  rowsColspan?: rowsColspanTable[];
  labelNodata?: string;
  isLoading?: boolean;
  paramsSearch?: any;
  classRowBody?: string;
  numRowLoading?: number;
  headerClassName?: string;
  changeSort?: (key: string) => void;
  onRowClick?: (el: any) => void;
}

export function TableRender({
  data = [],
  columns = [],
  rowsColspan = [],
  labelNodata = "No data",
  isLoading = false,
  paramsSearch = {},
  changeSort = () => {},
  classRowBody = "",
  numRowLoading = 5,
  headerClassName = "",
  onRowClick = () => {},
}: TableRenderProps) {
  // const rows_colspan = useMemo(
  //   () => rowsColspan.filter((col) => !col?.isColspan),
  //   [rowsColspan]
  // );

  /**
   * RENDER
   */
  return (
    <Table className="w-full">
      <TableHeader className={headerClassName}>
        <TableRow className=" hover:bg-transparent">
          {columns.map((el, index) => (
            <TableHead
              key={`head-${index}`}
              className={cn(
                "text-xs tracking-wide text-075 px-6",
                el.keySort ? "cursor-pointer" : "",
                el?.classHead
              )}
              onClick={() => {
                if (el.keySort) {
                  changeSort(el.keySort);
                }
              }}
            >
              <div className={cn("flex items-center", el?.classTitle)}>
                {el.title &&
                  (typeof el.title === "string" ? (
                    <span className="text-xs md:text-base">{el.title}</span>
                  ) : (
                    el.title
                  ))}

                {el?.keySort && paramsSearch[el.keySort] && (
                  <Button
                    variant="icon"
                    size="none"
                    className="ml-1 md:ml-2"
                    onClick={() => changeSort(el.keySort)}
                    disabled={isLoading}
                  >
                    {paramsSearch[el.keySort] == SORT_TYPE.desc ? (
                      <ArrowDown className="!w-4 !h-4 md:!w-5 md:!h-5" />
                    ) : (
                      <ArrowUp className="!w-4 !h-4 md:!w-5 md:!h-5" />
                    )}
                  </Button>
                )}
              </div>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array(data?.length || numRowLoading)
            .fill(0)
            .map((_, i) => (
              <TableRow
                key={`row-${i}`}
                className={cn(
                  "hover:bg-white/5 font-medium border-b border-white/10",
                  classRowBody
                )}
              >
                {columns.map((column, index) => (
                  <TableCell
                    key={`loading-${index}`}
                    className={cn(
                      "px-6 py-3 h-[97px] align-middle",
                      column?.classCell
                    )}
                  >
                    <div
                      className={cn("h-5 bg-white/10 animate-pulse rounded")}
                    ></div>
                  </TableCell>
                ))}
              </TableRow>
            ))
        ) : !isLoading && data.length > 0 ? (
          data.map((el, index) => (
            <React.Fragment key={`row-group-${index}`}>
              <TableRow
                key={`index-${index}`}
                className={cn(
                  "hover:bg-white/5 cursor-pointer font-medium",
                  index !== data.length - 1 && "border-b border-white/10",
                  classRowBody
                )}
                onClick={() => onRowClick?.(el)}
              >
                {columns.map((column, ydx) => (
                  <TableCell
                    key={`${index}-cell-${ydx}`}
                    className={cn(
                      "px-6 py-3 h-[50.5px] align-middle",
                      column?.classCell
                    )}
                  >
                    {column.render
                      ? column.render(el[column.dataIndex], el)
                      : el[column.dataIndex]}
                  </TableCell>
                ))}
              </TableRow>

              {/* rowsColspan */}

              {rowsColspan?.map((row, ridx) => (
                <TableRow
                  key={`${index}-row-${ridx}`}
                  className={cn(
                    "hover:bg-inherit",
                    row.checkHidden?.(el) ? "hidden" : ""
                  )}
                >
                  <TableCell
                    colSpan={columns.length}
                    className={cn("px-6 py-1.5", row.className)}
                  >
                    {row.render(el[row.dataIndex], el)}
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))
        ) : (
          <TableRow className="hover:bg-inherit">
            <TableCell
              colSpan={columns.length}
              className="text-center py-8 text-white/60 border-t border-white/10"
            >
              {labelNodata}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
