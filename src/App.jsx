import { useState, useEffect } from 'react'
import SplashScreen from './components/SplashScreen'
import TabBar from './components/TabBar'
import HomePage from './pages/HomePage'
import TimerPage from './pages/TimerPage'
import CommunityPage from './pages/CommunityPage'
import DonatePage from './pages/DonatePage'
import ProfilePage from './pages/ProfilePage'
import LoginModal from './components/LoginModal'
import { getFoods } from './utils/storage'
import { calculateStatus } from './utils/foodStatus'
import { requestNotificationPermission, checkExpiringFoods } from './utils/notifications'
import { getCurrentUser, clearUser } from './utils/userStorage'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [foods, setFoods] = useState([])
  const [daysFilter, setDaysFilter] = useState(null) // 时长筛选条件
  const [user, setUser] = useState(null) // 当前用户
  const [showLoginModal, setShowLoginModal] = useState(false) // 登录弹窗
  // 启动页计时器：1.5秒后开始淡出，2秒后完全切换
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 1500)

    const hideTimer = setTimeout(() => {
      setShowSplash(false)
    }, 2000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  // 加载食品数据
  useEffect(() => {
    if (!showSplash) {
      loadFoods()
      // 加载用户
      setUser(getCurrentUser())
      // 请求通知权限
      requestNotificationPermission()
    }
  }, [showSplash])

  // 定时刷新食品状态（每小时一次）
  useEffect(() => {
    if (showSplash) return

    const interval = setInterval(() => {
      loadFoods()
    }, 60 * 60 * 1000) // 1小时

    return () => clearInterval(interval)
  }, [showSplash])

  // 页面可见时刷新状态（用户切回App时）
  useEffect(() => {
    if (showSplash) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadFoods()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [showSplash])

  // 多标签页数据同步（其他标签页修改时刷新）
  useEffect(() => {
    if (showSplash) return

    const handleStorageChange = (e) => {
      // 监听食品数据变化
      if (e.key === 'cheese-plan-foods') {
        loadFoods()
      }
      // 监听用户数据变化
      if (e.key === 'cheese-plan-user') {
        setUser(getCurrentUser())
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [showSplash])

  const loadFoods = () => {
    const storedFoods = getFoods().map((food) => ({
      ...food,
      status: calculateStatus(food.expirationDate),
    }))
    storedFoods.sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate))
    setFoods(storedFoods)
    // 检查临期食品并发送通知
    checkExpiringFoods(storedFoods)
  }

  // 处理页面导航（支持传递筛选条件）
  const handleNavigate = (tab, options = {}) => {
    setActiveTab(tab)
    if (options.daysRange) {
      setDaysFilter(options.daysRange)
    } else {
      setDaysFilter(null)
    }
  }

  // TabBar切换时清除筛选
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setDaysFilter(null)
  }

  // 退出登录
  const handleLogout = () => {
    clearUser()
    setUser(null)
  }

  // 登录成功
  const handleLoginSuccess = (newUser) => {
    setUser(newUser)
  }

  // 显示启动页
  if (showSplash) {
    return <SplashScreen fadeOut={fadeOut} />
  }

  // 渲染当前页面
  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage foods={foods} onReload={loadFoods} daysFilter={daysFilter} onClearFilter={() => setDaysFilter(null)} />
      case 'timer':
        return <TimerPage foods={foods} onNavigate={handleNavigate} />
      case 'community':
        return <CommunityPage user={user} onLogin={() => setShowLoginModal(true)} />
      case 'donate':
        return <DonatePage foods={foods} onReload={loadFoods} />
      case 'profile':
        return <ProfilePage foods={foods} user={user} onLogin={() => setShowLoginModal(true)} onLogout={handleLogout} onNavigate={handleNavigate} onSettingsChange={loadFoods} />
      default:
        return <HomePage foods={foods} onReload={loadFoods} daysFilter={daysFilter} onClearFilter={() => setDaysFilter(null)} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-fade-in">
      <header className="bg-cheese text-gray-800 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-center gap-2">
          <img src="/images/cheese-logo.png" alt="" className="w-8 h-8 object-contain" />
          <h1 className="text-xl font-bold">奶酪计划</h1>
        </div>
      </header>

      <main>
        {renderPage()}
      </main>

      <TabBar active={activeTab} onChange={handleTabChange} />

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </div>
  )
}

export default App
