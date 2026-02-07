"use client";

const QUESTIONS = [
	{
		text: "What is India's current unemployment rate?",
		icon: "briefcase",
	},
	{
		text: "Compare GDP growth across the last 5 years",
		icon: "trending",
	},
	{
		text: "Which states have the highest inflation?",
		icon: "map",
	},
	{
		text: "Is there a correlation between industrial output and employment?",
		icon: "link",
	},
];

function QuestionIcon({ type }: { type: string }) {
	switch (type) {
		case "briefcase":
			return (
				<svg
					className="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={1.5}
				>
					<title>Employment</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"
					/>
				</svg>
			);
		case "trending":
			return (
				<svg
					className="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={1.5}
				>
					<title>Growth</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
					/>
				</svg>
			);
		case "map":
			return (
				<svg
					className="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={1.5}
				>
					<title>States</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
					/>
				</svg>
			);
		case "link":
			return (
				<svg
					className="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={1.5}
				>
					<title>Correlation</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
					/>
				</svg>
			);
		default:
			return null;
	}
}

export function StarterQuestions({
	onSelect,
}: {
	onSelect: (question: string) => void;
}) {
	return (
		<div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 px-4 sm:grid-cols-2">
			{QUESTIONS.map((q) => (
				<button
					key={q.text}
					type="button"
					onClick={() => onSelect(q.text)}
					className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-sm transition-all hover:border-amber-500/30 hover:bg-white/10"
				>
					<span className="mt-0.5 text-amber-400 transition-colors group-hover:text-amber-300">
						<QuestionIcon type={q.icon} />
					</span>
					<span className="text-sm text-gray-300 transition-colors group-hover:text-gray-100">
						{q.text}
					</span>
				</button>
			))}
		</div>
	);
}
