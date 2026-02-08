import type { ReactNode } from "react";

/**
 * Layout for User/Member View (Experiences)
 * Uses Frosted UI theme variables for auto light/dark support
 */
export default function ExperienceLayout({
	children,
}: { children: ReactNode }) {
	return <div className="min-h-screen bg-gray-1">{children}</div>;
}
