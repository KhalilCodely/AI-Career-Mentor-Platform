'use client'

import React, { useState, useEffect, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Plus, MessageCircle } from 'lucide-react'

// Types
interface Message {
  id: string
  role: 'user' | 'ai'
  text: string
  createdAt: string
}

interface Chat {
  id: string
  title: string
  createdAt: string
}

// Message Component
const MessageBubble = memo(({ message }: { message: Message }) => {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`flex items-end gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
          isUser ? 'bg-[#4a90c4]' : 'bg-[#4a90c4]'
        }`}
      >
        {isUser ? 'U' : 'AI'}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-xs px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-[#4a90c4] text-white rounded-bl-3xl'
            : 'bg-[#dceef8] text-[#1a3f5c] rounded-br-3xl'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>
        <span className="text-xs opacity-70 mt-1 block">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </motion.div>
  )
})

MessageBubble.displayName = 'MessageBubble'

// Typing Indicator Component
const TypingIndicator = memo(() => {
  return (
    <motion.div className="flex items-end gap-3 mb-4">
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#4a90c4] text-white text-sm font-bold flex-shrink-0">
        AI
      </div>
      <div className="bg-[#dceef8] text-[#1a3f5c] px-4 py-3 rounded-2xl rounded-br-3xl flex gap-2">
        <motion.div
          className="w-2 h-2 bg-[#1a3f5c] rounded-full"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
        <motion.div
          className="w-2 h-2 bg-[#1a3f5c] rounded-full"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
        />
        <motion.div
          className="w-2 h-2 bg-[#1a3f5c] rounded-full"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
        />
      </div>
    </motion.div>
  )
})

TypingIndicator.displayName = 'TypingIndicator'

// Chat Item Component
const ChatItem = memo(
  ({
    chat,
    isActive,
    onClick,
  }: {
    chat: Chat
    isActive: boolean
    onClick: () => void
  }) => {
    return (
      <motion.button
        whileHover={{ x: 4 }}
        onClick={onClick}
        className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
          isActive
            ? 'bg-[#c4ddf0] text-[#1a3f5c]'
            : 'text-[#2e5a7a] hover:bg-[#d6e8f5]'
        }`}
      >
        <div className="w-2 h-2 rounded-full bg-[#4a90c4] flex-shrink-0" />
        <span className="truncate">{chat.title}</span>
      </motion.button>
    )
  }
)

ChatItem.displayName = 'ChatItem'

// Main Component
export default function AIChatPage() {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'Career Development Strategy',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Interview Preparation Tips',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Portfolio Building Guide',
      createdAt: new Date().toISOString(),
    },
  ])

  const [activeChat, setActiveChat] = useState<string>('1')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      text: 'Hello! I\'m your Career Mentor AI. How can I help you with your career development today?',
      createdAt: new Date().toISOString(),
    },
  ])

  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: `That's a great question about "${inputValue}". Let me provide you with some career mentoring insights...`,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      createdAt: new Date().toISOString(),
    }
    setChats((prev) => [newChat, ...prev])
    setActiveChat(newChat.id)
    setMessages([
      {
        id: '1',
        role: 'ai',
        text: 'Hello! I\'m your Career Mentor AI. How can I help you with your career development today?',
        createdAt: new Date().toISOString(),
      },
    ])
  }

  // Mobile responsive: hamburger menu at <768px
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div className="flex h-screen bg-[#f0f6fc]">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: isMobile ? -300 : 0 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className={`w-52 bg-[#e8f1f9] border-r-2 border-[#c8ddef] flex flex-col ${
          isMobile ? 'absolute left-0 top-0 h-full z-40' : 'relative'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#c8ddef]">
          <h2 className="text-xs uppercase font-bold text-[#2e5a7a] tracking-wider mb-4">
            MY CHATS
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNewChat}
            className="w-full bg-[#4a90c4] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm hover:bg-[#3a7ab4] transition-colors"
          >
            <Plus size={18} />
            New Chat
          </motion.button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <AnimatePresence mode="popLayout">
            {chats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={activeChat === chat.id}
                onClick={() => {
                  setActiveChat(chat.id)
                  if (isMobile) setIsSidebarOpen(false)
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#c8ddef] text-xs text-[#5a85a8]">
          {chats.length} total {chats.length === 1 ? 'chat' : 'chats'}
        </div>
      </motion.aside>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSidebarOpen(false)}
          className="absolute inset-0 bg-black/30 z-30"
        />
      )}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b-2 border-[#cce0f0] px-6 py-4 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4a90c4] flex items-center justify-center text-white font-bold text-lg">
              ✦
            </div>
            <div>
              <h1 className="font-bold text-[#1a3f5c]">Career Mentor AI</h1>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-[#5a85a8]">Online</span>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f6fc]">
          <AnimatePresence mode="wait">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t-2 border-[#cce0f0] bg-white px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask your career mentor..."
              className="flex-1 bg-[#e4f0f8] border-2 border-[#b8d4e8] text-[#1a3f5c] placeholder-[#5a85a8] rounded-full px-6 py-3 focus:outline-none focus:border-[#4a90c4] transition-colors"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={!inputValue.trim()}
              className="w-10 h-10 bg-[#4a90c4] hover:bg-[#3a7ab4] text-white rounded-full flex items-center justify-center font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send size={18} />
            </motion.button>
          </form>
        </div>
      </main>
    </div>
  )
}
