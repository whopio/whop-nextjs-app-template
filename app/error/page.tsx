"use client";

import { Button } from "@whop/react/components";
import Link from "next/link";

/**
 * Generic error page
 * Shown for unhandled errors or authentication failures
 */
export default function ErrorPage() {
	return (
		<div className="min-h-screen bg-gray-a1 flex items-center justify-center p-6">
			<div className="max-w-md w-full text-center">
				<div className="bg-gray-a2 border border-gray-a4 rounded-xl p-8">
					{/* Error Icon */}
					<div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-a3 flex items-center justify-center">
						<svg
							className="w-10 h-10 text-red-9"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>

					{/* Message */}
					<h1 className="text-7 font-bold text-gray-12 mb-3">
						Oops! Something went wrong
					</h1>
					<p className="text-3 text-gray-10 mb-8">
						An unexpected error occurred. Please try again.
					</p>

					{/* Actions */}
					<div className="flex gap-3 justify-center">
						<Button
							variant="soft"
							onClick={() => window.history.back()}
						>
							Go Back
						</Button>
						<Link href="https://whop.com" target="_blank">
							<Button variant="classic">Return to Whop</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
