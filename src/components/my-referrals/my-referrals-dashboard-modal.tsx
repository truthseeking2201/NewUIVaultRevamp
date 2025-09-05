import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { DialogOutsideClose } from "@/components/ui/dialog-outside-close";
import { Button } from "@/components/ui/button";
import { SelectRender } from "@/components/ui/select-render";
import { Info } from "lucide-react";
import { TableRender } from "@/components/ui/table-render";
import { PaginationRender } from "@/components/ui/pagination-render";
import { InputSearch } from "@/components/ui/input-search";
import { getMyReferral } from "@/apis/wallet";
import { truncateStringWithSeparator } from "@/utils/helpers";
import { formatDate } from "@/utils/date";
import { showFormatNumber } from "@/lib/number";
import { USDC_CONFIG } from "@/config/coin-config";
import {
  TIME_FILTER,
  TIME_FILTER_OPTIONS_REFERRAL,
  SORT_TYPE,
} from "@/config/constants-types.ts";
import { useWallet } from "@/hooks";

interface MyReferralsDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MyReferralsDashboardModal({
  isOpen = false,
  onClose = () => {},
}: MyReferralsDashboardModalProps) {
  /**
   * DATA
   */
  const columns = [
    {
      title: "ADDRESS",
      dataIndex: "address",
      classHead: "pr-2 md:pr-6 pl-0 md:pl-6",
      classCell: "pr-2 md:pr-6 pl-0 md:pl-6",
      render: (value: any) => (
        <Button
          variant="icon"
          size="none"
          className=""
          onClick={() => handleCopy(value)}
          disabled={isLoading}
        >
          <span className="gradient-3rd-underline text-xs md:text-sm">
            {truncateStringWithSeparator(value, 13, "...", 6)}
          </span>
        </Button>
      ),
    },
    {
      title: "DATE JOINED",
      dataIndex: "dateJoin",
      keySort: "dateSort",
      classTitle: "min-w-[80px]",
      classHead: "px-2 md:px-6",
      classCell: "px-2 md:px-6",
      render: (value: any) => (
        <span className="font-mono text-075 text-xs md:text-sm">
          {formatDate(value)}
        </span>
      ),
    },
    {
      title: "DEPOSIT",
      dataIndex: "depositAmount",
      keySort: "depositSort",
      classHead: "pr-0 md:pr-6 pl-2 md:pl-6",
      classCell: "pr-0 md:pr-6 pl-2 md:pl-6",
      render: (value: any) => (
        <div className="flex items-center font-mono	text-white text-xs md:text-sm">
          <img
            src={USDC_CONFIG.image_url}
            alt={USDC_CONFIG.display_name}
            className="w-4 h-4 mr-1 flex-shrink-0"
          />
          {showFormatNumber(value || 0, 2, 2)}
        </div>
      ),
    },
  ];

  const defaultParamsRefer = {
    page: 1,
    limit: 10,
    address: "",
    timeSelect: TIME_FILTER.all,
    dateSort: SORT_TYPE.desc,
    depositSort: SORT_TYPE.desc,
    keySort: "dateSort",
  };

  const count = useRef<string>("");
  const [listRefer, setListRefer] = useState<any[]>([]);
  const [paramsRefer, setParamsRefer] = useState(defaultParamsRefer);
  const [totalRefer, setTotalRefer] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvalidAddress, setIsInvalidAddress] = useState(false);

  /**
   * HOOKS
   */
  const { address } = useWallet();
  const { toast } = useToast();

  /**
   * FUNCTION
   */
  const handleCopy = async (text) => {
    if (text) {
      await navigator.clipboard.writeText(text);
      toast({
        variant: "success",
        title: "Referral code copied",
        description: "Referral code copied to clipboard",
        duration: 2000,
      });
    }
  };

  const initData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!address) {
        setListRefer([]);
        return;
      }

      const sortField = {
        dateSort: "TIMESTAMP",
        depositSort: "TOTAL_DEPOSIT",
      };
      const params = {
        page: paramsRefer.page,
        limit: paramsRefer.limit,
        timeframe: paramsRefer.timeSelect,
        sortField: sortField[paramsRefer.keySort],
        sortType: paramsRefer[paramsRefer.keySort],
        filterWalletAddress: paramsRefer?.address
          ? encodeURIComponent(paramsRefer?.address)
          : undefined,
      };
      const response: any = await getMyReferral(params);
      const data = response?.data?.map((el, index) => {
        return {
          id: index,
          address: el?.wallet_address,
          dateJoin: el?.timestamp,
          depositAmount: el?.total_deposit || 0,
        };
      });
      setListRefer(data);
      setTotalRefer(response?.total || 0);
      // setTotalRefer(100);
    } catch (error) {
      console.log(error);
      setListRefer([]);
    }
    setIsLoading(false);
  }, [address, paramsRefer]);

  const changeSort = useCallback(
    async (key) => {
      const _params = { ...paramsRefer, keySort: key };
      _params[key] =
        _params[key] == SORT_TYPE.desc ? SORT_TYPE.asc : SORT_TYPE.desc;
      setParamsRefer(_params);
    },
    [paramsRefer]
  );
  const handlePageChange = useCallback(
    (page) => {
      setParamsRefer({ ...paramsRefer, page: page });
    },
    [paramsRefer]
  );
  const handleSelectTimeChange = useCallback(
    (value) => {
      setParamsRefer({ ...paramsRefer, timeSelect: value, page: 1 });
    },
    [paramsRefer]
  );
  const handleChangeAddress = useCallback(
    (inputValue) => {
      // const isAddress = isValidSuiAddress(inputValue);
      // if (isAddress || (paramsRefer.address && inputValue == "")) {
      if (inputValue || (paramsRefer.address && inputValue == "")) {
        setParamsRefer({ ...paramsRefer, address: inputValue, page: 1 });
      }
      // setIsInvalidAddress(inputValue && !isAddress);
    },
    [paramsRefer]
  );

  /**
   * LIFECYCLES
   */
  useEffect(() => {
    if (count.current !== address && address && isOpen) {
      setTotalRefer(0);
      initData();
      count.current = address;
    } else if (!isOpen) {
      count.current = "";
    }
  }, [address, isOpen, initData]);

  useEffect(() => {
    if (count.current) {
      initData();
    }
  }, [paramsRefer, initData]);

  /**
   * RENDER
   */
  return (
    <DialogOutsideClose
      open={isOpen}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      name="My Referral Dashboard"
      classNameDialog="md:max-w-[764px]"
    >
      <div className="grid gap-4 ">
        <div className="p-0 relative flex flex-col md:flex-row items-start justify-between flex-wrap">
          <div className="text-base md:text-xl font-bold m-0">
            My Referral Dashboard
          </div>

          <div className="flex gap-3 w-full md:w-2/3 mt-4 md:mt-0 ">
            <div className="ml-auto flex-1 md:max-w-60">
              <InputSearch
                placeholder="Search address"
                onChange={handleChangeAddress}
                disabled={isLoading}
                maxLength={66}
                className="text-sm md:text-base"
              />
              {isInvalidAddress && (
                <div className="text-red-error text-sm mt-1 flex items-center">
                  <Info
                    size={16}
                    className="mr-2"
                  />
                  Invalid address
                </div>
              )}
            </div>
            <SelectRender
              className="max-w-32 md:max-w-40"
              value={paramsRefer.timeSelect}
              options={TIME_FILTER_OPTIONS_REFERRAL}
              onChange={handleSelectTimeChange}
              disabled={isLoading}
            />
          </div>
        </div>

        <TableRender
          data={listRefer}
          columns={columns}
          isLoading={isLoading}
          paramsSearch={paramsRefer}
          changeSort={changeSort}
        />
        {totalRefer > 0 && (
          <PaginationRender
            className="mt-6"
            current={paramsRefer.page}
            pageSize={paramsRefer.limit}
            total={totalRefer}
            handlePageChange={handlePageChange}
            disabled={isLoading}
            templateShowing="Showing {min}-{max} of {total}"
          />
        )}
      </div>
    </DialogOutsideClose>
  );
}
