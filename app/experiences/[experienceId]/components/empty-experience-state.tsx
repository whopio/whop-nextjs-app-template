/**
 * Empty state shown when there are no active giveaways
 * for the given experience
 */
export function EmptyExperienceState() {
	return (
		<div className="min-h-screen bg-gray-1 flex items-center justify-center p-6">
			<div className="max-w-md w-full text-center space-y-6">
				{/* Icon */}
				<div className="w-24 h-24 mx-auto rounded-2xl bg-gray-a3 border border-gray-a6 flex items-center justify-center">
					<svg
						className="w-12 h-12 text-gray-8"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
						/>
					</svg>
				</div>

				{/* Message */}
				<div className="space-y-2">
					<h1 className="text-2xl font-bold text-gray-12">
						No Active Giveaways
					</h1>
					<p className="text-gray-10">
						There are no active giveaways at the moment. Check back
						later for new opportunities to win!
					</p>
				</div>

				{/* Decorative dots */}
				<div className="flex justify-center gap-2">
					<span className="w-2 h-2 rounded-full bg-gray-a6" />
					<span className="w-2 h-2 rounded-full bg-gray-a4" />
					<span className="w-2 h-2 rounded-full bg-gray-a6" />
				</div>

				{/* Notification info */}
				<div className="bg-gray-a2 border border-gray-a4 rounded-xl p-6 space-y-4">
					<p className="text-gray-11 text-sm">
						Want to be notified when a new giveaway drops?
					</p>
					<p className="text-gray-8 text-xs">
						Stay tuned to this page or follow us on social media for
						updates.
					</p>
				</div>
			</div>
		</div>
	);
}
