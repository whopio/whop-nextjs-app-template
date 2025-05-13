import type { PropsWithChildren } from "react";

export function SectionWrapper({
	children,
	title,
	description,
	index,
}: PropsWithChildren<{ title: string; description: string; index: number }>) {
	return (
		<div className="flex flex-col gap-2 border border-gray-200 dark:border-gray-800 p-2 rounded-lg">
			<div className="flex gap-2 items-center">
				<div className="flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 w-7 h-7 font-mono font-extrabold">
					{index}
				</div>
				<h2 className="text-2xl font-bold">{title}</h2>
			</div>
			<p className="text-sm text-gray-500">{description}</p>
			{children}
		</div>
	);
}
