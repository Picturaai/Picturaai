'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Wand2, Loader2, Undo2, Redo2, Download, Share2,
  Eraser, Paintbrush, ZoomIn, ZoomOut, RotateCcw,
  Sparkles, Scissors, Layers, Sun, Contrast, Palette,
  ArrowLeft, Check, RefreshCw, Send, History
} from 'lucide-react'
import { toast } from 'sonner'

interface EditHistory {
  url: string
  instruction: string
  timestamp: Date
}

interface AIImageEditorProps {
  imageUrl: string
  onClose: () => void
  onSave?: (newUrl: string) => void
}

const QUICK_ACTIONS = [
  { icon: Eraser, label: 'Remove Background', instruction: 'Remove the background and make it transparent' },
  { icon: Sun, label: 'Enhance', instruction: 'Enhance the image quality, improve lighting and colors' },
  { icon: Sparkles, label: 'Upscale', instruction: 'Upscale and enhance resolution while keeping details sharp' },
  { icon: Palette, label: 'Color Correct', instruction: 'Auto color correct and balance the image' },
  { icon: Contrast, label: 'Increase Contrast', instruction: 'Increase contrast to make the image more vibrant' },
  { icon: Layers, label: 'Add Depth', instruction: 'Add depth of field effect, blur background slightly' },
]

const STYLE_PRESETS = [
  { label: 'Cinematic', instruction: 'Apply cinematic color grading with film-like tones' },
  { label: 'Vintage', instruction: 'Apply vintage film effect with warm tones and grain' },
  { label: 'Noir', instruction: 'Convert to black and white with high contrast noir style' },
  { label: 'Vibrant', instruction: 'Make colors more vibrant and saturated' },
  { label: 'Soft', instruction: 'Apply soft, dreamy filter with reduced contrast' },
  { label: 'HDR', instruction: 'Apply HDR effect to bring out details in shadows and highlights' },
]

export function AIImageEditor({ imageUrl, onClose, onSave }: AIImageEditorProps) {
  const [currentImage, setCurrentImage] = useState(imageUrl)
  const [instruction, setInstruction] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [history, setHistory] = useState<EditHistory[]>([{ url: imageUrl, instruction: 'Original', timestamp: new Date() }])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [showHistory, setShowHistory] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const handleEdit = async (editInstruction: string) => {
    if (!editInstruction.trim() || isProcessing) return

    setIsProcessing(true)
    try {
      const res = await fetch('/api/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: currentImage,
          instruction: editInstruction.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Edit failed')
      }

      const data = await res.json()
      const newUrl = data.url

      // Add to history (remove any redo history)
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push({ url: newUrl, instruction: editInstruction, timestamp: new Date() })
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
      setCurrentImage(newUrl)
      setInstruction('')
      toast.success('Edit applied!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to apply edit')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUndo = () => {
    if (!canUndo) return
    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)
    setCurrentImage(history[newIndex].url)
  }

  const handleRedo = () => {
    if (!canRedo) return
    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)
    setCurrentImage(history[newIndex].url)
  }

  const handleReset = () => {
    setHistoryIndex(0)
    setCurrentImage(history[0].url)
    setHistory([history[0]])
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pictura-edited-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Image downloaded!')
    } catch {
      toast.error('Failed to download')
    }
  }

  const handleSave = () => {
    onSave?.(currentImage)
    toast.success('Changes saved!')
    onClose()
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo() }
        if (e.key === 'z' && e.shiftKey) { e.preventDefault(); handleRedo() }
        if (e.key === 'y') { e.preventDefault(); handleRedo() }
        if (e.key === 's') { e.preventDefault(); handleSave() }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canUndo, canRedo, currentImage])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-semibold text-foreground">AI Image Editor</h1>
            <p className="text-xs text-muted-foreground">Edit with natural language instructions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-lg transition-colors ${showHistory ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
              title="History"
            >
              <History className="h-4 w-4" />
            </button>
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
            <button
              onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(3, z + 0.25))}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Actions */}
          <button
            onClick={handleReset}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Reset to original"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Check className="h-4 w-4" />
            Save
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto bg-muted/30">
          <div
            className="relative transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          >
            <Image
              src={currentImage}
              alt="Editing"
              width={800}
              height={800}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              priority
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                <p className="text-sm font-medium">Applying edit...</p>
                <p className="text-xs text-muted-foreground mt-1">This may take a few seconds</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - History */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-border bg-card overflow-hidden"
            >
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-3">Edit History</h3>
                <div className="space-y-2 max-h-[60vh] overflow-auto">
                  {history.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setHistoryIndex(i)
                        setCurrentImage(item.url)
                      }}
                      className={`w-full p-2 rounded-lg border text-left transition-colors ${
                        i === historyIndex
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                          <Image src={item.url} alt="" width={32} height={32} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{item.instruction}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {item.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Panel */}
      <div className="border-t border-border bg-card p-4">
        {/* Quick Actions */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <span className="text-xs text-muted-foreground flex-shrink-0">Quick:</span>
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => handleEdit(action.instruction)}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-background hover:bg-muted text-xs font-medium transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <action.icon className="h-3 w-3" />
              {action.label}
            </button>
          ))}
        </div>

        {/* Style Presets */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <span className="text-xs text-muted-foreground flex-shrink-0">Styles:</span>
          {STYLE_PRESETS.map((style) => (
            <button
              key={style.label}
              onClick={() => handleEdit(style.instruction)}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-full border border-border bg-background hover:bg-muted text-xs font-medium transition-colors disabled:opacity-50 flex-shrink-0"
            >
              {style.label}
            </button>
          ))}
        </div>

        {/* Custom Instruction Input */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Wand2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEdit(instruction)}
              placeholder="Describe what you want to change... (e.g., 'Remove the person on the left', 'Make the sky more blue')"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              disabled={isProcessing}
            />
          </div>
          <button
            onClick={() => handleEdit(instruction)}
            disabled={!instruction.trim() || isProcessing}
            className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Apply
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Tip: Be specific with your instructions. Press Enter to apply, Ctrl+Z to undo.
        </p>
      </div>
    </motion.div>
  )
}
