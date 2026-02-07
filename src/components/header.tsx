"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
	const pathname = usePathname();

	return (
		<header className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
			<div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
				<Link href="/" className="flex items-center gap-2.5">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-emerald-500">
						<svg
							className="h-4 w-4 text-white"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<title>Logo</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5"
							/>
						</svg>
					</div>
					<div>
						<h1 className="text-sm font-semibold text-gray-100">
							India Economic Intelligence
						</h1>
						<p className="text-[10px] text-gray-500">
							Powered by MoSPI Live Data
						</p>
					</div>
				</Link>

				<nav className="flex items-center gap-1">
					<Link
						href="/"
						className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
							pathname === "/"
								? "bg-white/10 text-white"
								: "text-gray-400 hover:text-gray-200"
						}`}
					>
						Chat
					</Link>
					<Link
						href="/dashboard"
						className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
							pathname === "/dashboard"
								? "bg-white/10 text-white"
								: "text-gray-400 hover:text-gray-200"
						}`}
					>
						Dashboard
					</Link>
				</nav>
			</div>
		</header>
	);
}
