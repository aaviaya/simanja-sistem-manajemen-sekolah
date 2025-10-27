'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter,
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from "sonner"
import { Toaster } from '@/components/ui/sonner'
import { 
  Shield, 
  LogOut, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle,
  FileText,
  TrendingUp,
  Users,
  Calendar,
  Mail,
  Plus,
  Upload,
  Image as ImageIcon,
  School,
  Archive,
  Download,
  X,
  User,
  ChevronDown,
  MessageSquare,
  Loader2,
  Smartphone,
  Settings
} from 'lucide-react'

interface Complaint {
  id: string
  uuid: string
  ticketNo: string
  name: string
  email: string
  phone?: string
  category: string
  subject: string
  description: string
  status: string
  priority: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

interface Letter {
  id: string
  uuid: string
  letterNo: string
  type: string
  category: string
  subject: string
  description?: string
  sender?: string
  recipient?: string
  date: string
  status: string
  priority: string
  adminNotes?: string
  evidenceImages?: string
  createdAt: string
  updatedAt: string
}

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface SystemSettings {
  whatsappEnabled: boolean
  whatsappApiToken?: string
  whatsappSender?: string
  autoBackupEnabled: boolean
  backupSchedule: string
}

interface DocumentArchive {
  id: string
  uuid: string
  docNumber: string
  title: string
  category: string
  description?: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  fileType?: string
  issuedDate?: string
  issuedBy?: string
  status: string
  tags?: string
  adminNotes?: string

  multipleFiles?: {
    fileUrls: string[]
    fileNames: string[]
    fileSizes: number[]
    fileTypes: string[]
  }
  createdAt: string
  updatedAt: string
}

const LETTER_CATEGORIES = [
  'Surat Informasi IT',
  'Surat Pengajuan Barang',
  'Surat Berita Acara Kerusakan',
  'Surat Terima Barang',
  'Surat Keluar Barang',
  'Surat Peminjaman Barang',
  'Surat Pemeliharaan Barang',
  'Surat Pengembalian Barang',
  'Surat Mutasi Barang',
  'Surat Lainnya'
]

const DOCUMENT_CATEGORIES = [
  'Surat Keputusan (SK)',
  'Notulen Rapat', 
  'Laporan Kegiatan',
  'Legalitas & Perizinan',
  'Arsip Umum',
  'Kepeagawaian',
  'Kesiswaan'
]

const COMPLAINT_CATEGORIES = [
  { value: 'academic', label: 'Akademik' },
  { value: 'facility', label: 'Fasilitas' },
  { value: 'service', label: 'Layanan' },
  { value: 'other', label: 'Lainnya' }
]

export default function AdminDashboard() {
  
  const showConfirmDialog = (title: string, description: string, onConfirm: () => void) => {
    setConfirmDialog({
      open: true,
      title,
      description,
      onConfirm
    })
  }
  
  const [user, setUser] = useState<User | null>(null)
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [letters, setLetters] = useState<Letter[]>([])
  const [documents, setDocumentArchives] = useState<DocumentArchiveArchive[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    whatsappEnabled: false,
    whatsappApiToken: '',
    whatsappSender: '',
    autoBackupEnabled: false,
    backupSchedule: 'daily'
  })
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  
  // Separate filter states for each tab
  const [complaintFilters, setComplaintFilters] = useState({
    search: '',
    status: '',
    category: ''
  })
  const [letterFilters, setLetterFilters] = useState({
    search: '',
    status: '',
    type: ''
  })
  const [documentFilters, setDocumentArchiveFilters] = useState({
    search: '',
    status: '',
    category: ''
  })
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null)
  const [selectedDocumentArchive, setSelectedDocumentArchive] = useState<DocumentArchiveArchive | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isLetterDialogOpen, setIsLetterDialogOpen] = useState(false)
  const [isAddLetterDialogOpen, setIsAddLetterDialogOpen] = useState(false)
  const [isAddComplaintDialogOpen, setIsAddComplaintDialogOpen] = useState(false)
  const [isDocumentArchiveDialogOpen, setIsDocumentArchiveDialogOpen] = useState(false)
  const [isAddDocumentArchiveDialogOpen, setIsAddDocumentArchiveDialogOpen] = useState(false)
  const [isSubmittingLetter, setIsSubmittingLetter] = useState(false)
  const [whatsappLoadingStates, setWhatsappLoadingStates] = useState<Record<string, boolean>>({})
  const [whatsappConfirmDialog, setWhatsappConfirmDialog] = useState<{
    open: boolean
    document: DocumentArchiveArchive | null
    targetNumber: string
    isPhoneValid: boolean
  }>({
    open: false,
    document: null,
    targetNumber: '',
    isPhoneValid: false
  })
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    onConfirm: () => void
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {}
  })
  const [activeTab, setActiveTab] = useState('complaints')
  const [editForm, setEditForm] = useState({
    status: '',
    priority: '',
    adminNotes: ''
  })
  const [letterForm, setLetterForm] = useState({
    type: '',
    category: '',
    subject: '',
    description: '',
    sender: '',
    recipient: '',
    senderEmail: '',
    date: '',
    priority: 'medium',
    evidenceImages: [] as string[]
  })
  const [letterFiles, setLetterFiles] = useState<File[]>([])
  const [complaintForm, setComplaintForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    subject: '',
    description: '',
    priority: 'medium'
  })
  const [documentForm, setDocumentArchiveForm] = useState({
    title: '',
    category: '',
    description: '',
    issuedDate: '',
    issuedBy: '',
    status: 'active',
    fileUrls: [] as string[],
    fileNames: [] as string[],
    fileSizes: [] as number[],
    fileTypes: [] as string[]
  })
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken')
    const userData = localStorage.getItem('adminUser')
    
    if (!token || !userData) {
      router.push('/admin')
      return
    }

    try {
      setUser(JSON.parse(userData))
      fetchData()
    } catch (error) {
      router.push('/admin')
    }
  }, [router, activeTab])

  // Refresh system settings when component gains focus (returning from settings)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchSystemSettings()
      }
    }

    const handleFocus = () => {
      fetchSystemSettings()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const fetchData = async () => {
    try {
      // Always fetch all data to ensure tabs have data when switched
      await Promise.all([
        fetchComplaints(),
        fetchLetters(), 
        fetchDocumentArchives(),
        fetchSystemSettings()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error("Gagal memuat data. Silakan refresh halaman.")
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemSettings = async () => {
    try {
      const response = await fetch('/api/system-settings')
      if (response.ok) {
        const data = await response.json()
        console.log('System settings data:', data)
        setSystemSettings(data)
      } else {
        console.error('System settings response not ok:', response.status, response.statusText)
        toast.warning("Gagal memuat pengaturan sistem")
      }
    } catch (error) {
      console.error('Error fetching system settings:', error)
      toast.error("Gagal memuat pengaturan sistem")
    }
  }

  const handleSendWhatsAppNotification = async (document: DocumentArchiveArchive) => {
    // Refresh system settings before showing dialog
    await fetchSystemSettings()
    
    if (!systemSettings.whatsappEnabled) {
      toast.error("Layanan WhatsApp tidak aktif. Silakan aktifkan di pengaturan sistem.")
      return
    }

    const defaultTargetNumber = process.env.WHATSAPP_TARGET_NUMBER || '081234567890'
    
    // Show confirmation dialog with default target number from environment
    setWhatsappConfirmDialog({
      open: true,
      document: document,
      targetNumber: defaultTargetNumber,
      isPhoneValid: validatePhoneNumber(defaultTargetNumber)
    })
  }

  const confirmSendWhatsApp = async () => {
    const document = whatsappConfirmDialog.document
    const targetNumber = whatsappConfirmDialog.targetNumber
    if (!document || !targetNumber) return

    // Validate phone number format
    if (!validatePhoneNumber(targetNumber)) {
      toast.error("❌ Format nomor telepon tidak valid. Gunakan format: 0812xxxxxxx")
      return
    }

    // Set loading state for specific document
    setWhatsappLoadingStates(prev => ({ ...prev, [document.id]: true }))
    setWhatsappConfirmDialog({ open: false, document: null, targetNumber: '', isPhoneValid: false })

    try {
      const response = await fetch('/api/send-whatsapp-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'document',
          data: {
            title: document.title,
            docNumber: document.docNumber,
            category: document.category,
            status: document.status,
            issuedDate: document.issuedDate,
            issuedBy: document.issuedBy
          },
          targetNumber: targetNumber // Send custom target number
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('WhatsApp notification success:', result)
        toast.success(`✅ Notifikasi WhatsApp berhasil dikirim ke ${targetNumber}!`)
        
        // Show additional success details in a more prominent way
        setTimeout(() => {
          toast.success(`📱 Provider: wanotif.shb.sch.id\n📄 Dokumen: ${document.title}`, {
            duration: 5000
          })
        }, 1000)
      } else {
        const errorData = await response.json()
        console.error('WhatsApp notification error response:', errorData)
        const errorMessage = errorData.error || errorData.message || 'Terjadi kesalahan'
        toast.error(`❌ Gagal mengirim notifikasi: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error)
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan jaringan'
      toast.error(`❌ Gagal mengirim notifikasi WhatsApp: ${errorMessage}`)
    } finally {
      // Clear loading state for specific document
      setWhatsappLoadingStates(prev => ({ ...prev, [document.id]: false }))
    }
  }

  const cancelSendWhatsApp = () => {
    setWhatsappConfirmDialog({ open: false, document: null, targetNumber: '', isPhoneValid: false })
  }

  const handleTargetNumberChange = (value: string) => {
    const isValid = validatePhoneNumber(value)
    setWhatsappConfirmDialog(prev => ({ 
      ...prev, 
      targetNumber: value,
      isPhoneValid: isValid
    }))
  }

  const navigateToSettings = () => {
    cancelSendWhatsApp()
    router.push('/admin/settings')
  }

  const validatePhoneNumber = (phone: string): boolean => {
    // Validate Indonesian phone number format: 0812xxxxxxx
    const phoneRegex = /^08[0-9]{8,12}$/
    return phoneRegex.test(phone)
  }

  const fetchComplaints = async () => {
    try {
      const params = new URLSearchParams()
      if (complaintFilters.search && complaintFilters.search.trim()) params.append('search', complaintFilters.search.trim())
      if (complaintFilters.status && complaintFilters.status.trim() && complaintFilters.status !== 'all') params.append('status', complaintFilters.status)
      if (complaintFilters.category && complaintFilters.category.trim() && complaintFilters.category !== 'all') params.append('category', complaintFilters.category)

      const response = await fetch(`/api/complaints?${params}`)
      if (response.ok) {
        const data = await response.json()
        setComplaints(data.complaints)
      } else {
        console.error('Complaints API response not ok:', response.status, response.statusText)
        toast.error("Gagal memuat data pengaduan")
      }
    } catch (error) {
      console.error('Error fetching complaints:', error)
      toast.error("Gagal memuat data pengaduan")
    }
  }

  const fetchLetters = async () => {
    try {
      const params = new URLSearchParams()
      if (letterFilters.search && letterFilters.search.trim()) params.append('search', letterFilters.search.trim())
      if (letterFilters.status && letterFilters.status.trim() && letterFilters.status !== 'all') params.append('status', letterFilters.status)
      if (letterFilters.type && letterFilters.type.trim() && letterFilters.type !== 'all') params.append('type', letterFilters.type)

      const response = await fetch(`/api/letters?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLetters(data.letters)
      } else {
        toast.error("Gagal memuat data surat")
      }
    } catch (error) {
      console.error('Error fetching letters:', error)
      toast.error("Gagal memuat data surat")
    }
  }

  const fetchDocumentArchives = async () => {
    try {
      const params = new URLSearchParams()
      if (documentFilters.search && documentFilters.search.trim()) params.append('search', documentFilters.search.trim())
      if (documentFilters.status && documentFilters.status.trim() && documentFilters.status !== 'all') params.append('status', documentFilters.status)
      if (documentFilters.category && documentFilters.category.trim() && documentFilters.category !== 'all') params.append('category', documentFilters.category)

      const response = await fetch(`/api/documents?${params}`)
      if (response.ok) {
        const data = await response.json()
        setDocumentArchives(data.documents)
      } else {
        console.error('DocumentArchives API response not ok:', response.status, response.statusText)
        toast.error("Gagal memuat data dokumen")
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error("Gagal memuat data dokumen")
    }
  }

  useEffect(() => {
    if (activeTab === 'complaints') {
      fetchComplaints()
    } else if (activeTab === 'letters') {
      fetchLetters()
    } else {
      fetchDocumentArchives()
    }
  }, [complaintFilters.search, complaintFilters.status, complaintFilters.category, letterFilters.search, letterFilters.status, letterFilters.type, documentFilters.search, documentFilters.status, documentFilters.category, activeTab])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    toast.success("Anda telah berhasil logout")
    setTimeout(() => {
      router.push('/admin')
    }, 1000)
  }

  const handleEditComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setEditForm({
      status: complaint.status,
      priority: complaint.priority,
      adminNotes: complaint.adminNotes || ''
    })
    setIsEditDialogOpen(true)
  }

  const handleEditLetter = (letter: Letter) => {
    setSelectedLetter(letter)
    setEditForm({
      status: letter.status,
      priority: letter.priority,
      adminNotes: letter.adminNotes || ''
    })
    setIsLetterDialogOpen(true)
  }

  const handleViewComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setIsViewDialogOpen(true)
  }

  const handleViewLetter = (letter: Letter) => {
    setSelectedLetter(letter)
    setIsViewDialogOpen(true)
  }

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return

    try {
      const response = await fetch(`/api/complaints/${selectedComplaint.uuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        fetchComplaints()
        setIsEditDialogOpen(false)
        setSelectedComplaint(null)
        toast.success("Pengaduan berhasil diperbarui")
      } else {
        toast.error("Gagal memperbarui pengaduan")
      }
    } catch (error) {
      console.error('Error updating complaint:', error)
      toast.error("Gagal memperbarui pengaduan")
    }
  }

  const handleUpdateLetter = async () => {
    if (!selectedLetter) return

    try {
      const response = await fetch(`/api/letters/${selectedLetter.uuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        fetchLetters()
        setIsLetterDialogOpen(false)
        setSelectedLetter(null)
        toast.success("Surat berhasil diperbarui")
      } else {
        toast.error("Gagal memperbarui surat")
      }
    } catch (error) {
      console.error('Error updating letter:', error)
      toast.error("Gagal memperbarui surat")
    }
  }

  const handleDeleteComplaint = async (uuid: string) => {
    showConfirmDialog(
      'Konfirmasi Hapus',
      'Apakah Anda yakin ingin menghapus pengaduan ini?',
      async () => {
        try {
          const response = await fetch(`/api/complaints/${uuid}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            fetchComplaints()
            toast.success("Pengaduan berhasil dihapus")
          } else {
            toast.error("Gagal menghapus pengaduan")
          }
        } catch (error) {
          console.error('Error deleting complaint:', error)
          toast.error("Gagal menghapus pengaduan")
        }
      }
    )
  }

  const handleDeleteLetter = async (uuid: string) => {
    showConfirmDialog(
      'Konfirmasi Hapus',
      'Apakah Anda yakin ingin menghapus surat ini?',
      async () => {
        try {
          const response = await fetch(`/api/letters/${uuid}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            fetchLetters()
            toast.success("Surat berhasil dihapus")
          } else {
            toast.error("Gagal menghapus surat")
          }
        } catch (error) {
          console.error('Error deleting letter:', error)
          toast.error("Gagal menghapus surat")
        }
      }
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setLetterFiles(prev => {
      const newFiles = [...prev, ...files]
      // Limit to maximum 4 files
      if (newFiles.length > 4) {
        toast.warning("Maksimal 4 file yang diperbolehkan")
        return prev
      }
      return newFiles
    })
  }

  const removeFile = (index: number) => {
    setLetterFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.url
      }
      throw new Error('Failed to upload file')
    })
    
    return Promise.all(uploadPromises)
  }

  const handleAddLetter = async () => {
    if (isSubmittingLetter) return
    
    try {
      setIsSubmittingLetter(true)
      
      // Validate required fields
      if (!letterForm.type.trim()) {
        toast.warning("Jenis surat harus diisi")
        setIsSubmittingLetter(false)
        return
      }
      if (!letterForm.category.trim()) {
        toast.warning("Kategori harus diisi")
        setIsSubmittingLetter(false)
        return
      }
      if (!letterForm.subject.trim()) {
        toast.warning("Subjek harus diisi")
        setIsSubmittingLetter(false)
        return
      }
      if (!letterForm.sender.trim()) {
        toast.warning("Pengirim harus diisi")
        setIsSubmittingLetter(false)
        return
      }
      if (!letterForm.recipient.trim()) {
        toast.warning("Penerima harus diisi")
        setIsSubmittingLetter(false)
        return
      }
      if (!letterForm.senderEmail.trim()) {
        toast.warning("Email pengirim harus diisi")
        setIsSubmittingLetter(false)
        return
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(letterForm.senderEmail.trim())) {
        toast.warning("Format email tidak valid")
        setIsSubmittingLetter(false)
        return
      }
      
      if (!letterForm.date) {
        toast.warning("Tanggal harus diisi")
        setIsSubmittingLetter(false)
        return
      }
      
      // Validate file upload (required based on label)
      if (letterFiles.length === 0) {
        toast.warning("File dokumen harus diupload (maksimal 4 file)")
        setIsSubmittingLetter(false)
        return
      }

      // Upload files first
      let evidenceImages: string[] = []
      try {
        evidenceImages = await uploadFiles(letterFiles)
      } catch (uploadError) {
        console.error('Error uploading files:', uploadError)
        toast.warning("Gagal mengupload file. Silakan coba lagi.")
        setIsSubmittingLetter(false)
        return
      }

      const response = await fetch('/api/letters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...letterForm,
          sender: `${letterForm.sender} (${letterForm.senderEmail})`,
          evidenceImages
        }),
      })

      if (response.ok) {
        fetchLetters()
        setIsAddLetterDialogOpen(false)
        setLetterForm({
          type: '',
          category: '',
          subject: '',
          description: '',
          sender: '',
          recipient: '',
          senderEmail: '',
          date: '',
          priority: 'medium',
          evidenceImages: []
        })
        setLetterFiles([])
        toast.success("Surat berhasil ditambahkan!")
      } else {
        const errorData = await response.json()
        toast.error(`Gagal menambahkan surat: ${errorData.message || 'Terjadi kesalahan'}`)
      }
    } catch (error) {
      console.error('Error creating letter:', error)
      toast.error("Gagal menambahkan surat. Silakan coba lagi.")
    } finally {
      setIsSubmittingLetter(false)
    }
  }

  const handleAddComplaint = async () => {
    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(complaintForm),
      })

      if (response.ok) {
        fetchComplaints()
        setIsAddComplaintDialogOpen(false)
        setComplaintForm({
          name: '',
          email: '',
          phone: '',
          category: '',
          subject: '',
          description: '',
          priority: 'medium'
        })
        toast.success("Pengaduan berhasil ditambahkan")
      } else {
        const errorData = await response.json()
        toast.error(`Gagal menambahkan pengaduan: ${errorData.message || 'Terjadi kesalahan'}`)
      }
    } catch (error) {
      console.error('Error creating complaint:', error)
      toast.error("Gagal menambahkan pengaduan. Silakan coba lagi.")
    }
  }

  const handleEditDocumentArchive = (document: DocumentArchive) => {
    setSelectedDocumentArchive(document)
    setEditForm({
      status: document.status,
      priority: '',
      adminNotes: ''
    })
    setIsDocumentArchiveDialogOpen(true)
  }

  const handleViewDocumentArchive = (document: DocumentArchive) => {
    setSelectedDocumentArchive(document)
    setIsViewDialogOpen(true)
  }

  const handleUpdateDocumentArchive = async () => {
    if (!selectedDocumentArchive) return

    try {
      const response = await fetch(`/api/documents/${selectedDocumentArchive.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        fetchDocumentArchives()
        setIsDocumentArchiveDialogOpen(false)
        setSelectedDocumentArchive(null)
        toast.success("Dokumen berhasil diperbarui")
      } else {
        toast.error("Gagal memperbarui dokumen")
      }
    } catch (error) {
      console.error('Error updating document:', error)
      toast.error("Gagal memperbarui dokumen")
    }
  }

  const handleDeleteDocumentArchive = async (id: string) => {
    showConfirmDialog(
      'Konfirmasi Hapus',
      'Apakah Anda yakin ingin menghapus dokumen ini?',
      async () => {
        try {
          const response = await fetch(`/api/documents/${id}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            fetchDocumentArchives()
            toast.success("Dokumen berhasil dihapus")
          } else {
            toast.error("Gagal menghapus dokumen")
          }
        } catch (error) {
          console.error('Error deleting document:', error)
          toast.error("Gagal menghapus dokumen")
        }
      }
    )
  }

  const [downloadingDocumentArchiveId, setDownloadingDocumentArchiveId] = useState<string | null>(null)
  const [downloadStatus, setDownloadStatus] = useState<string>('')

  const handleDownloadDocumentArchive = async (document: DocumentArchive) => {
    setDownloadingDocumentArchiveId(document.id)
    setDownloadStatus('')
    
    try {
      if (document.multipleFiles?.fileUrls.length > 0) {
        if (document.multipleFiles.fileUrls.length === 1) {
          // Download single file from multipleFiles array
          setDownloadStatus(`Mengunduh ${document.multipleFiles.fileNames[0] || 'file'}...`)
          
          const link = document.createElement('a')
          link.href = document.multipleFiles.fileUrls[0]
          link.target = '_blank'
          link.rel = 'noopener noreferrer'
          link.download = document.multipleFiles.fileNames[0] || 'document'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          setDownloadStatus('File berhasil diunduh!')
        } else {
          // Download all files from multipleFiles array
          setDownloadStatus(`Mengunduh ${document.multipleFiles.fileUrls.length} file...`)
          
          let successCount = 0
          for (let i = 0; i < document.multipleFiles.fileUrls.length; i++) {
            try {
              const url = document.multipleFiles.fileUrls[i]
              const fileName = document.multipleFiles.fileNames[i] || `file-${i + 1}`
              
              setDownloadStatus(`Mengunduh ${fileName} (${i + 1}/${document.multipleFiles.fileUrls.length})...`)
              
              // Try to fetch the file first to ensure it's accessible
              const response = await fetch(url, { 
                mode: 'cors',
                cache: 'no-cache'
              })
              
              if (!response.ok) {
                console.error(`Failed to fetch file ${i + 1}:`, response.statusText)
                continue
              }
              
              const blob = await response.blob()
              const blobUrl = window.URL.createObjectURL(blob)
              
              const link = document.createElement('a')
              link.href = blobUrl
              link.download = fileName
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              
              // Clean up the blob URL after a short delay
              setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl)
              }, 1000)
              
              successCount++
              
              // Add delay between downloads to prevent browser blocking
              if (i < document.multipleFiles.fileUrls.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 800))
              }
            } catch (error) {
              console.error(`Error downloading file ${i + 1}:`, error)
            }
          }
          
          setDownloadStatus(`${successCount} dari ${document.multipleFiles.fileUrls.length} file berhasil diunduh!`)
        }
      } else if (document.fileUrl) {
        // Download single file
        setDownloadStatus(`Mengunduh ${document.fileName || 'file'}...`)
        
        try {
          const response = await fetch(document.fileUrl, { 
            mode: 'cors',
            cache: 'no-cache'
          })
          
          if (!response.ok) {
            console.error('Failed to fetch file:', response.statusText)
            // Fallback to direct link if fetch fails
            const link = document.createElement('a')
            link.href = document.fileUrl
            link.target = '_blank'
            link.rel = 'noopener noreferrer'
            if (document.fileName) {
              link.download = document.fileName
            }
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            setDownloadStatus('File dibuka di tab baru')
            return
          }
          
          const blob = await response.blob()
          const blobUrl = window.URL.createObjectURL(blob)
          
          const link = document.createElement('a')
          link.href = blobUrl
          link.download = document.fileName || 'document'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          // Clean up the blob URL
          setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl)
          }, 1000)
          
          setDownloadStatus('File berhasil diunduh!')
        } catch (error) {
          console.error('Error downloading file:', error)
          // Fallback to direct link
          const link = document.createElement('a')
          link.href = document.fileUrl
          link.target = '_blank'
          link.rel = 'noopener noreferrer'
          if (document.fileName) {
            link.download = document.fileName
          }
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          setDownloadStatus('File dibuka di tab baru')
        }
      } else {
        setDownloadStatus('Tidak ada file untuk diunduh')
      }
    } catch (error) {
      console.error('Download error:', error)
      setDownloadStatus('Gagal mengunduh file')
    } finally {
      // Reset loading state after a longer delay to show status
      setTimeout(() => {
        setDownloadingDocumentArchiveId(null)
        setDownloadStatus('')
      }, 3000)
    }
  }

  const handleAddDocumentArchive = async () => {
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentForm),
      })

      if (response.ok) {
        fetchDocumentArchives()
        setIsAddDocumentArchiveDialogOpen(false)
        setDocumentArchiveForm({
          title: '',
          category: '',
          description: '',
          issuedDate: '',
          issuedBy: '',
          status: 'active',
          fileUrls: [],
          fileNames: [],
          fileSizes: [],
          fileTypes: []
        })
        toast.success("Dokumen berhasil ditambahkan")
      } else {
        const errorData = await response.json()
        toast.error(`Gagal menambahkan dokumen: ${errorData.message || 'Terjadi kesalahan'}`)
      }
    } catch (error) {
      console.error('Error creating document:', error)
      toast.error("Gagal menambahkan dokumen. Silakan coba lagi.")
    }
  }

  const removeDocumentArchiveFile = (index: number) => {
    setDocumentArchiveForm(prev => ({
      ...prev,
      fileUrls: prev.fileUrls.filter((_, i) => i !== index),
      fileNames: prev.fileNames.filter((_, i) => i !== index),
      fileSizes: prev.fileSizes.filter((_, i) => i !== index),
      fileTypes: prev.fileTypes.filter((_, i) => i !== index)
    }))
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleFileUpload = async (files: FileList) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        return {
          url: data.fileUrl,
          name: data.fileName,
          size: data.fileSize,
          type: data.fileType
        }
      }
      throw new Error('Failed to upload file')
    })

    try {
      const uploadedFiles = await Promise.all(uploadPromises)
      setDocumentArchiveForm(prev => ({
        ...prev,
        fileUrls: [...prev.fileUrls, ...uploadedFiles.map(f => f.url)],
        fileNames: [...prev.fileNames, ...uploadedFiles.map(f => f.name)],
        fileSizes: [...prev.fileSizes, ...uploadedFiles.map(f => f.size)],
        fileTypes: [...prev.fileTypes, ...uploadedFiles.map(f => f.type)]
      }))
    } catch (error) {
      console.error('Error uploading files:', error)
      toast.warning("Gagal mengupload file")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: React.ReactNode }> = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: <Clock className="w-3 h-3" /> 
      },
      in_progress: { 
        color: 'bg-blue-100 text-blue-800', 
        icon: <AlertCircle className="w-3 h-3" /> 
      },
      resolved: { 
        color: 'bg-green-100 text-green-800', 
        icon: <CheckCircle className="w-3 h-3" /> 
      },
      rejected: { 
        color: 'bg-red-100 text-red-800', 
        icon: <XCircle className="w-3 h-3" /> 
      },
      approved: { 
        color: 'bg-green-100 text-green-800', 
        icon: <CheckCircle className="w-3 h-3" /> 
      },
      processed: { 
        color: 'bg-blue-100 text-blue-800', 
        icon: <CheckCircle className="w-3 h-3" /> 
      }
    }

    const variant = variants[status] || variants.pending

    return (
      <Badge className={variant.color}>
        <span className="flex items-center gap-1">
          {variant.icon}
          {status.replace('_', ' ').toUpperCase()}
        </span>
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800'
    }

    return (
      <Badge className={variants[priority] || variants.medium}>
        {priority.toUpperCase()}
      </Badge>
    )
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      academic: 'Akademik',
      facility: 'Fasilitas',
      service: 'Layanan',
      other: 'Lainnya'
    }
    return labels[category] || category
  }

  const getComplaintStats = () => {
    const total = complaints.length
    const pending = complaints.filter(c => c.status === 'pending').length
    const inProgress = complaints.filter(c => c.status === 'in_progress').length
    const resolved = complaints.filter(c => c.status === 'resolved').length

    return { total, pending, inProgress, resolved }
  }

  const getLetterStats = () => {
    const total = letters.length
    const pending = letters.filter(l => l.status === 'pending').length
    const approved = letters.filter(l => l.status === 'approved').length
    const processed = letters.filter(l => l.status === 'processed').length

    return { total, pending, approved, processed }
  }

  const getDocumentArchiveStats = () => {
    const total = documents.length
    const active = documents.filter(d => d.status === 'active').length
    const archived = documents.filter(d => d.status === 'archived').length
    const draft = documents.filter(d => d.status === 'draft').length

    return { total, active, archived, draft }
  }

  const complaintStats = getComplaintStats()
  const letterStats = getLetterStats()
  const documentStats = getDocumentArchiveStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-[#26316c] mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Admin Panel - Sistem Sekolah
                </h1>
                <p className="text-sm text-gray-500">
                  Selamat datang, {user?.name}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {user?.name}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push('/admin/settings')} className="flex items-center gap-2">
                  <School className="w-4 h-4" />
                  Pengaturan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="complaints" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Management Pengaduan
            </TabsTrigger>
            <TabsTrigger value="letters" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Management Surat
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Management Arsip
            </TabsTrigger>
          </TabsList>

          {/* Complaints Tab */}
          <TabsContent value="complaints" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pengaduan</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{complaintStats.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{complaintStats.pending}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Dalam Proses</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#26316c]">{complaintStats.inProgress}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Selesai</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{complaintStats.resolved}</div>
                </CardContent>
              </Card>
            </div>

            {/* Complaints Table */}
            <Card>
              {/* Header with Add Button */}
              <div className="flex justify-between items-center p-6 pb-0">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Management Pengaduan</h2>
                  <p className="text-gray-600">Kelola semua pengaduan yang masuk</p>
                </div>
                <Dialog open={isAddComplaintDialogOpen} onOpenChange={setIsAddComplaintDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#26316c] hover:bg-[#1e2459]">
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Pengaduan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Tambah Pengaduan Baru</DialogTitle>
                      <DialogDescription>
                        Tambahkan pengaduan baru ke sistem
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); handleAddComplaint(); }} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="complaint-name">Nama Lengkap *</Label>
                          <Input
                            id="complaint-name"
                            value={complaintForm.name}
                            onChange={(e) => setComplaintForm({...complaintForm, name: e.target.value})}
                            placeholder="Masukkan nama pelapor"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="complaint-email">Email *</Label>
                          <Input
                            id="complaint-email"
                            type="email"
                            value={complaintForm.email}
                            onChange={(e) => setComplaintForm({...complaintForm, email: e.target.value})}
                            placeholder="email@example.com"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="complaint-phone">Nomor Telepon</Label>
                          <Input
                            id="complaint-phone"
                            type="tel"
                            value={complaintForm.phone}
                            onChange={(e) => setComplaintForm({...complaintForm, phone: e.target.value})}
                            placeholder="08123456789"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="complaint-category">Kategori *</Label>
                          <Select value={complaintForm.category} onValueChange={(value) => setComplaintForm({...complaintForm, category: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                              {COMPLAINT_CATEGORIES.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complaint-subject">Subjek *</Label>
                        <Input
                          id="complaint-subject"
                          value={complaintForm.subject}
                          onChange={(e) => setComplaintForm({...complaintForm, subject: e.target.value})}
                          placeholder="Masukkan subjek pengaduan"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complaint-description">Deskripsi *</Label>
                        <Textarea
                          id="complaint-description"
                          value={complaintForm.description}
                          onChange={(e) => setComplaintForm({...complaintForm, description: e.target.value})}
                          placeholder="Masukkan deskripsi pengaduan"
                          rows={4}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="complaint-priority">Prioritas</Label>
                        <Select value={complaintForm.priority} onValueChange={(value) => setComplaintForm({...complaintForm, priority: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih prioritas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Rendah</SelectItem>
                            <SelectItem value="medium">Sedang</SelectItem>
                            <SelectItem value="high">Tinggi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsAddComplaintDialogOpen(false)}>
                          Batal
                        </Button>
                        <Button type="submit" className="bg-[#26316c] hover:bg-[#1e2459]">
                          Tambah Pengaduan
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Filters */}
              <CardContent className="p-4 pt-0">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Cari pengaduan..."
                        value={complaintFilters.search}
                        onChange={(e) => setComplaintFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={complaintFilters.status || "all"} onValueChange={(value) => setComplaintFilters(prev => ({ ...prev, status: value === "all" ? "" : value }))}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="pending">Menunggu</SelectItem>
                      <SelectItem value="in_progress">Dalam Proses</SelectItem>
                      <SelectItem value="resolved">Selesai</SelectItem>
                      <SelectItem value="rejected">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={complaintFilters.category || "all"} onValueChange={(value) => setComplaintFilters(prev => ({ ...prev, category: value === "all" ? "" : value }))}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kategori</SelectItem>
                      <SelectItem value="academic">Akademik</SelectItem>
                      <SelectItem value="facility">Fasilitas</SelectItem>
                      <SelectItem value="service">Layanan</SelectItem>
                      <SelectItem value="other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setComplaintFilters({
                        search: '',
                        status: '',
                        category: ''
                      })
                    }}
                  >
                    Reset Filter
                  </Button>
                </div>
              </CardContent>

              {/* Complaints List */}
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tiket</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Subjek</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {complaints.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <p className="text-gray-500">Tidak ada pengaduan ditemukan</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        complaints.map((complaint) => (
                          <TableRow key={complaint.uuid}>
                            <TableCell className="font-mono text-sm">
                              {complaint.ticketNo}
                            </TableCell>
                            <TableCell>{complaint.name}</TableCell>
                            <TableCell>
                              {getCategoryLabel(complaint.category)}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {complaint.subject}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(complaint.status)}
                            </TableCell>
                            <TableCell>
                              {getPriorityBadge(complaint.priority)}
                            </TableCell>
                            <TableCell>
                              {new Date(complaint.createdAt).toLocaleDateString('id-ID')}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewComplaint(complaint)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Lihat Detail"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditComplaint(complaint)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteComplaint(complaint.uuid)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Hapus"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Letters Tab */}
          <TabsContent value="letters" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Surat</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{letterStats.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{letterStats.pending}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{letterStats.approved}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Diproses</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#26316c]">{letterStats.processed}</div>
                </CardContent>
              </Card>
            </div>

            {/* Letters Table */}
            <Card>
              {/* Header with Add Button */}
              <div className="flex justify-between items-center p-6 pb-0">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Management Surat</h2>
                  <p className="text-gray-600">Kelola semua surat masuk dan keluar</p>
                </div>
                <Dialog open={isAddLetterDialogOpen} onOpenChange={setIsAddLetterDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#26316c] hover:bg-[#1e2459]">
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Surat
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Tambah Surat Baru</DialogTitle>
                      <DialogDescription>
                        Tambahkan surat baru ke sistem
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); handleAddLetter(); }} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="letter-type">Jenis Surat *</Label>
                          <Select value={letterForm.type} onValueChange={(value) => setLetterForm({...letterForm, type: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jenis surat" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="masuk">Surat Masuk</SelectItem>
                              <SelectItem value="keluar">Surat Keluar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="letter-category">Kategori *</Label>
                          <Select value={letterForm.category} onValueChange={(value) => setLetterForm({...letterForm, category: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                              {LETTER_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="letter-subject">Subjek *</Label>
                        <Input
                          id="letter-subject"
                          value={letterForm.subject}
                          onChange={(e) => setLetterForm({...letterForm, subject: e.target.value})}
                          placeholder="Masukkan subjek surat"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="letter-description">Deskripsi</Label>
                        <Textarea
                          id="letter-description"
                          value={letterForm.description}
                          onChange={(e) => setLetterForm({...letterForm, description: e.target.value})}
                          placeholder="Masukkan deskripsi surat"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="letter-sender">Pengirim *</Label>
                          <Input
                            id="letter-sender"
                            value={letterForm.sender}
                            onChange={(e) => setLetterForm({...letterForm, sender: e.target.value})}
                            placeholder="Nama pengirim"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="letter-recipient">Penerima *</Label>
                          <Input
                            id="letter-recipient"
                            value={letterForm.recipient}
                            onChange={(e) => setLetterForm({...letterForm, recipient: e.target.value})}
                            placeholder="Nama penerima"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="letter-senderEmail">Email Pengirim *</Label>
                          <Input
                            id="letter-senderEmail"
                            type="email"
                            value={letterForm.senderEmail}
                            onChange={(e) => setLetterForm({...letterForm, senderEmail: e.target.value})}
                            placeholder="email@example.com"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="letter-date">Tanggal *</Label>
                          <Input
                            id="letter-date"
                            type="date"
                            value={letterForm.date}
                            onChange={(e) => setLetterForm({...letterForm, date: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="letter-priority">Prioritas</Label>
                        <Select value={letterForm.priority} onValueChange={(value) => setLetterForm({...letterForm, priority: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih prioritas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Rendah</SelectItem>
                            <SelectItem value="medium">Sedang</SelectItem>
                            <SelectItem value="high">Tinggi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="letter-files">File Dokumen * (Maksimal 4 file)</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Input
                              type="file"
                              multiple
                              max="4"
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                              onChange={handleFileChange}
                              className="hidden"
                              id="letter-file-upload"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('letter-file-upload')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Pilih File
                            </Button>
                          </div>
                          
                          {letterFiles.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">File yang Dipilih:</Label>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {letterFiles.map((file, index) => (
                                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <span className="text-sm truncate flex-1">{file.name}</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeFile(index)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsAddLetterDialogOpen(false)}>
                          Batal
                        </Button>
                        <Button type="submit" className="bg-[#26316c] hover:bg-[#1e2459]" disabled={isSubmittingLetter}>
                          {isSubmittingLetter ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Menyimpan...
                            </>
                          ) : (
                            'Tambah Surat'
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Filters */}
              <CardContent className="p-4 pt-0">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Cari surat..."
                        value={letterFilters.search}
                        onChange={(e) => setLetterFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={letterFilters.status || "all"} onValueChange={(value) => setLetterFilters(prev => ({ ...prev, status: value === "all" ? "" : value }))}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="pending">Menunggu</SelectItem>
                      <SelectItem value="approved">Disetujui</SelectItem>
                      <SelectItem value="processed">Diproses</SelectItem>
                      <SelectItem value="rejected">Ditolak</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={letterFilters.type || "all"} onValueChange={(value) => setLetterFilters(prev => ({ ...prev, type: value === "all" ? "" : value }))}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jenis</SelectItem>
                      <SelectItem value="masuk">Surat Masuk</SelectItem>
                      <SelectItem value="keluar">Surat Keluar</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setLetterFilters({
                        search: '',
                        status: '',
                        type: ''
                      })
                    }}
                  >
                    Reset Filter
                  </Button>
                </div>
              </CardContent>
              <CardContent className="p-6 pt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No. Surat</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Subjek</TableHead>
                        <TableHead>Pengirim/Penerima</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {letters.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <p className="text-gray-500">Tidak ada surat ditemukan</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        letters.map((letter) => (
                          <TableRow key={letter.uuid}>
                            <TableCell className="font-mono text-sm">
                              {letter.letterNo}
                            </TableCell>
                            <TableCell>
                              <Badge variant={letter.type === 'masuk' ? 'default' : 'secondary'}>
                                {letter.type === 'masuk' ? 'Masuk' : 'Keluar'}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {letter.category}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {letter.subject}
                            </TableCell>
                            <TableCell>
                              {letter.type === 'masuk' ? letter.sender : letter.recipient}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(letter.status)}
                            </TableCell>
                            <TableCell>
                              {letter.date || new Date(letter.createdAt).toLocaleDateString('id-ID')}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewLetter(letter)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Lihat Detail"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditLetter(letter)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteLetter(letter.uuid)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Hapus"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DocumentArchives Tab */}
          <TabsContent value="documents" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Dokumen</CardTitle>
                  <Archive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{documentStats.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aktif</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{documentStats.active}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Diarsipkan</CardTitle>
                  <Archive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#26316c]">{documentStats.archived}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Draft</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-600">{documentStats.draft}</div>
                </CardContent>
              </Card>
            </div>

            {/* DocumentArchives Table */}
            <Card>
              {/* Header with Add Button */}
              <div className="flex justify-between items-center p-6 pb-0">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Management Arsip</h2>
                  <p className="text-gray-600">Kelola dokumen-dokumen penting sekolah</p>
                </div>
                <Dialog open={isAddDocumentArchiveDialogOpen} onOpenChange={setIsAddDocumentArchiveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#26316c] hover:bg-[#1e2459]">
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Dokumen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Tambah Dokumen Baru</DialogTitle>
                      <DialogDescription>
                        Tambahkan dokumen baru ke arsip sekolah
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); handleAddDocumentArchive(); }} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="doc-title">Judul Dokumen *</Label>
                          <Input
                            id="doc-title"
                            value={documentForm.title}
                            onChange={(e) => setDocumentArchiveForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Masukkan judul dokumen"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="doc-category">Kategori *</Label>
                          <Select value={documentForm.category} onValueChange={(value) => setDocumentArchiveForm(prev => ({ ...prev, category: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                              {DOCUMENT_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="doc-description">Deskripsi</Label>
                        <Textarea
                          id="doc-description"
                          value={documentForm.description}
                          onChange={(e) => setDocumentArchiveForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Masukkan deskripsi dokumen"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="file">File Dokumen * (Maksimal 4 file)</Label>
                        <div className="space-y-2">
                          <Input
                            id="file"
                            type="file"
                            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                            multiple
                            max="4"
                            required={documentForm.fileUrls.length === 0}
                          />
                          {documentForm.fileNames.length > 0 && (
                            <div className="space-y-2">
                              {documentForm.fileNames.map((fileName, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-green-600" />
                                    <div>
                                      <p className="text-sm font-medium text-green-800">{fileName}</p>
                                      <p className="text-xs text-green-600">{formatFileSize(documentForm.fileSizes[index])}</p>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeDocumentArchiveFile(index)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="issued-date">Tanggal Diterbitkan</Label>
                          <Input
                            id="issued-date"
                            type="date"
                            value={documentForm.issuedDate}
                            onChange={(e) => setDocumentArchiveForm(prev => ({ ...prev, issuedDate: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="issued-by">Diterbitkan oleh</Label>
                          <Input
                            id="issued-by"
                            value={documentForm.issuedBy}
                            onChange={(e) => setDocumentArchiveForm(prev => ({ ...prev, issuedBy: e.target.value }))}
                            placeholder="Nama penerbit"
                          />
                        </div>
                      </div>



                      <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => setIsAddDocumentArchiveDialogOpen(false)}>
                          Batal
                        </Button>
                        <Button 
                          type="submit"
                          disabled={!documentForm.title || !documentForm.category || documentForm.fileUrls.length === 0}
                          className="bg-[#26316c] hover:bg-[#1e2459]"
                        >
                          Simpan Dokumen
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Filters */}
              <CardContent className="p-4 pt-0">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Cari dokumen..."
                        value={documentFilters.search}
                        onChange={(e) => setDocumentArchiveFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={documentFilters.category || "all"} onValueChange={(value) => setDocumentArchiveFilters(prev => ({ ...prev, category: value === "all" ? "" : value }))}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kategori</SelectItem>
                      {DOCUMENT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={documentFilters.status || "all"} onValueChange={(value) => setDocumentArchiveFilters(prev => ({ ...prev, status: value === "all" ? "" : value }))}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="archived">Diarsipkan</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDocumentArchiveFilters({
                        search: '',
                        status: '',
                        category: ''
                      })
                    }}
                  >
                    Reset Filter
                  </Button>
                </div>
                
                {/* Download Status */}
                {downloadStatus && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-pulse">
                        <Download className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-sm text-blue-800">{downloadStatus}</p>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* DocumentArchives List */}
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#26316c]"></div>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada dokumen</h3>
                    <p className="text-gray-500">Mulai dengan menambahkan dokumen pertama</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nomor Dokumen</TableHead>
                          <TableHead>Judul</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead>Diterbitkan</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((document) => (
                          <TableRow key={document.id} className="hover:bg-gray-50">
                            <TableCell className="font-mono text-sm">
                              {document.docNumber}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-medium text-gray-900">{document.title}</div>
                              {document.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {document.description}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{document.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-500">
                                {document.issuedDate ? (
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                                    {new Date(document.issuedDate).toLocaleDateString('id-ID')}
                                  </div>
                                ) : (
                                  '-'
                                )}
                                {document.issuedBy && (
                                  <div className="flex items-center mt-1">
                                    <User className="h-4 w-4 text-gray-400 mr-1" />
                                    <span className="text-xs">{document.issuedBy}</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(document.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDocumentArchive(document)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Lihat Detail"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditDocumentArchive(document)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {systemSettings.whatsappEnabled && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSendWhatsAppNotification(document)}
                                    className="text-green-600 hover:text-green-900"
                                    title="Kirim Notifikasi WhatsApp"
                                    disabled={whatsappLoadingStates[document.id]}
                                  >
                                    {whatsappLoadingStates[document.id] ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <MessageSquare className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                                {document.multipleFiles?.fileUrls.length > 0 ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDownloadDocumentArchive(document)}
                                    disabled={downloadingDocumentArchiveId === document.id}
                                    className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                                    title={downloadingDocumentArchiveId === document.id ? "Mengunduh..." : (document.multipleFiles.fileUrls.length === 1 ? "Download File" : "Download Semua File")}
                                  >
                                    {downloadingDocumentArchiveId === document.id ? (
                                      <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                                    ) : (
                                      <Download className="h-4 w-4" />
                                    )}
                                  </Button>
                                ) : document.fileUrl ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDownloadDocumentArchive(document)}
                                    disabled={downloadingDocumentArchiveId === document.id}
                                    className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                                    title={downloadingDocumentArchiveId === document.id ? "Mengunduh..." : "Download File"}
                                  >
                                    {downloadingDocumentArchiveId === document.id ? (
                                      <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                                    ) : (
                                      <Download className="h-4 w-4" />
                                    )}
                                  </Button>
                                ) : null}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteDocumentArchive(document.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Hapus"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Complaint Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Pengaduan</DialogTitle>
              <DialogDescription>
                Perbarui status dan catatan pengaduan
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={editForm.status} onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="in_progress">Dalam Proses</SelectItem>
                    <SelectItem value="resolved">Selesai</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Prioritas</Label>
                <Select value={editForm.priority} onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih prioritas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Rendah</SelectItem>
                    <SelectItem value="medium">Sedang</SelectItem>
                    <SelectItem value="high">Tinggi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminNotes">Catatan Admin</Label>
                <Textarea
                  id="adminNotes"
                  value={editForm.adminNotes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                  placeholder="Tambahkan catatan admin..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleUpdateComplaint}>
                Simpan Perubahan
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Letter Dialog */}
        <Dialog open={isLetterDialogOpen} onOpenChange={setIsLetterDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Surat</DialogTitle>
              <DialogDescription>
                Perbarui status dan catatan surat
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={editForm.status} onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="approved">Disetujui</SelectItem>
                    <SelectItem value="processed">Diproses</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Prioritas</Label>
                <Select value={editForm.priority} onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih prioritas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Rendah</SelectItem>
                    <SelectItem value="medium">Sedang</SelectItem>
                    <SelectItem value="high">Tinggi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminNotes">Catatan Admin</Label>
                <Textarea
                  id="adminNotes"
                  value={editForm.adminNotes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                  placeholder="Tambahkan catatan admin..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsLetterDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleUpdateLetter}>
                Simpan Perubahan
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit DocumentArchive Dialog */}
        <Dialog open={isDocumentArchiveDialogOpen} onOpenChange={setIsDocumentArchiveDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Dokumen</DialogTitle>
              <DialogDescription>
                Perbarui status dan informasi dokumen
              </DialogDescription>
            </DialogHeader>
            {selectedDocumentArchive && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Nomor Dokumen</Label>
                    <p className="font-mono text-sm">{selectedDocumentArchive.docNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Judul</Label>
                    <p className="font-medium">{selectedDocumentArchive.title}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={editForm.status} onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="archived">Diarsipkan</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminNotes">Catatan Admin</Label>
                  <Textarea
                    id="adminNotes"
                    value={editForm.adminNotes}
                    onChange={(e) => setEditForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                    placeholder="Tambahkan catatan admin..."
                  />
                </div>
                {selectedDocumentArchive.fileUrl && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">File Saat Ini</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{selectedDocumentArchive.fileName}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(selectedDocumentArchive.fileSize)})</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedDocumentArchive.fileUrl, '_blank')}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                {selectedDocumentArchive.multipleFiles && selectedDocumentArchive.multipleFiles.fileUrls.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">File Saat Ini</Label>
                    <div className="mt-1 space-y-2">
                      {selectedDocumentArchive.multipleFiles.fileUrls.map((url, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm flex-1">{selectedDocumentArchive.multipleFiles?.fileNames[index]}</span>
                          <span className="text-xs text-gray-500">({formatFileSize(selectedDocumentArchive.multipleFiles?.fileSizes[index])})</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(url, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDocumentArchiveDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleUpdateDocumentArchive}>
                Simpan Perubahan
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedComplaint ? 'Detail Pengaduan' : selectedLetter ? 'Detail Surat' : 'Detail Dokumen'}
              </DialogTitle>
            </DialogHeader>
            {selectedComplaint && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Nomor Tiket</Label>
                    <p className="font-mono text-sm">{selectedComplaint.ticketNo}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedComplaint.status)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Nama</Label>
                    <p className="font-medium">{selectedComplaint.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="font-medium">{selectedComplaint.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Kategori</Label>
                    <p className="font-medium">{getCategoryLabel(selectedComplaint.category)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Prioritas</Label>
                    <div className="mt-1">
                      {getPriorityBadge(selectedComplaint.priority)}
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Subjek</Label>
                  <p className="font-medium">{selectedComplaint.subject}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Deskripsi</Label>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedComplaint.description}</p>
                </div>
                {selectedComplaint.adminNotes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Catatan Admin</Label>
                    <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                      <p className="text-blue-800 whitespace-pre-wrap">{selectedComplaint.adminNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            {selectedLetter && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Nomor Surat</Label>
                    <p className="font-mono text-sm">{selectedLetter.letterNo}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedLetter.status)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Jenis</Label>
                    <p className="font-medium">
                      <Badge variant={selectedLetter.type === 'masuk' ? 'default' : 'secondary'}>
                        {selectedLetter.type === 'masuk' ? 'Surat Masuk' : 'Surat Keluar'}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Kategori</Label>
                    <p className="font-medium">{selectedLetter.category}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      {selectedLetter.type === 'masuk' ? 'Pengirim' : 'Penerima'}
                    </Label>
                    <p className="font-medium">
                      {selectedLetter.type === 'masuk' ? selectedLetter.sender : selectedLetter.recipient}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Tanggal</Label>
                    <p className="font-medium">
                      {selectedLetter.date || new Date(selectedLetter.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Subjek</Label>
                  <p className="font-medium">{selectedLetter.subject}</p>
                </div>
                {selectedLetter.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Deskripsi</Label>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedLetter.description}</p>
                  </div>
                )}
                {selectedLetter.evidenceImages && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Foto Bukti</Label>
                    <div className="mt-2 space-y-2">
                      {JSON.parse(selectedLetter.evidenceImages).map((image: string, index: number) => {
                        const fileName = image.split('/').pop() || `file_${index + 1}`
                        const fileExt = fileName.split('.').pop()?.toLowerCase() || ''
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">{fileName}</p>
                                <p className="text-xs text-gray-500">File {index + 1}</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(image, '_blank')}
                              className="flex items-center space-x-2"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download</span>
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                {selectedLetter.adminNotes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Catatan Admin</Label>
                    <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                      <p className="text-blue-800 whitespace-pre-wrap">{selectedLetter.adminNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            {selectedDocumentArchive && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Nomor Dokumen</Label>
                    <p className="font-mono text-sm">{selectedDocumentArchive.docNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedDocumentArchive.status)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Judul</Label>
                    <p className="font-medium">{selectedDocumentArchive.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Kategori</Label>
                    <p className="font-medium">{selectedDocumentArchive.category}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Tanggal Terbit</Label>
                    <p className="font-medium">
                      {selectedDocumentArchive.issuedDate || new Date(selectedDocumentArchive.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Diterbitkan oleh</Label>
                    <p className="font-medium">{selectedDocumentArchive.issuedBy || '-'}</p>
                  </div>
                </div>
                {selectedDocumentArchive.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Deskripsi</Label>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedDocumentArchive.description}</p>
                  </div>
                )}

                {selectedDocumentArchive.fileUrl && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">File</Label>
                    <div className="mt-1 flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{selectedDocumentArchive.fileName}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(selectedDocumentArchive.fileSize)}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedDocumentArchive.fileUrl, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}
                {selectedDocumentArchive.multipleFiles && selectedDocumentArchive.multipleFiles.fileUrls.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Files</Label>
                    <div className="mt-1 space-y-2">
                      {selectedDocumentArchive.multipleFiles.fileUrls.map((url, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{selectedDocumentArchive.multipleFiles?.fileNames[index]}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(selectedDocumentArchive.multipleFiles?.fileSizes[index])}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(url, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedDocumentArchive.adminNotes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Catatan Admin</Label>
                    <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                      <p className="text-blue-800 whitespace-pre-wrap">{selectedDocumentArchive.adminNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>
              {confirmDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
              Batal
            </Button>
            <Button onClick={() => {
              confirmDialog.onConfirm()
              setConfirmDialog(prev => ({ ...prev, open: false }))
            }}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Confirmation Dialog */}
      <Dialog open={whatsappConfirmDialog.open} onOpenChange={(open) => !open && cancelSendWhatsApp()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              Konfirmasi Kirim Notifikasi WhatsApp
            </DialogTitle>
            <DialogDescription className="space-y-3">
              {!systemSettings.whatsappEnabled && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <div className="space-y-2">
                      <div>
                        <strong>Perhatian:</strong> Layanan WhatsApp notifikasi saat ini tidak aktif.
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={navigateToSettings}
                          className="text-amber-700 border-amber-300 hover:bg-amber-100"
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Aktifkan di Pengaturan
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              <p>Apakah Anda yakin ingin mengirim notifikasi WhatsApp untuk dokumen ini?</p>
              
              {whatsappConfirmDialog.document && (
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Judul Dokumen:</span>
                    <span className="text-gray-900">{whatsappConfirmDialog.document.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Nomor Dokumen:</span>
                    <span className="text-gray-900">{whatsappConfirmDialog.document.docNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Kategori:</span>
                    <span className="text-gray-900">{whatsappConfirmDialog.document.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="text-gray-900">{whatsappConfirmDialog.document.status}</span>
                  </div>
                </div>
              )}
              
              {/* Target Number Input */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Target Penerima:</span>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type="tel"
                      placeholder="081234567890"
                      value={whatsappConfirmDialog.targetNumber}
                      onChange={(e) => handleTargetNumberChange(e.target.value)}
                      className={`w-full ${whatsappConfirmDialog.targetNumber ? (whatsappConfirmDialog.isPhoneValid ? 'border-green-500 focus:border-green-500' : 'border-red-500 focus:border-red-500') : ''}`}
                    />
                    {whatsappConfirmDialog.targetNumber && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {whatsappConfirmDialog.isPhoneValid ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-blue-600">
                    Format: 0812xxxxxxx
                  </p>
                  {whatsappConfirmDialog.targetNumber && !whatsappConfirmDialog.isPhoneValid && (
                    <p className="text-xs text-red-600">
                      Nomor telepon tidak valid. Gunakan format 08 diikuti 8-12 digit angka.
                    </p>
                  )}
                </div>
              </div>
              
              <div className={`${systemSettings.whatsappEnabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} p-3 rounded-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${systemSettings.whatsappEnabled ? 'text-green-800' : 'text-gray-600'}`}>
                      <strong>Provider:</strong> wanotif.shb.sch.id
                    </p>
                    <p className={`text-xs mt-1 ${systemSettings.whatsappEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                      Status: {systemSettings.whatsappEnabled ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Aktif
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Tidak Aktif
                        </span>
                      )}
                    </p>
                  </div>
                  {!systemSettings.whatsappEnabled ? (
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={cancelSendWhatsApp} disabled={whatsappLoadingStates[whatsappConfirmDialog.document?.id || '']}>
              Batal
            </Button>
            <Button 
              onClick={confirmSendWhatsApp} 
              disabled={whatsappLoadingStates[whatsappConfirmDialog.document?.id || ''] || !whatsappConfirmDialog.targetNumber.trim() || !whatsappConfirmDialog.isPhoneValid || !systemSettings.whatsappEnabled}
              className="bg-green-600 hover:bg-green-700"
            >
              {whatsappLoadingStates[whatsappConfirmDialog.document?.id || ''] ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Kirim Notifikasi
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  )
}