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

const variantConfig = {
  default: {
    card: "bg-card border-border",
    icon: "bg-muted text-muted-foreground",
    value: "text-foreground",
    label: "text-muted-foreground",
    accent: "bg-border",
  },
  success: {
    card: "bg-card border-green-200 dark:border-green-900",
    icon: "bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400",
    value: "text-green-700 dark:text-green-400",
    label: "text-green-600/80 dark:text-green-500/80",
    accent: "bg-green-500",
  },
  warning: {
    card: "bg-card border-amber-200 dark:border-amber-900",
    icon: "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
    value: "text-amber-700 dark:text-amber-400",
    label: "text-amber-600/80 dark:text-amber-500/80",
    accent: "bg-amber-500",
  },
  danger: {
    card: "bg-card border-red-200 dark:border-red-900",
    icon: "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400",
    value: "text-red-700 dark:text-red-400",
    label: "text-red-600/80 dark:text-red-500/80",
    accent: "bg-red-500",
  },
};

interface Props {
  title: string;
  value: number | string;
  icon: string;
  variant?: "default" | "success" | "warning" | "danger";
}

export function StatsCard({ title, value, icon, variant = "default" }: Props) {
  const Icon = ICON_MAP[icon] ?? Activity;
  const cfg = variantConfig[variant];

  return (
    <div className={`relative rounded-xl border p-5 overflow-hidden ${cfg.card}`}>
      {/* Accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${cfg.accent}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${cfg.label}`}>
            {title}
          </p>
          <p className={`text-3xl font-black leading-none ${cfg.value}`}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${cfg.icon}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}
