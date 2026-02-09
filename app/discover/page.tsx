import { Button } from "@whop/react/components";
import Link from "next/link";

export default function DiscoverPage() {
	return (
		<div className="min-h-screen bg-gray-1">
			<div className="max-w-4xl mx-auto px-4 py-16">
				{/* Hero */}
				<div className="text-center mb-16">
					<div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-a3 to-purple-a3 flex items-center justify-center">
						<svg
							className="w-10 h-10 text-blue-9"
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
					<h1 className="text-4xl sm:text-5xl font-bold text-gray-12 mb-4 break-words">
						Giveaway Master
					</h1>
					<p className="text-lg sm:text-xl text-gray-10 max-w-2xl mx-auto mb-8">
						Create viral giveaways with built-in referral tracking.
						Grow your audience exponentially through social sharing
						and referral incentives.
					</p>
					<Link href="https://whop.com/apps" target="_blank">
						<Button variant="classic" size="4">
							Install Giveaway Master
						</Button>
					</Link>
				</div>

				{/* Features */}
				<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-16">
					<div className="bg-gray-a2 border border-gray-a4 rounded-xl p-6 overflow-hidden">
						<h3 className="text-lg font-semibold text-gray-12 mb-2 break-words">
							Viral Referral System
						</h3>
						<p className="text-sm text-gray-10">
							Each participant gets a unique referral link. More
							referrals = more entries = higher chance of
							winning. Growth on autopilot.
						</p>
					</div>
					<div className="bg-gray-a2 border border-gray-a4 rounded-xl p-6 overflow-hidden">
						<h3 className="text-lg font-semibold text-gray-12 mb-2 break-words">
							Social Growth Actions
						</h3>
						<p className="text-sm text-gray-10">
							Require Twitter follows, Discord joins, YouTube
							subs, and more as entry actions. Grow every channel
							at once.
						</p>
					</div>
					<div className="bg-gray-a2 border border-gray-a4 rounded-xl p-6 overflow-hidden">
						<h3 className="text-lg font-semibold text-gray-12 mb-2 break-words">
							Fair Winner Selection
						</h3>
						<p className="text-sm text-gray-10">
							Weighted random selection rewards active
							participants. More entries from referrals means
							better odds.
						</p>
					</div>
				</div>

				{/* How it works */}
				<div className="bg-gray-a2 border border-gray-a4 rounded-xl p-8 mb-16">
					<h2 className="text-2xl font-bold text-gray-12 mb-6 text-center">
						How It Works
					</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
						{[
							{
								step: "1",
								title: "Create",
								desc: "Set up a giveaway with prize details and entry rules",
							},
							{
								step: "2",
								title: "Share",
								desc: "Participants enter and get unique referral links",
							},
							{
								step: "3",
								title: "Grow",
								desc: "Referrals earn bonus entries, creating viral loops",
							},
							{
								step: "4",
								title: "Pick",
								desc: "Select winners with fair weighted random selection",
							},
						].map((item) => (
							<div key={item.step} className="text-center">
								<div className="w-10 h-10 mx-auto mb-3 rounded-full bg-blue-a3 flex items-center justify-center text-blue-11 font-bold">
									{item.step}
								</div>
								<h3 className="font-semibold text-gray-12 mb-1">
									{item.title}
								</h3>
								<p className="text-xs text-gray-10">
									{item.desc}
								</p>
							</div>
						))}
					</div>
				</div>

				{/* CTA */}
				<div className="text-center">
					<p className="text-gray-10 mb-4">
						Ready to grow your audience with viral giveaways?
					</p>
					<Link href="https://whop.com/apps" target="_blank">
						<Button variant="classic" size="3">
							Get Started Free
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
