import { useState } from 'react'

export default function DonationModal({ foods, onClose, onSuccess }) {
  const [selectedIds, setSelectedIds] = useState([])

  // 筛选可捐赠的食品（仅临期食品）
  const donatableFoods = foods.filter(f => f.status === 'warning')

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedIds.length === donatableFoods.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(donatableFoods.map(f => f.id))
    }
  }

  const handleSubmit = () => {
    if (selectedIds.length === 0) {
      alert('请选择要捐赠的食品')
      return
    }
    const selectedFoods = foods.filter(f => selectedIds.includes(f.id))
    onSuccess(selectedFoods)
    onClose()
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">选择捐赠食品</h2>
            <button onClick={onClose} className="text-gray-400 text-xl">✕</button>
          </div>
          <p className="text-sm text-gray-500 mt-1">选择临期食品进行捐赠，减少浪费</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {donatableFoods.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">📦</span>
              <p className="text-gray-500 mt-2">暂无临期食品</p>
              <p className="text-sm text-gray-400 mt-1">当食品临近过期时可在此捐赠</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">共 {donatableFoods.length} 件食品可捐赠</span>
                <button
                  onClick={selectAll}
                  className="text-sm text-cheese font-medium"
                >
                  {selectedIds.length === donatableFoods.length ? '取消全选' : '全选'}
                </button>
              </div>

              <div className="space-y-3">
                {donatableFoods.map((food) => (
                  <div
                    key={food.id}
                    onClick={() => toggleSelect(food.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                      selectedIds.includes(food.id)
                        ? 'border-cheese bg-cheese-light'
                        : 'border-gray-100 bg-white'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedIds.includes(food.id)
                        ? 'border-cheese bg-cheese'
                        : 'border-gray-300'
                    }`}>
                      {selectedIds.includes(food.id) && (
                        <span className="text-white text-sm">✓</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{food.name}</p>
                      <p className="text-xs text-gray-500">
                        到期：{formatDate(food.expirationDate)}
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-600">
                          临期
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {donatableFoods.length > 0 && (
          <div className="p-4 border-t">
            <button
              onClick={handleSubmit}
              disabled={selectedIds.length === 0}
              className="w-full py-3 bg-cheese text-gray-800 rounded-xl font-medium hover:bg-cheese-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认捐赠 ({selectedIds.length} 件)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
