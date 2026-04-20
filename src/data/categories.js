export const categories = [
  { id: 'dairy', name: '乳制品', icon: '🥛' },
  { id: 'meat', name: '肉类', icon: '🥩' },
  { id: 'beverage', name: '饮料', icon: '🧃' },
  { id: 'snack', name: '零食', icon: '🍪' },
  { id: 'condiment', name: '调味品', icon: '🧂' },
  { id: 'grain', name: '粮油', icon: '🍚' },
  { id: 'canned', name: '罐头', icon: '🥫' },
  { id: 'frozen', name: '冷冻食品', icon: '🧊' },
  { id: 'other', name: '其他', icon: '📦' },
]

export const getCategoryById = (id) => {
  return categories.find((c) => c.id === id) || categories[categories.length - 1]
}
