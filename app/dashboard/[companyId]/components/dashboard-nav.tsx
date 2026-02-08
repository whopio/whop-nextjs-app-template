"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardNavProps {
	companyId: string;
}

interface NavItem {
	label: string;
	href: string;
}

export function DashboardNav({ companyId }: DashboardNavProps) {
	const pathname = usePathname();
	const basePath = `/dashboard/${companyId}`;

	const navItems: NavItem[] = [
		{ label: "Overview", href: basePath },
		{ label: "Giveaways", href: `${basePath}/giveaways` },
		{ label: "Entries", href: `${basePath}/entries` },
		{ label: "Analytics", href: `${basePath}/analytics` },
		{ label: "Settings", href: `${basePath}/settings` },
	];

	return (
		<nav className="border-b border-gray-a4 bg-gray-a2 px-6">
			<div className="flex gap-1">
				{navItems.map((item) => {
					const isActive =
						item.href === basePath
							? pathname === basePath
							: pathname.startsWith(item.href);

					return (
						<Link
							key={item.href}
							href={item.href}
							className={`
								px-4 py-3 text-3 font-medium transition-colors
								border-b-2 -mb-px
								${
									isActive
										? "text-gray-12 border-blue-9"
										: "text-gray-10 border-transparent hover:text-gray-12 hover:border-gray-a6"
								}
							`}
						>
							{item.label}
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
