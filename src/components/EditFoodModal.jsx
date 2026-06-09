import { useState } from 'react'
import { X, Camera } from 'lucide-react'
import { categories } from '../data/categories'
import { units } from '../data/units'
import { calculateExpirationDate, calculateStatus } from '../utils/foodStatus'
import { updateFood } from '../utils/storage'
import ScannerModal from './ScannerModal'
import ImagePicker from './ImagePicker'

export default function EditFoodModal({ food, onClose, onSuccess }) {
  const [name, setName] = useState(food.name)
  const [productionDate, setProductionDate] = useState(food.productionDate)
  const [shelfLifeDays, setShelfLifeDays] = useState(food.shelfLifeDays.toString())
  const [category, setCategory] = useState(food.category)
  const [barcode, setBarcode] = useState(food.barcode || '')
  const [quantity, setQuantity] = useState(food.quantity || 1)
  const [unit, setUnit] = useState(food.unit || 'piece')
  const [image, setImage] = useState(food.image || null)
  const [showScanner, setShowScanner] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!name.trim() || !shelfLifeDays) {
      alert('请填写食品名称和保质期')
      return
    }

    const days = parseInt(shelfLifeDays)
    if (isNaN(days) || days < 1) {
      alert('保质期必须大于0天')
      return
    }

    const expirationDate = calculateExpirationDate(productionDate, days)

    updateFood(food.id, {
      name: name.trim(),
      productionDate,
      shelfLifeDays: days,
      expirationDate,
      status: calculateStatus(expirationDate),
      category,
      barcode: barcode.trim(),
      quantity: parseInt(quantity) || 1,
      unit,
      image,
    })

    onSuccess()
    onClose()
  }

  const handleScan = (code) => {
    setBarcode(code)
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
          <h2 className="text-lg font-bold">编辑食品</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            aria-label="关闭弹窗"
          >
            <X size={20} />
          </button>
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
                placeholder="扫码或手动输入"
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-cheese"
              />
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="px-4 py-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 flex items-center gap-1"
              >
                <Camera size={18} />
                扫码
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-cheese text-gray-800 rounded-lg font-medium hover:bg-cheese-dark"
          >
            保存修改
          </button>
        </form>
      </div>
    </div>
  )
}
