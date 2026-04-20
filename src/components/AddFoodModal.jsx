import { useState } from 'react'
import { categories } from '../data/categories'
import { units } from '../data/units'
import { createFood } from '../utils/foodStatus'
import { addFood } from '../utils/storage'
import { lookupProduct } from '../utils/productLookup'
import ScannerModal from './ScannerModal'
import ImagePicker from './ImagePicker'

export default function AddFoodModal({ onClose, onSuccess, initialBarcode = '' }) {
  const today = new Date().toISOString().split('T')[0]

  const [name, setName] = useState('')
  const [productionDate, setProductionDate] = useState(today)
  const [shelfLifeDays, setShelfLifeDays] = useState('')
  const [category, setCategory] = useState('other')
  const [barcode, setBarcode] = useState(initialBarcode)
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('piece')
  const [image, setImage] = useState(null)
  const [showScanner, setShowScanner] = useState(false)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [lookupMessage, setLookupMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!name.trim() || !shelfLifeDays) {
      alert('请填写食品名称和保质期')
      return
    }

    const food = createFood(
      name.trim(),
      productionDate,
      parseInt(shelfLifeDays),
      category,
      {
        barcode: barcode.trim(),
        quantity: parseInt(quantity) || 1,
        unit,
        image,
      }
    )

    addFood(food)
    onSuccess()
    onClose()
  }

  // 查询商品信息并自动填充
  const handleLookup = async (code) => {
    if (!code) return

    setIsLookingUp(true)
    setLookupMessage('正在查询商品信息...')

    try {
      const product = await lookupProduct(code)

      if (product) {
        // 自动填充表单
        if (product.name) setName(product.name)
        if (product.category) setCategory(product.category)
        if (product.shelfLifeDays) setShelfLifeDays(product.shelfLifeDays.toString())
        if (product.imageUrl) setImage(product.imageUrl)

        setLookupMessage(`已识别：${product.name || '未知商品'}`)
      } else {
        setLookupMessage('未找到商品信息，请手动填写')
      }
    } catch (error) {
      setLookupMessage('查询失败，请手动填写')
    } finally {
      setIsLookingUp(false)
      // 3秒后清除消息
      setTimeout(() => setLookupMessage(''), 3000)
    }
  }

  const handleScan = (code) => {
    setBarcode(code)
    handleLookup(code)
  }

  // 手动输入条码后查询
  const handleBarcodeBlur = () => {
    if (barcode && barcode.length >= 8 && !name) {
      handleLookup(barcode)
    }
  }

  if (showScanner) {
    return (
      <ScannerModal
        onScan={handleScan}
        onClose={() => setShowScanner(false)}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">添加食品</h2>
          <button onClick={onClose} className="text-gray-400 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 食品照片 */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">食品照片（可选）</label>
            <ImagePicker value={image} onChange={setImage} />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">食品名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：牛奶、面包"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-cheese"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">分类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-cheese"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 数量和单位 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">数量</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-cheese"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">单位</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-cheese"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">生产日期</label>
              <input
                type="date"
                value={productionDate}
                onChange={(e) => setProductionDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-cheese"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">保质期（天）*</label>
              <input
                type="number"
                value={shelfLifeDays}
                onChange={(e) => setShelfLifeDays(e.target.value)}
                placeholder="如：30"
                min="1"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-cheese"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">条形码（可选）</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onBlur={handleBarcodeBlur}
                placeholder="扫码或手动输入"
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-cheese"
              />
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                disabled={isLookingUp}
                className="px-4 py-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              >
                📷 扫码
              </button>
            </div>
            {/* 查询状态提示 */}
            {lookupMessage && (
              <p className={`text-sm mt-1 ${lookupMessage.includes('已识别') ? 'text-green-600' : 'text-gray-500'}`}>
                {isLookingUp && '⏳ '}{lookupMessage}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-cheese text-gray-800 rounded-lg font-medium hover:bg-cheese-dark"
          >
            保存
          </button>
        </form>
      </div>
    </div>
  )
}
