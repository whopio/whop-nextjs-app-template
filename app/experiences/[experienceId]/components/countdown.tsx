"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
	endDate: string;
	className?: string;
}

interface TimeLeft {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

function calculateTimeLeft(endDate: string): TimeLeft | null {
	const difference = new Date(endDate).getTime() - new Date().getTime();

	if (difference <= 0) {
		return null;
	}

	return {
		days: Math.floor(difference / (1000 * 60 * 60 * 24)),
		hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
		minutes: Math.floor((difference / 1000 / 60) % 60),
		seconds: Math.floor((difference / 1000) % 60),
	};
}

function TimeBlock({ value, label }: { value: number; label: string }) {
	return (
		<div className="text-center">
			<div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-a3 border border-gray-a6 rounded-xl flex items-center justify-center">
				<span className="text-2xl sm:text-3xl font-bold text-gray-12 tabular-nums">
					{value.toString().padStart(2, "0")}
				</span>
			</div>
			<span className="text-xs sm:text-sm text-gray-10 mt-2 block uppercase tracking-wider">
				{label}
			</span>
		</div>
	);
}

export function Countdown({ endDate, className = "" }: CountdownProps) {
	const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
		calculateTimeLeft(endDate),
	);

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeLeft(calculateTimeLeft(endDate));
		}, 1000);

		return () => clearInterval(timer);
	}, [endDate]);

	if (!timeLeft) {
		return (
			<div className={`text-center ${className}`}>
				<span className="text-xl font-bold text-red-11">
					GIVEAWAY ENDED
				</span>
			</div>
		);
	}

	return (
		<div className={`flex justify-center gap-3 sm:gap-4 ${className}`}>
			<TimeBlock value={timeLeft.days} label="Days" />
			<TimeBlock value={timeLeft.hours} label="Hours" />
			<TimeBlock value={timeLeft.minutes} label="Mins" />
			<TimeBlock value={timeLeft.seconds} label="Secs" />
		</div>
	);
}
