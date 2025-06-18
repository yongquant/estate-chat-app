'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocumentUploadProps {
  onFileUpload: (files: File[], documentType: string) => void
  isLoading?: boolean
}

const documentTypes = [
  { id: 'purchase-agreement', name: 'Purchase Agreement', description: 'Sales contracts and offers' },
  { id: 'lease', name: 'Lease Agreement', description: 'Rental and lease contracts' },
  { id: 'deed', name: 'Property Deed', description: 'Title and ownership documents' },
  { id: 'mortgage', name: 'Mortgage Documents', description: 'Loan and financing papers' },
  { id: 'inspection', name: 'Inspection Report', description: 'Property inspection documents' },
  { id: 'hoa', name: 'HOA Documents', description: 'Homeowners association papers' },
  { id: 'tax', name: 'Tax Documents', description: 'Property tax records' },
  { id: 'other', name: 'Other', description: 'Other real estate documents' }
]

export default function DocumentUpload({ onFileUpload, isLoading = false }: DocumentUploadProps) {
  const [selectedType, setSelectedType] = useState<string>('')
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024 // 10MB
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      
      return file.size <= maxSize && allowedTypes.includes(file.type)
    })

    setUploadedFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    if (uploadedFiles.length > 0 && selectedType) {
      onFileUpload(uploadedFiles, selectedType)
      setUploadedFiles([])
      setSelectedType('')
    }
  }

  const onButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload Real Estate Documents
        </CardTitle>
        <CardDescription>
          Upload contracts, deeds, inspections, or other property documents for review and analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Type Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Document Type</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {documentTypes.map((type) => (
              <Button
                key={type.id}
                variant={selectedType === type.id ? 'default' : 'outline'}
                size="sm"
                className="h-auto p-2 text-xs"
                onClick={() => setSelectedType(type.id)}
              >
                <div className="text-center">
                  <div className="font-medium">{type.name}</div>
                  <div className="text-xs opacity-70 hidden md:block">{type.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* File Upload Area */}
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
            'hover:border-primary hover:bg-primary/5'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleChange}
            accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
            className="hidden"
          />
          
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop files here, or click to select
          </p>
          <Button type="button" variant="secondary" onClick={onButtonClick}>
            Choose Files
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Supported: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
          </p>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Uploaded Files</label>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{file.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {(file.size / 1024 / 1024).toFixed(1)}MB
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handleUpload}
            disabled={uploadedFiles.length === 0 || !selectedType || isLoading}
            className="flex-1 mr-2"
          >
            {isLoading ? 'Analyzing...' : `Upload ${uploadedFiles.length} File${uploadedFiles.length !== 1 ? 's' : ''}`}
          </Button>
        </div>

        {/* Warning */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                <strong>Privacy Notice:</strong> Documents are processed securely for analysis only. 
                Never upload documents containing sensitive personal information like Social Security numbers 
                or financial account details.
              </p>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
