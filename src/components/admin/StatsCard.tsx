import {
  FileText, CheckCircle, Clock, TrendingUp, Rss, Activity,
  AlertCircle, Eye, Zap, Globe, type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  "file-text": FileText,
  "check-circle": CheckCircle,
  "clock": Clock,
  "trending-up": TrendingUp,
  "rss": Rss,
  "activity": Activity,
  "alert-circle": AlertCircle,
  "eye": Eye,
  "zap": Zap,
  "globe": Globe,
};

const variantStyles = {
  default: "bg-card border-border",
  success: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900",
  warning: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-900",
  danger:  "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900",
};

const valueStyles = {
  default: "text-foreground",
  success: "text-green-700 dark:text-green-400",
  warning: "text-yellow-700 dark:text-yellow-400",
  danger:  "text-red-700 dark:text-red-400",
};

const iconStyles = {
  default: "text-muted-foreground",
  success: "text-green-500",
  warning: "text-yellow-500",
  danger:  "text-red-500",
};

interface Props {
  title: string;
  value: number | string;
  icon: string;
  variant?: "default" | "success" | "warning" | "danger";
}

export function StatsCard({ title, value, icon, variant = "default" }: Props) {
  const Icon = ICON_MAP[icon] ?? Activity;

  return (
    <div className={`rounded-xl border p-5 ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
        <Icon size={18} className={iconStyles[variant]} />
      </div>
      <p className={`text-3xl font-bold ${valueStyles[variant]}`}>{value.toLocaleString()}</p>
    </div>
  );
}
