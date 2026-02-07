"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface DashboardData {
	datasets: Record<string, unknown>;
	loading: boolean;
	error: string | null;
}

const SUMMARY_CARDS = [
	{
		title: "GDP Growth",
		dataset: "NAS",
		description: "National Accounts Statistics",
		color: "from-amber-500/20 to-amber-600/20",
		borderColor: "border-amber-500/30",
		textColor: "text-amber-400",
	},
	{
		title: "CPI Inflation",
		dataset: "CPI",
		description: "Consumer Price Index",
		color: "from-rose-500/20 to-rose-600/20",
		borderColor: "border-rose-500/30",
		textColor: "text-rose-400",
	},
	{
		title: "WPI",
		dataset: "WPI",
		description: "Wholesale Price Index",
		color: "from-violet-500/20 to-violet-600/20",
		borderColor: "border-violet-500/30",
		textColor: "text-violet-400",
	},
	{
		title: "Industrial Output",
		dataset: "IIP",
		description: "Index of Industrial Production",
		color: "from-blue-500/20 to-blue-600/20",
		borderColor: "border-blue-500/30",
		textColor: "text-blue-400",
	},
	{
		title: "Unemployment Rate",
		dataset: "PLFS",
		description: "Periodic Labour Force Survey",
		color: "from-emerald-500/20 to-emerald-600/20",
		borderColor: "border-emerald-500/30",
		textColor: "text-emerald-400",
	},
	{
		title: "Energy",
		dataset: "ENERGY",
		description: "Energy Statistics",
		color: "from-cyan-500/20 to-cyan-600/20",
		borderColor: "border-cyan-500/30",
		textColor: "text-cyan-400",
	},
];

export default function DashboardPage() {
	const [state, setState] = useState<DashboardData>({
		datasets: {},
		loading: true,
		error: null,
	});

	const fetchOverview = useCallback(async () => {
		try {
			const response = await fetch("/api/data", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "overview" }),
			});
			if (response.ok) {
				const result = await response.json();
				setState({
					datasets: result.data || {},
					loading: false,
					error: null,
				});
			} else {
				setState((prev) => ({
					...prev,
					loading: false,
					error: "Failed to load dashboard data",
				}));
			}
		} catch {
			setState((prev) => ({
				...prev,
				loading: false,
				error: "Failed to connect to data service",
			}));
		}
	}, []);

	useEffect(() => {
		fetchOverview();
	}, [fetchOverview]);

	return (
		<div className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
			<div className="mx-auto max-w-5xl">
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-gray-100">
							Economic Dashboard
						</h1>
						<p className="mt-1 text-sm text-gray-400">
							Overview of key Indian economic indicators from MoSPI
						</p>
					</div>
					<Link
						href="/"
						className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10"
					>
						Ask the AI Agent
					</Link>
				</div>

				{state.error && (
					<div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
						{state.error}
					</div>
				)}

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{SUMMARY_CARDS.map((card) => (
						<div
							key={card.dataset}
							className={`rounded-xl border ${card.borderColor} bg-gradient-to-br ${card.color} p-5 backdrop-blur-sm transition-all hover:scale-[1.02]`}
						>
							<div className="flex items-start justify-between">
								<div>
									<h3 className={`text-sm font-medium ${card.textColor}`}>
										{card.title}
									</h3>
									<p className="mt-0.5 text-xs text-gray-500">
										{card.description}
									</p>
								</div>
								<span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-gray-400">
									{card.dataset}
								</span>
							</div>
							<div className="mt-4">
								{state.loading ? (
									<div className="h-8 w-24 animate-pulse rounded bg-white/10" />
								) : (
									<p className="text-lg font-semibold text-gray-200">
										Data available
									</p>
								)}
							</div>
							<Link
								href={`/?q=Tell me about the latest ${card.title} data from ${card.description}`}
								className="mt-3 inline-block text-xs text-gray-400 transition-colors hover:text-gray-200"
							>
								Explore with AI Agent &rarr;
							</Link>
						</div>
					))}
				</div>

				<div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
					<h2 className="mb-2 text-lg font-semibold text-gray-200">
						About the Data
					</h2>
					<p className="text-sm leading-relaxed text-gray-400">
						All data is sourced from the Ministry of Statistics and Programme
						Implementation (MoSPI), Government of India. The datasets include
						PLFS (employment), CPI (consumer inflation), WPI (wholesale prices),
						IIP (industrial production), NAS (national accounts/GDP), ASI
						(annual industrial survey), and ENERGY statistics. Data is fetched
						in real-time via the MoSPI MCP server and cached for performance.
					</p>
				</div>
			</div>
		</div>
	);
}
