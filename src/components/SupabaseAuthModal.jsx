import { useState } from 'react'
import { signUp, signIn } from '../utils/supabase'

const avatarOptions = ['🧀', '🐭', '🐹', '🧁', '🍕', '🍔', '🥗', '🍜', '🍣', '🥪', '🌮', '🍩']

export default function SupabaseAuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState('login') // login | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('请填写邮箱和密码')
      return
    }

    if (mode === 'signup' && !username.trim()) {
      setError('请填写用户名')
      return
    }

    setLoading(true)

    try {
      if (mode === 'signup') {
        const { data, error } = await signUp(email, password, username)
        if (error) throw error
        if (data.user) {
          onSuccess({
            id: data.user.id,
            email: data.user.email,
            username: username,
            avatar: selectedAvatar,
          })
          onClose()
        }
      } else {
        const { data, error } = await signIn(email, password)
        if (error) throw error
        if (data.user) {
          onSuccess({
            id: data.user.id,
            email: data.user.email,
            username: data.user.user_metadata?.username || '用户',
            avatar: selectedAvatar,
          })
          onClose()
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      if (err.message.includes('Invalid login')) {
        setError('邮箱或密码错误')
      } else if (err.message.includes('already registered')) {
        setError('该邮箱已注册，请直接登录')
      } else if (err.message.includes('valid email')) {
        setError('请输入有效的邮箱地址')
      } else if (err.message.includes('at least 6')) {
        setError('密码至少需要6个字符')
      } else {
        setError(err.message || '操作失败，请重试')
      }
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
          {/* 注册时显示头像和用户名 */}
          {mode === 'signup' && (
            <>
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

              <div>
                <label className="block text-sm text-gray-600 mb-1">用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-cheese"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm text-gray-600 mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-cheese"
            />
          </div>

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

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cheese text-gray-800 rounded-xl font-medium hover:bg-cheese-dark transition disabled:opacity-50"
          >
            {loading ? '处理中...' : (mode === 'login' ? '登录' : '注册')}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setError('')
            }}
            className="text-sm text-cheese hover:underline"
          >
            {mode === 'login' ? '没有账号？立即注册' : '已有账号？立即登录'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          分享功能需要登录账号
        </p>
      </div>
    </div>
  )
}
