export const categories = [
  { id: 'dairy', name: '乳制品', icon: '🥛' },
  { id: 'egg', name: '蛋类', icon: '🥚' },
  { id: 'meat', name: '肉类', icon: '🥩' },
  { id: 'seafood', name: '海鲜', icon: '🦐' },
  { id: 'vegetable', name: '蔬菜', icon: '🥬' },
  { id: 'fruit', name: '水果', icon: '🍎' },
  { id: 'bakery', name: '面包烘焙', icon: '🍞' },
  { id: 'beverage', name: '饮料', icon: '🧃' },
  { id: 'snack', name: '零食', icon: '🍪' },
  { id: 'instant', name: '速食', icon: '🍜' },
  { id: 'condiment', name: '调味品', icon: '🧂' },
  { id: 'other', name: '其他', icon: '📦' },
]

export const getCategoryById = (id) => {
  return categories.find((c) => c.id === id) || categories[categories.length - 1]
}
