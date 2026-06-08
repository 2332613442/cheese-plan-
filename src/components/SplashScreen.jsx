export default function SplashScreen({ fadeOut }) {
  return (
    <div
      className={`min-h-screen bg-white flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* 奶酪图标 - 使用原始素材 100%还原 */}
      <div className="mb-6 animate-bounce-slow">
        <img
          src={`${import.meta.env.BASE_URL}images/cheese-logo.png`}
          alt="奶酪计划"
          className="w-32 h-auto object-contain"
        />
      </div>

      {/* 奶酪计划文字 - 使用原始素材 100%还原 */}
      <div className="mb-4">
        <img
          src={`${import.meta.env.BASE_URL}images/cheese-text.png`}
          alt="奶酪计划"
          className="w-48 h-auto object-contain"
        />
      </div>

      {/* 英文品牌名 */}
      <p className="text-sm text-gray-400 tracking-[0.5em] font-medium">
        CHEESE PLAN
      </p>

      {/* 底部加载指示 */}
      <div className="absolute bottom-16 flex gap-1.5">
        <span className="w-2 h-2 bg-cheese rounded-full animate-pulse"></span>
        <span className="w-2 h-2 bg-cheese rounded-full animate-pulse delay-100"></span>
        <span className="w-2 h-2 bg-cheese rounded-full animate-pulse delay-200"></span>
      </div>
    </div>
  )
}
