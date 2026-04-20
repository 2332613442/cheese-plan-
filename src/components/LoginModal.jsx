import { useState } from 'react'
import { createUser, avatarOptions } from '../utils/userStorage'

export default function LoginModal({ onClose, onSuccess }) {
  const [username, setUsername] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!username.trim()) {
      alert('请输入用户名')
      return
    }

    if (username.trim().length > 12) {
      alert('用户名最多12个字符')
      return
    }

    const user = createUser(username.trim(), selectedAvatar)
    onSuccess(user)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">欢迎使用奶酪计划</h2>
          <button onClick={onClose} className="text-gray-400 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 头像选择 */}
          <div>
            <label className="block text-sm text-gray-600 mb-3">选择头像</label>
            <div className="grid grid-cols-6 gap-2">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`w-10 h-10 text-2xl rounded-full flex items-center justify-center transition ${
                    selectedAvatar === avatar
                      ? 'bg-cheese ring-2 ring-cheese-dark'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* 用户名输入 */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名（最多12字）"
              maxLength={12}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-cheese"
            />
          </div>

          {/* 登录按钮 */}
          <button
            type="submit"
            className="w-full py-3 bg-cheese text-gray-800 rounded-xl font-medium hover:bg-cheese-dark transition"
          >
            开始使用
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          数据保存在本地，请勿清除浏览器数据
        </p>
      </div>
    </div>
  )
}
