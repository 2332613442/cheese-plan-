import { useState, useEffect } from 'react'
import SplashScreen from './components/SplashScreen'
import TabBar from './components/TabBar'
import HomePage from './pages/HomePage'
import TimerPage from './pages/TimerPage'
import CommunityPage from './pages/CommunityPage'
import DonatePage from './pages/DonatePage'
import ProfilePage from './pages/ProfilePage'
import LoginModal from './components/LoginModal'
import ConfirmModal from './components/ConfirmModal'
import { getFoods } from './utils/storage'
import { calculateStatus } from './utils/foodStatus'
import { requestNotificationPermission, checkExpiringFoods, sendDailySummary } from './utils/notifications'
import { getCurrentUser, clearUser } from './utils/userStorage'
import { getCloudFoods, syncFoods, clearToken } from './utils/api'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [foods, setFoods] = useState([])
  const [daysFilter, setDaysFilter] = useState(null) // 时长筛选条件
  const [user, setUser] = useState(null) // 当前用户
  const [showLoginModal, setShowLoginModal] = useState(false) // 登录弹窗
  const [syncStatus, setSyncStatus] = useState('') // 同步状态
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false) // 云恢复确认弹窗
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
    // 发送每日摘要
    sendDailySummary(storedFoods)
  }

  // 云端同步
  const handleCloudSync = async () => {
    if (!user) return
    setSyncStatus('syncing')
    try {
      const localFoods = getFoods()
      await syncFoods(localFoods)
      setSyncStatus('success')
      setTimeout(() => setSyncStatus(''), 2000)
    } catch (err) {
      setSyncStatus('error')
      setTimeout(() => setSyncStatus(''), 2000)
    }
  }

  // 从云端恢复（弹窗确认）
  const handleCloudRestore = () => {
    if (!user) return
    setShowRestoreConfirm(true)
  }

  const doCloudRestore = async () => {
    setShowRestoreConfirm(false)
    if (!user) return
    setSyncStatus('restoring')
    try {
      const cloudFoods = await getCloudFoods()
      // 转换格式并保存到本地
      const localFormat = cloudFoods.map(f => {
        const productionDate = f.production_date || new Date().toISOString().split('T')[0]
        const expirationDate = f.expiration_date
        const shelfLifeDays = productionDate && expirationDate
          ? Math.max(1, Math.round((new Date(expirationDate) - new Date(productionDate)) / (1000 * 60 * 60 * 24)))
          : 30
        return {
          id: `cloud-${f.id}`,
          name: f.name,
          category: f.category || 'other',
          productionDate,
          expirationDate,
          shelfLifeDays,
          quantity: f.quantity || 1,
          unit: f.unit || 'piece',
          barcode: f.barcode,
          image: f.image,
          createdAt: f.created_at,
        }
      })
      // 保存到 localStorage
      localStorage.setItem('cheese-plan-foods', JSON.stringify(localFormat))
      loadFoods()
      setSyncStatus('restored')
      setTimeout(() => setSyncStatus(''), 2000)
    } catch (err) {
      setSyncStatus('error')
      setTimeout(() => setSyncStatus(''), 2000)
    }
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
    clearToken()
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
        return <CommunityPage user={user} onLogin={() => setShowLoginModal(true)} foods={foods} />
      case 'donate':
        return <DonatePage foods={foods} onReload={loadFoods} user={user} onLogin={() => setShowLoginModal(true)} onNavigate={handleNavigate} />
      case 'profile':
        return <ProfilePage foods={foods} user={user} onLogin={() => setShowLoginModal(true)} onLogout={handleLogout} onNavigate={handleNavigate} onSettingsChange={loadFoods} onCloudSync={handleCloudSync} onCloudRestore={handleCloudRestore} syncStatus={syncStatus} />
      default:
        return <HomePage foods={foods} onReload={loadFoods} daysFilter={daysFilter} onClearFilter={() => setDaysFilter(null)} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-fade-in">
      <header className="bg-cheese text-gray-800 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-center gap-2">
          <img src={`${import.meta.env.BASE_URL}images/cheese-logo.png`} alt="" className="w-8 h-8 object-contain" />
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

      {showRestoreConfirm && (
        <ConfirmModal
          title="从云端恢复"
          message="从云端恢复将覆盖本地所有数据，确定继续？"
          confirmText="确认恢复"
          cancelText="取消"
          danger
          onConfirm={doCloudRestore}
          onCancel={() => setShowRestoreConfirm(false)}
        />
      )}
    </div>
  )
}

export default App
