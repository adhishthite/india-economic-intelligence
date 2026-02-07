"use client";

import { type KeyboardEvent, useRef, useState } from "react";

interface ChatInputProps {
	onSend: (message: string) => void;
	isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
	const [input, setInput] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleSend = () => {
		const trimmed = input.trim();
		if (!trimmed || isLoading) return;
		onSend(trimmed);
		setInput("");
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleInput = () => {
		const el = textareaRef.current;
		if (el) {
			el.style.height = "auto";
			el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
		}
	};

	return (
		<div className="border-t border-white/10 bg-gray-950/80 backdrop-blur-xl">
			<div className="mx-auto flex max-w-3xl items-end gap-3 px-4 py-3">
				<textarea
					ref={textareaRef}
					value={input}
					onChange={(e) => {
						setInput(e.target.value);
						handleInput();
					}}
					onKeyDown={handleKeyDown}
					placeholder="Ask about India's economy..."
					rows={1}
					disabled={isLoading}
					className="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 disabled:opacity-50"
				/>
				<button
					type="button"
					onClick={handleSend}
					disabled={!input.trim() || isLoading}
					className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg transition-all hover:from-amber-500 hover:to-amber-400 disabled:opacity-40 disabled:shadow-none"
				>
					{isLoading ? (
						<svg
							className="h-5 w-5 animate-spin"
							fill="none"
							viewBox="0 0 24 24"
						>
							<title>Loading</title>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
							/>
						</svg>
					) : (
						<svg
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<title>Send</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
							/>
						</svg>
					)}
				</button>
			</div>
		</div>
	);
}
