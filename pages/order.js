import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/useAuth'

export default function OrderForm() {
  const { user, loading } = useAuth(true)
  const router = useRouter()
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState('')
  const [selectedInfo, setSelectedInfo] = useState(null)
  const [gameUser, setGameUser] = useState('')
  const [gamePass, setGamePass] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.from('game_services').select('*').then(({ data }) => {
      if (data) setServices(data)
    })
  }, [])

  useEffect(() => {
    const found = services.find(s => s.id === parseInt(selectedService))
    setSelectedInfo(found || null)
  }, [selectedService, services])

  const handleOrder = async (e) => {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)

    const { error } = await supabase.from('orders').insert([{
      customer_id: user.id,
      service_id: parseInt(selectedService),
      game_username: gameUser,
      game_password: gamePass,
      status: 'pending',
      note: note,
    }])

    setSubmitting(false)
    if (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message)
    } else {
      router.push('/dashboard?success=1')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-400 animate-pulse">กำลังโหลด...</div>
    </div>
  )

  return (
    <>
      <Head><title>ส่งงานฟาร์ม — GameFarm Pro</title></Head>
      <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
        <div className="max-w-2xl mx-auto">

          {/* Back */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-6 text-sm"
          >
            ← กลับหน้า Dashboard
          </button>

          <h1 className="text-2xl font-bold text-cyan-400 mb-6">ส่งงานฟาร์มเกม</h1>

          {/* Security Notice */}
          <div className="bg-yellow-500/5 border border-yellow-500/30 rounded-xl p-4 mb-6 text-sm text-yellow-400">
            ⚠️ <strong>ความปลอดภัย:</strong> ข้อมูล ID/Password จะเข้าถึงได้เฉพาะทีมงานที่รับงานเท่านั้น
            และจะถูกลบทิ้งทันทีเมื่องานเสร็จสิ้น
          </div>

          <form onSubmit={handleOrder} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">

            {/* Service Select */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">เลือกบริการที่ต้องการ *</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-cyan-500 transition"
                required
              >
                <option value="">-- เลือกแพ็กเกจบริการ --</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.game_name} — {s.service_type} ({s.price} บาท)
                  </option>
                ))}
              </select>

              {selectedInfo && (
                <div className="mt-2 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-sm">
                  <p className="font-semibold text-cyan-300">{selectedInfo.game_name} — {selectedInfo.service_type}</p>
                  {selectedInfo.description && <p className="text-gray-400 mt-1">{selectedInfo.description}</p>}
                  <p className="mt-1 font-bold text-cyan-400 text-base">{selectedInfo.price} บาท</p>
                </div>
              )}
            </div>

            {/* Game Credentials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">ไอดีเข้าเกม (Username/Email) *</label>
                <input
                  type="text"
                  value={gameUser}
                  onChange={(e) => setGameUser(e.target.value)}
                  placeholder="your_game_id"
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">รหัสผ่านเข้าเกม *</label>
                <input
                  type="password"
                  value={gamePass}
                  onChange={(e) => setGamePass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">รายละเอียดเพิ่มเติม / ปัญหาที่ต้องการแก้ไข</label>
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="เช่น ช่วยเก็บเควสรายวันให้ครบ หรือ บัญชีเข้าไม่ได้เพราะ..."
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-cyan-500 resize-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-gray-950 font-bold p-3 rounded-lg transition"
            >
              {submitting ? 'กำลังส่งงาน...' : '✅ ยืนยันการส่งงาน'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
