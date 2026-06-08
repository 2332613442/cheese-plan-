export default function DonationHistory({ donations, onClose }) {
  const formatDate = (isoString) => {
    const date = new Date(isoString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  }

  const formatTime = (isoString) => {
    const date = new Date(isoString)
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">捐赠记录</h2>
            <button onClick={onClose} className="text-gray-400 text-xl">✕</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {donations.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">📝</span>
              <p className="text-gray-500 mt-2">暂无捐赠记录</p>
              <p className="text-sm text-gray-400 mt-1">开始你的第一次捐赠吧</p>
            </div>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <div
                  key={donation.id}
                  className="bg-cheese-light rounded-xl p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-sm text-gray-600">
                        {formatDate(donation.createdAt)} {formatTime(donation.createdAt)}
                      </span>
                      {donation.shareTitle && (
                        <p className="text-sm font-medium text-gray-700 mt-1">
                          📤 {donation.shareTitle}
                        </p>
                      )}
                    </div>
                    <span className="px-2 py-1 bg-cheese rounded-full text-xs font-medium text-gray-800">
                      {donation.foodCount} 件
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {donation.foods.map((food, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white rounded-full text-sm text-gray-700"
                      >
                        {food.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
