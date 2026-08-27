import { useState, useEffect, useCallback } from "react"
import {
  Database, Table2, Trash2, ChevronRight, ChevronLeft,
  RefreshCw, AlertTriangle, Lock, Search, X,
} from "lucide-react"

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || ""

interface TableInfo {
  name: string
  rows: number
  blocked: boolean
}

interface Column {
  name: string
  type: string
  pk: boolean
}

interface TableData {
  table: string
  columns: Column[]
  rows: Record<string, unknown>[]
  total: number
  page: number
  limit: number
  pages: number
}

function getToken() {
  return localStorage.getItem("admin_token") ?? ""
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" }
}

// ── Format cell value ─────────────────────────────────────────────────────────
function CellValue({ val }: { val: unknown }) {
  if (val === null || val === undefined)
    return <span className="text-gray-300 italic text-xs">null</span>
  if (typeof val === "string" && val.length > 80)
    return (
      <span className="text-xs text-gray-700" title={val}>
        {val.slice(0, 80)}…
      </span>
    )
  return <span className="text-xs text-gray-800">{String(val)}</span>
}

// ── Tables List ───────────────────────────────────────────────────────────────
function TablesList({
  tables, loading, selected, onSelect,
}: {
  tables: TableInfo[]
  loading: boolean
  selected: string | null
  onSelect: (t: TableInfo) => void
}) {
  const [q, setQ] = useState("")
  const filtered = q
    ? tables.filter((t) => t.name.includes(q.toLowerCase()))
    : tables

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Database size={16} className="text-primary" />
          الجداول ({tables.length})
        </h2>
        <div className="relative">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="بحث…"
            className="w-full text-xs border border-gray-200 rounded-lg pr-8 pl-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
      </div>
      <div className="overflow-y-auto flex-1 py-2">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
            <RefreshCw size={16} className="animate-spin mr-2" /> جاري التحميل…
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 text-xs py-6">لا توجد جداول</p>
        ) : (
          filtered.map((t) => (
            <button
              key={t.name}
              onClick={() => !t.blocked && onSelect(t)}
              className={`w-full text-right px-4 py-2.5 flex items-center gap-2 transition-colors text-sm ${
                t.blocked
                  ? "opacity-40 cursor-not-allowed"
                  : selected === t.name
                  ? "bg-primary/10 text-primary font-semibold"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              {t.blocked ? (
                <Lock size={13} className="text-gray-400 shrink-0" />
              ) : (
                <Table2 size={13} className="text-gray-400 shrink-0" />
              )}
              <span className="flex-1 truncate font-mono">{t.name}</span>
              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                {t.rows}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

// ── Confirm Delete Dialog ─────────────────────────────────────────────────────
function ConfirmDialog({
  row, pkCol, table, onConfirm, onCancel,
}: {
  row: Record<string, unknown>
  pkCol: string
  table: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">تأكيد الحذف</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              جدول <span className="font-mono font-bold">{table}</span> — السجل رقم{" "}
              <span className="font-mono font-bold">{String(row[pkCol])}</span>
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-5">
          هذا الإجراء لا يمكن التراجع عنه. هل أنت متأكد من حذف هذا السجل؟
        </p>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
          >
            نعم، احذف
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Table Viewer ──────────────────────────────────────────────────────────────
function TableViewer({
  tableName, onBack,
}: {
  tableName: string
  onBack: () => void
}) {
  const [data, setData] = useState<TableData | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const load = useCallback(
    async (p: number) => {
      setLoading(true)
      setError(null)
      try {
        const r = await fetch(
          `${API_BASE}/api/admin/database/tables/${tableName}?page=${p}&limit=50`,
          { headers: authHeaders() }
        )
        if (!r.ok) {
          const j = await r.json().catch(() => ({}))
          setError((j as { error?: string }).error ?? "خطأ في التحميل")
          return
        }
        setData(await r.json())
      } catch {
        setError("تعذّر الاتصال بالخادم")
      } finally {
        setLoading(false)
      }
    },
    [tableName]
  )

  useEffect(() => {
    setPage(1)
    load(1)
  }, [load])

  const handleDelete = async () => {
    if (!deleting || !data) return
    const pkCol = data.columns.find((c) => c.pk)?.name ?? "id"
    const pkVal = deleting[pkCol]
    try {
      const r = await fetch(
        `${API_BASE}/api/admin/database/tables/${tableName}/${pkVal}`,
        { method: "DELETE", headers: authHeaders() }
      )
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        setToast((j as { error?: string }).error ?? "فشل الحذف")
      } else {
        setToast("تم الحذف بنجاح")
        load(page)
      }
    } catch {
      setToast("تعذّر الاتصال بالخادم")
    } finally {
      setDeleting(null)
      setTimeout(() => setToast(null), 3000)
    }
  }

  const pkCol = data?.columns.find((c) => c.pk)?.name ?? "id"

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronRight size={16} /> الجداول
        </button>
        <span className="text-gray-300">/</span>
        <span className="font-mono font-bold text-gray-800 text-sm">{tableName}</span>
        {data && (
          <span className="text-xs text-gray-400 mr-auto">
            {data.total} سجل
          </span>
        )}
        <button
          onClick={() => load(page)}
          className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          title="تحديث"
        >
          <RefreshCw size={14} className={`text-gray-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Table */}
      {loading && !data ? (
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
          <RefreshCw size={20} className="animate-spin text-gray-400" />
        </div>
      ) : data ? (
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-0">
          <div className="overflow-auto flex-1">
            <table className="w-full text-right border-collapse min-w-max">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {data.columns.map((col) => (
                    <th
                      key={col.name}
                      className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      <span className="flex items-center gap-1">
                        {col.pk && (
                          <span className="text-[9px] bg-primary/10 text-primary px-1 rounded">PK</span>
                        )}
                        <span className="font-mono">{col.name}</span>
                        <span className="text-gray-300 font-normal normal-case">{col.type}</span>
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    إجراء
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={data.columns.length + 1}
                      className="text-center py-10 text-gray-400 text-sm"
                    >
                      لا توجد سجلات
                    </td>
                  </tr>
                ) : (
                  data.rows.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      {data.columns.map((col) => (
                        <td key={col.name} className="px-4 py-2.5 max-w-[200px]">
                          <CellValue val={row[col.name]} />
                        </td>
                      ))}
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => setDeleting(row)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                        >
                          <Trash2 size={13} /> حذف
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                صفحة {data.page} من {data.pages} — {data.total} سجل
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => { const p = page - 1; setPage(p); load(p) }}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
                <button
                  disabled={page >= data.pages}
                  onClick={() => { const p = page + 1; setPage(p); load(p) }}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Confirm delete */}
      {deleting && data && (
        <ConfirmDialog
          row={deleting}
          pkCol={pkCol}
          table={tableName}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 z-50">
          {toast}
          <button onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DatabaseManager() {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [loadingTables, setLoadingTables] = useState(true)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tablesError, setTablesError] = useState<string | null>(null)

  const loadTables = async () => {
    setLoadingTables(true)
    setTablesError(null)
    try {
      const r = await fetch(`${API_BASE}/api/admin/database/tables`, {
        headers: authHeaders(),
      })
      if (!r.ok) {
        setTablesError("تعذّر تحميل قائمة الجداول")
        return
      }
      setTables(await r.json())
    } catch {
      setTablesError("تعذّر الاتصال بالخادم")
    } finally {
      setLoadingTables(false)
    }
  }

  useEffect(() => { loadTables() }, [])

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Database size={22} className="text-primary" />
            قاعدة البيانات
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            عرض وإدارة جداول قاعدة البيانات — جدول
            <span className="font-mono text-red-400"> admins </span>
            محمي ولا يمكن عرضه
          </p>
        </div>
        <button
          onClick={() => { setSelectedTable(null); loadTables() }}
          className="flex items-center gap-2 text-sm bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 px-3 py-2 rounded-xl transition-colors"
        >
          <RefreshCw size={14} className={loadingTables ? "animate-spin" : ""} />
          تحديث
        </button>
      </div>

      {tablesError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 flex items-center gap-2">
          <AlertTriangle size={16} /> {tablesError}
        </div>
      )}

      <div className="flex gap-4 flex-1 min-h-0" style={{ minHeight: "70vh" }}>
        {/* Left: tables list */}
        <div className="w-56 shrink-0">
          <TablesList
            tables={tables}
            loading={loadingTables}
            selected={selectedTable}
            onSelect={(t) => setSelectedTable(t.name)}
          />
        </div>

        {/* Right: table viewer */}
        <div className="flex-1 min-w-0">
          {selectedTable ? (
            <TableViewer
              key={selectedTable}
              tableName={selectedTable}
              onBack={() => setSelectedTable(null)}
            />
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center h-full min-h-64">
              <div className="text-center text-gray-400">
                <Table2 size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">اختر جدولاً من القائمة لعرض بياناته</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
