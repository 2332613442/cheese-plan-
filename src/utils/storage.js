const STORAGE_KEY = 'cheese-plan-foods'

export const getFoods = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('读取食品数据失败:', error)
    return []
  }
}

export const saveFoods = (foods) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(foods))
    return true
  } catch (error) {
    console.error('保存食品数据失败:', error)
    // 可能是存储空间已满
    if (error.name === 'QuotaExceededError') {
      alert('存储空间已满，请清理部分数据')
    }
    return false
  }
}

export const addFood = (food) => {
  const foods = getFoods()
  foods.push(food)
  saveFoods(foods)
  return foods
}

export const updateFood = (id, updates) => {
  const foods = getFoods()
  const index = foods.findIndex((f) => f.id === id)
  if (index !== -1) {
    foods[index] = { ...foods[index], ...updates, updatedAt: new Date().toISOString() }
    saveFoods(foods)
  }
  return foods
}

export const deleteFood = (id) => {
  const foods = getFoods().filter((f) => f.id !== id)
  saveFoods(foods)
  return foods
}
