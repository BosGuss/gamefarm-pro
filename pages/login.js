import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else if (data.user) {
        await supabase.from('profiles').insert([
          { id: data.user.id, full_name: fullName, role: 'customer' }
        ])
        setMessage({ type: 'success', text: '✅ สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลยืนยัน แล้วเข้าสู่ระบบได้เลย' })
        setIsSignUp(false)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        router.push('/dashboard')
      }
    }
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>{isSignUp ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'} — GameFarm Pro</title>
      </Head>
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">

        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="text-6xl mb-3">🎮</div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            GameFarm Pro
          </h1>
          <p className="text-gray-400 mt-2 text-sm">บริการฟาร์มและแก้ไขปัญหา ID เกม ครบวงจร</p>
        </div>

        {/* Card */}
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-center mb-1">
            {isSignUp ? 'สร้างบัญชีใหม่' : 'เข้าสู่ระบบ'}
          </h2>
          <p className="text-gray-500 text-xs text-center mb-6">
            {isSignUp ? 'กรอกข้อมูลด้านล่างเพื่อสมัครสมาชิก' : 'ยินดีต้อนรับกลับมา!'}
          </p>

          {message && (
            <div className={`p-3 mb-5 rounded-lg text-sm border ${
              message.type === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="กรอกชื่อของคุณ"
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-cyan-500 text-white placeholder-gray-600 transition"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm text-gray-400 mb-1">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-cyan-500 text-white placeholder-gray-600 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-cyan-500 text-white placeholder-gray-600 transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 p-3 rounded-lg font-bold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'กำลังดำเนินการ...' : (isSignUp ? 'สมัครสมาชิก' : 'ลงชื่อเข้าใช้')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            {isSignUp ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชี?'}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setMessage(null) }}
              className="text-cyan-400 ml-1 font-semibold hover:underline"
            >
              {isSignUp ? 'เข้าสู่ระบบ' : 'สมัครสมาชิกที่นี่'}
            </button>
          </div>
        </div>

        {/* Feature badges */}
        <div className="flex gap-4 mt-8 text-xs text-gray-600">
          <span>🔒 ปลอดภัย</span>
          <span>⚡ รวดเร็ว</span>
          <span>🎯 แม่นยำ</span>
        </div>
      </div>
    </>
  )
}
