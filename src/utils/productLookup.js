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
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(`${OPEN_FOOD_FACTS_API}/${barcode}.json`, { signal: controller.signal })

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
    if (error.name === 'AbortError') {
      console.error('查询商品信息超时')
    } else {
      console.error('查询商品信息失败:', error)
    }
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

// 本地商品数据库（常见商品快速查询）
const localProductDatabase = {
  // 乳制品
  '6901028001489': { name: '蒙牛纯牛奶', category: 'dairy', shelfLifeDays: 45 },
  '6902083886912': { name: '伊利纯牛奶', category: 'dairy', shelfLifeDays: 45 },
  '6907992500508': { name: '光明纯牛奶', category: 'dairy', shelfLifeDays: 45 },
  '6902083882013': { name: '伊利安慕希酸奶', category: 'dairy', shelfLifeDays: 21 },
  '6901028071710': { name: '蒙牛特仑苏', category: 'dairy', shelfLifeDays: 180 },
  '6901028001120': { name: '蒙牛酸酸乳', category: 'dairy', shelfLifeDays: 25 },
  '6902083891527': { name: '伊利金典纯牛奶', category: 'dairy', shelfLifeDays: 180 },
  '6901028000338': { name: '蒙牛真果粒', category: 'dairy', shelfLifeDays: 25 },

  // 饮料
  '6920152400012': { name: '农夫山泉', category: 'beverage', shelfLifeDays: 365 },
  '6921168509256': { name: '可口可乐', category: 'beverage', shelfLifeDays: 270 },
  '6925303721329': { name: '百事可乐', category: 'beverage', shelfLifeDays: 270 },
  '6921168500017': { name: '雪碧', category: 'beverage', shelfLifeDays: 270 },
  '6921168500093': { name: '芬达橙味', category: 'beverage', shelfLifeDays: 270 },
  '6902538004aborrar': { name: '康师傅冰红茶', category: 'beverage', shelfLifeDays: 270 },
  '6902538001808': { name: '康师傅冰红茶', category: 'beverage', shelfLifeDays: 270 },
  '6902538005035': { name: '康师傅绿茶', category: 'beverage', shelfLifeDays: 270 },
  '6920584400109': { name: '统一冰红茶', category: 'beverage', shelfLifeDays: 270 },
  '6920584400154': { name: '统一绿茶', category: 'beverage', shelfLifeDays: 270 },
  '6921581596031': { name: '王老吉凉茶', category: 'beverage', shelfLifeDays: 540 },
  '6920202888883': { name: '加多宝凉茶', category: 'beverage', shelfLifeDays: 540 },
  '6922255451427': { name: '元气森林气泡水', category: 'beverage', shelfLifeDays: 270 },
  '6901285991219': { name: '脉动维生素饮料', category: 'beverage', shelfLifeDays: 365 },
  '6920152401026': { name: '农夫山泉东方树叶', category: 'beverage', shelfLifeDays: 365 },

  // 方便食品
  '6901939621608': { name: '康师傅方便面', category: 'grain', shelfLifeDays: 180 },
  '6901939621103': { name: '康师傅红烧牛肉面', category: 'grain', shelfLifeDays: 180 },
  '6901939621202': { name: '康师傅香辣牛肉面', category: 'grain', shelfLifeDays: 180 },
  '6920584430007': { name: '统一老坛酸菜面', category: 'grain', shelfLifeDays: 180 },
  '6920584430106': { name: '统一红烧牛肉面', category: 'grain', shelfLifeDays: 180 },
  '6972117670018': { name: '自嗨锅', category: 'grain', shelfLifeDays: 180 },

  // 零食
  '6916013100019': { name: '乐事薯片原味', category: 'snack', shelfLifeDays: 180 },
  '6916013100118': { name: '乐事薯片黄瓜味', category: 'snack', shelfLifeDays: 180 },
  '6902827110013': { name: '好丽友派', category: 'snack', shelfLifeDays: 180 },
  '6902827111317': { name: '好丽友薯愿', category: 'snack', shelfLifeDays: 180 },
  '6923450600016': { name: '奥利奥饼干', category: 'snack', shelfLifeDays: 365 },
  '6901668002129': { name: '旺旺雪饼', category: 'snack', shelfLifeDays: 270 },
  '6901668002006': { name: '旺旺仙贝', category: 'snack', shelfLifeDays: 270 },
  '6902890510011': { name: '卫龙辣条', category: 'snack', shelfLifeDays: 180 },
  '6924743915817': { name: '三只松鼠坚果', category: 'snack', shelfLifeDays: 180 },
  '6902827111010': { name: '好丽友呀土豆', category: 'snack', shelfLifeDays: 180 },

  // 调味品
  '6901030300012': { name: '海天酱油', category: 'condiment', shelfLifeDays: 540 },
  '6901030301019': { name: '海天生抽', category: 'condiment', shelfLifeDays: 540 },
  '6901030302016': { name: '海天老抽', category: 'condiment', shelfLifeDays: 540 },
  '6902265110019': { name: '李锦记蚝油', category: 'condiment', shelfLifeDays: 540 },
  '6901209201013': { name: '太太乐鸡精', category: 'condiment', shelfLifeDays: 730 },
  '6922266441012': { name: '金龙鱼食用油', category: 'condiment', shelfLifeDays: 540 },
  '6902265110118': { name: '李锦记酱油', category: 'condiment', shelfLifeDays: 540 },
  '6921581520015': { name: '老干妈辣椒酱', category: 'condiment', shelfLifeDays: 540 },

  // 罐头/即食
  '6926895700016': { name: '梅林午餐肉', category: 'canned', shelfLifeDays: 1095 },
  '6925303710118': { name: '银鹭八宝粥', category: 'canned', shelfLifeDays: 365 },
  '6921168550012': { name: '娃哈哈八宝粥', category: 'canned', shelfLifeDays: 365 },

  // 速冻食品
  '6920152430012': { name: '思念水饺', category: 'frozen', shelfLifeDays: 365 },
  '6921513700016': { name: '三全水饺', category: 'frozen', shelfLifeDays: 365 },
  '6921513710015': { name: '三全汤圆', category: 'frozen', shelfLifeDays: 365 },
  '6920152440011': { name: '湾仔码头水饺', category: 'frozen', shelfLifeDays: 365 },
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
