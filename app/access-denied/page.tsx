import { Button } from "@whop/react/components";
import Link from "next/link";

/**
 * Access denied page
 * Shown when user doesn't have permission to access a resource
 */
export default function AccessDeniedPage() {
	return (
		<div className="min-h-screen bg-gray-a1 flex items-center justify-center p-6">
			<div className="max-w-md w-full text-center">
				<div className="bg-gray-a2 border border-gray-a4 rounded-xl p-8">
					{/* Lock Icon */}
					<div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-a3 flex items-center justify-center">
						<svg
							className="w-10 h-10 text-orange-9"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
					</div>

					{/* Message */}
					<h1 className="text-7 font-bold text-gray-12 mb-3">
						Access Denied
					</h1>
					<p className="text-3 text-gray-10 mb-8">
						You don&apos;t have permission to access this dashboard.
						Only admins and owners of this Whop can access Giveaway
						Master settings.
					</p>

					{/* Help Text */}
					<div className="bg-gray-a3 rounded-lg p-4 mb-6 text-left">
						<p className="text-2 text-gray-10">
							<strong className="text-gray-12">
								Need access?
							</strong>{" "}
							Contact the owner of this Whop to request admin
							permissions.
						</p>
					</div>

					{/* Actions */}
					<div className="flex gap-3 justify-center">
						<Link href="https://whop.com" target="_blank">
							<Button variant="soft">Go to Whop</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
