/**
 * Loading skeleton for dashboard content
 */
export function DashboardLoading() {
	return (
		<div className="animate-pulse space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				{[...Array(4)].map((_, i) => (
					<div
						key={i}
						className="bg-gray-a3 border border-gray-a4 rounded-xl p-4 h-24"
					>
						<div className="h-3 bg-gray-a5 rounded w-24 mb-3" />
						<div className="h-8 bg-gray-a5 rounded w-16" />
					</div>
				))}
			</div>

			<div className="bg-gray-a2 border border-gray-a4 rounded-xl p-6">
				<div className="h-6 bg-gray-a5 rounded w-48 mb-4" />
				<div className="space-y-3">
					<div className="h-4 bg-gray-a4 rounded w-full" />
					<div className="h-4 bg-gray-a4 rounded w-3/4" />
					<div className="h-4 bg-gray-a4 rounded w-1/2" />
				</div>
			</div>

			<div className="bg-gray-a2 border border-gray-a4 rounded-xl overflow-hidden">
				<div className="border-b border-gray-a4 p-4">
					<div className="h-5 bg-gray-a5 rounded w-32" />
				</div>
				<div className="divide-y divide-gray-a4">
					{[...Array(5)].map((_, i) => (
						<div key={i} className="p-4 flex items-center gap-4">
							<div className="h-10 w-10 bg-gray-a5 rounded-full" />
							<div className="flex-1 space-y-2">
								<div className="h-4 bg-gray-a5 rounded w-48" />
								<div className="h-3 bg-gray-a4 rounded w-32" />
							</div>
							<div className="h-8 bg-gray-a5 rounded w-20" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export function FullPageLoading() {
	return (
		<div className="min-h-screen bg-gray-a1 flex items-center justify-center">
			<div className="text-center">
				<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-a6 border-t-blue-9 mb-4" />
				<p className="text-3 text-gray-10">Loading...</p>
			</div>
		</div>
	);
}

export function LoadingSpinner({
	size = "md",
}: { size?: "sm" | "md" | "lg" }) {
	const sizeClasses = {
		sm: "h-4 w-4 border-2",
		md: "h-8 w-8 border-3",
		lg: "h-12 w-12 border-4",
	};

	return (
		<div
			className={`inline-block animate-spin rounded-full border-gray-a6 border-t-blue-9 ${sizeClasses[size]}`}
		/>
	);
}
