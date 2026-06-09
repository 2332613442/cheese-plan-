import { useState } from 'react'
import { X, ArrowLeft, Check, Package, Lightbulb } from 'lucide-react'

export default function DonationModal({ foods, onClose, onSuccess, isSubmitting = false }) {
  const [selectedIds, setSelectedIds] = useState([])
  const [step, setStep] = useState(1) // 1: 选食品, 2: 填写信息
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [contact, setContact] = useState('')
  const [pickupTime, setPickupTime] = useState('')

  // 筛选可捐赠的食品（所有非过期食品），临期优先
  const donatableFoods = foods
    .filter(f => f.status !== 'expired')
    .sort((a, b) => {
      // 临期食品排在前面
      if (a.status === 'warning' && b.status !== 'warning') return -1
      if (a.status !== 'warning' && b.status === 'warning') return 1
      // 同状态按到期日期排序
      return new Date(a.expirationDate) - new Date(b.expirationDate)
    })

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

  const handleNext = () => {
    if (selectedIds.length === 0) {
      alert('请选择要捐赠的食品')
      return
    }
    // 自动生成默认标题
    const selectedFoods = foods.filter(f => selectedIds.includes(f.id))
    if (!title) {
      setTitle(`分享${selectedFoods.length}件食品`)
    }
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('请输入分享标题')
      return
    }
    if (!location.trim()) {
      alert('请输入取货地点')
      return
    }
    if (!contact.trim()) {
      alert('请输入联系方式')
      return
    }
    const selectedFoods = foods.filter(f => selectedIds.includes(f.id))
    onSuccess(selectedFoods, title.trim(), description.trim(), location.trim(), contact.trim(), pickupTime.trim())
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
            <div className="flex items-center gap-2">
              {step === 2 && (
                <button
                  onClick={handleBack}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  aria-label="返回上一步"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <h2 className="text-lg font-bold">
                {step === 1 ? '选择捐赠食品' : '发布到附近分享'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              aria-label="关闭弹窗"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {step === 1 ? '选择食品分享给附近的人' : '填写分享信息，让附近的人看到'}
          </p>
          {/* 步骤指示器 */}
          <div className="flex gap-2 mt-3">
            <div className={`flex-1 h-1 rounded ${step >= 1 ? 'bg-cheese' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-1 rounded ${step >= 2 ? 'bg-cheese' : 'bg-gray-200'}`} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {step === 1 ? (
            // 第一步：选择食品
            donatableFoods.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  <Package size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 mt-2">暂无可捐赠食品</p>
                <p className="text-sm text-gray-400 mt-1">添加一些食品后即可在此捐赠</p>
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
                  {donatableFoods.map((food) => {
                    const statusLabel = food.status === 'warning' ? '临期·推荐捐赠' : '正常'
                    const statusColor = food.status === 'warning'
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-green-100 text-green-600'
                    return (
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
                            <Check size={14} className="text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{food.name}</p>
                          <p className="text-xs text-gray-500">
                            到期：{formatDate(food.expirationDate)}
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )
          ) : (
            // 第二步：填写分享信息
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">分享标题 *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="如：分享一些临期食品"
                  maxLength={30}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-cheese"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">补充说明（选填）</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="如：食品保存情况、特别说明等"
                  rows={2}
                  maxLength={200}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-cheese resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">取货地点 *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="XX小区门口"
                    maxLength={50}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-cheese text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">联系方式 *</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="手机号/微信"
                    maxLength={30}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-cheese text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">取货时间（选填）</label>
                <input
                  type="text"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  placeholder="如：今天18:00-20:00、随时可取"
                  maxLength={30}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-cheese"
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">已选食品（{selectedIds.length}件）：</p>
                <div className="flex flex-wrap gap-2">
                  {foods.filter(f => selectedIds.includes(f.id)).map(food => (
                    <span key={food.id} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border">
                      {food.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-cheese-light rounded-xl p-4">
                <p className="text-sm text-gray-600 flex items-start gap-2">
                  <Lightbulb size={16} className="text-cheese shrink-0 mt-0.5" />
                  <span>发布后将显示在"附近分享"中，附近的人可以领取并联系你取件。</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {donatableFoods.length > 0 && (
          <div className="p-4 border-t">
            {step === 1 ? (
              <button
                onClick={handleNext}
                disabled={selectedIds.length === 0}
                className="w-full py-3 bg-cheese text-gray-800 rounded-xl font-medium hover:bg-cheese-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一步（已选 {selectedIds.length} 件）
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!title.trim() || !location.trim() || !contact.trim() || isSubmitting}
                className="w-full py-3 bg-cheese text-gray-800 rounded-xl font-medium hover:bg-cheese-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '发布中...' : '发布到附近分享'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
