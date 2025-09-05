import React, { useState, useEffect, Fragment, useMemo, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine } from "recharts";
import { mockDataLiveChart, mockDataLiveChart2 } from "../constant";

type Period = "ONE_DAY" | "ONE_WEEK";

const UserPosition = ({ period }: { period: Period }) => {
  const [series, setSeries] = useState<Array<{ time: string; percentage: number }>>([]);
  const timerRef = useRef<number | null>(null);

  const maxPoints = period === "ONE_WEEK" ? 300 : 120; // rolling window

  // Seed from base mocks for a familiar shape, then stream in small updates
  const seedInitial = useMemo(() => {
    const base = period === "ONE_WEEK" ? mockDataLiveChart2 : mockDataLiveChart;
    const mapped = base.slice(-maxPoints).map((d: any, idx: number) => ({
      time: d.time || new Date(Date.now() - (maxPoints - idx) * 1000).toLocaleTimeString(),
      percentage: typeof d.percentage === "number" ? d.percentage : 0,
    }));
    if (mapped.length) return mapped;
    let v = 0;
    const arr: { time: string; percentage: number }[] = [];
    for (let i = 0; i < maxPoints; i++) {
      v = Math.max(-12, Math.min(12, v + (Math.random() - 0.5) * 1.2));
      arr.push({ time: new Date(Date.now() - (maxPoints - i) * 1000).toLocaleTimeString(), percentage: v });
    }
    return arr;
  }, [period, maxPoints]);

  useEffect(() => {
    setSeries(seedInitial);
  }, [seedInitial]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    timerRef.current = window.setInterval(() => {
      setSeries((prev) => {
        const last = prev.length ? prev[prev.length - 1].percentage : 0;
        const next = Math.max(-12, Math.min(12, last + (Math.random() - 0.5) * 0.6));
        const point = { time: new Date().toLocaleTimeString(), percentage: next };
        const combined = [...prev, point];
        return combined.length > maxPoints ? combined.slice(combined.length - maxPoints) : combined;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [maxPoints, period]);

  const lastIndex = series.length ? series.length - 1 : null;

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={series}
          margin={{ top: 16, right: 16, left: 16, bottom: 16 }}
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
            isAnimationActive={false}
            dot={({ cx, cy, index }) =>
              index === lastIndex ? (
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
