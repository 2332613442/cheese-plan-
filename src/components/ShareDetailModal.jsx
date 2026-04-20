import { useState } from 'react'
import { claimShare, sendMessage, getShareMessages } from '../utils/shareService'
import { getUnitName } from '../data/units'

export default function ShareDetailModal({ share, user, onClose, onClaim, onLogin }) {
  const [claiming, setClaiming] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState([])
  const [showMessages, setShowMessages] = useState(false)
  const [error, setError] = useState('')

  const profile = share.profiles || {}
  const isOwner = user && share.user_id === user.id
  const isClaimer = user && share.claimed_by === user.id
  const canClaim = share.status === 'available' && !isOwner

  // 加载消息
  const loadMessages = async () => {
    try {
      const data = await getShareMessages(share.id)
      setMessages(data)
      setShowMessages(true)
    } catch (err) {
      console.error('加载消息失败:', err)
    }
  }

  // 领取
  const handleClaim = async () => {
    if (!user) {
      onLogin()
      return
    }

    setClaiming(true)
    setError('')

    try {
      await claimShare(share.id)
      onClaim()
    } catch (err) {
      console.error('领取失败:', err)
      setError(err.message || '领取失败，请重试')
    } finally {
      setClaiming(false)
    }
  }

  // 发送消息
  const handleSendMessage = async () => {
    if (!message.trim()) return
    if (!user) {
      onLogin()
      return
    }

    setSending(true)
    try {
      const toUserId = isOwner ? share.claimed_by : share.user_id
      await sendMessage(share.id, toUserId, message.trim())
      setMessage('')
      loadMessages()
    } catch (err) {
      console.error('发送失败:', err)
    } finally {
      setSending(false)
    }
  }

  // 格式化时间
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">分享详情</h2>
          <button onClick={onClose} className="text-gray-400 text-xl">✕</button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 图片 */}
          {share.images && share.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {share.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt=""
                  className="w-32 h-32 object-cover rounded-lg shrink-0"
                />
              ))}
            </div>
          )}

          {/* 标题和描述 */}
          <div>
            <h3 className="text-xl font-bold text-gray-800">{share.title}</h3>
            {share.description && (
              <p className="text-gray-600 mt-2">{share.description}</p>
            )}
          </div>

          {/* 发布者信息 */}
          <div className="flex items-center gap-3 py-3 border-y">
            <span className="text-3xl">{profile.avatar || '🧀'}</span>
            <div>
              <p className="font-medium text-gray-800">{profile.username || '匿名用户'}</p>
              <p className="text-sm text-gray-400">{formatTime(share.created_at)}</p>
            </div>
            {share.location_text && (
              <span className="ml-auto text-sm text-gray-400">📍 {share.location_text}</span>
            )}
          </div>

          {/* 食品列表 */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">包含食品</h4>
            <div className="space-y-2">
              {share.foods?.map((food, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xl">🧀</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{food.name}</p>
                    <p className="text-xs text-gray-500">
                      {food.quantity > 1 && `${food.quantity}${getUnitName(food.unit)} · `}
                      到期：{food.expirationDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 消息区域 */}
          {(isOwner || isClaimer) && (
            <div>
              <button
                onClick={loadMessages}
                className="text-sm text-cheese hover:underline"
              >
                {showMessages ? '刷新消息' : '查看消息'}
              </button>

              {showMessages && (
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">暂无消息</p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-2 rounded-lg text-sm ${
                          msg.from_user === user?.id
                            ? 'bg-cheese-light ml-8'
                            : 'bg-gray-100 mr-8'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatTime(msg.created_at)}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 发消息 */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="输入消息..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-cheese"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !message.trim()}
                  className="px-4 py-2 bg-cheese text-gray-800 rounded-lg text-sm disabled:opacity-50"
                >
                  发送
                </button>
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* 底部操作 */}
        <div className="p-4 border-t">
          {share.status === 'available' && !isOwner && (
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="w-full py-3 bg-cheese text-gray-800 rounded-xl font-medium hover:bg-cheese-dark disabled:opacity-50"
            >
              {claiming ? '领取中...' : '我要领取'}
            </button>
          )}

          {share.status === 'claimed' && (
            <div className="text-center py-2">
              <span className="text-yellow-600">⏳ 已被领取，等待确认</span>
            </div>
          )}

          {share.status === 'completed' && (
            <div className="text-center py-2">
              <span className="text-green-600">✅ 已完成</span>
            </div>
          )}

          {isOwner && share.status === 'available' && (
            <p className="text-center text-gray-400 text-sm">这是你发布的分享</p>
          )}
        </div>
      </div>
    </div>
  )
}
