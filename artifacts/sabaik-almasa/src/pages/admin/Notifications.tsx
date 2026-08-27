import { useState } from "react"
import { getGetNotificationsQueryKey, useGetNotifications } from "@workspace/api-client-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, CheckCheck, Package, MessageSquare, Settings, Inbox, Trash2, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { arSA } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { fetchAdminMutation } from "@/lib/adminMutation"

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || ""

const typeConfig: Record<string, { label: string; icon: typeof Bell; color: string }> = {
  request: { label: "طلب خدمة", icon: Inbox, color: "bg-blue-100 text-blue-700" },
  service_request: { label: "طلب خدمة", icon: Inbox, color: "bg-blue-100 text-blue-700" },
  chat: { label: "رسالة", icon: MessageSquare, color: "bg-green-100 text-green-700" },
  conversation: { label: "رسالة", icon: MessageSquare, color: "bg-green-100 text-green-700" },
  message: { label: "رسالة", icon: MessageSquare, color: "bg-green-100 text-green-700" },
  whatsapp: { label: "واتساب", icon: MessageSquare, color: "bg-green-100 text-green-700" },
  system: { label: "نظام", icon: Settings, color: "bg-gray-100 text-gray-700" },
  container: { label: "باقة تنظيف", icon: Package, color: "bg-orange-100 text-orange-700" },
}

// Chat/message events are handled in the conversations area, not in the
// notifications inbox. Keep service-request, system, and other notifications
// visible here without changing the stored records or other pages.
const MESSAGE_NOTIFICATION_TYPES = new Set(["chat", "conversation", "message", "whatsapp"])

export default function AdminNotifications() {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deletingAll, setDeletingAll] = useState(false)
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)
  const { data: notifications = [], refetch } = useGetNotifications({
    query: {
      queryKey: getGetNotificationsQueryKey(),
      staleTime: 0,
      refetchOnMount: "always",
    },
    request: { cache: "no-store" },
  })
  const { toast } = useToast()

  const visibleNotifications = notifications.filter(
    (notification) => !MESSAGE_NOTIFICATION_TYPES.has(notification.type),
  )

  const filtered = visibleNotifications.filter((n) => {
    if (filter === "unread") return !n.isRead
    if (filter === "read") return n.isRead
    return true
  })

  const unreadCount = visibleNotifications.filter((n) => !n.isRead).length

  const handleMarkRead = async (id: number) => {
    try {
      const res = await fetchAdminMutation(`${API_BASE}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token") || ""}` },
      })
      if (!res.ok) {
        if (res.status === 404) {
          await refetch()
          return
        }
        throw new Error("فشل التحديث")
      }
      await refetch()
    } catch {
      toast({ variant: "destructive", title: "فشل تحديد الإشعار كمقروء" })
    }
  }

  const handleMarkAllRead = async () => {
    try {
      const res = await fetchAdminMutation(`${API_BASE}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token") || ""}` },
      })
      if (!res.ok) throw new Error("فشل التحديث")
      await refetch()
    } catch {
      toast({ variant: "destructive", title: "فشل تحديد الإشعارات كمقروءة" })
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      const res = await fetchAdminMutation(`${API_BASE}/api/admin/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
      })
      if (!res.ok) throw new Error("فشل الحذف")
      await refetch()
      toast({ title: "تم حذف الإشعار ✅" })
    } catch {
      toast({ variant: "destructive", title: "فشل الحذف" })
    } finally {
      setDeletingId(null)
    }
  }

  async function handleDeleteAll() {
    setDeletingAll(true)
    try {
      const res = await fetchAdminMutation(`${API_BASE}/api/admin/notifications`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
      })
      if (!res.ok) throw new Error("فشل الحذف")
      setConfirmDeleteAll(false)
      await refetch()
      toast({ title: "تم حذف جميع الإشعارات ✅" })
    } catch {
      toast({ variant: "destructive", title: "فشل الحذف" })
    } finally {
      setDeletingAll(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-800">الإشعارات</h2>
          {unreadCount > 0 && (
            <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {unreadCount} جديد
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-2">
              <CheckCheck size={16} />
              تعليم الكل كمقروء
            </Button>
          )}
          {visibleNotifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDeleteAll(true)}
              className="gap-2 text-red-500 border-red-200 hover:bg-red-50"
            >
              <Trash2 size={16} />
              حذف الكل
            </Button>
          )}
        </div>
      </div>

      {/* Delete All confirmation */}
      {confirmDeleteAll && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
          <AlertTriangle size={16} className="text-red-500 shrink-0" />
          <p className="flex-1 text-red-700 font-medium">هل أنت متأكد من حذف جميع الإشعارات؟ لا يمكن التراجع.</p>
          <Button size="sm" variant="destructive" onClick={handleDeleteAll} disabled={deletingAll} className="rounded-xl">
            {deletingAll ? "جارٍ الحذف..." : "نعم، احذف الكل"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setConfirmDeleteAll(false)} className="rounded-xl">إلغاء</Button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: "all",    label: `الكل (${visibleNotifications.length})` },
          { key: "unread", label: `غير مقروء (${unreadCount})` },
          { key: "read",   label: "مقروء" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-primary text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-3 text-gray-400">
            <Bell size={48} strokeWidth={1} />
            <p className="text-lg font-medium">لا توجد إشعارات</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((notification) => {
            const config = typeConfig[notification.type] ?? typeConfig.system!
            const Icon = config.icon
            return (
              <div
                key={notification.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4 transition-all group ${
                  !notification.isRead
                    ? "border-primary/30 shadow-sm shadow-primary/5"
                    : "border-gray-100"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2 mb-1">
                    <h3 className={`font-semibold ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}>
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-primary rounded-full shrink-0" />
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full sm:mr-auto ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {format(new Date(notification.createdAt), "dd MMMM yyyy — HH:mm", { locale: arSA })}
                  </p>
                </div>
                <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:shrink-0">
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkRead(notification.id)}
                      className="text-primary hover:text-primary hover:bg-primary/5"
                    >
                      <CheckCheck size={14} className="mr-1" /> مقروء
                    </Button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    disabled={deletingId === notification.id}
                    title="حذف الإشعار"
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                  >
                    {deletingId === notification.id
                      ? <span className="text-xs text-red-400 w-4 inline-block text-center">...</span>
                      : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
