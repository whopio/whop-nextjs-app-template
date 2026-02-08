"use client";

import { useEffect } from "react";
import { Button } from "@whop/react/components";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
	useEffect(() => {
		console.error("[Dashboard Error]", error);
	}, [error]);

	const isAuthError =
		error.message.includes("authentication") ||
		error.message.includes("unauthorized") ||
		error.message.includes("access");

	return (
		<div className="min-h-[50vh] flex items-center justify-center p-6">
			<div className="max-w-md w-full text-center">
				<div className="bg-red-a2 border border-red-a6 rounded-xl p-8">
					<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-a3 flex items-center justify-center">
						<svg
							className="w-8 h-8 text-red-9"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>

					<h2 className="text-5 font-bold text-gray-12 mb-2">
						{isAuthError
							? "Access Denied"
							: "Something went wrong"}
					</h2>
					<p className="text-3 text-gray-10 mb-6">
						{isAuthError
							? "You don't have permission to access this page. Please contact the owner if you believe this is an error."
							: "An unexpected error occurred. Please try again or contact support if the problem persists."}
					</p>

					{process.env.NODE_ENV === "development" && (
						<div className="mb-6 p-4 bg-gray-a2 rounded-lg text-left">
							<p className="text-2 text-gray-10 font-mono break-all">
								{error.message}
							</p>
							{error.digest && (
								<p className="text-1 text-gray-8 mt-2">
									Digest: {error.digest}
								</p>
							)}
						</div>
					)}

					<div className="flex gap-3 justify-center">
						<Button
							variant="soft"
							onClick={() => window.history.back()}
						>
							Go Back
						</Button>
						{!isAuthError && (
							<Button variant="classic" onClick={reset}>
								Try Again
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
