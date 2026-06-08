import { useState } from 'react'
import { register, login, setToken } from '../utils/api'
import { setCurrentUser, avatarOptions } from '../utils/userStorage'

export default function LoginModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState('login') // login | register
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('请输入用户名')
      return
    }

    if (!password || password.length < 4) {
      setError('密码至少4位')
      return
    }

    setLoading(true)

    try {
      let data
      if (mode === 'register') {
        data = await register(username.trim(), password, selectedAvatar)
      } else {
        data = await login(username.trim(), password)
      }

      // 保存 token 和用户信息
      setToken(data.token)
      const user = {
        id: data.user.id,
        username: data.user.username,
        avatar: data.user.avatar,
        level: data.user.level || 1,
      }
      setCurrentUser(user)
      onSuccess(user)
      onClose()
    } catch (err) {
      console.error('登录错误:', err)
      setError(err.message || (mode === 'register' ? '注册失败，请重试' : '用户名或密码错误'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">
            {mode === 'login' ? '登录' : '注册'}
          </h2>
          <button onClick={onClose} className="text-gray-400 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 注册时显示头像选择 */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm text-gray-600 mb-2">选择头像</label>
              <div className="grid grid-cols-6 gap-2">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`w-10 h-10 text-xl rounded-full flex items-center justify-center transition ${
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
          )}

          {/* 用户名 */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              maxLength={20}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-cheese"
            />
          </div>

          {/* 密码 */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-cheese"
            />
          </div>

          {/* 错误提示 */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cheese text-gray-800 rounded-xl font-medium hover:bg-cheese-dark transition disabled:opacity-50"
          >
            {loading ? '处理中...' : (mode === 'login' ? '登录' : '注册')}
          </button>
        </form>

        {/* 切换登录/注册 */}
        <div className="text-center mt-4 space-y-2">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError('')
            }}
            className="text-sm text-cheese hover:underline"
          >
            {mode === 'login' ? '没有账号？立即注册' : '已有账号？立即登录'}
          </button>
          <div>
            <button
              onClick={onClose}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              暂不登录，使用离线模式
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
