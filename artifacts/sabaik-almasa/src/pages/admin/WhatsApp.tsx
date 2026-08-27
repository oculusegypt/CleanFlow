import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageCircle, Settings, Zap, CheckCircle2, XCircle, Loader2,
  Phone, RefreshCw, Send, Trash2, Eye, EyeOff, Copy, Wifi,
  WifiOff, Clock, ArrowDownLeft, ArrowUpRight, Badge,
} from "lucide-react"
import { format } from "date-fns"
import { arSA } from "date-fns/locale"

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || ""

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("admin_token") ?? ""
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
}

// ── types ──────────────────────────────────────────────────────────────────────
interface WaSettings {
  accessToken: string
  hasToken: boolean
  businessId: string
  phoneNumberId: string
  webhookVerifyToken: string
}

interface WaPhone {
  id: string
  display_phone_number: string
  verified_name: string
  quality_rating: string
  status: string
}

interface WaMessage {
  id: number
  waId: string | null
  from: string
  fromName: string | null
  toNumber: string | null
  type: string
  body: string | null
  direction: "inbound" | "outbound"
  status: string | null
  isRead: boolean
  createdAt: string
}

// ── sub-components ─────────────────────────────────────────────────────────────
function StatusBadge({ status, quality }: { status?: string; quality?: string }) {
  const s = (status ?? "").toUpperCase()
  const color =
    s === "CONNECTED" ? "bg-green-100 text-green-700" :
    s === "FLAGGED"   ? "bg-red-100 text-red-700" :
    "bg-gray-100 text-gray-600"
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{status ?? "—"}{quality ? ` · ${quality}` : ""}</span>
}

function MessageRow({ msg, onDelete }: { msg: WaMessage; onDelete: (id: number) => void }) {
  const inbound = msg.direction === "inbound"
  return (
    <div className={`flex gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!msg.isRead && inbound ? "bg-green-50/40" : ""}`}>
      <div className={`mt-1 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${inbound ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
        {inbound ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-gray-800">{msg.fromName || msg.from}</span>
          {msg.fromName && <span className="text-xs text-gray-400">{msg.from}</span>}
          <span className="text-[10px] text-gray-400 mr-auto">{format(new Date(msg.createdAt), "dd MMM – HH:mm", { locale: arSA })}</span>
        </div>
        <p className="text-sm text-gray-600 mt-0.5 break-words">{msg.body ?? `[${msg.type}]`}</p>
      </div>
      <button onClick={() => onDelete(msg.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 mt-1">
        <Trash2 size={13} />
      </button>
    </div>
  )
}

// ── main page ──────────────────────────────────────────────────────────────────
export default function WhatsAppAdmin() {
  const { toast } = useToast()

  // settings state
  const [settings, setSettings] = useState<WaSettings>({
    accessToken: "", hasToken: false, businessId: "", phoneNumberId: "", webhookVerifyToken: "",
  })
  const [editToken, setEditToken] = useState("")
  const [showToken, setShowToken] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingSettings, setLoadingSettings] = useState(true)

  // test state
  const [testing, setTesting]   = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; account?: { name: string; id: string }; phones?: WaPhone[]; error?: string } | null>(null)

  // messages state
  const [messages, setMessages] = useState<WaMessage[]>([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sendTo, setSendTo]     = useState("")
  const [sendBody, setSendBody] = useState("")
  const [sending, setSending]   = useState(false)

  // ── load settings ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/api/admin/whatsapp/settings`, { headers: authHeaders() })
      .then(r => r.json())
      .then((d: WaSettings) => { setSettings(d); setLoadingSettings(false) })
      .catch(() => setLoadingSettings(false))
  }, [])

  // ── load messages ─────────────────────────────────────────────────────────────
  const loadMessages = useCallback(() => {
    setLoadingMsgs(true)
    fetch(`${API_BASE}/api/admin/whatsapp/messages?limit=100`, { headers: authHeaders() })
      .then(r => r.json())
      .then((d: unknown) => { setMessages(Array.isArray(d) ? d : []); setLoadingMsgs(false) })
      .catch(() => setLoadingMsgs(false))
  }, [])

  useEffect(() => { loadMessages() }, [loadMessages])

  // ── save settings ─────────────────────────────────────────────────────────────
  async function saveSettings() {
    setSaving(true)
    try {
      await fetch(`${API_BASE}/api/admin/whatsapp/settings`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          accessToken:        editToken || undefined,
          businessId:         settings.businessId,
          phoneNumberId:      settings.phoneNumberId,
          webhookVerifyToken: settings.webhookVerifyToken,
        }),
      })
      toast({ title: "✅ تم حفظ الإعدادات" })
      setEditToken("")
      // reload
      const d = await fetch(`${API_BASE}/api/admin/whatsapp/settings`, { headers: authHeaders() }).then(r => r.json())
      setSettings(d)
    } catch { toast({ title: "فشل الحفظ", variant: "destructive" }) }
    finally { setSaving(false) }
  }

  // ── test connection ───────────────────────────────────────────────────────────
  async function testConnection() {
    setTesting(true); setTestResult(null)
    try {
      const r = await fetch(`${API_BASE}/api/admin/whatsapp/test`, {
        method: "POST",
        headers: authHeaders(),
      })
      const d = await r.json()
      setTestResult(d)
    } catch (e) { setTestResult({ ok: false, error: String(e) }) }
    finally { setTesting(false) }
  }

  // ── send message ─────────────────────────────────────────────────────────────
  async function sendMessage() {
    if (!sendTo || !sendBody) return
    setSending(true)
    try {
      const r = await fetch(`${API_BASE}/api/admin/whatsapp/send`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ to: sendTo, message: sendBody }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      toast({ title: "✅ تم إرسال الرسالة" })
      setSendBody("")
      loadMessages()
    } catch (e) { toast({ title: "فشل الإرسال", description: String(e), variant: "destructive" }) }
    finally { setSending(false) }
  }

  // ── delete message ────────────────────────────────────────────────────────────
  async function deleteMessage(id: number) {
    await fetch(`${API_BASE}/api/admin/whatsapp/messages/${id}`, { method: "DELETE", headers: authHeaders() })
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  const unreadCount = messages.filter(m => m.direction === "inbound" && !m.isRead).length

  if (loadingSettings) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-gray-400" size={28} />
    </div>
  )

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
          <MessageCircle size={20} className="text-green-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">واتساب للأعمال</h1>
          <p className="text-sm text-gray-500">إدارة رسائل WhatsApp Business API</p>
        </div>
        <div className="mr-auto flex items-center gap-2">
          {settings.hasToken
            ? <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full"><Wifi size={12}/> متصل</span>
            : <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full"><WifiOff size={12}/> غير مُعدّ</span>}
        </div>
      </div>

      <Tabs defaultValue="settings">
        <TabsList className="w-full justify-start gap-1 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="settings" className="gap-2 rounded-lg">
            <Settings size={14}/> الإعدادات
          </TabsTrigger>
          <TabsTrigger value="test" className="gap-2 rounded-lg">
            <Zap size={14}/> اختبار الاتصال
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2 rounded-lg relative">
            <MessageCircle size={14}/>
            الرسائل
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Settings Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="settings" className="mt-4 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">بيانات الحساب</p>

            {/* Access Token */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">رمز الوصول (Access Token)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showToken ? "text" : "password"}
                    value={editToken || (showToken ? "" : settings.accessToken)}
                    onChange={e => setEditToken(e.target.value)}
                    placeholder={settings.hasToken ? "رمز الوصول محفوظ — اكتب رمزاً جديداً للتحديث" : "EAA..."}
                    className="font-mono text-xs pl-9"
                  />
                  <button className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowToken(v => !v)}>
                    {showToken ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
              </div>
              {settings.hasToken && !editToken && (
                <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 size={11}/> رمز وصول محفوظ</p>
              )}
            </div>

            {/* Business Account ID */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">معرّف حساب الأعمال (WABA ID)</label>
              <Input value={settings.businessId} onChange={e => setSettings(s => ({ ...s, businessId: e.target.value }))}
                placeholder="997591522990829" className="font-mono text-sm" />
              <p className="text-xs text-gray-400">معرّف حافظة الأعمال من Meta Business Suite</p>
            </div>

            {/* Phone Number ID */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">معرّف رقم الهاتف (Phone Number ID)</label>
              <div className="flex gap-2">
                <Input value={settings.phoneNumberId} onChange={e => setSettings(s => ({ ...s, phoneNumberId: e.target.value }))}
                  placeholder="سيُملأ تلقائياً بعد اختبار الاتصال" className="font-mono text-sm flex-1" />
              </div>
            </div>

            {/* Webhook Verify Token */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">رمز التحقق من Webhook</label>
              <Input value={settings.webhookVerifyToken} onChange={e => setSettings(s => ({ ...s, webhookVerifyToken: e.target.value }))}
                placeholder="my_secret_token_2026" className="font-mono text-sm" />
            </div>

            {/* Webhook URL info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-200">
              <p className="text-xs font-bold text-gray-600">رابط Webhook الخاص بك</p>
              <div className="flex items-center gap-2">
                <code className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded flex-1 break-all">
                  {window.location.origin}/api/webhooks/whatsapp
                </code>
                <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/whatsapp`); toast({ title: "تم نسخ الرابط" }) }}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                  <Copy size={13}/>
                </button>
              </div>
              <p className="text-[11px] text-gray-500">أضف هذا الرابط في إعدادات Webhook بحساب Meta Developer وضع رمز التحقق نفسه أعلاه</p>
            </div>

            <Button onClick={saveSettings} disabled={saving} className="w-full">
              {saving ? <><Loader2 size={14} className="animate-spin ml-2"/>جاري الحفظ...</> : "حفظ الإعدادات"}
            </Button>
          </div>
        </TabsContent>

        {/* ── Test Tab ─────────────────────────────────────────────────────── */}
        <TabsContent value="test" className="mt-4 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">اختبار الاتصال بـ WhatsApp API</p>

            <Button onClick={testConnection} disabled={testing || !settings.hasToken} className="w-full gap-2">
              {testing
                ? <><Loader2 size={14} className="animate-spin"/>جاري الاختبار...</>
                : <><Zap size={14}/>اختبر الاتصال الآن</>}
            </Button>

            {!settings.hasToken && (
              <p className="text-sm text-amber-600 bg-amber-50 rounded-xl p-3 border border-amber-200">
                ⚠️ يرجى إدخال رمز الوصول في تاب الإعدادات أولاً
              </p>
            )}

            {testResult && (
              <div className={`rounded-xl border p-4 space-y-4 ${testResult.ok ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                <div className="flex items-center gap-2">
                  {testResult.ok
                    ? <><CheckCircle2 size={16} className="text-green-600"/><span className="font-bold text-green-700 text-sm">الاتصال ناجح ✓</span></>
                    : <><XCircle size={16} className="text-red-500"/><span className="font-bold text-red-600 text-sm">فشل الاتصال</span></>}
                </div>

                {testResult.account && (
                  <div className="bg-white rounded-lg p-3 space-y-1 border border-green-100">
                    <p className="text-xs font-bold text-gray-500">معلومات الحساب</p>
                    <p className="text-sm"><span className="text-gray-500">الاسم: </span><span className="font-medium">{testResult.account.name}</span></p>
                    <p className="text-sm font-mono text-xs text-gray-500">ID: {testResult.account.id}</p>
                  </div>
                )}

                {testResult.phones && testResult.phones.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-600">أرقام الهاتف المرتبطة</p>
                    {testResult.phones.map(phone => (
                      <div key={phone.id} className="bg-white rounded-lg p-3 border border-green-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-green-600 flex-shrink-0"/>
                          <div>
                            <p className="font-bold text-sm">{phone.display_phone_number}</p>
                            <p className="text-xs text-gray-500">{phone.verified_name}</p>
                            <p className="text-xs text-gray-400 font-mono">ID: {phone.id}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <StatusBadge status={phone.status} quality={phone.quality_rating}/>
                          <button
                            onClick={() => { setSettings(s => ({ ...s, phoneNumberId: phone.id })); toast({ title: "تم تحديد معرّف الرقم — لا تنسَ الحفظ" }) }}
                            className="text-xs text-blue-600 hover:underline">
                            استخدم هذا الرقم
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {testResult.phones?.length === 0 && testResult.ok && (
                  <p className="text-xs text-gray-500">لم يتم العثور على أرقام هاتف — تحقق من معرّف حساب الأعمال</p>
                )}

                {testResult.error && (
                  <p className="text-sm text-red-700 font-mono bg-red-100 rounded p-2 break-all">{testResult.error}</p>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Messages Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="messages" className="mt-4 space-y-4">
          {/* Send message */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <p className="text-xs font-bold text-gray-500">إرسال رسالة</p>
            <div className="flex gap-2">
              <Input value={sendTo} onChange={e => setSendTo(e.target.value)}
                placeholder="رقم الهاتف مع رمز الدولة (966...)" className="font-mono text-sm" dir="ltr" />
            </div>
            <div className="flex gap-2">
              <Input value={sendBody} onChange={e => setSendBody(e.target.value)}
                placeholder="نص الرسالة..." className="flex-1" />
              <Button onClick={sendMessage} disabled={sending || !sendTo || !sendBody || !settings.phoneNumberId} className="gap-1.5">
                {sending ? <Loader2 size={13} className="animate-spin"/> : <Send size={13}/>}
                إرسال
              </Button>
            </div>
            {!settings.phoneNumberId && (
              <p className="text-xs text-amber-600">⚠️ يرجى تحديد معرّف رقم الهاتف في الإعدادات</p>
            )}
          </div>

          {/* Messages list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-gray-500">الرسائل الواردة والصادرة</p>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">{unreadCount} جديدة</span>
                )}
              </div>
              <button onClick={loadMessages} disabled={loadingMsgs} className="text-gray-400 hover:text-gray-600 transition-colors">
                <RefreshCw size={14} className={loadingMsgs ? "animate-spin" : ""}/>
              </button>
            </div>

            {loadingMsgs ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 size={20} className="animate-spin text-gray-400"/>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400 gap-2">
                <MessageCircle size={28} className="opacity-30"/>
                <p className="text-sm">لا توجد رسائل بعد</p>
                <p className="text-xs text-center px-8">ستظهر الرسائل هنا عند استلامها عبر Webhook أو إرسالها</p>
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto">
                {messages.map(msg => (
                  <MessageRow key={msg.id} msg={msg} onDelete={deleteMessage}/>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
