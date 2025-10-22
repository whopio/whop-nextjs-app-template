interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: "up" | "down";
    percentage: number;
  };
  icon?: React.ReactNode;
}

export function MetricCard({ title, value, subtitle, trend, icon }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">
              {value}
            </p>
            {trend && (
              <span
                className={`ml-2 text-sm font-medium ${
                  trend.direction === "up"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {trend.direction === "up" ? "↑" : "↓"} {trend.percentage}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
