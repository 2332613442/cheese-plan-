// 商品信息查询服务
// 使用 Open Food Facts API（免费、无需API Key）

const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v0/product'

// 分类映射
const categoryMapping = {
  'dairy': ['dairy', 'milk', 'cheese', 'yogurt', 'butter', '乳', '奶', '酸奶'],
  'meat': ['meat', 'beef', 'pork', 'chicken', 'fish', '肉', '鸡', '鱼', '虾'],
  'beverage': ['beverage', 'drink', 'juice', 'water', 'tea', 'coffee', '饮料', '果汁', '茶', '咖啡'],
  'snack': ['snack', 'biscuit', 'cookie', 'chip', 'candy', '零食', '饼干', '糖果', '巧克力'],
  'condiment': ['sauce', 'condiment', 'spice', 'salt', 'oil', '调味', '酱', '盐', '油'],
  'grain': ['grain', 'rice', 'flour', 'bread', 'pasta', 'noodle', '米', '面', '粮'],
  'canned': ['canned', 'can', '罐头', '罐装'],
  'frozen': ['frozen', 'ice', '冷冻', '冰'],
}

// 根据商品名称/分类推断分类ID
function inferCategory(productName, categories) {
  const text = `${productName} ${categories}`.toLowerCase()

  for (const [categoryId, keywords] of Object.entries(categoryMapping)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        return categoryId
      }
    }
  }

  return 'other'
}

// 根据分类推断默认保质期（天）
function inferShelfLife(categoryId) {
  const shelfLifeMap = {
    'dairy': 7,
    'meat': 3,
    'beverage': 180,
    'snack': 90,
    'condiment': 365,
    'grain': 180,
    'canned': 730,
    'frozen': 180,
    'other': 30,
  }
  return shelfLifeMap[categoryId] || 30
}

// 通过条形码查询商品信息
export async function lookupProductByBarcode(barcode) {
  try {
    const response = await fetch(`${OPEN_FOOD_FACTS_API}/${barcode}.json`)

    if (!response.ok) {
      throw new Error('网络请求失败')
    }

    const data = await response.json()

    if (data.status !== 1 || !data.product) {
      return null // 未找到商品
    }

    const product = data.product

    // 获取商品名称（优先中文）
    const productName = product.product_name_zh
      || product.product_name_cn
      || product.product_name
      || product.generic_name
      || ''

    // 获取分类
    const categories = product.categories || ''
    const categoryId = inferCategory(productName, categories)

    // 推断保质期
    const shelfLifeDays = inferShelfLife(categoryId)

    return {
      name: productName,
      category: categoryId,
      shelfLifeDays,
      brand: product.brands || '',
      imageUrl: product.image_url || product.image_front_url || null,
    }
  } catch (error) {
    console.error('查询商品信息失败:', error)
    return null
  }
}

// 本地商品数据库（常见商品快速查询）
const localProductDatabase = {
  '6901028001489': { name: '蒙牛纯牛奶', category: 'dairy', shelfLifeDays: 45 },
  '6902083886912': { name: '伊利纯牛奶', category: 'dairy', shelfLifeDays: 45 },
  '6920152400012': { name: '农夫山泉', category: 'beverage', shelfLifeDays: 365 },
  '6921168509256': { name: '可口可乐', category: 'beverage', shelfLifeDays: 270 },
  '6901939621608': { name: '康师傅方便面', category: 'grain', shelfLifeDays: 180 },
}

// 综合查询（先查本地，再查API）
export async function lookupProduct(barcode) {
  // 先查本地数据库
  if (localProductDatabase[barcode]) {
    return localProductDatabase[barcode]
  }

  // 再查API
  return await lookupProductByBarcode(barcode)
}
