// 捐赠记录存储

const DONATIONS_KEY = 'cheese-plan-donations'

// 获取所有捐赠记录
export function getDonations() {
  try {
    const data = localStorage.getItem(DONATIONS_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('读取捐赠数据失败:', error)
    return []
  }
}

// 保存捐赠记录
function saveDonations(donations) {
  try {
    localStorage.setItem(DONATIONS_KEY, JSON.stringify(donations))
    return true
  } catch (error) {
    console.error('保存捐赠数据失败:', error)
    return false
  }
}

// 添加捐赠记录
export function addDonation(foods) {
  const donations = getDonations()
  const newDonation = {
    id: crypto.randomUUID(),
    foods: foods.map(f => ({
      id: f.id,
      name: f.name,
      expirationDate: f.expirationDate,
    })),
    foodCount: foods.length,
    createdAt: new Date().toISOString(),
  }
  donations.unshift(newDonation)
  saveDonations(donations)
  return newDonation
}

// 获取捐赠统计
export function getDonationStats() {
  const donations = getDonations()
  const totalFoods = donations.reduce((sum, d) => sum + d.foodCount, 0)
  const totalDonations = donations.length
  // 估算节省金额（每个食品约30元）
  const savedAmount = totalFoods * 30
  return {
    totalFoods,
    totalDonations,
    savedAmount,
    helpedCount: totalDonations, // 假设每次捐赠帮助一个人
  }
}
