import React, { useState, useEffect, Fragment, useMemo, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import { mockDataLiveChart, mockDataLiveChart2 } from "../constant";

const UserPosition = ({ period }) => {
  console.log("UserPosition rendered with period:", period);
  const [timeFilter, setTimeFilter] = useState(period);
  // Local live data stream generated from the selected mock baseline
  const baselineRef = useRef(mockDataLiveChart);
  const [liveData, setLiveData] = useState(baselineRef.current);
  const tickRef = useRef(0);

  // Switch baseline when tab changes
  const chartData = useMemo(() => {
    if (timeFilter === "ONE_DAY") return mockDataLiveChart;
    if (timeFilter === "ONE_WEEK") return mockDataLiveChart2;
    return mockDataLiveChart;
  }, [timeFilter]);

  const checkPositionOfPrice = useMemo(() => {
    for (let i = liveData.length - 1; i >= 0; i--) {
      if (typeof (liveData as any)[i]?.price === "number" && !isNaN((liveData as any)[i]?.price)) {
        return i;
      }
    }
    return null;
  }, [liveData]);

  useEffect(() => {
    setTimeFilter(period);
  }, [period]);

  // Reset live stream when baseline changes
  useEffect(() => {
    baselineRef.current = chartData;
    setLiveData(chartData);
    tickRef.current = 0;
  }, [chartData]);

  // Mock real-time updates: shift + append a new point every 1s
  useEffect(() => {
    const id = setInterval(() => {
      setLiveData((prev) => {
        if (!prev?.length) return prev;
        const last = prev[prev.length - 1];
        const lastTs = last?.ts ? new Date(last.ts).getTime() : Date.now();
        const nextTs = lastTs + 60 * 1000; // advance by 1 minute per tick
        const t = tickRef.current + prev.length; // monotonically increase
        // Smooth mock series oscillating within ±9%
        const nextPct = Math.sin((t % 360) / 12) * 9;
        const next = {
          ts: new Date(nextTs).toISOString(),
          time: new Date(nextTs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          percentage: nextPct,
          price: (last?.price ?? 1) + (Math.random() - 0.5) * 0.1,
        } as any;
        tickRef.current += 1;
        const copy = prev.slice(1).concat(next);
        return copy;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      {/* Center real-time line overlay (styled to match Figma) */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2">
        {/* Core line */}
        <div
          className="h-full"
          style={{
            width: 2,
            background: "linear-gradient(180deg, #F2BB89 0%, #F3D2B5 50%, #F5C8A4 100%)",
          }}
        />
        {/* Soft glow */}
        <div
          className="absolute inset-y-0 -left-[4px] right-[-4px] blur-sm"
          style={{
            background: "linear-gradient(180deg, rgba(242,187,137,0.25) 0%, rgba(243,210,181,0.4) 50%, rgba(245,200,164,0.25) 100%)",
          }}
        />
        {/* End caps glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ background: "#F5C8A4" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ background: "#F2BB89" }} />
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={liveData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          width={500}
          height={300}
        >
          <defs>
            <linearGradient
              id="greenGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.70)" />
              <stop offset="38.16%" stopColor="rgba(16, 185, 129, 0.39)" />
              <stop offset="76.32%" stopColor="rgba(16, 185, 129, 0.10)" />
            </linearGradient>
            <linearGradient
              id="yellowGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%" stopColor="#FBBF24" stopOpacity={0} />
              <stop offset="100%" stopColor="#FBBF24" stopOpacity={1} />
            </linearGradient>
            <linearGradient
              id="redGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.80)" />
              <stop offset="48%" stopColor="rgba(239, 68, 68, 0.80)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0.20)" />
            </linearGradient>
            <linearGradient id="customLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F2BB89" />
              <stop offset="50.48%" stopColor="#F3D2B5" />
              <stop offset="100%" stopColor="#F5C8A4" />
            </linearGradient>
          </defs>
          <ReferenceArea y1={0} y2={15} fill="url(#greenGradient)" />
          <ReferenceArea y1={-5} y2={0} fill="url(#yellowGradient)" />
          <ReferenceArea y1={-15} y2={-5} fill="url(#redGradient)" />

          <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />

          {/* <CartesianGrid strokeDasharray="3 3" stroke="#374151" /> */}

          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            padding={{ left: 10, right: 10 }}
          />

          <YAxis
            domain={[-15, 15]}
            tickFormatter={(value) => `${value > 0 ? "+" : ""}${value}%`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="percentage"
            stroke="url(#customLineGradient)"
            strokeWidth={2}
            dot={({ cx, cy, index }) =>
              index === checkPositionOfPrice ? (
                <Fragment key={index}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={8}
                    fill="white"
                    style={{ filter: "blur(6px)" }}
                    className="animate-pulse"
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill="black"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                </Fragment>
              ) : null
            }
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserPosition;
