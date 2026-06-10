export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { messages } = req.body
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY is not set' })

  const systemPrompt = `คุณคือ AI ผู้ช่วยของ GameFarm Pro บริการรับจ้างฟาร์มเกมออนไลน์
ตอบเป็นภาษาไทยเท่านั้น ตอบสั้นกระชับ เป็นมิตร

บริการที่มี:
- ROV: ปั้มแรงค์ Diamond → Conqueror (500 บาท), แก้ไขปัญหาบัญชี (200 บาท)
- Genshin Impact: ฟาร์มของอัปเกรดตัวละคร (300 บาท)
- Valorant: ไต่แรงค์ Gold → Platinum (800 บาท)

ขั้นตอนการสั่ง: กดปุ่ม "ส่งงานใหม่" → เลือกบริการ → กรอก ID/Password เกม → ยืนยัน
เวลาดำเนินการ: 1-7 วันแล้วแต่บริการ
การชำระเงิน: แจ้งทีมงานหลังสั่งงาน

ถ้าไม่รู้คำตอบให้บอกว่า "กรุณาติดต่อทีมงานโดยตรง"`

  // แปลง messages format สำหรับ Gemini
  const geminiMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }))

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: geminiMessages,
          generationConfig: { maxOutputTokens: 512, temperature: 0.7 }
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Gemini error:', data)
      return res.status(500).json({ error: data.error?.message || 'Gemini API error' })
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'ขออภัย ไม่สามารถตอบได้ในขณะนี้'
    return res.status(200).json({ reply: text })

  } catch (err) {
    console.error('Fetch error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
