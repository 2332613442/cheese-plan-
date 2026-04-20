import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export default function ScannerModal({ onScan, onClose }) {
  const scannerRef = useRef(null)

  useEffect(() => {
    const scanner = new Html5Qrcode('scanner')
    scannerRef.current = scanner

    scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 250, height: 150 },
      },
      (decodedText) => {
        scanner.stop().then(() => {
          onScan(decodedText)
          onClose()
        })
      },
      () => {}
    ).catch((err) => {
      console.error('无法启动摄像头:', err)
      alert('无法访问摄像头，请确保已授权')
    })

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop()
      }
    }
  }, [onScan, onClose])

  return (
    <div className="fixed inset-0 bg-black z-[100]">
      <div className="relative h-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 rounded-full text-white text-xl"
        >
          ✕
        </button>

        <div className="h-full flex flex-col items-center justify-center">
          <p className="text-white mb-4">将条形码放入框内</p>
          <div id="scanner" className="w-full max-w-sm"></div>
          <p className="text-white/60 mt-4 text-sm">自动识别后将返回添加页面</p>
        </div>
      </div>
    </div>
  )
}
