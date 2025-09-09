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
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    text: 'text-blue-600',
    textHeader: 'text-blue-900',
  },
  animation: {
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    text: 'text-purple-600',
    textHeader: 'text-purple-900',
  },
  props: {
    bg: 'bg-green-50',
    border: 'border-green-100',
    text: 'text-green-600',
    textHeader: 'text-green-900',
  },
  structure: {
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    text: 'text-orange-600',
    textHeader: 'text-orange-900',
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
      className="border border-white/20 rounded-2xl overflow-hidden bg-white/60 backdrop-blur-sm shadow-lg"
    >
      <div className={`px-6 py-4 ${color.bg} border-b ${color.border}`}>
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${color.text}`} />
          <p className={`text-sm font-medium ${color.textHeader} capitalize`}>{type}</p>
        </div>
        <p className="text-sm text-gray-700 mt-2">{description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        {/* Before */}
        <div className="relative">
          <div className="flex items-center justify-between px-4 py-3 bg-red-50/50 border-b border-red-100">
            <span className="text-sm font-medium text-red-800 flex items-center gap-2">
              Before
            </span>
            <button
              onClick={() => handleCopy(before, 0)}
              className="p-1.5 hover:bg-red-100 rounded transition-colors"
              title="Copy code"
            >
              {copiedIndex === 0 ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-red-600" />
              )}
            </button>
          </div>
          <div className="max-h-80 overflow-auto">
            <SyntaxHighlighter
              language={language}
              style={oneDark}
              customStyle={{
                margin: 0,
                background: 'rgb(254, 242, 242)',
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
          <div className="flex items-center justify-between px-4 py-3 bg-green-50/50 border-b border-green-100">
            <span className="text-sm font-medium text-green-800 flex items-center gap-2">
              After
            </span>
            <button
              onClick={() => handleCopy(after, 1)}
              className="p-1.5 hover:bg-green-100 rounded transition-colors"
              title="Copy code"
            >
              {copiedIndex === 1 ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-green-600" />
              )}
            </button>
          </div>
          <div className="max-h-80 overflow-auto">
            <SyntaxHighlighter
              language={language}
              style={oneDark}
              customStyle={{
                margin: 0,
                background: 'rgb(240, 253, 244)',
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
