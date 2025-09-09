'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useFormContext } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileCode, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  name: string
  disabled?: boolean
  className?: string
}

export function FileUpload({ name, disabled = false, className }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileContent, setFileContent] = useState<string>('')

  const {
    setValue,
    setError,
    clearErrors,
    formState: { errors },
    watch
  } = useFormContext()

  // Watch the form field to get the current value
  const currentValue = watch(name)

  const onDrop = useCallback(async (files: File[]) => {
    if (disabled) return

    // Clear previous errors/file state
    clearErrors(name)
    setUploadedFile(null)

    if (files.length === 0) return

    const file = files[0]

    // Manual validation for size
    if (file.size > 10 * 1024 * 1024) {
      setError(name, { type: 'manual', message: 'File is larger than 10MB' })
      return
    }

    // Manual validation for type
    const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx']
    const fileName = file.name.toLowerCase()
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
    if (!hasValidExtension) {
      setError(name, { type: 'manual', message: 'File type must be .js, .jsx, .ts, or .tsx' })
      return
    }
    
    // Start upload simulation
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      // Read file content
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsText(file)
      })

      // Complete upload
      clearInterval(progressInterval)
      setUploadProgress(100)
      setUploadedFile(file)
      setFileContent(content)

      // Update form value
      setValue(name, {
        file,
        content,
        fileName: file.name,
        fileSize: file.size
      })

      // Small delay to show 100% progress
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)

    } catch (error) {
      setError(name, {
        type: 'manual',
        message: 'Failed to process file'
      })
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [disabled, name, setError, clearErrors, setValue])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    multiple: false,
    disabled: disabled || isUploading,
  })

  const removeFile = () => {
    setUploadedFile(null)
    setFileContent('')
    setValue(name, null)
    clearErrors(name)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = () => {
    if (uploadedFile?.name.toLowerCase().endsWith('.tsx') || uploadedFile?.name.toLowerCase().endsWith('.jsx')) {
      return '⚛️' // React icon
    }
    return '📄' // Generic file icon
  }

  const errorMessage = errors[name]?.message as string

  return (
    <div className={cn('w-full', className)}>
      <motion.div
        {...getRootProps()}
        className={cn(
          'relative cursor-pointer rounded-2xl border-2 border-dashed p-8 transition-all duration-200 backdrop-blur-sm',
          isDragActive && !isDragReject && !disabled && 'border-blue-400 bg-blue-50/50 scale-[1.02]',
          isDragReject && 'border-red-400 bg-red-50/50',
          uploadedFile && 'border-green-400 bg-green-50/50',
          errorMessage && 'border-red-400 bg-red-50/50',
          disabled && 'cursor-not-allowed opacity-50',
          !uploadedFile && !errorMessage && 'border-gray-300 bg-white/50 hover:border-gray-400 hover:bg-gray-50/50'
        )}
        whileHover={!disabled && !uploadedFile ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        <input {...getInputProps()} aria-label="Upload file" />

        <AnimatePresence mode="wait">
          {errorMessage ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p className="text-lg font-medium text-red-700 mb-2">Upload Error</p>
              <p className="text-sm text-red-600">{errorMessage}</p>
            </motion.div>
          ) : isUploading ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <Loader2 className="mx-auto h-12 w-12 text-blue-500 mb-4 animate-spin" />
              <p className="text-lg font-medium text-blue-700 mb-2">Processing File...</p>
              <div className="w-full bg-blue-100 rounded-full h-2 mb-2">
                <motion.div
                  className="bg-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-sm text-blue-600">{uploadProgress}% complete</p>
            </motion.div>
          ) : uploadedFile ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    {getFileIcon()} {uploadedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(uploadedFile.size)} • {uploadedFile.type || 'text/plain'}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile()
                }}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                disabled={disabled}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <Upload className="mx-auto h-16 w-16 text-gray-400 mb-6" />
              <p className="text-xl font-semibold text-gray-900 mb-3">
                {isDragActive ? 'Drop your file here' : 'Upload your React component'}
              </p>
              <p className="text-gray-500 mb-4">
                Drag & drop or click to browse
              </p>
              <div className="flex justify-center gap-3 text-sm text-gray-400">
                <span className="px-2 py-1 bg-gray-100 rounded-md">.tsx</span>
                <span className="px-2 py-1 bg-gray-100 rounded-md">.ts</span>
                <span className="px-2 py-1 bg-gray-100 rounded-md">.jsx</span>
                <span className="px-2 py-1 bg-gray-100 rounded-md">.js</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Maximum file size: 10MB</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
