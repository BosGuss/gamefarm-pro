import { useState, useRef, useEffect } from 'react'

export default function AiChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'สวัสดีครับ! 👋 ผม AI ผู้ช่วยของ GameFarm Pro มีอะไรให้ช่วยไหมครับ?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const newMessages = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || 'ขออภัย เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
      }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ปุ่มลอย */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-400 shadow-lg shadow-cyan-500/30 flex items-center justify-center text-2xl transition-all hover:scale-110"
        title="AI Support"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* หน้าต่างแชท */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
          style={{ height: '480px' }}>

          {/* Header */}
          <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-sm">🤖</div>
            <div>
              <p className="text-sm font-bold text-white">AI Support</p>
              <p className="text-xs text-green-400">● ออนไลน์</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-cyan-500 text-gray-950 font-medium rounded-br-sm'
                    : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="พิมพ์ข้อความ..."
              disabled={loading}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-gray-950 font-bold w-10 h-10 rounded-xl flex items-center justify-center transition"
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  )
}
