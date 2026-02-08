export default function ExperienceLoading() {
	return (
		<div className="min-h-screen bg-gray-1 flex items-center justify-center p-6">
			<div className="max-w-lg w-full space-y-6">
				<div className="aspect-square w-full rounded-2xl bg-gray-a3 animate-pulse" />

				<div className="space-y-3">
					<div className="h-8 bg-gray-a3 rounded-lg w-3/4 mx-auto animate-pulse" />
					<div className="h-4 bg-gray-a3 rounded w-1/2 mx-auto animate-pulse" />
				</div>

				<div className="flex justify-center gap-4">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="text-center">
							<div className="w-16 h-16 bg-gray-a3 rounded-lg animate-pulse" />
							<div className="h-3 w-12 bg-gray-a3 rounded mt-2 mx-auto animate-pulse" />
						</div>
					))}
				</div>

				<div className="h-16 bg-gray-a3 rounded-xl animate-pulse" />

				<div className="flex justify-center gap-8">
					<div className="h-4 w-20 bg-gray-a3 rounded animate-pulse" />
					<div className="h-4 w-24 bg-gray-a3 rounded animate-pulse" />
				</div>
			</div>
		</div>
	);
}
