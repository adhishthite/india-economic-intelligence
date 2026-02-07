"use client";

import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { ChartData } from "@/lib/types";

const CHART_COLORS = [
	"#f59e0b", // amber/saffron
	"#10b981", // emerald/green
	"#3b82f6", // blue
	"#ef4444", // red
	"#8b5cf6", // purple
];

export function ChartRenderer({ chart }: { chart: ChartData }) {
	const { type, title, xKey, yKeys, data, source } = chart;

	const renderChart = () => {
		const commonProps = {
			data,
			margin: { top: 5, right: 20, left: 10, bottom: 5 },
		};

		const axisProps = {
			stroke: "#6b7280",
			fontSize: 12,
			tickLine: false,
		};

		const gridProps = {
			strokeDasharray: "3 3",
			stroke: "#374151",
		};

		const tooltipProps = {
			contentStyle: {
				backgroundColor: "rgba(17, 24, 39, 0.95)",
				border: "1px solid rgba(255, 255, 255, 0.1)",
				borderRadius: "8px",
				color: "#e5e7eb",
				fontSize: "13px",
			},
		};

		switch (type) {
			case "bar":
				return (
					<BarChart {...commonProps}>
						<CartesianGrid {...gridProps} />
						<XAxis dataKey={xKey} {...axisProps} />
						<YAxis {...axisProps} />
						<Tooltip {...tooltipProps} />
						<Legend />
						{yKeys.map((key, i) => (
							<Bar
								key={key}
								dataKey={key}
								fill={CHART_COLORS[i % CHART_COLORS.length]}
								radius={[4, 4, 0, 0]}
							/>
						))}
					</BarChart>
				);
			case "area":
				return (
					<AreaChart {...commonProps}>
						<CartesianGrid {...gridProps} />
						<XAxis dataKey={xKey} {...axisProps} />
						<YAxis {...axisProps} />
						<Tooltip {...tooltipProps} />
						<Legend />
						{yKeys.map((key, i) => (
							<Area
								key={key}
								type="monotone"
								dataKey={key}
								stroke={CHART_COLORS[i % CHART_COLORS.length]}
								fill={CHART_COLORS[i % CHART_COLORS.length]}
								fillOpacity={0.15}
							/>
						))}
					</AreaChart>
				);
			default:
				return (
					<LineChart {...commonProps}>
						<CartesianGrid {...gridProps} />
						<XAxis dataKey={xKey} {...axisProps} />
						<YAxis {...axisProps} />
						<Tooltip {...tooltipProps} />
						<Legend />
						{yKeys.map((key, i) => (
							<Line
								key={key}
								type="monotone"
								dataKey={key}
								stroke={CHART_COLORS[i % CHART_COLORS.length]}
								strokeWidth={2}
								dot={{ r: 3 }}
								activeDot={{ r: 5 }}
							/>
						))}
					</LineChart>
				);
		}
	};

	return (
		<div className="my-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
			<h4 className="mb-3 text-sm font-semibold text-gray-200">{title}</h4>
			<div className="h-64 w-full">
				<ResponsiveContainer width="100%" height="100%">
					{renderChart()}
				</ResponsiveContainer>
			</div>
			{source && <p className="mt-2 text-xs text-gray-500">Source: {source}</p>}
		</div>
	);
}
