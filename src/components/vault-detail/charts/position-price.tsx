import { Button } from "@/components/ui/button";
import { BasicVaultDetailsType } from "@/types/vault-config.types";
import { convertTokenBase } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { ArrowLeftRight } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import {
  Bar,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PERIOD_TABS } from "../constant";
import { formatNumber } from "@/lib/number";
import { DynamicFontText } from "@/components/ui/dynamic-font-text";
import { cn } from "@/lib/utils";
import useBreakpoint from "@/hooks/use-breakpoint";
import ConditionRenderer from "@/components/shared/condition-renderer";
import { Skeleton } from "@/components/ui/skeleton";
import ChartNoData from "@/components/vault-detail/charts/empty-data.tsx";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  isConvertedToken: boolean;
}

interface PositionPriceChartProps {
  period: string;
  analyticsData: any;
  vault: BasicVaultDetailsType;
  onEmptyStateChange?: (empty: boolean) => void;
  isLoading?: boolean;
}

/**
 * Custom Legend component to avoid DOM prop warnings
 */
const CustomLegend = () => {
  const { isMobile } = useBreakpoint();
  return (
    <div className="flex md:gap-[200px] gap-4 justify-center">
      <div className="flex items-center gap-2">
        <span
          style={{
            display: "inline-block",
            width: isMobile ? 50 : 100,
            height: 3,
            background: "linear-gradient(90deg, #9DEBFF 0%, #00FF5E 100%)",
            borderRadius: 1,
          }}
        />
        <span className="md:text-sm text-[10px] text-white font-bold">
          Price
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span
          style={{
            display: "inline-block",
            width: isMobile ? 19 : 38,
            height: isMobile ? 6 : 12,
            background: "rgba(253, 235, 207, 0.6)",
            borderRadius: 2,
          }}
        />
        <span className="md:text-sm text-[10px] text-white font-bold">
          Range
        </span>
      </div>
    </div>
  );
};
const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload || !payload.length) return null;

  const priceData = payload[0]?.payload;

  if (!priceData) return null;

  const displayPriceNum = Number(priceData.displayPrice);
  const minRangeNum = Number(priceData.rangeMin);
  const maxRangeNum = Number(priceData.rangeMax);

  const price = formatNumber(displayPriceNum, 0, displayPriceNum < 1 ? 6 : 3);
  const range = `${formatNumber(
    minRangeNum,
    0,
    minRangeNum < 1 ? 6 : 3
  )} - ${formatNumber(maxRangeNum, 0, maxRangeNum < 1 ? 6 : 3)}`;

  return (
    <div className="bg-black p-3 border border-white/20 rounded-lg shadow-lg w-[250px]">
      <div className="text-xs font-bold text-white mb-[6px]">
        {formatDate(label, "dd MMM yyyy HH:mm")}
      </div>
      {price && (
        <div className="flex items-end justify-between mb-1">
          <span className="font-medium text-xs text-white/80">
            Position Price:{" "}
          </span>
          <span className="font-mono text-sm font-semibold text-white">
            {price}
          </span>
        </div>
      )}
      <div className="flex items-end justify-between">
        <span className="font-medium text-xs text-white/80">Range: </span>
        <DynamicFontText
          className={cn(
            "font-mono font-semibold text-white",
            displayPriceNum > 10000 ? "text-xs" : "text-sm"
          )}
          defaultFontSize="text-sm"
        >
          {range}
        </DynamicFontText>
      </div>
    </div>
  );
};

const PositionPriceChart = ({
  period,
  analyticsData,
  vault,
  isLoading,
  onEmptyStateChange,
}: PositionPriceChartProps) => {
  const [isConvertedToken, setIsConvertedToken] = useState(false);
  const { isMobile } = useBreakpoint();
  const chartData = useMemo(() => {
    let dataList = analyticsData?.list;
    if (!dataList || dataList.length === 0) {
      return [];
    }
    if (period === PERIOD_TABS[1].value) {
      dataList = dataList.slice(-73);
    }
    const chartPoints = [];
    let prevRangeMin = "";
    let prevRangeMax = "";
    let prevDisplayPrice = "";
    let foundFirstValid = false;
    for (let i = 0; i < dataList.length; i++) {
      const dataPoint = dataList[i];
      // Only skip leading zeroes
      if (
        !foundFirstValid &&
        Number(dataPoint.value.real) === 0 &&
        Number(dataPoint.value.lower) === 0 &&
        Number(dataPoint.value.upper) === 0
      ) {
        continue;
      }
      if (!foundFirstValid && Number(dataPoint.value.real) !== 0)
        foundFirstValid = true;

      let lower = Number(dataPoint.value.lower);
      let upper = Number(dataPoint.value.upper);
      let real = Number(dataPoint.value.real);
      let rangeMin = isConvertedToken
        ? convertTokenBase(upper, true)
        : lower;
      let rangeMax = isConvertedToken
        ? convertTokenBase(lower, true)
        : upper;
      let displayPrice = isConvertedToken
        ? convertTokenBase(real, true)
        : real;

      // For non-leading zeroes, use previous value
      if (real === 0 && chartPoints.length > 0) {
        displayPrice = prevDisplayPrice;
        real = Number(prevDisplayPrice);
      }
      if (lower === 0 && chartPoints.length > 0) {
        rangeMin = prevRangeMin;
        lower = Number(prevRangeMin);
      }
      if (upper === 0 && chartPoints.length > 0) {
        rangeMax = prevRangeMax;
        upper = Number(prevRangeMax);
      }

      chartPoints.push({
        timestamp: dataPoint.value.date,
        value: {
          real,
          lower,
          upper,
        },
        displayPrice,
        rangeMax,
        rangeMin,
        range: [rangeMin, rangeMax],
      });

      prevRangeMin = String(rangeMin);
      prevRangeMax = String(rangeMax);
      prevDisplayPrice = String(displayPrice);
    }
    return chartPoints;
  }, [analyticsData, period, isConvertedToken]);

  const currentData = useMemo(
    () => chartData?.[chartData.length > 0 ? chartData.length - 1 : 0],
    [chartData]
  );

  const currentPrice = useMemo(
    () =>
      isConvertedToken
        ? convertTokenBase(Number(currentData?.value?.real), true)
        : Number(currentData?.value?.real),
    [isConvertedToken, currentData]
  );
  const minPrice = useMemo(
    () =>
      isConvertedToken
        ? convertTokenBase(Number(currentData?.value?.upper), true)
        : Number(currentData?.value?.lower),
    [isConvertedToken, currentData]
  );
  const maxPrice = useMemo(
    () =>
      isConvertedToken
        ? convertTokenBase(Number(currentData?.value?.lower), true)
        : Number(currentData?.value?.upper),
    [isConvertedToken, currentData]
  );

  const isWeek = useMemo(() => {
    return period === PERIOD_TABS[1].value;
  }, [period]);

  const pair = useMemo(
    () => (vault?.pool?.pool_name || "").replace(/\//g, "-").split("-") || [],
    [vault]
  );

  const checkOffset = useMemo(() => {
    return (ref: number) => {
      let offset = 2;
      const extendRange = ref < Math.pow(10, 4) ? 0.7 : 1;
      if (ref <= 0) {
        offset = 0.0000001;
      } else {
        const exponent = Math.floor(Math.log10(ref));
        offset = Math.pow(10, exponent - extendRange);
      }
      return offset;
    };
  }, []);

  const handleSwapConversion = () => {
    setIsConvertedToken(!isConvertedToken);
  };

  // Memoize the index of the last valid displayPrice
  const lastPriceIndex = useMemo(() => {
    for (let i = chartData.length - 1; i >= 0; i--) {
      return i;
    }
    return null;
  }, [chartData]);

  if ((!chartData || chartData?.length === 0) && !isLoading) {
    onEmptyStateChange(true);
    return (
      <ChartNoData>
        <div className="text-white/60 text-sm mb-6 text-center">
          {period === PERIOD_TABS[0].value ? (
            <span>
              Chill out — we’re collecting 24-hour {isMobile && <br />}
              performance data. The report will be {isMobile && <br />}
              available soon.
            </span>
          ) : (
            <span>
              Chill out — we’re collecting 7-day {isMobile && <br />}
              performance data. The report will be{isMobile && <br />} available
              soon.
            </span>
          )}
        </div>
      </ChartNoData>
    );
  }

  return (
    <ConditionRenderer
      when={!isLoading}
      fallback={<Skeleton className="w-full h-[400px]" />}
    >
      <div className="w-full h-[400px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center md:gap-4 gap-2 w-full">
            <div className="md:p-4 p-3 border border-[#2A2A2A] rounded-lg w-full bg-white/10">
              <div className="text-white/80 md:text-sm text-[9px]">
                MIN PRICE
              </div>
              <div className="font-mono font-semibold md:text-base text-sm text-white">
                {formatNumber(minPrice, 0, minPrice < 1 ? 6 : 4)}
                {isMobile && <br />}
                <span className="text-white/80 font-sans font-normal md:ml-2 ml-0 md:text-base text-[10px]">
                  {isConvertedToken
                    ? `${pair[1]}/${pair[0]}`
                    : `${pair[0]}/${pair[1]}`}
                </span>
              </div>
            </div>
            <div className="md:p-4 p-3 border border-[#2A2A2A] rounded-lg w-full bg-white/10">
              <div className="text-white/80 md:text-sm text-[9px]">
                CURRENT PRICE
              </div>
              <div className="font-mono font-semibold text-white md:text-base text-sm">
                {formatNumber(currentPrice, 0, currentPrice < 1 ? 6 : 4)}
                {isMobile && <br />}
                <span className="text-white/80 font-sans font-normal md:ml-2 ml-0 md:text-base text-[10px]">
                  {isConvertedToken
                    ? `${pair[1]}/${pair[0]}`
                    : `${pair[0]}/${pair[1]}`}
                </span>
              </div>
            </div>
            <div className="md:p-4 p-3 border border-[#2A2A2A] rounded-lg relative w-full bg-white/10">
              <Button
                variant="outline"
                size="xs"
                onClick={handleSwapConversion}
                className="absolute md:top-2 md:right-2 top-1 right-1 rounded-md md:h-7 md:w-7 w-5 h-6 bg-white/15 "
              >
                <ArrowLeftRight className="!md:h-4 !md:w-4 !h-3 !w-3" />
              </Button>
              <div className="text-white/80 md:text-sm text-[9px]">
                MAX PRICE
              </div>
              <div className="font-mono font-semibold text-white md:text-base text-sm">
                {formatNumber(maxPrice, 0, maxPrice < 1 ? 6 : 4)}
                {isMobile && <br />}
                <span className="text-white/80 font-sans font-normal md:ml-2 ml-0 md:text-base text-[10px]">
                  {isConvertedToken
                    ? `${pair[1]}/${pair[0]}`
                    : `${pair[0]}/${pair[1]}`}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div
          className="w-full rounded-[10.742px] border-[0.671px] border-white/5 p-1"
          style={{
            background:
              "linear-gradient(180deg, rgba(16,185,129,0.05) 0%, rgba(16,185,129,0.02) 33%, rgba(251,191,36,0.02) 33%, rgba(251,191,36,0.05) 66%, rgba(239,68,68,0.02) 66%, rgba(239,68,68,0.05) 100%), #0A0A0A",
          }}
        >
          <ResponsiveContainer width="100%" height={isMobile ? 278 : 300}>
            <ComposedChart
              data={chartData}
              barCategoryGap={6}
              margin={{
                top: isMobile ? 10 : 10,
                right: isMobile ? 20 : 20,
                bottom: isMobile ? 10 : 10,
                left: isMobile ? (minPrice < 1 ? 10 : -10) : 10,
              }}
            >
              <defs>
                <linearGradient
                  id="priceLineGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#9DEBFF" />
                  <stop offset="100%" stopColor="#00FF5E" />
                </linearGradient>
                <radialGradient id="dotGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#00FF5E" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#00FF5E" stopOpacity="0" />
                </radialGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                tick={({ x, y, payload }) => (
                  <text
                    x={x + 4}
                    y={y + 8}
                    fontSize={12}
                    className="font-mono text-white/75 md:text-xs text-[10px]"
                    fill="#fff"
                    textAnchor="middle"
                  >
                    {isWeek
                      ? formatDate(payload.value, "dd/MM HH:mm")
                      : formatDate(payload.value, "HH:mm")}
                  </text>
                )}
                axisLine={false}
                tickLine={false}
                interval={isWeek ? (isMobile ? 20 : 15) : 5}
              />
              <YAxis
                domain={([dataMin, dataMax]) => {
                  // Use the first chartData rangeMin as reference
                  const ref =
                    chartData.length > 0 ? Number(chartData[0].rangeMin) : 0;
                  const offset = checkOffset(ref);
                  const min = dataMin - offset > 0 ? dataMin - offset : 0;
                  const max = dataMax + offset;
                  return [min, max];
                }}
                axisLine={false}
                tickLine={false}
                orientation="left"
                tick={({ x, y, payload }) => {
                  let decimalPlaces = 2;
                  if (payload.value < 1) {
                    decimalPlaces = 6;
                  } else if (payload.value < Math.pow(10, 4)) {
                    decimalPlaces = 2;
                  } else {
                    decimalPlaces = 0;
                  }
                  return (
                    <text
                      x={x}
                      y={y}
                      fontSize={12}
                      className="font-mono text-white"
                      fill="#fff"
                      textAnchor="end"
                    >
                      {formatNumber(payload.value, 0, decimalPlaces)}
                    </text>
                  );
                }}
              />

              <Legend content={<CustomLegend />} />
              <Tooltip
                content={<CustomTooltip isConvertedToken={isConvertedToken} />}
              />
              <Bar
                dataKey="range"
                fill="rgba(253, 235, 207, 0.6)"
                opacity={0.7}
                radius={[2, 2, 0, 0]}
                barSize={period === PERIOD_TABS[1].value ? 8 : 12}
              />
              <Line
                type="monotone"
                dataKey="displayPrice"
                stroke="url(#priceLineGradient)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
              />
              {/* Custom last dot with gradient and blur */}
              <Line
                type="monotone"
                dataKey="displayPrice"
                stroke="none"
                dot={({ cx, cy, index }) =>
                  index === lastPriceIndex ? (
                    <Fragment key={index}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={16}
                        fill="url(#dotGradient)"
                        style={{
                          filter: "blur(3px)",
                          opacity: 0,
                          animation: "fadeInDot 1s 1.25s forwards",
                        }}
                        className="animate-pulse"
                      />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill="#00FF5E"
                        stroke="#fff"
                        strokeWidth={1}
                        style={{
                          opacity: 0,
                          animation: "fadeInDot 1s 1.25s forwards",
                        }}
                      />
                      <style>
                        {`
                    @keyframes fadeInDot {
                    from { opacity: 0; }
                    to { opacity: 1; }
                    }
                  `}
                      </style>
                    </Fragment>
                  ) : null
                }
                isAnimationActive={true}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ConditionRenderer>
  );
};

export default PositionPriceChart;
