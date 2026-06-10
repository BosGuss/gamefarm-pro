import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/useAuth'
import AiChat from '../components/AiChat'

const STATUS_MAP = {
  pending:     { label: 'รอดำเนินการ',    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', icon: '⏳' },
  'in-progress':{ label: 'กำลังดำเนินการ', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',     icon: '⚙️' },
  completed:   { label: 'เสร็จสิ้น',       color: 'bg-green-500/10 text-green-400 border-green-500/30',  icon: '✅' },
  cancelled:   { label: 'ยกเลิกแล้ว',      color: 'bg-red-500/10 text-red-400 border-red-500/30',        icon: '❌' },
}

export default function Dashboard() {
  const { user, loading, signOut } = useAuth(true)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!user) return

    const fetchOrders = async () => {
      setOrdersLoading(true)
      const { data } = await supabase
        .from('orders')
        .select(`id, game_username, status, created_at, note,
                 game_services ( game_name, service_type, price )`)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
      if (data) setOrders(data)
      setOrdersLoading(false)
    }

    fetchOrders()

    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-400 animate-pulse">กำลังโหลด...</div>
    </div>
  )

  const stats = [
    { label: 'งานทั้งหมด',    value: orders.length,                                   color: 'text-white' },
    { label: 'รอดำเนินการ',   value: orders.filter(o => o.status === 'pending').length, color: 'text-yellow-400' },
    { label: 'กำลังทำงาน',   value: orders.filter(o => o.status === 'in-progress').length, color: 'text-blue-400' },
    { label: 'เสร็จสิ้น',     value: orders.filter(o => o.status === 'completed').length, color: 'text-green-400' },
  ]

  return (
    <>
      <Head><title>Dashboard — GameFarm Pro</title></Head>
      <div className="min-h-screen bg-gray-950 text-white">

        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎮</span>
              <div>
                <h1 className="text-base font-bold text-cyan-400 leading-tight">GameFarm Pro</h1>
                <p className="text-xs text-gray-500 hidden md:block">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2 md:gap-3">
              <button
                onClick={() => router.push('/order')}
                className="bg-cyan-500 hover:bg-cyan-600 text-gray-950 font-bold px-3 md:px-4 py-2 rounded-lg text-sm transition"
              >
                + ส่งงานใหม่
              </button>
              <button
                onClick={signOut}
                className="bg-gray-800 hover:bg-gray-700 px-3 md:px-4 py-2 rounded-lg text-sm text-gray-300 transition"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 md:px-6 py-6">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Orders */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-200">รายการงานของฉัน</h2>
            <span className="text-xs text-gray-500">🔴 อัปเดต Realtime</span>
          </div>

          {ordersLoading ? (
            <div className="text-center py-16 text-gray-500 animate-pulse">กำลังโหลดรายการงาน...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-2xl">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-400 mb-5">ยังไม่มีรายการฟาร์มในขณะนี้</p>
              <button
                onClick={() => router.push('/order')}
                className="bg-cyan-500 hover:bg-cyan-600 text-gray-950 font-bold px-6 py-2.5 rounded-lg transition"
              >
                สั่งฟาร์มเกมแรกเลย!
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((order) => {
                const s = STATUS_MAP[order.status] || STATUS_MAP.pending
                return (
                  <div key={order.id} className="p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-white">{order.game_services?.game_name}</h4>
                        <p className="text-sm text-gray-400">{order.game_services?.service_type}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ml-2 ${s.color}`}>
                        {s.icon} {s.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      ID เกม: <span className="text-gray-200 font-mono">{order.game_username}</span>
                    </p>
                    {order.note && (
                      <p className="text-xs text-gray-500 italic mt-1">"{order.note}"</p>
                    )}
                    <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between text-xs text-gray-500">
                      <span className="text-cyan-400 font-semibold">{order.game_services?.price} บาท</span>
                      <span>{new Date(order.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
      <AiChat />
    </>
  )
}
