export default function TabBar({ active, onChange }) {
  const tabs = [
    { id: 'home', icon: '/images/tabs/home.png', label: '首页' },
    { id: 'timer', icon: '/images/tabs/timer.png', label: '时长' },
    { id: 'community', icon: '/images/tabs/community.png', label: '交流' },
    { id: 'donate', icon: '/images/tabs/donate.png', label: '捐赠' },
    { id: 'profile', icon: '/images/tabs/profile.png', label: '我的' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center gap-1 px-4 py-2"
            >
              <div className="w-7 h-7 flex items-center justify-center">
                <img
                  src={tab.icon}
                  alt={tab.label}
                  className="max-w-full max-h-full object-contain transition-all"
                  style={{
                    filter: isActive
                      ? 'brightness(0) saturate(100%) invert(83%) sepia(56%) saturate(497%) hue-rotate(359deg) brightness(103%) contrast(92%)'
                      : 'brightness(0) saturate(100%) invert(70%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(90%)'
                  }}
                />
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: isActive ? '#E5D63E' : '#9CA3AF' }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
