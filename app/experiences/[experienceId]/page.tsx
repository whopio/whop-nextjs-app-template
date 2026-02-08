"use client";

import { useState, useEffect, useRef, useMemo} from "react";
import { motion, AnimatePresence } from "framer-motion";
import useUser from "@whop/sdk";
import { useWhopAuth } from "@/app/hooks/useWhopAuth";
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	CellProps,
} from "recharts";
import {
	TrendingUp,
	Flame,
	Trophy,
	Target,
	DollarSign,
	BarChart3,
	Plus,
	X,
	CheckCircle2,
	AlertCircle,
	Brain,
	Shield,
	BookOpen,
	Ban,
	Camera,
	Filter,
	Download,
	Search,
	Play,
	Pause,
	Settings,
	Calendar,
	Clock,
	Image as ImageIcon,
	FileText,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { 
	format, 
	subDays, 
	isToday, 
	parseISO, 
	startOfDay,
	startOfMonth,
	endOfMonth,
	startOfWeek,
	endOfWeek,
	addMonths,
	subMonths,
	getDaysInMonth,
	isSameMonth,
	isSameDay,
	eachDayOfInterval,
	getWeek,
} from "date-fns";
import { useSupabaseState } from "@/app/hooks/useSupabaseState";

interface Trade {
	id: string;
	ticker: string;
	entryPrice: number;
	exitPrice: number;
	quantity: number;
	leverage: number;
	pnl: number;
	date: string;
	setup: string;
	emotion: string;
	notes: string;
	followedRules: boolean;
	tags: string[];
	chartImage?: string;
	preTradeChecklist?: {
		partOfPlan: boolean;
		emotionallyNeutral: boolean;
		checkedFundamentals: boolean;
		riskManaged: boolean;
	};
}

interface DailyCheckIn {
	date: string;
	mood: number;
	sleepQuality: number;
	stressLevel: number;
	notes: string;
}

interface BlockedTicker {
	ticker: string;
	reason: string;
	dateBlocked: string;
}

interface Achievement {
	id: string;
	name: string;
	description: string;
	icon: string;
	unlocked: boolean;
	unlockedDate?: string;
}

const COLORS = {
	profit: "#10b981",
	loss: "#ef4444",
	neutral: "#6b7280",
	streak: "#f59e0b",
};

const SETUPS = [
	"Breakout",
	"Pullback",
	"Reversal",
	"Trend Following",
	"Range Trade",
	"News Trade",
	"FOMO",
	"Other",
];

const EMOTIONS = [
	"Confident",
	"Neutral",
	"Anxious",
	"FOMO",
	"Revenge",
	"Excited",
	"Calm",
];

const ACHIEVEMENTS: Achievement[] = [
	{
		id: "streak-7",
		name: "Week Warrior",
		description: "7-day journaling streak",
		icon: "🔥",
		unlocked: false,
	},
	{
		id: "streak-30",
		name: "Disciplined Trader",
		description: "30 days following rules",
		icon: "🛡️",
		unlocked: false,
	},
	{
		id: "trades-50",
		name: "Risk Manager",
		description: "50 trades with proper position sizing",
		icon: "📊",
		unlocked: false,
	},
	{
		id: "streak-100",
		name: "Journal Warrior",
		description: "100 consecutive days logging",
		icon: "⚔️",
		unlocked: false,
	},
	{
		id: "comeback",
		name: "Comeback Kid",
		description: "Recovered from 3-trade losing streak",
		icon: "💪",
		unlocked: false,
	},
];

export default function Page() {
	const [userId, setUserId] = useState<string>("");
 
	// ✅ Fetch real Whop user ID
	useEffect(() => {
	  fetch('/api/auth/user')
		 .then(r => r.json())
		 .then(data => {
			if (data.userId) {
			  setUserId(data.userId);
			}
		 })
		 .catch(() => {});
	}, []);

	const [displayName, setDisplayName] = useSupabaseState<string>(userId, 'display_name', "Trader");
	const [trades, setTrades, { loading, syncing }] = useSupabaseState<Trade[]>(userId, 'trades', []);
	const [blockedTickers, setBlockedTickers] = useSupabaseState<BlockedTicker[]>(userId, 'blocked_tickers', []);
	const [dailyCheckIns, setDailyCheckIns] = useSupabaseState<DailyCheckIn[]>(userId, 'daily_checkins', []);
	const [achievements, setAchievements] = useSupabaseState<Achievement[]>(userId, 'achievements', ACHIEVEMENTS);
	const [showTradeForm, setShowTradeForm] = useState(false);
	const [showPreTradeChecklist, setShowPreTradeChecklist] = useState(false);
	const [showBlocklist, setShowBlocklist] = useState(false);
	const [showCheckIn, setShowCheckIn] = useState(false);
	const [selectedTab, setSelectedTab] = useState<"dashboard" | "trades" | "insights" | "calendar" | "settings">("dashboard");
	const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
	const [showCelebration, setShowCelebration] = useState(false);
	const [celebrationMessage, setCelebrationMessage] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [filterSetup, setFilterSetup] = useState<string>("all");
	const [filterEmotion, setFilterEmotion] = useState<string>("all");
	const [replayIndex, setReplayIndex] = useState<number>(-1);
	const [isReplaying, setIsReplaying] = useState(false);
	const replayIntervalRef = useRef<NodeJS.Timeout | null>(null);

	// Check if ticker is blocked
	const isTickerBlocked = (ticker: string) => {
		return blockedTickers.some((b) => b.ticker.toUpperCase() === ticker.toUpperCase());
	};

	// Filtered trades - optimized
	const filteredTrades = useMemo(() => {
		const query = searchQuery.toLowerCase();
		return trades
			.filter((t) => 
				(!query || t.ticker.toLowerCase().includes(query) || t.notes.toLowerCase().includes(query)) &&
				(filterSetup === "all" || t.setup === filterSetup) &&
				(filterEmotion === "all" || t.emotion === filterEmotion)
			)
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	}, [trades, searchQuery, filterSetup, filterEmotion]);

	// Calculate stats - optimized with single pass
	const stats = useMemo(() => {
		let wins = 0;
		let losses = 0;
		let pnl = 0;
		let winSum = 0;
		let lossSum = 0;
		let rulesFollowed = 0;

		trades.forEach((t) => {
			pnl += t.pnl;
			if (t.pnl > 0) {
				wins++;
				winSum += t.pnl;
			} else {
				losses++;
				lossSum += Math.abs(t.pnl);
			}
			if (t.followedRules) rulesFollowed++;
		});

		const totalTrades = trades.length;
		const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
		const avgWin = wins > 0 ? winSum / wins : 0;
		const avgLoss = losses > 0 ? lossSum / losses : 0;
		const riskReward = avgLoss > 0 ? avgWin / avgLoss : 0;
		const rulesAdherence = totalTrades > 0 ? (rulesFollowed / totalTrades) * 100 : 0;

		// Calculate streak
		const sortedTrades = [...trades].sort((a, b) => 
			new Date(b.date).getTime() - new Date(a.date).getTime()
		);
		let streak = 0;
		const today = new Date();
		for (let i = 0; i < sortedTrades.length; i++) {
			const tradeDate = parseISO(sortedTrades[i].date);
			const expectedDate = subDays(today, i);
			if (
				format(tradeDate, "yyyy-MM-dd") === format(expectedDate, "yyyy-MM-dd") ||
				(i === 0 && isToday(tradeDate))
			) {
				streak++;
			} else {
				break;
			}
		}

		// Calculate equity curve
		const equityCurve = trades
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
			.reduce((acc, trade, index) => {
				const prevEquity = acc.length > 0 ? acc[acc.length - 1].equity : 0;
				acc.push({
					date: format(parseISO(trade.date), "MMM dd"),
					equity: prevEquity + trade.pnl,
					trade: index + 1,
				});
				return acc;
			}, [] as { date: string; equity: number; trade: number }[]);

		// Heat map data (trading by hour)
		const heatMapData = Array.from({ length: 24 }, (_, hour) => {
			const tradesAtHour = trades.filter((t) => {
				const tradeHour = new Date(t.date).getHours();
				return tradeHour === hour;
			});
			const wins = tradesAtHour.filter((t) => t.pnl > 0).length;
			const losses = tradesAtHour.filter((t) => t.pnl < 0).length;
			const winRate = tradesAtHour.length > 0 ? (wins / tradesAtHour.length) * 100 : 0;
			return {
				hour,
				count: tradesAtHour.length,
				winRate,
				label: `${hour}:00`,
			};
		});

		return {
			totalTrades,
			winningTrades: wins,
			losingTrades: losses,
			totalPnl: pnl,
			winRate,
			avgWin,
			avgLoss,
			riskReward,
			rulesAdherence,
			streak,
			equityCurve,
			heatMapData,
		};
	}, [trades]);

	// Check achievements
	useEffect(() => {
		if (typeof window === "undefined") return;
		const newAchievements = [...achievements];
		let unlocked = false;

		if (stats.streak >= 7 && !achievements.find((a) => a.id === "streak-7")?.unlocked) {
			const idx = newAchievements.findIndex((a) => a.id === "streak-7");
			if (idx >= 0) {
				newAchievements[idx].unlocked = true;
				newAchievements[idx].unlockedDate = new Date().toISOString();
				unlocked = true;
				setCelebrationMessage("🔥 Week Warrior! 7-day streak unlocked!");
			}
		}
		if (stats.streak >= 30 && !achievements.find((a) => a.id === "streak-30")?.unlocked) {
			const idx = newAchievements.findIndex((a) => a.id === "streak-30");
			if (idx >= 0 && !newAchievements[idx].unlocked) {
				newAchievements[idx].unlocked = true;
				newAchievements[idx].unlockedDate = new Date().toISOString();
				unlocked = true;
				setCelebrationMessage("🛡️ Disciplined Trader! 30-day streak!");
			}
		}
		if (stats.streak >= 100 && !achievements.find((a) => a.id === "streak-100")?.unlocked) {
			const idx = newAchievements.findIndex((a) => a.id === "streak-100");
			if (idx >= 0 && !newAchievements[idx].unlocked) {
				newAchievements[idx].unlocked = true;
				newAchievements[idx].unlockedDate = new Date().toISOString();
				unlocked = true;
				setCelebrationMessage("⚔️ Journal Warrior! 100-day streak!");
			}
		}
		if (stats.totalTrades >= 50 && !achievements.find((a) => a.id === "trades-50")?.unlocked) {
			const idx = newAchievements.findIndex((a) => a.id === "trades-50");
			if (idx >= 0 && !newAchievements[idx].unlocked) {
				newAchievements[idx].unlocked = true;
				newAchievements[idx].unlockedDate = new Date().toISOString();
				unlocked = true;
				setCelebrationMessage("📊 Risk Manager! 50 trades logged!");
			}
		}
		if (stats.totalTrades >= 3) {
			const recentTrades = [...trades]
				.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
				.slice(0, 4);
			const hadLosingStreak = recentTrades.slice(1, 4).every((t) => t.pnl < 0);
			const recovered = recentTrades[0]?.pnl > 0;
			if (
				hadLosingStreak &&
				recovered &&
				!achievements.find((a) => a.id === "comeback")?.unlocked
			) {
				const idx = newAchievements.findIndex((a) => a.id === "comeback");
				if (idx >= 0 && !newAchievements[idx].unlocked) {
					newAchievements[idx].unlocked = true;
					newAchievements[idx].unlockedDate = new Date().toISOString();
					unlocked = true;
					setCelebrationMessage("💪 Comeback Kid! Recovered from losing streak!");
				}
			}
		}

		if (unlocked) {
			setAchievements(newAchievements);
			localStorage.setItem(`achievements_${userId}`, JSON.stringify(newAchievements));
			setShowCelebration(true);
			setTimeout(() => setShowCelebration(false), 5000);
		}
	}, [stats, trades, achievements, userId]);

	// AI Insights - Enhanced with comprehensive analysis
	const aiInsights = useMemo(() => {
		if (trades.length < 5) {
			return [
				{
					type: "info",
					message: `You've logged ${trades.length} trade${trades.length !== 1 ? "s" : ""}. Log at least 5 trades to unlock detailed AI pattern analysis and personalized insights!`,
			},
			];
		}

		const insights = [];

		// Time-based patterns - Enhanced
		const worstHour = stats.heatMapData
			.filter((d) => d.count > 0)
			.sort((a, b) => a.winRate - b.winRate)[0];
		const bestHour = stats.heatMapData
			.filter((d) => d.count > 0)
			.sort((a, b) => b.winRate - a.winRate)[0];

		if (worstHour && worstHour.winRate < 40 && worstHour.count >= 3) {
			insights.push({
				type: "warning",
				message: `⏰ Time Pattern Detected: Your win rate drops to ${Math.round(worstHour.winRate)}% at ${worstHour.hour}:00 (${worstHour.count} trades analyzed). This suggests you may be trading during low-focus hours or market conditions that don't suit your style. Consider setting a trading schedule that avoids this time slot.`,
			});
		}

		if (bestHour && bestHour.winRate > 70 && bestHour.count >= 3) {
			insights.push({
				type: "success",
				message: `⭐ Peak Performance Time: You achieve a ${Math.round(bestHour.winRate)}% win rate at ${bestHour.hour}:00 (${bestHour.count} trades). This is your golden hour! Schedule your most important trades during this time window for optimal results.`,
			});
		}

		// Day of week analysis
		const dayStats = trades.reduce((acc, trade) => {
			const day = format(parseISO(trade.date), "EEEE");
			acc[day] = acc[day] || { wins: 0, losses: 0, total: 0 };
			acc[day].total++;
			if (trade.pnl > 0) acc[day].wins++;
			else acc[day].losses++;
			return acc;
		}, {} as Record<string, { wins: number; losses: number; total: number }>);

		const worstDay = Object.entries(dayStats)
			.filter(([_, data]) => data.total >= 3)
			.map(([day, data]) => ({
				day,
				winRate: data.wins / (data.wins + data.losses),
				total: data.total,
			}))
			.sort((a, b) => a.winRate - b.winRate)[0];

		if (worstDay && worstDay.winRate < 0.35) {
			insights.push({
				type: "warning",
				message: `📅 Weekly Pattern: ${worstDay.day}s are your weakest trading day with a ${Math.round(worstDay.winRate * 100)}% win rate (${worstDay.total} trades). This could be due to market conditions, your mental state, or external factors. Consider reducing position sizes or skipping trades on ${worstDay.day}s until you identify the root cause.`,
			});
		}

		// Emotion analysis - Enhanced
		const emotionStats = trades.reduce((acc, trade) => {
			acc[trade.emotion] = acc[trade.emotion] || { wins: 0, losses: 0, total: 0, totalPnl: 0 };
			acc[trade.emotion].total++;
			acc[trade.emotion].totalPnl += trade.pnl;
			if (trade.pnl > 0) acc[trade.emotion].wins++;
			else acc[trade.emotion].losses++;
			return acc;
		}, {} as Record<string, { wins: number; losses: number; total: number; totalPnl: number }>);

		const worstEmotion = Object.entries(emotionStats)
			.filter(([_, data]) => data.total >= 3)
			.map(([emotion, data]) => ({
				emotion,
				winRate: data.wins / (data.wins + data.losses),
				total: data.total,
				avgPnl: data.totalPnl / data.total,
			}))
			.sort((a, b) => a.winRate - b.winRate)[0];

		if (worstEmotion && worstEmotion.winRate < 0.3) {
			const avgLoss = worstEmotion.avgPnl < 0 ? Math.abs(worstEmotion.avgPnl) : 0;
			insights.push({
				type: "error",
				message: `🚨 Emotional Trading Alert: When trading with "${worstEmotion.emotion}" emotion, your win rate drops to ${Math.round(worstEmotion.winRate * 100)}% (${worstEmotion.total} trades analyzed)${avgLoss > 0 ? ` with an average loss of $${avgLoss.toFixed(2)} per trade` : ""}. This is a major leak in your trading. Implement a rule: if you feel ${worstEmotion.emotion.toLowerCase()}, take a 30-minute break before entering any trade.`,
			});
		}

		// Setup analysis - Enhanced
		const setupStats = trades.reduce((acc, trade) => {
			acc[trade.setup] = acc[trade.setup] || { wins: 0, losses: 0, total: 0, totalPnl: 0 };
			acc[trade.setup].total++;
			acc[trade.setup].totalPnl += trade.pnl;
			if (trade.pnl > 0) acc[trade.setup].wins++;
			else acc[trade.setup].losses++;
			return acc;
		}, {} as Record<string, { wins: number; losses: number; total: number; totalPnl: number }>);

		const bestSetup = Object.entries(setupStats)
			.filter(([_, data]) => data.total >= 3)
			.map(([setup, data]) => ({
				setup,
				winRate: data.wins / (data.wins + data.losses),
				total: data.total,
				avgPnl: data.totalPnl / data.total,
			}))
			.sort((a, b) => b.winRate - a.winRate)[0];

		const worstSetup = Object.entries(setupStats)
			.filter(([_, data]) => data.total >= 3)
			.map(([setup, data]) => ({
				setup,
				winRate: data.wins / (data.wins + data.losses),
				total: data.total,
				avgPnl: data.totalPnl / data.total,
			}))
			.sort((a, b) => a.winRate - b.winRate)[0];

		if (bestSetup && bestSetup.winRate > 0.6) {
			insights.push({
				type: "success",
				message: `🎯 Your Edge: The "${bestSetup.setup}" setup is your strongest with a ${Math.round(bestSetup.winRate * 100)}% win rate and ${bestSetup.total} trades${bestSetup.avgPnl > 0 ? ` averaging $${bestSetup.avgPnl.toFixed(2)} profit per trade` : ""}. This is your bread and butter - focus 80% of your trading on this setup. Document exactly what makes this setup work for you and replicate it consistently.`,
			});
		}

		if (worstSetup && worstSetup.winRate < 0.35 && worstSetup.total >= 3) {
			insights.push({
				type: "warning",
				message: `⚠️ Setup Weakness: Your "${worstSetup.setup}" setup has only a ${Math.round(worstSetup.winRate * 100)}% win rate (${worstSetup.total} trades)${worstSetup.avgPnl < 0 ? ` with an average loss of $${Math.abs(worstSetup.avgPnl).toFixed(2)}` : ""}. Either improve your execution of this setup through practice, or consider removing it from your trading plan until you can master it in a demo account.`,
			});
		}

		// Ticker analysis
		const tickerStats = trades.reduce((acc, trade) => {
			acc[trade.ticker] = acc[trade.ticker] || { wins: 0, losses: 0, total: 0, totalPnl: 0 };
			acc[trade.ticker].total++;
			acc[trade.ticker].totalPnl += trade.pnl;
			if (trade.pnl > 0) acc[trade.ticker].wins++;
			else acc[trade.ticker].losses++;
			return acc;
		}, {} as Record<string, { wins: number; losses: 0; total: number; totalPnl: number }>);

		const worstTicker = Object.entries(tickerStats)
			.filter(([_, data]) => data.total >= 3)
			.map(([ticker, data]) => ({
				ticker,
				winRate: data.wins / (data.wins + data.losses),
				total: data.total,
				totalPnl: data.totalPnl,
			}))
			.sort((a, b) => a.winRate - b.winRate)[0];

		if (worstTicker && worstTicker.winRate < 0.25 && worstTicker.totalPnl < 0) {
			insights.push({
				type: "error",
				message: `📉 Ticker Performance Alert: You're ${worstTicker.total}-${worstTicker.total === 1 ? "trade" : "trades"} deep on ${worstTicker.ticker} with a ${Math.round(worstTicker.winRate * 100)}% win rate and $${Math.abs(worstTicker.totalPnl).toFixed(2)} in total losses. This ticker doesn't suit your trading style. Add it to your blocklist and focus on tickers where you have an edge.`,
			});
		}

		// Consecutive losses analysis
		const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
		let maxConsecutiveLosses = 0;
		let currentStreak = 0;
		for (const trade of sortedTrades) {
			if (trade.pnl < 0) {
				currentStreak++;
				maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentStreak);
			} else {
				currentStreak = 0;
			}
		}

		if (maxConsecutiveLosses >= 3) {
			insights.push({
				type: "warning",
				message: `📉 Loss Streak Pattern: You've had ${maxConsecutiveLosses} consecutive losses at some point. After 2 consecutive losses, implement a "cooling off" period: reduce position size by 50% or take a break. Revenge trading after losses is one of the fastest ways to blow up an account.`,
			});
		}

		// Risk/Reward analysis
		if (stats.riskReward < 1.5 && stats.totalTrades >= 10) {
			insights.push({
				type: "warning",
				message: `⚖️ Risk/Reward Ratio: Your current R:R is ${stats.riskReward.toFixed(2)}:1, which means you're risking more than you're making on average. Aim for at least 2:1 or higher. This means if you risk $100, you should target $200+ in profit. Review your exit strategies - you may be taking profits too early or letting losses run too long.`,
			});
		}

		if (stats.riskReward >= 2.5 && stats.totalTrades >= 10) {
			insights.push({
				type: "success",
				message: `✅ Excellent Risk Management: Your ${stats.riskReward.toFixed(2)}:1 risk/reward ratio shows disciplined trading. You're consistently taking profits while cutting losses quickly. Keep this up - this is the foundation of profitable trading.`,
			});
		}

		// Rules adherence - Enhanced
		if (stats.rulesAdherence < 50) {
			insights.push({
				type: "error",
				message: `🚨 Critical Discipline Issue: You're following your trading rules only ${Math.round(stats.rulesAdherence)}% of the time. This is a major red flag. Every trade that breaks your rules is essentially gambling. Stop trading immediately and review your rules. If your rules aren't working, change them - but follow them 100% once set. Discipline is more important than any strategy.`,
			});
		} else if (stats.rulesAdherence < 70) {
			insights.push({
				type: "warning",
				message: `⚠️ Rules Adherence: You're following your rules ${Math.round(stats.rulesAdherence)}% of the time. The difference between profitable and unprofitable traders often comes down to discipline. Set a goal: follow your rules 100% for the next 10 trades, regardless of outcome. Process over results.`,
			});
		} else if (stats.rulesAdherence >= 90) {
			insights.push({
				type: "success",
				message: `🛡️ Discipline Master: You're following your rules ${Math.round(stats.rulesAdherence)}% of the time! This level of discipline is what separates consistent traders from gamblers. Keep up the excellent work - this is your competitive advantage.`,
			});
		}

		// Win rate analysis
		if (stats.winRate < 40 && stats.totalTrades >= 10) {
			insights.push({
				type: "warning",
				message: `📊 Win Rate Analysis: Your ${stats.winRate.toFixed(1)}% win rate is below optimal. However, a low win rate can still be profitable with good risk/reward. Your current R:R is ${stats.riskReward.toFixed(2)}:1. Focus on improving either your win rate OR your risk/reward ratio. If you can't improve win rate, ensure you're getting at least 3:1 R:R on every trade.`,
			});
		}

		if (stats.winRate >= 60 && stats.totalTrades >= 10) {
			insights.push({
				type: "success",
				message: `🎯 High Win Rate: Your ${stats.winRate.toFixed(1)}% win rate is excellent! Combined with your ${stats.riskReward.toFixed(2)}:1 risk/reward ratio, you have a strong foundation. The key now is consistency - keep doing what's working and avoid changing your strategy during drawdowns.`,
			});
		}

		// Streak encouragement - Enhanced
		if (stats.streak >= 30) {
			insights.push({
				type: "success",
				message: `🔥 Incredible Streak: ${stats.streak} consecutive days of journaling! This level of consistency is rare and shows serious commitment to improvement. Your future self will thank you for this data. Keep the streak alive!`,
			});
		} else if (stats.streak >= 7) {
			insights.push({
				type: "success",
				message: `🔥 Week Warrior: ${stats.streak}-day journaling streak! Consistency is key to trading success. Studies show traders who journal daily improve 3x faster than those who don't. You're building a valuable database of your trading patterns.`,
			});
		} else if (stats.streak >= 3) {
			insights.push({
				type: "success",
				message: `🔥 Streak Building: ${stats.streak}-day journaling streak! Keep it going. Every trade you log is data that will help you improve. Don't break the chain!`,
			});
		}

		// Profitability analysis
		if (stats.totalPnl < 0 && stats.totalTrades >= 10) {
			const lossAmount = Math.abs(stats.totalPnl);
			insights.push({
				type: "warning",
				message: `💰 Performance Review: You're down $${lossAmount.toFixed(2)} across ${stats.totalTrades} trades. This is valuable data, not failure. Review your worst-performing setups, emotions, and times. Consider paper trading or reducing position sizes by 50% until you identify and fix your leaks. Every losing trade teaches you something - make sure you're learning.`,
			});
		}

		if (stats.totalPnl > 0 && stats.totalTrades >= 10) {
			insights.push({
				type: "success",
				message: `💰 Profitable Trader: You're up $${stats.totalPnl.toFixed(2)} across ${stats.totalTrades} trades with a ${stats.winRate.toFixed(1)}% win rate. This is solid performance. Focus on consistency and scaling gradually. Don't increase position sizes too quickly - protect what you've built.`,
			});
		}

		// Trade frequency analysis
		const tradesPerDay = stats.totalTrades / Math.max(1, Math.ceil((new Date().getTime() - new Date(trades[0]?.date || new Date()).getTime()) / (1000 * 60 * 60 * 24)));
		if (tradesPerDay > 5 && stats.totalTrades >= 20) {
			insights.push({
				type: "warning",
				message: `⚡ High Trade Frequency: You're averaging ${tradesPerDay.toFixed(1)} trades per day. High frequency can lead to overtrading and emotional decisions. Quality over quantity - focus on your best setups only. Consider setting a daily trade limit (e.g., max 3 trades per day) to force yourself to be more selective.`,
			});
		}

		// Return insights, prioritizing most important
		const sortedInsights = insights.sort((a, b) => {
			const priority = { error: 3, warning: 2, success: 1, info: 0 };
			return priority[b.type as keyof typeof priority] - priority[a.type as keyof typeof priority];
		});

		return sortedInsights.length > 0 ? sortedInsights.slice(0, 8) : [
			{
				type: "info",
				message: "Keep logging trades to discover more patterns! The more data you collect, the more insights we can provide.",
			},
		];
	}, [trades, stats]);

	const handleAddTrade = (trade: Omit<Trade, "id">) => {
		// Check if ticker is blocked
		if (isTickerBlocked(trade.ticker)) {
			alert(`⚠️ ${trade.ticker} is on your blocklist! This trade was blocked.`);
			return;
		}

		const newTrade: Trade = {
			...trade,
			id: Date.now().toString(),
		};
		setTrades([...trades, newTrade]);
		setShowTradeForm(false);

		if (trade.followedRules) {
			setCelebrationMessage("✅ Trade logged! You followed your rules!");
			setShowCelebration(true);
			setTimeout(() => setShowCelebration(false), 3000);
		}
	};

	const handleExportCSV = () => {
		const headers = ["Date", "Ticker", "Entry", "Exit", "Quantity", "Leverage", "P&L", "Setup", "Emotion", "Followed Rules", "Notes"];
		const rows = trades.map((t) => [
			format(parseISO(t.date), "yyyy-MM-dd HH:mm"),
			t.ticker,
			t.entryPrice,
			t.exitPrice,
			t.quantity,
			t.leverage,
			t.pnl,
			t.setup,
			t.emotion,
			t.followedRules ? "Yes" : "No",
			t.notes,
		]);
		const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `trades_${format(new Date(), "yyyy-MM-dd")}.csv`;
		a.click();
	};

	const handleReplayTrades = () => {
		if (trades.length === 0 || isReplaying) return;
		
		// Clear any existing interval
		if (replayIntervalRef.current) {
			clearInterval(replayIntervalRef.current);
		}
		
		setReplayIndex(0);
		setIsReplaying(true);

		replayIntervalRef.current = setInterval(() => {
			setReplayIndex((prev) => {
				if (prev >= trades.length - 1) {
					if (replayIntervalRef.current) {
						clearInterval(replayIntervalRef.current);
						replayIntervalRef.current = null;
					}
					setIsReplaying(false);
					return -1;
				}
				return prev + 1;
			});
		}, 1000);
	};

	// Cleanup replay interval on unmount
	useEffect(() => {
		return () => {
			if (replayIntervalRef.current) {
				clearInterval(replayIntervalRef.current);
			}
		};
	}, []);

	const handleAddBlockedTicker = (ticker: string, reason: string) => {
		if (isTickerBlocked(ticker)) {
			alert(`${ticker} is already blocked!`);
			return;
		}
		setBlockedTickers([
			...blockedTickers,
			{ ticker: ticker.toUpperCase(), reason, dateBlocked: new Date().toISOString() },
		]);
	};

	const handleAddCheckIn = (checkIn: DailyCheckIn) => {
		const existingIndex = dailyCheckIns.findIndex(
			(c) => format(parseISO(c.date), "yyyy-MM-dd") === format(parseISO(checkIn.date), "yyyy-MM-dd")
		);
		if (existingIndex >= 0) {
			const updated = [...dailyCheckIns];
			updated[existingIndex] = checkIn;
			setDailyCheckIns(updated);
		} else {
			setDailyCheckIns([...dailyCheckIns, checkIn]);
		}
		setShowCheckIn(false);
	};

	const todayCheckIn = dailyCheckIns.find(
		(c) => format(parseISO(c.date), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
	);

	return (
		<div className="min-h-screen bg-gray-a1 p-4 md:p-8">
			<AnimatePresence>
				{showCelebration && (
					<motion.div
						initial={{ opacity: 0, scale: 0.5, y: -50 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.5, y: -50 }}
						className="fixed top-8 left-1/2 -translate-x-1/2 z-50"
					>
						<div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-lg shadow-2xl">
							<div className="flex items-center gap-3">
								<motion.div
									animate={{ rotate: [0, 10, -10, 10, 0] }}
									transition={{ duration: 0.5 }}
									className="text-4xl"
								>
									🎉
								</motion.div>
								<div>
									<div className="font-bold text-lg">{celebrationMessage}</div>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<div className="max-w-7xl mx-auto mb-8">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
					<div>
						<h1 className="text-8 font-bold text-gray-12 mb-2">
							Welcome back, {displayName}! 👋
					</h1>
					<p className="text-4 text-gray-10">
							The trading journal that doesn't feel like homework
						</p>
					</div>
					<div className="flex gap-2">
						<button
							onClick={() => setShowCheckIn(true)}
							className="px-4 py-2 bg-gray-a3 hover:bg-gray-a4 border border-gray-a4 rounded-lg text-gray-12 font-medium transition-colors flex items-center gap-2"
						>
							<Calendar className="w-5 h-5" />
							Check In
						</button>
						<button
							onClick={() => setShowPreTradeChecklist(true)}
							className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors flex items-center gap-2"
						>
							<Shield className="w-5 h-5" />
							Log Trade
						</button>
					</div>
				</div>

				{stats.streak > 0 && (
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						className="inline-block mb-6"
					>
						<div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg inline-flex items-center gap-3">
							<Flame className="w-6 h-6" />
							<div>
								<div className="font-bold text-lg">{stats.streak} Day Streak</div>
								<div className="text-sm opacity-90">Keep it going! 🔥</div>
							</div>
						</div>
					</motion.div>
				)}

				<div className="flex gap-2 mb-6 border-b border-gray-a4">
					<button
						onClick={() => setSelectedTab("dashboard")}
						className={`px-4 py-2 font-medium transition-colors ${
							selectedTab === "dashboard"
								? "text-gray-12 border-b-2 border-gray-12"
								: "text-gray-10 hover:text-gray-12"
						}`}
					>
						Dashboard
					</button>
					<button
						onClick={() => setSelectedTab("trades")}
						className={`px-4 py-2 font-medium transition-colors ${
							selectedTab === "trades"
								? "text-gray-12 border-b-2 border-gray-12"
								: "text-gray-10 hover:text-gray-12"
						}`}
					>
						Trades ({trades.length})
					</button>
					<button
						onClick={() => setSelectedTab("insights")}
						className={`px-4 py-2 font-medium transition-colors ${
							selectedTab === "insights"
								? "text-gray-12 border-b-2 border-gray-12"
								: "text-gray-10 hover:text-gray-12"
						}`}
					>
						AI Insights
					</button>
					<button
						onClick={() => setSelectedTab("calendar")}
						className={`px-4 py-2 font-medium transition-colors ${
							selectedTab === "calendar"
								? "text-gray-12 border-b-2 border-gray-12"
								: "text-gray-10 hover:text-gray-12"
						}`}
					>
						Calendar
					</button>
					<button
						onClick={() => setSelectedTab("settings")}
						className={`px-4 py-2 font-medium transition-colors ${
							selectedTab === "settings"
								? "text-gray-12 border-b-2 border-gray-12"
								: "text-gray-10 hover:text-gray-12"
						}`}
					>
						Settings
					</button>
				</div>
			</div>

			<div className="max-w-7xl mx-auto">
				{selectedTab === "dashboard" && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-6"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<div className="bg-gray-a2 border border-gray-a4 rounded-lg p-6">
								<div className="flex items-center justify-between mb-2">
									<div className="text-gray-10 text-sm">Total P&L</div>
									<DollarSign className="w-5 h-5 text-gray-10" />
								</div>
								<div
									className={`text-3xl font-bold ${
										stats.totalPnl >= 0 ? "text-green-500" : "text-red-500"
									}`}
								>
									${stats.totalPnl.toFixed(2)}
								</div>
							</div>

							<div className="bg-gray-a2 border border-gray-a4 rounded-lg p-6">
								<div className="flex items-center justify-between mb-2">
									<div className="text-gray-10 text-sm">Win Rate</div>
									<Target className="w-5 h-5 text-gray-10" />
								</div>
								<div className="text-3xl font-bold text-gray-12">
									{stats.winRate.toFixed(1)}%
								</div>
								<div className="text-sm text-gray-10 mt-1">
									{stats.winningTrades}W / {stats.losingTrades}L
								</div>
							</div>

							<div className="bg-gray-a2 border border-gray-a4 rounded-lg p-6">
								<div className="flex items-center justify-between mb-2">
									<div className="text-gray-10 text-sm">Risk/Reward</div>
									<BarChart3 className="w-5 h-5 text-gray-10" />
								</div>
								<div className="text-3xl font-bold text-gray-12">
									{stats.riskReward.toFixed(2)}:1
								</div>
								<div className="text-sm text-gray-10 mt-1">
									Avg Win: ${stats.avgWin.toFixed(2)}
								</div>
							</div>

							<div className="bg-gray-a2 border border-gray-a4 rounded-lg p-6">
								<div className="flex items-center justify-between mb-2">
									<div className="text-gray-10 text-sm">Rules Adherence</div>
									<Shield className="w-5 h-5 text-gray-10" />
								</div>
								<div className="text-3xl font-bold text-gray-12">
									{stats.rulesAdherence.toFixed(0)}%
								</div>
								<div className="text-sm text-gray-10 mt-1">
									{stats.totalTrades > 0
										? `${trades.filter((t) => t.followedRules).length}/${stats.totalTrades} trades`
										: "No trades yet"}
								</div>
							</div>
						</div>

						{stats.equityCurve.length > 0 && (
							<div className="bg-gray-a2 border border-gray-a4 rounded-lg p-6">
								<h3 className="text-6 font-bold mb-4 flex items-center gap-2">
									<TrendingUp className="w-5 h-5" />
									Equity Curve
								</h3>
								<ResponsiveContainer width="100%" height={300}>
									<LineChart data={stats.equityCurve}>
										<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
										<XAxis dataKey="date" stroke="#9ca3af" />
										<YAxis stroke="#9ca3af" />
										<Tooltip
											contentStyle={{
												backgroundColor: "#1f2937",
												border: "1px solid #374151",
												borderRadius: "8px",
											}}
										/>
										<Line
											type="monotone"
											dataKey="equity"
											stroke={stats.totalPnl >= 0 ? COLORS.profit : COLORS.loss}
											strokeWidth={3}
											dot={{ fill: stats.totalPnl >= 0 ? COLORS.profit : COLORS.loss }}
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						)}

						<div className="bg-gray-a2 border border-gray-a4 rounded-lg p-6">
							<h3 className="text-6 font-bold mb-4 flex items-center gap-2">
								<Clock className="w-5 h-5" />
								Trading Time Heat Map
							</h3>
							<div className="grid grid-cols-6 md:grid-cols-12 gap-2">
								{stats.heatMapData.map((data) => {
									const intensity = data.count > 0 ? Math.min(data.winRate / 100, 1) : 0;
									const bgColor = data.count === 0
										? "bg-gray-a3"
										: intensity > 0.6
											? `bg-green-${Math.floor(intensity * 5) + 5}00`
											: intensity > 0.4
												? `bg-yellow-${Math.floor(intensity * 5) + 5}00`
												: `bg-red-${Math.floor(intensity * 5) + 5}00`;
									return (
										<div
											key={data.hour}
											className={`p-3 rounded text-center text-xs ${bgColor} ${
												data.count > 0 ? "cursor-pointer hover:scale-110 transition-transform" : ""
											}`}
											title={`${data.label}: ${data.count} trades, ${data.winRate.toFixed(0)}% win rate`}
										>
											<div className="font-bold">{data.hour}</div>
											<div className="text-xs">{data.count}</div>
										</div>
									);
								})}
							</div>
						</div>

						<div className="bg-gray-a2 border border-gray-a4 rounded-lg p-6">
							<h3 className="text-6 font-bold mb-4 flex items-center gap-2">
								<Trophy className="w-5 h-5" />
								Achievements
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{achievements.map((achievement) => (
									<motion.div
										key={achievement.id}
										whileHover={{ scale: 1.05 }}
										className={`p-4 rounded-lg border-2 ${
											achievement.unlocked
												? "border-yellow-500 bg-yellow-500/10"
												: "border-gray-a4 bg-gray-a2 opacity-50"
										}`}
									>
										<div className="flex items-center gap-3">
											<div className="text-3xl">{achievement.icon}</div>
											<div>
												<div className="font-bold">{achievement.name}</div>
												<div className="text-sm text-gray-10">
													{achievement.description}
												</div>
											</div>
										</div>
									</motion.div>
								))}
							</div>
						</div>

						{trades.length > 0 && (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="bg-gray-a2 border border-gray-a4 rounded-lg p-6">
									<h3 className="text-6 font-bold mb-4">Win/Loss Distribution</h3>
									<ResponsiveContainer width="100%" height={250}>
										<PieChart>
											<Pie
												data={[
													{ name: "Wins", value: stats.winningTrades },
													{ name: "Losses", value: stats.losingTrades },
												]}
												cx="50%"
												cy="50%"
												labelLine={false}
												label={({ name, percent }) =>
													`${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
												}
												outerRadius={80}
												fill="#8884d8"
												dataKey="value"
											>
												<Cell fill={COLORS.profit} />
												<Cell fill={COLORS.loss} />
											</Pie>
										</PieChart>
									</ResponsiveContainer>
								</div>

								<div className="bg-gray-a2 border border-gray-a4 rounded-lg p-6">
									<h3 className="text-6 font-bold mb-4">Setup Performance</h3>
									<ResponsiveContainer width="100%" height={250}>
										<BarChart
											data={Object.entries(
												trades.reduce((acc, trade) => {
													acc[trade.setup] = (acc[trade.setup] || 0) + 1;
													return acc;
												}, {} as Record<string, number>)
											).map(([setup, count]) => ({ setup, count }))}
										>
											<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
											<XAxis dataKey="setup" stroke="#9ca3af" />
											<YAxis stroke="#9ca3af" />
											<Tooltip
												contentStyle={{
													backgroundColor: "#1f2937",
													border: "1px solid #374151",
													borderRadius: "8px",
												}}
											/>
											<Bar dataKey="count" fill="#6366f1" />
										</BarChart>
									</ResponsiveContainer>
								</div>
							</div>
						)}
					</motion.div>
				)}

				{selectedTab === "trades" && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-4"
					>
						<div className="bg-gray-a2 border border-gray-a4 rounded-lg p-4">
							<div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
								<div className="flex-1 relative">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-10" />
									<input
										type="text"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										placeholder="Search trades..."
										className="w-full pl-10 pr-4 py-2 bg-gray-a3 border border-gray-a4 rounded-lg text-gray-12 focus:outline-none focus:ring-2 focus:ring-gray-a6"
									/>
								</div>
								<select
									value={filterSetup}
									onChange={(e) => setFilterSetup(e.target.value)}
									className="px-4 py-2 bg-gray-a3 border border-gray-a4 rounded-lg text-gray-12 focus:outline-none focus:ring-2 focus:ring-gray-a6"
								>
									<option value="all">All Setups</option>
									{SETUPS.map((setup) => (
										<option key={setup} value={setup}>
											{setup}
										</option>
									))}
								</select>
								<select
									value={filterEmotion}
									onChange={(e) => setFilterEmotion(e.target.value)}
									className="px-4 py-2 bg-gray-a3 border border-gray-a4 rounded-lg text-gray-12 focus:outline-none focus:ring-2 focus:ring-gray-a6"
								>
									<option value="all">All Emotions</option>
									{EMOTIONS.map((emotion) => (
										<option key={emotion} value={emotion}>
											{emotion}
										</option>
									))}
								</select>
								<button
									onClick={handleExportCSV}
									className="px-4 py-2 bg-gray-a3 hover:bg-gray-a4 border border-gray-a4 rounded-lg text-gray-12 font-medium transition-colors flex items-center gap-2"
								>
									<Download className="w-5 h-5" />
									Export CSV
								</button>
								{trades.length > 0 && (
									<button
										onClick={handleReplayTrades}
										className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors flex items-center gap-2"
									>
										{isReplaying ? (
											<>
												<Pause className="w-5 h-5" />
												Pause Replay
											</>
										) : (
											<>
												<Play className="w-5 h-5" />
												Replay Trades
											</>
										)}
									</button>
								)}
							</div>
						</div>

						<div className="bg-gray-a2 border border-gray-a4 rounded-lg p-6">
							<h3 className="text-6 font-bold mb-4">All Trades</h3>
							{filteredTrades.length === 0 ? (
								<div className="text-center py-12 text-gray-10">
									<BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
									<p className="text-lg">No trades found</p>
									<p className="text-sm mt-2">
										{trades.length === 0
											? 'Click "Log Trade" to get started!'
											: "Try adjusting your filters"}
									</p>
								</div>
							) : (
								<div className="space-y-3">
									{filteredTrades.map((trade, index) => {
										const isHighlighted = isReplaying && index <= replayIndex;
										return (
											<motion.div
												key={trade.id}
												initial={isHighlighted ? { scale: 1.02, backgroundColor: "#3b82f6" } : {}}
												animate={
													isHighlighted
														? { scale: 1.02, backgroundColor: "#3b82f6" }
														: { scale: 1, backgroundColor: "transparent" }
												}
												className="bg-gray-a3 border border-gray-a4 rounded-lg p-4"
											>
												<div className="flex items-start justify-between">
													<div className="flex-1">
														<div className="flex items-center gap-3 mb-2">
															<span className="font-bold text-lg">{trade.ticker}</span>
															<span
																className={`px-2 py-1 rounded text-sm font-medium ${
																	trade.pnl >= 0
																		? "bg-green-500/20 text-green-500"
																		: "bg-red-500/20 text-red-500"
																}`}
															>
																{trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
															</span>
															{trade.leverage > 1 && (
															<span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-500 font-medium">
																{trade.leverage}x
															</span>
														)}
															{trade.followedRules ? (
																<CheckCircle2 className="w-5 h-5 text-green-500" />
															) : (
																<AlertCircle className="w-5 h-5 text-red-500" />
															)}
															{isTickerBlocked(trade.ticker) && (
																<Ban className="w-5 h-5 text-red-500" />
															)}
														</div>
														<div className="flex flex-wrap gap-2 mb-2">
															<span className="px-2 py-1 rounded text-xs bg-gray-a4 text-gray-10">
																{trade.setup}
															</span>
															<span className="px-2 py-1 rounded text-xs bg-gray-a4 text-gray-10">
																{trade.emotion}
															</span>
															<span className="px-2 py-1 rounded text-xs bg-gray-a4 text-gray-10">
																{format(parseISO(trade.date), "MMM dd, yyyy")}
															</span>
														</div>
														{trade.chartImage && (
															<div className="mt-2">
																<img
																	src={trade.chartImage}
																	alt="Trade chart"
																	className="max-w-xs rounded-lg border border-gray-a4"
																/>
															</div>
														)}
														{trade.notes && (
															<p className="text-sm text-gray-10 mt-2">{trade.notes}</p>
														)}
													</div>
												</div>
											</motion.div>
										);
									})}
								</div>
							)}
						</div>
					</motion.div>
				)}

				{selectedTab === "insights" && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
					>
						<div className="bg-gray-a2 border border-gray-a4 rounded-lg p-6">
							<h3 className="text-6 font-bold mb-4 flex items-center gap-2">
								<Brain className="w-5 h-5" />
								AI-Powered Insights
							</h3>
							<div className="space-y-4">
								{aiInsights.map((insight, idx) => (
									<div
										key={idx}
										className={`p-4 rounded-lg border-l-4 ${
											insight.type === "success"
												? "border-green-500 bg-green-500/10"
												: insight.type === "warning"
													? "border-yellow-500 bg-yellow-500/10"
													: insight.type === "error"
														? "border-red-500 bg-red-500/10"
														: "border-blue-500 bg-blue-500/10"
										}`}
									>
										<div className="flex items-start gap-3">
											{insight.type === "success" && (
												<CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
											)}
											{insight.type === "warning" && (
												<AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
											)}
											{insight.type === "error" && (
												<AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
											)}
											{insight.type === "info" && (
												<Brain className="w-5 h-5 text-blue-500 mt-0.5" />
											)}
											<p className="text-sm flex-1">{insight.message}</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</motion.div>
				)}

				{selectedTab === "calendar" && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-6"
					>
						<CalendarView trades={trades} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
					</motion.div>
				)}

				{selectedTab === "settings" && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-6"
					>
						<div className="bg-gray-a2 border border-gray-a4 rounded-lg p-6">
							<h3 className="text-6 font-bold mb-4 flex items-center gap-2">
								<Ban className="w-5 h-5" />
								Blocked Tickers
							</h3>
							<button
								onClick={() => setShowBlocklist(true)}
								className="mb-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium transition-colors flex items-center gap-2"
							>
								<Plus className="w-5 h-5" />
								Add Blocked Ticker
							</button>
							<div className="space-y-2">
								{blockedTickers.length === 0 ? (
									<p className="text-gray-10">No tickers blocked yet</p>
								) : (
									blockedTickers.map((blocked) => (
										<div
											key={blocked.ticker}
											className="flex items-center justify-between p-3 bg-gray-a3 rounded-lg"
										>
											<div>
												<div className="font-bold">{blocked.ticker}</div>
												<div className="text-sm text-gray-10">{blocked.reason}</div>
												<div className="text-xs text-gray-10">
													Blocked: {format(parseISO(blocked.dateBlocked), "MMM dd, yyyy")}
												</div>
											</div>
											<button
												onClick={() =>
													setBlockedTickers(blockedTickers.filter((b) => b.ticker !== blocked.ticker))
												}
												className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
											>
												Unblock
											</button>
										</div>
									))
								)}
							</div>
						</div>

						<div className="bg-gray-a2 border border-gray-a4 rounded-lg p-6">
							<h3 className="text-6 font-bold mb-4 flex items-center gap-2">
								<Calendar className="w-5 h-5" />
								Daily Check-Ins
							</h3>
							<div className="space-y-4">
								{dailyCheckIns
									.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
									.slice(0, 7)
									.map((checkIn) => (
										<div key={checkIn.date} className="p-4 bg-gray-a3 rounded-lg">
											<div className="flex items-center justify-between mb-2">
												<div className="font-bold">
													{format(parseISO(checkIn.date), "MMM dd, yyyy")}
												</div>
											</div>
											<div className="grid grid-cols-3 gap-4 text-sm">
												<div>
													<div className="text-gray-10">Mood</div>
													<div className="font-bold">{checkIn.mood}/10</div>
												</div>
												<div>
													<div className="text-gray-10">Sleep</div>
													<div className="font-bold">{checkIn.sleepQuality}/10</div>
												</div>
												<div>
													<div className="text-gray-10">Stress</div>
													<div className="font-bold">{checkIn.stressLevel}/10</div>
												</div>
											</div>
											{checkIn.notes && (
												<div className="mt-2 text-sm text-gray-10">{checkIn.notes}</div>
											)}
										</div>
									))}
							</div>
						</div>
					</motion.div>
				)}
			</div>

			<AnimatePresence>
				{showPreTradeChecklist && (
					<PreTradeChecklistModal
						onClose={() => setShowPreTradeChecklist(false)}
						onComplete={() => {
							setShowPreTradeChecklist(false);
							setShowTradeForm(true);
						}}
					/>
				)}
				{showTradeForm && (
					<TradeFormModal
						onClose={() => setShowTradeForm(false)}
						onSubmit={handleAddTrade}
						blockedTickers={blockedTickers}
					/>
				)}
				{showBlocklist && (
					<BlocklistModal
						onClose={() => setShowBlocklist(false)}
						onAdd={handleAddBlockedTicker}
					/>
				)}
				{showCheckIn && (
					<CheckInModal
						onClose={() => setShowCheckIn(false)}
						onSubmit={handleAddCheckIn}
						existingCheckIn={todayCheckIn}
					/>
				)}
			</AnimatePresence>
		</div>
	);
}

function CalendarView({
	trades,
	currentMonth,
	setCurrentMonth,
}: {
	trades: Trade[];
	currentMonth: Date;
	setCurrentMonth: (date: Date) => void;
}) {
	// Calculate daily stats
	const dailyStats = useMemo(() => {
		const stats: Record<string, { pnl: number; count: number }> = {};
		trades.forEach((trade) => {
			const dateKey = format(parseISO(trade.date), "yyyy-MM-dd");
			if (!stats[dateKey]) {
				stats[dateKey] = { pnl: 0, count: 0 };
			}
			stats[dateKey].pnl += trade.pnl;
			stats[dateKey].count += 1;
		});
		return stats;
	}, [trades]);

	// Calculate monthly stats
	const monthlyStats = useMemo(() => {
		const monthStart = startOfMonth(currentMonth);
		const monthEnd = endOfMonth(currentMonth);
		const monthTrades = trades.filter((trade) => {
			const tradeDate = parseISO(trade.date);
			return tradeDate >= monthStart && tradeDate <= monthEnd;
		});

		const totalPnl = monthTrades.reduce((sum, t) => sum + t.pnl, 0);
		const tradingDays = new Set(
			monthTrades.map((t) => format(parseISO(t.date), "yyyy-MM-dd"))
		).size;

		return {
			totalPnl,
			tradingDays,
			totalTrades: monthTrades.length,
		};
	}, [trades, currentMonth]);

	// Generate calendar days
	const calendarDays = useMemo(() => {
		const monthStart = startOfMonth(currentMonth);
		const monthEnd = endOfMonth(currentMonth);
		const start = startOfWeek(monthStart, { weekStartsOn: 0 });
		const end = endOfWeek(monthEnd, { weekStartsOn: 0 });
		return eachDayOfInterval({ start, end });
	}, [currentMonth]);

	// Calculate weekly stats
	const weeklyStats = useMemo(() => {
		const monthStart = startOfMonth(currentMonth);
		const monthEnd = endOfMonth(currentMonth);

	
		
		// Group calendar days into weeks
		const weekMap: Record<number, { pnl: number; days: Set<string>; trades: number; endDate: Date }> = {};
		let currentWeek = 1;
		let lastWeekStart = "";
		
		calendarDays.forEach((day) => {
			if (isSameMonth(day, currentMonth)) {
				const weekStart = startOfWeek(day, { weekStartsOn: 0 });
				const weekStartKey = format(weekStart, "yyyy-MM-dd");
				const weekEnd = endOfWeek(day, { weekStartsOn: 0 });
				
				// New week detected
				if (weekStartKey !== lastWeekStart) {
					if (lastWeekStart !== "") currentWeek++;
					lastWeekStart = weekStartKey;
					
					if (!weekMap[currentWeek]) {
						weekMap[currentWeek] = {
							pnl: 0,
							days: new Set(),
							trades: 0,
							endDate: weekEnd > monthEnd ? monthEnd : weekEnd,
						};
					}
				}
				
				// Check if this day has trades
				const dateKey = format(day, "yyyy-MM-dd");
				const dayStats = dailyStats[dateKey];
				if (dayStats) {
					weekMap[currentWeek].pnl += dayStats.pnl;
					weekMap[currentWeek].days.add(dateKey);
					weekMap[currentWeek].trades += dayStats.count;
				}
			}
		});

		// Convert to array, filter out empty weeks, and sort
		return Object.entries(weekMap)
			.filter(([_, data]) => data.trades > 0)
			.map(([weekNum, data]) => ({
				weekNum: parseInt(weekNum),
				pnl: data.pnl,
				days: data.days.size,
				trades: data.trades,
				endDate: data.endDate,
			}))
			.sort((a, b) => a.weekNum - b.weekNum);
	}, [trades, currentMonth, calendarDays, dailyStats]);

	const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	const formatCurrency = (amount: number) => {
		if (Math.abs(amount) >= 1000) {
			return `${amount >= 0 ? "+" : ""}$${(amount / 1000).toFixed(1)}K`;
		}
		return `${amount >= 0 ? "+" : ""}$${amount.toFixed(0)}`;
	};

	return (
		<div className="bg-gray-a2 border border-gray-a4 rounded-lg p-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-4">
					<button
						onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
						className="p-2 hover:bg-gray-a3 rounded-lg transition-colors"
					>
						<ChevronLeft className="w-5 h-5" />
					</button>
					<h2 className="text-7 font-bold">{format(currentMonth, "MMMM yyyy")}</h2>
					<button
						onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
						className="p-2 hover:bg-gray-a3 rounded-lg transition-colors"
					>
						<ChevronRight className="w-5 h-5" />
					</button>
				</div>
				<div className="flex items-center gap-6">
					<div className="text-right">
						<div className="text-sm text-gray-10">Monthly stats:</div>
						<div className="flex items-center gap-4">
							<span className={`text-lg font-bold ${monthlyStats.totalPnl >= 0 ? "text-green-500" : "text-red-500"}`}>
								{formatCurrency(monthlyStats.totalPnl)}
							</span>
							<span className="text-sm text-gray-10">{monthlyStats.tradingDays} days</span>
							<span className="text-sm text-gray-10">{monthlyStats.totalTrades} trades</span>
						</div>
					</div>
				</div>
			</div>

			<div className="flex gap-6">
				{/* Calendar Grid */}
				<div className="flex-1">
					<div className="grid grid-cols-7 gap-2 mb-2">
						{weekDays.map((day) => (
							<div key={day} className="text-center text-sm font-medium text-gray-10 py-2">
								{day}
							</div>
						))}
					</div>
					<div className="grid grid-cols-7 gap-2">
						{calendarDays.map((day, idx) => {
							const dateKey = format(day, "yyyy-MM-dd");
							const dayStats = dailyStats[dateKey];
							const isCurrentMonth = isSameMonth(day, currentMonth);
							const isTodayDate = isToday(day);

							return (
								<div
									key={idx}
									className={`min-h-[100px] p-2 rounded-lg border-2 ${
										isCurrentMonth
											? dayStats
												? dayStats.pnl >= 0
													? "bg-green-500/20 border-green-500/50"
													: "bg-red-500/20 border-red-500/50"
												: "bg-gray-a3 border-gray-a4"
											: "bg-gray-a1 border-gray-a3 opacity-30"
									} ${isTodayDate ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
								>
									<div className={`text-sm font-bold mb-2 ${isCurrentMonth ? "text-gray-12" : "text-gray-10"}`}>
										{format(day, "d")}
									</div>
									{dayStats && isCurrentMonth && (
										<div className="space-y-1">
											<div className={`w-3 h-3 rounded-full mb-1 ${dayStats.pnl >= 0 ? "bg-green-500" : "bg-red-500"}`} />
											<div className={`text-xs font-bold ${dayStats.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
												{formatCurrency(dayStats.pnl)}
											</div>
											<div className="text-xs text-gray-10">
												{dayStats.count} {dayStats.count === 1 ? "trade" : "trades"}
											</div>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>

				{/* Weekly Summaries */}
				<div className="w-64 space-y-3">
					<div className="text-sm font-bold text-gray-10 mb-2">Weekly Summary</div>
					{weeklyStats.map((week) => (
						<div
							key={week.weekNum}
							className="p-3 bg-gray-a3 rounded-lg border border-gray-a4"
						>
							<div className="text-xs font-medium text-gray-10 mb-1">
								Week {week.weekNum} (ending {format(week.endDate, "MMM d")})
							</div>
							<div className={`text-sm font-bold ${week.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
								{formatCurrency(week.pnl)}
							</div>
							<div className="text-xs text-gray-10">{week.days} day{week.days !== 1 ? "s" : ""}</div>
						</div>
					))}
					{weeklyStats.length === 0 && (
						<div className="text-sm text-gray-10 p-3">No trades this month</div>
					)}
				</div>
			</div>
		</div>
	);
}

function PreTradeChecklistModal({
	onClose,
	onComplete,
}: {
	onClose: () => void;
	onComplete: () => void;
}) {
	const [checklist, setChecklist] = useState({
		partOfPlan: false,
		emotionallyNeutral: false,
		checkedFundamentals: false,
		riskManaged: false,
	});

	const allChecked = Object.values(checklist).every((v) => v);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
			onClick={onClose}
		>
			<motion.div
				initial={{ scale: 0.9, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.9, opacity: 0 }}
				onClick={(e) => e.stopPropagation()}
				className="bg-gray-a1 border border-gray-a4 rounded-lg p-6 max-w-md w-full shadow-2xl"
			>
				<h2 className="text-7 font-bold mb-4">Pre-Trade Checklist</h2>
				<div className="space-y-4 mb-6">
					<label className="flex items-center gap-3 cursor-pointer">
						<input
							type="checkbox"
							checked={checklist.partOfPlan}
							onChange={(e) => setChecklist({ ...checklist, partOfPlan: e.target.checked })}
							className="w-5 h-5"
						/>
						<span>Is this trade part of my plan?</span>
					</label>
					<label className="flex items-center gap-3 cursor-pointer">
						<input
							type="checkbox"
							checked={checklist.emotionallyNeutral}
							onChange={(e) => setChecklist({ ...checklist, emotionallyNeutral: e.target.checked })}
							className="w-5 h-5"
						/>
						<span>Am I emotionally neutral?</span>
					</label>
					<label className="flex items-center gap-3 cursor-pointer">
						<input
							type="checkbox"
							checked={checklist.checkedFundamentals}
							onChange={(e) => setChecklist({ ...checklist, checkedFundamentals: e.target.checked })}
							className="w-5 h-5"
						/>
						<span>Have I checked fundamentals?</span>
					</label>
					<label className="flex items-center gap-3 cursor-pointer">
						<input
							type="checkbox"
							checked={checklist.riskManaged}
							onChange={(e) => setChecklist({ ...checklist, riskManaged: e.target.checked })}
							className="w-5 h-5"
						/>
						<span>Have I managed my risk?</span>
					</label>
				</div>
				<div className="flex gap-3">
					<button
						onClick={onComplete}
						disabled={!allChecked}
						className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
							allChecked
								? "bg-green-500 hover:bg-green-600 text-white"
								: "bg-gray-a3 text-gray-10 cursor-not-allowed"
						}`}
					>
						Continue to Log Trade
					</button>
					<button
						onClick={onClose}
						className="px-4 py-2 bg-gray-a2 hover:bg-gray-a3 border border-gray-a4 rounded-lg text-gray-10 hover:text-gray-12 font-medium transition-colors"
					>
						Cancel
					</button>
				</div>
			</motion.div>
		</motion.div>
	);
}

function BlocklistModal({
	onClose,
	onAdd,
}: {
	onClose: () => void;
	onAdd: (ticker: string, reason: string) => void;
}) {
	const [ticker, setTicker] = useState("");
	const [reason, setReason] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (ticker.trim()) {
			onAdd(ticker, reason || "No reason provided");
			setTicker("");
			setReason("");
			onClose();
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
			onClick={onClose}
		>
			<motion.div
				initial={{ scale: 0.9, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.9, opacity: 0 }}
				onClick={(e) => e.stopPropagation()}
				className="bg-gray-a1 border border-gray-a4 rounded-lg p-6 max-w-md w-full shadow-2xl"
			>
				<h2 className="text-7 font-bold mb-4">Block Ticker</h2>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-2">Ticker Symbol</label>
						<input
							type="text"
							value={ticker}
							onChange={(e) => setTicker(e.target.value.toUpperCase())}
							placeholder="TSLA"
							required
							className="w-full px-3 py-2 bg-gray-a2 border border-gray-a4 rounded-lg text-gray-12 focus:outline-none focus:ring-2 focus:ring-gray-a6"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-2">Reason (optional)</label>
						<textarea
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder="Why are you blocking this ticker?"
							rows={3}
							className="w-full px-3 py-2 bg-gray-a2 border border-gray-a4 rounded-lg text-gray-12 focus:outline-none focus:ring-2 focus:ring-gray-a6 resize-none"
						/>
					</div>
					<div className="flex gap-3">
						<button
							type="submit"
							className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
						>
							Block Ticker
						</button>
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 bg-gray-a2 hover:bg-gray-a3 border border-gray-a4 rounded-lg text-gray-10 hover:text-gray-12 font-medium transition-colors"
						>
							Cancel
						</button>
					</div>
				</form>
			</motion.div>
		</motion.div>
	);
}

function CheckInModal({
	onClose,
	onSubmit,
	existingCheckIn,
}: {
	onClose: () => void;
	onSubmit: (checkIn: DailyCheckIn) => void;
	existingCheckIn?: DailyCheckIn;
}) {
	const [checkIn, setCheckIn] = useState<DailyCheckIn>({
		date: new Date().toISOString(),
		mood: existingCheckIn?.mood || 5,
		sleepQuality: existingCheckIn?.sleepQuality || 5,
		stressLevel: existingCheckIn?.stressLevel || 5,
		notes: existingCheckIn?.notes || "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(checkIn);
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
			onClick={onClose}
		>
			<motion.div
				initial={{ scale: 0.9, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.9, opacity: 0 }}
				onClick={(e) => e.stopPropagation()}
				className="bg-gray-a1 border border-gray-a4 rounded-lg p-6 max-w-md w-full shadow-2xl"
			>
				<h2 className="text-7 font-bold mb-4">Daily Check-In</h2>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-2">
							How are you feeling? ({checkIn.mood}/10)
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={checkIn.mood}
							onChange={(e) => setCheckIn({ ...checkIn, mood: parseInt(e.target.value) })}
						className="w-full"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-2">
							Sleep Quality ({checkIn.sleepQuality}/10)
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={checkIn.sleepQuality}
							onChange={(e) => setCheckIn({ ...checkIn, sleepQuality: parseInt(e.target.value) })}
							className="w-full"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-2">
							Stress Level ({checkIn.stressLevel}/10)
						</label>
						<input
							type="range"
							min="1"
							max="10"
							value={checkIn.stressLevel}
							onChange={(e) => setCheckIn({ ...checkIn, stressLevel: parseInt(e.target.value) })}
							className="w-full"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-2">Notes</label>
						<textarea
							value={checkIn.notes}
							onChange={(e) => setCheckIn({ ...checkIn, notes: e.target.value })}
							placeholder="How are you feeling before trading today?"
							rows={3}
							className="w-full px-3 py-2 bg-gray-a2 border border-gray-a4 rounded-lg text-gray-12 focus:outline-none focus:ring-2 focus:ring-gray-a6 resize-none"
						/>
					</div>
					<div className="flex gap-3">
						<button
							type="submit"
							className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
						>
							Save Check-In
						</button>
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 bg-gray-a2 hover:bg-gray-a3 border border-gray-a4 rounded-lg text-gray-10 hover:text-gray-12 font-medium transition-colors"
						>
							Cancel
						</button>
				</div>
				</form>
			</motion.div>
		</motion.div>
	);
}

function TradeFormModal({
	onClose,
	onSubmit,
	blockedTickers,
}: {
	onClose: () => void;
	onSubmit: (trade: Omit<Trade, "id">) => void;
	blockedTickers: BlockedTicker[];
}) {
	const [formData, setFormData] = useState({
		ticker: "",
		entryPrice: "",
		exitPrice: "",
		quantity: "",
		leverage: "1",
		setup: SETUPS[0],
		emotion: EMOTIONS[1],
		notes: "",
		followedRules: true,
		tags: [] as string[],
		chartImage: "",
	});
	const [imagePreview, setImagePreview] = useState<string>("");

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
				setFormData({ ...formData, chartImage: reader.result as string });
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const entry = parseFloat(formData.entryPrice);
		const exit = parseFloat(formData.exitPrice);
		const qty = parseFloat(formData.quantity);
		const leverage = parseFloat(formData.leverage);

		// Calculate PnL with leverage multiplier
		const basePnl = (exit - entry) * qty;
		const pnl = basePnl * leverage;

		const isBlocked = blockedTickers.some(
			(b) => b.ticker.toUpperCase() === formData.ticker.toUpperCase()
		);

		if (isBlocked) {
			alert(`⚠️ ${formData.ticker.toUpperCase()} is on your blocklist!`);
			return;
		}

		onSubmit({
			ticker: formData.ticker.toUpperCase(),
			entryPrice: entry,
			exitPrice: exit,
			quantity: qty,
			leverage,
			pnl,
			date: new Date().toISOString(),
			setup: formData.setup,
			emotion: formData.emotion,
			notes: formData.notes,
			followedRules: formData.followedRules,
			tags: formData.tags,
			chartImage: formData.chartImage || undefined,
		});

		setFormData({
			ticker: "",
			entryPrice: "",
			exitPrice: "",
			quantity: "",
			leverage: "1",
			setup: SETUPS[0],
			emotion: EMOTIONS[1],
			notes: "",
			followedRules: true,
			tags: [],
			chartImage: "",
		});
		setImagePreview("");
	};

	const isTickerBlocked = blockedTickers.some(
		(b) => b.ticker.toUpperCase() === formData.ticker.toUpperCase()
	);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
			onClick={onClose}
		>
			<motion.div
				initial={{ scale: 0.9, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.9, opacity: 0 }}
				onClick={(e) => e.stopPropagation()}
				className="bg-gray-a1 border border-gray-a4 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
			>
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-7 font-bold">Log New Trade</h2>
					<button onClick={onClose} className="text-gray-10 hover:text-gray-12">
						<X className="w-6 h-6" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-2">Ticker</label>
							<input
								type="text"
								value={formData.ticker}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setFormData({ ...formData, ticker: e.target.value.toUpperCase() })
								}
								placeholder="AAPL"
								required
								className={`w-full px-3 py-2 bg-gray-a2 border rounded-lg text-gray-12 focus:outline-none focus:ring-2 focus:ring-gray-a6 ${
									isTickerBlocked ? "border-red-500" : "border-gray-a4"
								}`}
							/>
							{isTickerBlocked && (
								<p className="text-red-500 text-xs mt-1">⚠️ This ticker is blocked!</p>
							)}
		</div>
						<div>
							<label className="block text-sm font-medium mb-2">Quantity</label>
							<input
								type="number"
								value={formData.quantity}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, quantity: e.target.value })}
								placeholder="100"
								required
								step="0.01"
								className="w-full px-3 py-2 bg-gray-a2 border border-gray-a4 rounded-lg text-gray-12 focus:outline-none focus:ring-2 focus:ring-gray-a6"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2">Leverage Multiplier</label>
						<input
							type="number"
							value={formData.leverage}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, leverage: e.target.value })}
							placeholder="1"
							required
							min="1"
							max="1000"
							step="1"
							className="w-full px-3 py-2 bg-gray-a2 border border-gray-a4 rounded-lg text-gray-12 focus:outline-none focus:ring-2 focus:ring-gray-a6"
						/>
						<p className="text-xs text-gray-10 mt-1">
							Enter your leverage (e.g., 100 for 100x). P&L will be multiplied by this amount.
						</p>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-2">Entry Price</label>
							<input
								type="number"
								value={formData.entryPrice}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, entryPrice: e.target.value })}
								placeholder="150.00"
								required
								step="0.01"
								className="w-full px-3 py-2 bg-gray-a2 border border-gray-a4 rounded-lg text-gray-12 focus:outline-none focus:ring-2 focus:ring-gray-a6"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-2">Exit Price</label>
							<input
								type="number"
								value={formData.exitPrice}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, exitPrice: e.target.value })}
								placeholder="152.50"
								required
								step="0.01"
								className="w-full px-3 py-2 bg-gray-a2 border border-gray-a4 rounded-lg text-gray-12 focus:outline-none focus:ring-2 focus:ring-gray-a6"
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-2">Setup Type</label>
							<select
								value={formData.setup}
								onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, setup: e.target.value })}
								className="w-full px-3 py-2 bg-gray-a2 border border-gray-a4 rounded-lg text-gray-12 focus:outline-none focus:ring-2 focus:ring-gray-a6"
							>
								{SETUPS.map((setup) => (
									<option key={setup} value={setup}>
										{setup}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium mb-2">Emotion</label>
							<select
								value={formData.emotion}
								onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, emotion: e.target.value })}
								className="w-full px-3 py-2 bg-gray-a2 border border-gray-a4 rounded-lg text-gray-12 focus:outline-none focus:ring-2 focus:ring-gray-a6"
							>
								{EMOTIONS.map((emotion) => (
									<option key={emotion} value={emotion}>
										{emotion}
									</option>
								))}
							</select>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2">Chart Screenshot (optional)</label>
						<input
							type="file"
							accept="image/*"
							onChange={handleImageUpload}
							className="w-full px-3 py-2 bg-gray-a2 border border-gray-a4 rounded-lg text-gray-12 focus:outline-none focus:ring-2 focus:ring-gray-a6"
						/>
						{imagePreview && (
							<div className="mt-2">
								<img
									src={imagePreview}
									alt="Preview"
									className="max-w-xs rounded-lg border border-gray-a4"
								/>
							</div>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium mb-2">Notes</label>
						<textarea
							value={formData.notes}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
							placeholder="What did you learn from this trade?"
							rows={3}
							className="w-full px-3 py-2 bg-gray-a2 border border-gray-a4 rounded-lg text-gray-12 focus:outline-none focus:ring-2 focus:ring-gray-a6 resize-none"
						/>
					</div>

					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							id="followedRules"
							checked={formData.followedRules}
							onChange={(e) =>
								setFormData({ ...formData, followedRules: e.target.checked })
							}
							className="w-4 h-4"
						/>
						<label htmlFor="followedRules" className="text-sm">
							I followed my trading rules
						</label>
					</div>

					<div className="flex gap-3 pt-4">
						<button
							type="submit"
							disabled={isTickerBlocked}
							className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
								isTickerBlocked
									? "bg-gray-a3 text-gray-10 cursor-not-allowed"
									: "bg-gray-a3 hover:bg-gray-a4 border border-gray-a4 text-gray-12"
							}`}
						>
							Log Trade
						</button>
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 bg-gray-a2 hover:bg-gray-a3 border border-gray-a4 rounded-lg text-gray-10 hover:text-gray-12 font-medium transition-colors"
						>
							Cancel
						</button>
					</div>
				</form>
			</motion.div>
		</motion.div>
	);
}
