import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ListOrdered, TrendingUp, Clock, CheckCircle2 } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  color: string
  bg: string
}

function StatCard({ label, value, sub, icon, color, bg }: StatCardProps) {
  return (
    <Card className="border shadow-none">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
          <p className="text-2xl font-extrabold text-gray-900 leading-none mb-1">{value}</p>
          {sub && <p className="text-[11px] text-gray-400 font-normal">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${bg} ${color} shrink-0`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}

interface RequestsStatsGridProps {
  stats?: {
    totalRequests?: number
    weekRequests?: number
    todayRequests?: number
    yesterdayRequests?: number
    inProgressRequests?: number
    pendingRequests?: number
    completedRequests?: number
    cancelledRequests?: number
  }
}

export function RequestsStatsGrid({ stats }: RequestsStatsGridProps) {
  const todayCount = stats?.todayRequests ?? 0
  const yestCount  = stats?.yesterdayRequests ?? 0
  const trendDiff  = todayCount - yestCount
  const trendLabel = trendDiff === 0
    ? "مثل الأمس"
    : trendDiff > 0
      ? `+${trendDiff} عن الأمس`
      : `${trendDiff} عن الأمس`

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard
        label="إجمالي الطلبات"
        value={stats?.totalRequests ?? "—"}
        sub={`هذا الأسبوع: ${stats?.weekRequests ?? 0}`}
        icon={<ListOrdered className="w-5 h-5" />}
        color="text-indigo-600"
        bg="bg-indigo-50"
      />
      <StatCard
        label="طلبات اليوم"
        value={stats?.todayRequests ?? "—"}
        sub={trendLabel}
        icon={<TrendingUp className="w-5 h-5" />}
        color="text-sky-600"
        bg="bg-sky-50"
      />
      <StatCard
        label="قيد التنفيذ"
        value={stats?.inProgressRequests ?? "—"}
        sub={`جديدة: ${stats?.pendingRequests ?? 0}`}
        icon={<Clock className="w-5 h-5" />}
        color="text-orange-500"
        bg="bg-orange-50"
      />
      <StatCard
        label="مكتملة"
        value={stats?.completedRequests ?? "—"}
        sub={`ملغاة: ${stats?.cancelledRequests ?? 0}`}
        icon={<CheckCircle2 className="w-5 h-5" />}
        color="text-green-600"
        bg="bg-green-50"
      />
    </div>
  )
}
