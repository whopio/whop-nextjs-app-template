"use client";

import React from "react";
export class ErrorBoundary extends React.Component<
	{
		children: React.ReactNode;
	},
	{ errorMessage: string | null }
> {
	constructor(props: {
		children: React.ReactNode;
	}) {
		super(props);
		this.state = { errorMessage: null };
	}

	static getDerivedStateFromError(error: unknown) {
		// Update state so the next render will show the fallback UI.

		if (error instanceof Error) {
			return { errorMessage: error.message };
		}

		return { errorMessage: String(error) };
	}

	componentDidCatch(error: unknown, info: React.ErrorInfo) {
		console.error(error, info);
	}

	render() {
		if (this.state.errorMessage) {
			return <ErrorFallback errorMessage={this.state.errorMessage} />;
		}

		return this.props.children;
	}
}

export function ErrorFallback({ errorMessage }: { errorMessage: string }) {
	return (
		<div className="bg-red-500/20 text-red-500 p-3 rounded-lg">
			Error: {errorMessage}
		</div>
	);
}
