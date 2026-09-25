import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    function handler(e) {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!deferredPrompt || dismissed) return null

  async function handleInstall() {
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80
      bg-[#1a6b4a] text-white rounded-xl p-4 shadow-lg z-50 flex items-start gap-3">
      <Download size={20} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-[14px] font-semibold">Install Nabitende SS</p>
        <p className="text-[12px] text-white/80 mt-0.5">
          Add this app to your home screen for quick, offline access.
        </p>
        <button
          onClick={handleInstall}
          className="mt-2 px-3 py-1.5 bg-white text-[#1a6b4a] text-[13px] font-semibold rounded-lg"
        >
          Install
        </button>
      </div>
      <button onClick={() => setDismissed(true)} className="text-white/60 hover:text-white">
        <X size={16} />
      </button>
    </div>
  )
}