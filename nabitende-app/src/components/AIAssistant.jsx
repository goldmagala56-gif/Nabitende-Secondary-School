import { useState, useRef, useEffect } from 'react'
import { X, Send, Bot, Minimize2, Maximize2, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const ROLE_CONFIG = {
  student: {
    color:       '#7c3aed',
    lightBg:     'bg-purple-50',
    border:      'border-purple-200',
    label:       'Study Assistant',
    placeholder: 'Ask me anything — maths, science, history...',
  },
  parent: {
    color:       '#0891b2',
    lightBg:     'bg-cyan-50',
    border:      'border-cyan-200',
    label:       'Parent Assistant',
    placeholder: 'Ask about fees, attendance, grades...',
  },
  teacher: {
    color:       '#1a6b4a',
    lightBg:     'bg-green-50',
    border:      'border-green-200',
    label:       'Teaching Assistant',
    placeholder: 'Ask about lesson planning, grading, class management...',
  },
  admin: {
    color:       '#ea580c',
    lightBg:     'bg-orange-50',
    border:      'border-orange-200',
    label:       'Admin Assistant',
    placeholder: 'Ask about school management, reports, policies...',
  },
  government: {
    color:       '#1d4ed8',
    lightBg:     'bg-blue-50',
    border:      'border-blue-200',
    label:       'Policy Assistant',
    placeholder: 'Ask about school performance, district reports, policies...',
  },
}

export default function AIAssistant() {
  const { user } = useAuth()
  const [open,     setOpen]     = useState(false)
  const [messages, setMessages] = useState([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [minimized,setMinimized]= useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [editText, setEditText] = useState('')
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const abortRef = useRef(null)
  const [fullscreen, setFullscreen] = useState(false)

  const config = ROLE_CONFIG[user?.role] || ROLE_CONFIG.student
  const color  = config.color

  // Welcome message when first opened (or load real history)
  useEffect(() => {
    if (open && messages.length === 0) {
      const welcomes = {
        student:    `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your study assistant. Ask me anything — maths problems, science questions, essay help. What are you working on today?`,
        parent:     `Hello ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm here to help you with questions about your child's education. Ask me about fees, attendance, grades or anything school-related.`,
        teacher:    `Hello ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your teaching assistant. I can help with lesson planning, grading, classroom strategies and more. What do you need today?`,
        admin:      `Hello ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your school management assistant. Ask me about performance data, policies, staff management or anything school administration.`,
        government: `Hello ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your policy assistant. I can help you analyse school performance, understand compliance data and draft policy communications.`,
      }

      api.get('/ai/history')
        .then(res => {
          const history = res.data.messages || []
          if (history.length > 0) {
            setMessages(history)
          } else {
            setMessages([{ role: 'assistant', content: welcomes[user?.role] || welcomes.student }])
          }
        })
        .catch(() => {
          setMessages([{ role: 'assistant', content: welcomes[user?.role] || welcomes.student }])
        })
    }
  }, [open])

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, minimized])

  async function sendMessage(e) {
  e?.preventDefault()
  if (!input.trim() || loading) return

  const userMessage = { role: 'user', content: input.trim() }
  setMessages(prev => [...prev, userMessage])
  setInput('')
  setLoading(true)

  const controller = new AbortController()
  abortRef.current = controller

  try {
    const response = await api.post('/ai/chat', {
      messages: [...messages, userMessage].filter(
        m => m.role === 'user' || m.role === 'assistant'
      ),
    }, { signal: controller.signal })

    const reply = response.data.reply
      || 'Sorry, I could not get a response. Please try again.'
    typeOutMessage(reply)
  } catch (err) {
    if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
      // user cancelled — remove their message so it doesn't look sent
      setMessages(prev => prev.slice(0, -1))
    } else {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please check your internet and try again.',
      }])
    }
  } finally {
    setLoading(false)
    abortRef.current = null
  }
}

function startEdit(index, currentText) {
  setEditingIndex(index)
  setEditText(currentText)
}

function cancelEdit() {
  setEditingIndex(null)
  setEditText('')
}

async function saveEdit(index) {
  if (!editText.trim()) return

  const messageToEdit = messages[index]

  // Trim server history from this message onward, if it has a real id
  if (messageToEdit.id) {
    try {
      await api.delete(`/ai/history/after/${messageToEdit.id}`)
    } catch (err) {
      console.error('Failed to trim history on server:', err)
    }
  }

  // Trim local state to just before this message, then resend the edited version
  const trimmed = messages.slice(0, index)
  setMessages(trimmed)
  setEditingIndex(null)
  setEditText('')
  setInput('')

  const userMessage = { role: 'user', content: editText.trim() }
  setMessages(prev => [...prev, userMessage])
  setLoading(true)

  try {
    const response = await api.post('/ai/chat', {
      messages: [...trimmed, userMessage],
    })
    const reply = response.data.reply
      || 'Sorry, I could not get a response. Please try again.'
    typeOutMessage(reply)
  } catch (err) {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'Sorry, I\'m having trouble connecting right now. Please check your internet and try again.',
    }])
  } finally {
    setLoading(false)
  }
}

function cancelMessage() {
  abortRef.current?.abort()
}
  function typeOutMessage(fullText) {
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])
    let i = 0
    const interval = setInterval(() => {
      i++
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: fullText.slice(0, i),
        }
        return updated
      })
      if (i >= fullText.length) clearInterval(interval)
    }, 15) // lower = faster typing
  }

  async function clearChat() {
    try {
      await api.delete('/ai/history')
    } catch (err) {
      console.error('Failed to clear history on server:', err)
    }
    setMessages([])
    setTimeout(() => setOpen(true), 100)
  }

  function copyMessage(text) {
    navigator.clipboard.writeText(text)
  }

  function formatTime(timestamp) {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

 return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6
            w-14 h-14 rounded-full shadow-lg z-40
            flex items-center justify-center
            hover:scale-110 transition-all duration-200
            active:scale-95"
          style={{ background: color }}
          title={`Open ${config.label}`}
        >
          <Sparkles size={22} className="text-white" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className={`fixed z-50 shadow-2xl rounded-2xl
          border bg-[var(--color-surface)]
          transition-all duration-200
          ${minimized
            ? 'bottom-24 right-4 lg:bottom-6 lg:right-6 w-72 h-14'
            : fullscreen
              ? 'inset-4 w-auto h-auto'
              : 'bottom-24 right-4 lg:bottom-6 lg:right-6 w-[92vw] max-w-md h-[580px]'
          } ${config.border}`}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3
            rounded-t-2xl text-white"
            style={{ background: color }}>
            <div className="w-8 h-8 rounded-full bg-white/20
              flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate">
                {config.label}
              </div>
              {!minimized && (
                <div className="text-[10px] text-white/70">
                  Powered by Claude AI · EduConnect
                </div>
              )}
            </div>
            <button
              onClick={() => setFullscreen(f => !f)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
              {fullscreen ? <Minimize2 size={15} className="text-white" /> : <Maximize2 size={15} className="text-white" />}
            </button>
            <button
              onClick={() => setMinimized(m => !m)}
              className="p-1.5 rounded-lg hover:bg-white/20
                transition-colors">
              <Minimize2 size={15} className="text-white" />
            </button>
            <button
              onClick={() => { setOpen(false); setMinimized(false) }}
              className="p-1.5 rounded-lg hover:bg-white/20
                transition-colors">
              <X size={15} className="text-white" />
            </button>
          </div>

          {/* Body — hidden when minimized */}
          {!minimized && (
            <>
              {/* Messages */}
              <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${fullscreen ? 'h-[calc(100%-130px)]' : 'h-[calc(580px-130px)]'}`}>
                {messages.map((msg, i) => (
                  <div key={i}
                    className={`flex gap-2 ${
                      msg.role === 'user' ? 'flex-row-reverse' : ''
                    }`}>
                    {/* Avatar */}
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full flex-shrink-0
                        flex items-center justify-center text-white text-[11px]"
                        style={{ background: color }}>
                        <Bot size={13} />
                      </div>
                    )}

                    {msg.role === 'user' && editingIndex === i ? (
                      <div className="flex flex-col gap-1.5 max-w-[80%]">
                        <textarea
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          rows={2}
                          className="px-3 py-2 rounded-xl border-2 text-[13px] resize-none
                            text-[var(--color-text)] bg-white focus:outline-none"
                          style={{ borderColor: color }}
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                          <button onClick={cancelEdit}
                            className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                            Cancel
                          </button>
                          <button onClick={() => saveEdit(i)}
                            className="text-[10px] font-medium"
                            style={{ color }}>
                            Save & resend
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative group max-w-[80%]">
                        <div className={`px-3.5 py-2.5
                          rounded-2xl text-[13px] leading-relaxed
                          whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'text-white rounded-tr-sm'
                            : `${config.lightBg} text-[var(--color-text)] rounded-tl-sm border ${config.border}`
                          }`}
                          style={msg.role === 'user' ? { background: color } : {}}>
                          {msg.content}
                        </div>
                        <div className="flex gap-2 items-center mt-1">
                          {msg.created_at && (
                            <span className="text-[9px] text-[var(--color-text-muted)]">{formatTime(msg.created_at)}</span>
                          )}
                          {msg.role === 'assistant' && (
                            <button onClick={() => copyMessage(msg.content)}
                              className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                              Copy
                            </button>
                          )}
                          {msg.role === 'user' && (
                            <button onClick={() => startEdit(i, msg.content)}
                              className="text-[10px] text-gray-600 underline underline-offset-2 hover:opacity-80">
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading dots */}
                {loading && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full flex-shrink-0
                      flex items-center justify-center text-white"
                      style={{ background: color }}>
                      <Bot size={13} />
                    </div>
                    <div className={`px-4 py-3 rounded-2xl rounded-tl-sm
                      border ${config.lightBg} ${config.border} flex items-center gap-2`}>
                      <div className="flex gap-1 items-center h-4">
                        {[0, 1, 2].map(i => (
                          <div key={i}
                            className="w-2 h-2 rounded-full animate-bounce"
                            style={{
                              background:       color,
                              animationDelay:   `${i * 0.15}s`,
                              animationDuration: '0.8s',
                            }} />
                        ))}
                      </div>
                      <button onClick={cancelMessage}
                        className="text-[10px] text-red-500 hover:underline ml-1">
                        Stop
                      </button>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-4 pb-4 pt-2
                border-t border-[var(--color-border)]">
                <form onSubmit={sendMessage}
                  className="flex gap-2 items-end">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    placeholder={config.placeholder}
                    rows={1}
                    style={{ maxHeight: '80px' }}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border-2
                      border-[var(--color-border)] bg-white text-[13px]
                      text-[var(--color-text)] resize-none
                      focus:outline-none transition-all
                      placeholder:text-[var(--color-text-muted)]"
                    onFocus={e => e.target.style.borderColor = color}
                    onBlur={e => e.target.style.borderColor = ''}
                  />
                  <button type="submit"
                    disabled={loading || !input.trim()}
                    className="w-10 h-10 rounded-xl flex items-center
                      justify-center text-white flex-shrink-0
                      transition-all disabled:opacity-40
                      disabled:cursor-not-allowed active:scale-95"
                    style={{ background: color }}>
                    <Send size={16} />
                  </button>
                </form>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    Press Enter to send · Shift+Enter for new line
                  </span>
                  {messages.length > 1 && (
                    <button onClick={clearChat}
                      className="text-[10px] text-[var(--color-text-muted)]
                        hover:text-red-500 transition-colors">
                      Clear chat
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}