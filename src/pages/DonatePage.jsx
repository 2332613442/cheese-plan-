import { useState, useEffect, useMemo } from 'react'
import { getDonations, addDonation, getDonationStats } from '../utils/donationStorage'
import { createShare } from '../utils/api'
import DonationModal from '../components/DonationModal'
import DonationHistory from '../components/DonationHistory'

// 迷宫路径waypoints（沿黄色虚线从起点到终点的坐标百分比）
const pathPoints = [
  { x: 100, y: 6 },    // 0: 起点（右上角入口）
  { x: 65, y: 6 },     // 1: 向下
  { x: 65, y: 20 },    // 2: 向左
  { x: 92, y: 20 },    // 3: 向下
  { x: 92, y: 40 },    // 4: 向右
  { x: 80, y: 40 },    // 5: 向下
  { x: 80, y: 55 },    // 6: 向左
  { x: 67, y: 55 },    // 7: 向下
  { x: 67, y: 40 },    // 8: 向左
  { x: 30, y: 40 },    // 9: 向下
  { x: 30, y: 53 },    // 10: 向右
  { x: 55, y: 53 },    // 11: 向下
  { x: 55, y: 63 },    // 12: 向左
  { x: 81, y: 63 },    // 13: 向上
  { x: 81, y: 78 },    // 14: 向左
  { x: 68, y: 78 },    // 15: 向下
  { x: 68, y: 91 },    // 16: 终点（左下角奶酪处）
  { x: 55, y: 91 },    // 17: 新增点
  { x: 55, y: 75 },    // 18: 新增点
  { x: 44, y: 75 },    // 19: 新增点
  { x: 44, y: 90 },    // 20: 新增点
  { x: 31, y: 90 },    // 21: 新增点
  { x: 31, y: 64 },    // 22: 新增点
  { x: 7, y: 64 },     // 23: 新增点
  { x: 7, y: 80 },     // 24: 新增点
  { x: 21, y: 80 },    // 25: 新增点
  { x: 21, y: 90 },    // 26: 新增点
  { x: 10, y: 90 },    // 27: 终点（奶酪处）
]

// 计算路径总长度和每段累计长度（用于精确定位）
function calculatePathLengths(points) {
  const lengths = [0]
  let total = 0
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x
    const dy = points[i].y - points[i - 1].y
    const segmentLength = Math.sqrt(dx * dx + dy * dy)
    total += segmentLength
    lengths.push(total)
  }
  return { lengths, total }
}

// 根据进度获取路径上的精确位置和方向
function getPositionOnPath(points, progress, pathData) {
  const { lengths, total } = pathData
  const targetLength = progress * total

  // 找到当前所在的路径段
  let segmentIndex = 0
  for (let i = 1; i < lengths.length; i++) {
    if (lengths[i] >= targetLength) {
      segmentIndex = i - 1
      break
    }
    segmentIndex = i - 1
  }

  // 计算在当前段的位置比例
  const segmentStart = lengths[segmentIndex]
  const segmentEnd = lengths[segmentIndex + 1] || lengths[segmentIndex]
  const segmentLength = segmentEnd - segmentStart
  const segmentProgress = segmentLength > 0 ? (targetLength - segmentStart) / segmentLength : 0

  // 当前段的起点和终点
  const p1 = points[segmentIndex]
  const p2 = points[Math.min(segmentIndex + 1, points.length - 1)]

  // 插值计算精确位置
  const x = p1.x + (p2.x - p1.x) * segmentProgress
  const y = p1.y + (p2.y - p1.y) * segmentProgress

  // 计算移动方向向量
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y

  // 老鼠精灵图默认朝左
  // 计算方向角度：0°=右, 90°=下, ±180°=左, -90°=上
  let angle = 0
  let flipX = false

  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
    // 静止不动
    angle = 0
    flipX = false
  } else {
    // 计算方向角度
    const directionAngle = Math.atan2(dy, dx) * (180 / Math.PI)

    // 判断是否向右半边移动（-90° 到 90°）
    if (Math.abs(directionAngle) <= 90) {
      // 向右半边移动：翻转精灵朝右，然后旋转
      flipX = true
      // scaleX(-1) 会镜像旋转方向，所以角度取反
      angle = -directionAngle
    } else {
      // 向左半边移动：保持精灵朝左，调整旋转角度
      flipX = false
      // 从朝左(180°)转到目标方向
      angle = directionAngle > 0 ? directionAngle - 180 : directionAngle + 180
    }

    // 限制角度范围 -90 到 90，防止倒置
    angle = Math.max(-90, Math.min(90, angle))
  }

  return { x, y, angle, flipX }
}

export default function DonatePage({ foods, onReload, user, onLogin, onNavigate }) {
  // 捐赠相关状态
  const [donations, setDonations] = useState([])
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [stats, setStats] = useState({ totalFoods: 0, savedAmount: 0, helpedCount: 0 })

  // 加载捐赠数据
  useEffect(() => {
    loadDonations()
  }, [])

  const loadDonations = () => {
    setDonations(getDonations())
    setStats(getDonationStats())
  }

  // 实际帮助人数
  const targetHelpedCount = stats.helpedCount || 0
  const savedAmount = stats.savedAmount || 0

  // 动画相关状态
  const [animationProgress, setAnimationProgress] = useState(0) // 当前动画进度 0-100
  const [mouseFrame, setMouseFrame] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true) // 是否正在播放动画
  const [toast, setToast] = useState('') // Toast提示
  const [lastDonation, setLastDonation] = useState(null) // 最近一次捐赠（用于显示成功）
  const [isSubmitting, setIsSubmitting] = useState(false) // 提交状态

  // 预计算路径长度数据
  const pathData = useMemo(() => calculatePathLengths(pathPoints), [])

  // 页面加载时播放动画，从0跑到目标值
  useEffect(() => {
    if (!isAnimating) return
    if (targetHelpedCount === 0) {
      setIsAnimating(false)
      return
    }

    const interval = setInterval(() => {
      setAnimationProgress((prev) => {
        const next = prev + 0.5  // 每次移动0.5%，更平滑
        if (next >= targetHelpedCount) {
          setIsAnimating(false)
          return targetHelpedCount
        }
        return next
      })
    }, 50)  // 50ms间隔，配合0.5%步长，总时长约4.5秒跑完45%

    return () => clearInterval(interval)
  }, [isAnimating, targetHelpedCount])

  // 老鼠奔跑动画帧切换（只在动画进行中播放）
  useEffect(() => {
    if (!isAnimating) return
    const interval = setInterval(() => {
      setMouseFrame((prev) => (prev + 1) % 4)
    }, 150)
    return () => clearInterval(interval)
  }, [isAnimating])

  // 计算老鼠在迷宫中的位置和朝向
  const maxCount = Math.max(targetHelpedCount, 1)
  const progress = targetHelpedCount === 0 ? 0 : Math.min(animationProgress / maxCount, 1)
  const { x: mouseX, y: mouseY, angle: rotation, flipX } = getPositionOnPath(pathPoints, progress, pathData)

  // 里程碑提示 - 动态计算
  const getMilestoneMessage = () => {
    const count = Math.round(animationProgress)
    if (count === 0) return null

    // 动态里程碑：根据目标值计算百分比
    const target = Math.max(targetHelpedCount, 10)
    const percent = (count / target) * 100

    if (percent >= 100) return `太棒了！已帮助${count}人，目标达成！`
    if (percent >= 90) return `冲刺阶段！还差${Math.ceil(target - count)}人达成目标！`
    if (percent >= 75) return `已完成75%，继续加油！`
    if (percent >= 50) return `已过半程，你的善举温暖了${count}个家庭！`
    if (percent >= 25) return `良好开端！已帮助${count}人`
    if (count >= 1) return '爱心传递中...'
    return null
  }
  const milestoneMessage = getMilestoneMessage()

  // 处理捐赠成功
  const handleDonateSuccess = async (selectedFoods, title, description, location, contact, pickupTime) => {
    setIsSubmitting(true)
    try {
      // 发布到附近分享
      const foodNames = selectedFoods.map(f => f.name)
      const foodIds = selectedFoods.map(f => f.id)
      await createShare(title, foodNames, {
        description,
        location,
        contact,
        pickup_time: pickupTime,
        food_ids: foodIds, // 保存食品ID，完成后再删除
      })

      // 添加捐赠记录（保存食品ID用于后续删除）
      const donation = addDonation(selectedFoods, { title, foodIds })

      // 暂不删除食品，等分享完成后再删除
      // selectedFoods.forEach(food => deleteFood(food.id))

      // 重新加载数据
      loadDonations()
      onReload()

      // 关闭弹窗
      setShowDonationModal(false)

      // 重播动画
      setAnimationProgress(0)
      setIsAnimating(true)

      // 保存最近捐赠（用于显示成功）
      setLastDonation({
        foods: selectedFoods,
        title,
        donation,
      })

      // Toast提示
      showToast(`已发布到附近分享！`)
    } catch (err) {
      showToast('发布失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 跳转到附近分享
  const handleGoToNearby = () => {
    setLastDonation(null)
    onNavigate?.('community')
  }

  // 点击捐赠按钮
  const handleDonateClick = () => {
    if (!user) {
      onLogin?.()
      return
    }
    setShowDonationModal(true)
  }

  // 关闭成功卡片
  const closeSuccessCard = () => {
    setLastDonation(null)
  }

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 3000)
  }

  // 计算可捐赠食品数量（所有非过期食品）
  const donatableCount = foods.filter(f => f.status !== 'expired').length

  return (
    <div className="p-4 min-h-screen">
      <h2 className="text-lg font-bold text-gray-800 mb-1">捐赠</h2>
      <p className="text-sm text-gray-400 mb-2">DONATION</p>
      <p className="text-gray-600 mb-6">今天，你做慈善了吗？</p>

      {/* 迷宫图 - 带老鼠动画 */}
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-sm">
          {/* 迷宫底图 */}
          <img
            src={`${import.meta.env.BASE_URL}images/maze-bg.png`}
            alt="捐赠迷宫"
            className="w-full h-auto object-contain"
          />

          {/* 老鼠 - 脚底对齐黄线，根据路径方向旋转 */}
          <div
            className="absolute transition-all duration-200 ease-out"
            style={{
              left: `${mouseX}%`,
              top: `${mouseY}%`,
              width: '15%',
              transform: `translate(-50%, -80%) scaleX(${flipX ? -1 : 1}) rotate(${rotation}deg)`,
              transformOrigin: 'center bottom',
            }}
          >
            <div
              style={{
                width: '100%',
                paddingBottom: '50%',
                backgroundImage: `url(${import.meta.env.BASE_URL}images/mouse.png)`,
                backgroundSize: '400% 100%',
                backgroundPosition: `${mouseFrame === 3 ? 100 : mouseFrame * 33.33}% 0`,
                backgroundRepeat: 'no-repeat',
              }}
            />
          </div>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="text-center space-y-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-2">目前已帮助</p>
          <p className="text-4xl font-bold text-cheese">
            {Math.round(animationProgress)} <span className="text-lg">人</span>
          </p>
          {/* 里程碑提示 */}
          {milestoneMessage && (
            <p className="text-sm text-cheese mt-3 animate-pulse">{milestoneMessage}</p>
          )}
        </div>

        <div className="bg-cheese rounded-xl p-6">
          <p className="text-gray-600 mb-2">已节省食物价值</p>
          <p className="text-4xl font-bold text-gray-800">¥{savedAmount} 元</p>
          <p className="text-sm text-gray-600 mt-2">已捐赠 {stats.totalFoods} 件食品</p>
        </div>
      </div>

      {/* 捐赠按钮 */}
      <div className="mt-8 space-y-3">
        <button
          onClick={handleDonateClick}
          disabled={donatableCount === 0}
          className={`w-full py-4 rounded-xl font-medium transition ${
            donatableCount > 0
              ? 'bg-cheese text-gray-800 hover:bg-cheese-dark'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          捐赠食品 {donatableCount > 0 && `(${donatableCount}件可捐)`}
        </button>
        <button
          onClick={() => setShowHistoryModal(true)}
          className="w-full py-4 bg-white text-cheese border-2 border-cheese rounded-xl font-medium hover:bg-cheese-light transition"
        >
          查看捐赠记录
        </button>
      </div>

      {/* 说明文字 */}
      <p className="text-center text-sm text-gray-400 mt-6">
        将食品捐赠给需要的人，减少浪费
      </p>

      {/* 成功卡片 */}
      {lastDonation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">发布成功！</h3>
            <p className="text-gray-600 mb-4">
              已将 <span className="font-medium text-cheese">{lastDonation.foods.length}</span> 件食品发布到附近分享
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
              <p className="text-sm font-medium text-gray-700 mb-2">{lastDonation.title}</p>
              <div className="flex flex-wrap gap-2">
                {lastDonation.foods.map(f => (
                  <span key={f.id} className="px-2 py-1 bg-white rounded text-xs text-gray-600 border">
                    {f.name}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              附近的人可以在"社区 → 附近分享"中看到并领取
            </p>
            <div className="space-y-2">
              <button
                onClick={handleGoToNearby}
                className="w-full py-3 bg-cheese text-gray-800 rounded-xl font-medium hover:bg-cheese-dark transition"
              >
                查看附近分享
              </button>
              <button
                onClick={closeSuccessCard}
                className="w-full py-2 text-gray-500 text-sm"
              >
                稍后再看
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 捐赠弹窗 */}
      {showDonationModal && (
        <DonationModal
          foods={foods}
          onClose={() => setShowDonationModal(false)}
          onSuccess={handleDonateSuccess}
          isSubmitting={isSubmitting}
        />
      )}

      {/* 捐赠记录弹窗 */}
      {showHistoryModal && (
        <DonationHistory
          donations={donations}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

      {/* Toast提示 */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
