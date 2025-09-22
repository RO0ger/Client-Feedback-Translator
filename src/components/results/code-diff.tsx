'use client'
import { motion } from 'framer-motion'
import { Copy, Check, Code, Palette, Play, Layout } from 'lucide-react'
import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

interface CodeDiffProps {
  before: string
  after: string
  language: string
  description: string
  type: 'css' | 'animation' | 'props' | 'structure'
}

const typeIcons = {
  css: Palette,
  animation: Play,
  props: Code,
  structure: Layout,
}

const typeColors = {
  css: {
    bg: 'bg-gradient-to-r from-blue-500/20 to-blue-600/10',
    border: 'border-blue-400/30',
    text: 'text-blue-300',
    textHeader: 'text-blue-100',
  },
  animation: {
    bg: 'bg-gradient-to-r from-purple-500/20 to-purple-600/10',
    border: 'border-purple-400/30',
    text: 'text-purple-300',
    textHeader: 'text-purple-100',
  },
  props: {
    bg: 'bg-gradient-to-r from-green-500/20 to-green-600/10',
    border: 'border-green-400/30',
    text: 'text-green-300',
    textHeader: 'text-green-100',
  },
  structure: {
    bg: 'bg-gradient-to-r from-orange-500/20 to-orange-600/10',
    border: 'border-orange-400/30',
    text: 'text-orange-300',
    textHeader: 'text-orange-100',
  },
};

export function CodeDiff({ before, after, language, description, type }: CodeDiffProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const Icon = typeIcons[type]
  const color = typeColors[type]

  const handleCopy = async (code: string, index: number) => {
    await navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl modern-glass premium-shadow overflow-hidden"
    >
      <div className={`px-6 py-4 ${color.bg} border-b ${color.border}`}>
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${color.text}`} />
          <p className={`text-sm font-medium ${color.textHeader} capitalize`}>{type}</p>
        </div>
        <p className="text-sm text-gradient-secondary mt-2 font-inter">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-600/30">
        {/* Before */}
        <div className="relative">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-500/20 to-red-600/10 border-b border-red-400/30">
            <span className="text-sm font-medium text-red-300 flex items-center gap-2">
              Before
            </span>
            <button
              onClick={() => handleCopy(before, 0)}
              className="p-1.5 hover:bg-red-400/20 rounded transition-colors"
              title="Copy code"
            >
              {copiedIndex === 0 ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-red-300" />
              )}
            </button>
          </div>
          <div className="max-h-80 overflow-auto">
            <SyntaxHighlighter
              language={language}
              style={oneDark}
              customStyle={{
                margin: 0,
                background: 'rgb(30, 30, 30)',
                fontSize: '13px',
                lineHeight: '1.4',
              }}
              showLineNumbers={true}
            >
              {before}
            </SyntaxHighlighter>
          </div>
        </div>
        
        {/* After */}
        <div className="relative">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-500/20 to-green-600/10 border-b border-green-400/30">
            <span className="text-sm font-medium text-green-300 flex items-center gap-2">
              After
            </span>
            <button
              onClick={() => handleCopy(after, 1)}
              className="p-1.5 hover:bg-green-400/20 rounded transition-colors"
              title="Copy code"
            >
              {copiedIndex === 1 ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-green-300" />
              )}
            </button>
          </div>
          <div className="max-h-80 overflow-auto">
            <SyntaxHighlighter
              language={language}
              style={oneDark}
              customStyle={{
                margin: 0,
                background: 'rgb(30, 30, 30)',
                fontSize: '13px',
                lineHeight: '1.4',
              }}
              showLineNumbers={true}
            >
              {after}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
