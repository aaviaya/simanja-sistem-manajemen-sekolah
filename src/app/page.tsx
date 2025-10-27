'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  School, 
  Wrench, 
  HeadphonesIcon, 
  HelpCircle,
  Shield,
  Clock,
  MessageSquare,
  ArrowRight,
  XCircle,
  Search,
  User,
  Calendar,
  Upload,
  X,
  FolderOpen,
  ChevronDown,
  LogOut,
  Phone
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { toast } = useToast()
  
  // User state
  const [user, setUser] = useState<any>(null)
  
  // Complaint states
  const [complaintData, setComplaintData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    subject: '',
    description: '',
    priority: 'medium'
  })
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false)
  const [complaintSubmitStatus, setComplaintSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [complaintTicketNumber, setComplaintTicketNumber] = useState('')

  // Letter states
  const [letterData, setLetterData] = useState({
    type: '',
    category: '',
    subject: '',
    description: '',
    sender: '',
    recipient: '',
    senderEmail: '',
    priority: 'medium',
    date: ''
  })
  const [letterFiles, setLetterFiles] = useState<File[]>([])
  const [isSubmittingLetter, setIsSubmittingLetter] = useState(false)
  const [letterSubmitStatus, setLetterSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [letterNumber, setLetterNumber] = useState('')

  // Document states
  const [documentForm, setDocumentForm] = useState({
    docName: '',
    docDescription: '',
    docFile: null as File | null,
    category: 'Arsip Umum'
  })
  const [documentFiles, setDocumentFiles] = useState<File[]>([])
  const [documentLoading, setDocumentLoading] = useState(false)
  const [documentSubmitStatus, setDocumentSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [documentNumber, setDocumentNumber] = useState('')
  const [docNumber, setDocNumber] = useState('')
  const [documentTrackingLoading, setDocumentTrackingLoading] = useState(false)
  const [documentTrackingError, setDocumentTrackingError] = useState('')
  const [documentTrackingInfo, setDocumentTrackingInfo] = useState<any>(null)

  // Tracking states
  const [trackingTicketNo, setTrackingTicketNo] = useState('')
  const [trackingLetterNo, setTrackingLetterNo] = useState('')
  const [trackingDocNo, setTrackingDocNo] = useState('')
  const [isTracking, setIsTracking] = useState(false)
  const [trackingResult, setTrackingResult] = useState<any>(null)
  const [trackingError, setTrackingError] = useState('')
  const [showTrackingResult, setShowTrackingResult] = useState(false)

  // Statistics states
  const [stats, setStats] = useState({
    totalComplaints: 0,
    totalLetters: 0,
    totalDocuments: 0,
    inProgress: 0,
    completed: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)

  // School data state
  const [schoolData, setSchoolData] = useState<any>(null)
  const [schoolLoading, setSchoolLoading] = useState(true)

  const complaintCategories = [
    { value: 'academic', label: 'Akademik', icon: School, description: 'Masalah pembelajaran, nilai, guru, dll' },
    { value: 'facility', label: 'Fasilitas', icon: Wrench, description: 'Ruang kelas, peralatan, infrastruktur' },
    { value: 'service', label: 'Layanan', icon: HeadphonesIcon, description: 'Administrasi, kantin, perpustakaan' },
    { value: 'other', label: 'Lainnya', icon: HelpCircle, description: 'Pengaduan lainnya' }
  ]

  const letterTypes = [
    { value: 'masuk', label: 'Surat Masuk' },
    { value: 'keluar', label: 'Surat Keluar' }
  ]

  const letterCategories = [
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

  const documentCategories = [
    'Surat Keputusan (SK)',
    'Notulen Rapat',
    'Laporan Kegiatan',
    'Legalitas & Perizinan',
    'Arsip Umum',
    'Kepeagawaian',
    'Kesiswaan'
  ]

  const handleComplaintInputChange = (field: string, value: string) => {
    setComplaintData(prev => ({ ...prev, [field]: value }))
  }

  const handleLetterInputChange = (field: string, value: string) => {
    setLetterData(prev => ({ ...prev, [field]: value }))
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

  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setDocumentFiles(prev => {
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

  const removeDocumentFile = (index: number) => {
    setDocumentFiles(prev => prev.filter((_, i) => i !== index))
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

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingComplaint(true)
    setComplaintSubmitStatus('idle')

    // Validation
    if (!complaintData.name.trim()) {
      toast({
        title: "Error",
        description: "Nama harus diisi",
        variant: "destructive",
      })
      setIsSubmittingComplaint(false)
      return
    }

    if (!complaintData.email.trim()) {
      toast({
        title: "Error",
        description: "Email harus diisi",
        variant: "destructive",
      })
      setIsSubmittingComplaint(false)
      return
    }

    if (!complaintData.category) {
      toast({
        title: "Error",
        description: "Kategori harus dipilih",
        variant: "destructive",
      })
      setIsSubmittingComplaint(false)
      return
    }

    if (!complaintData.subject.trim()) {
      toast({
        title: "Error",
        description: "Subjek harus diisi",
        variant: "destructive",
      })
      setIsSubmittingComplaint(false)
      return
    }

    if (!complaintData.description.trim()) {
      toast({
        title: "Error",
        description: "Deskripsi harus diisi",
        variant: "destructive",
      })
      setIsSubmittingComplaint(false)
      return
    }

    try {
      console.log('Submitting complaint:', complaintData)
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(complaintData),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        setComplaintTicketNumber(data.complaint.ticketNo)
        setComplaintSubmitStatus('success')
        // Auto-fill tracking form with the new ticket number
        setTrackingTicketNo(data.complaint.ticketNo)
        setComplaintData({
          name: '',
          email: '',
          phone: '',
          category: '',
          subject: '',
          description: '',
          priority: 'medium'
        })
        toast({
          title: "Pengaduan Berhasil Dikirim!",
          description: `Nomor tiket: ${data.complaint.ticketNo}`,
        })
      } else {
        console.error('API Error:', data)
        setComplaintSubmitStatus('error')
        toast({
          title: "Gagal Mengirim Pengaduan",
          description: data.error || 'Terjadi kesalahan',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Submit error:', error)
      setComplaintSubmitStatus('error')
      toast({
        title: "Terjadi Kesalahan",
        description: "Silakan coba lagi",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingComplaint(false)
    }
  }

  const handleLetterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingLetter(true)
    setLetterSubmitStatus('idle')

    // Validation
    if (!letterData.type) {
      toast({
        title: "Error",
        description: "Jenis surat harus dipilih",
        variant: "destructive",
      })
      setIsSubmittingLetter(false)
      return
    }

    if (!letterData.category) {
      toast({
        title: "Error",
        description: "Kategori harus dipilih",
        variant: "destructive",
      })
      setIsSubmittingLetter(false)
      return
    }

    if (!letterData.subject.trim()) {
      toast({
        title: "Error",
        description: "Subjek harus diisi",
        variant: "destructive",
      })
      setIsSubmittingLetter(false)
      return
    }

    if (!letterData.sender.trim()) {
      toast({
        title: "Error",
        description: "Pengirim harus diisi",
        variant: "destructive",
      })
      setIsSubmittingLetter(false)
      return
    }

    if (!letterData.recipient.trim()) {
      toast({
        title: "Error",
        description: "Penerima harus diisi",
        variant: "destructive",
      })
      setIsSubmittingLetter(false)
      return
    }

    if (!letterData.senderEmail.trim()) {
      toast({
        title: "Error",
        description: "Email pengirim harus diisi",
        variant: "destructive",
      })
      setIsSubmittingLetter(false)
      return
    }

    // Validate file upload (required based on label)
    if (letterFiles.length === 0) {
      toast({
        title: "Error",
        description: "File dokumen harus diupload (maksimal 4 file)",
        variant: "destructive",
      })
      setIsSubmittingLetter(false)
      return
    }

    if (letterFiles.length > 4) {
      toast({
        title: "Error",
        description: "Maksimal 4 file yang diperbolehkan",
        variant: "destructive",
      })
      setIsSubmittingLetter(false)
      return
    }

    try {
      // Upload files first
      let evidenceImages: string[] = []
      if (letterFiles.length > 0) {
        evidenceImages = await uploadFiles(letterFiles)
      }

      const response = await fetch('/api/letters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...letterData,
          sender: `${letterData.sender} (${letterData.senderEmail})`,
          evidenceImages
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setLetterNumber(data.letter.letterNo)
        setLetterSubmitStatus('success')
        // Auto-fill tracking form with the new letter number
        setTrackingLetterNo(data.letter.letterNo)
        setLetterData({
          type: '',
          category: '',
          subject: '',
          description: '',
          sender: '',
          recipient: '',
          senderEmail: '',
          priority: 'medium',
          date: ''
        })
        setLetterFiles([])
        toast({
          title: "Surat Berhasil Dibuat!",
          description: `Nomor surat: ${data.letter.letterNo}`,
        })
      } else {
        const errorData = await response.json()
        setLetterSubmitStatus('error')
        toast({
          title: "Gagal Membuat Surat",
          description: errorData.error || 'Terjadi kesalahan',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Letter submit error:', error)
      setLetterSubmitStatus('error')
      toast({
        title: "Terjadi Kesalahan",
        description: "Silakan coba lagi",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingLetter(false)
    }
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDocumentForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDocumentCategoryChange = (value: string) => {
    setDocumentForm(prev => ({
      ...prev,
      category: value
    }))
  }

  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDocumentLoading(true)
    setDocumentSubmitStatus('idle')

    // Validation
    if (!documentForm.docName.trim()) {
      toast({
        title: "Error",
        description: "Nama dokumen harus diisi",
        variant: "destructive",
      })
      setDocumentLoading(false)
      return
    }

    if (documentFiles.length === 0) {
      toast({
        title: "Error", 
        description: "File dokumen harus dipilih (maksimal 4 file)",
        variant: "destructive",
      })
      setDocumentLoading(false)
      return
    }

    if (documentFiles.length > 4) {
      toast({
        title: "Error", 
        description: "Maksimal 4 file yang diperbolehkan",
        variant: "destructive",
      })
      setDocumentLoading(false)
      return
    }

    try {
      // Upload files first
      let fileUrls: string[] = []
      let fileNames: string[] = []
      let fileSizes: number[] = []
      let fileTypes: string[] = []
      
      console.log('Starting document upload...')
      
      if (documentFiles.length > 0) {
        const uploadResults = await uploadFiles(documentFiles)
        fileUrls = uploadResults
        fileNames = documentFiles.map(file => file.name)
        fileSizes = documentFiles.map(file => file.size)
        fileTypes = documentFiles.map(file => file.type)
        console.log('Files uploaded successfully:', uploadResults)
      }

      // Create document with uploaded file info
      const documentPayload = {
        title: documentForm.docName,
        category: documentForm.category,
        description: documentForm.docDescription,
        fileUrls: fileUrls,
        fileNames: fileNames,
        fileSizes: fileSizes,
        fileTypes: fileTypes,
        issuedDate: new Date().toISOString().split('T')[0],
        issuedBy: 'Admin',
        tags: ''
      }
      
      console.log('Creating document with payload:', documentPayload)
      
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentPayload),
      })

      console.log('Document API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Document created successfully:', data)
        // Set success state and document number
        setDocumentNumber(data.document.docNumber)
        setDocumentSubmitStatus('success')
        // Auto-fill tracking form with the new document number
        setDocNumber(data.document.docNumber)
        // Reset form
        setDocumentForm({
          docName: '',
          docDescription: '',
          docFile: null,
          category: 'Arsip Umum'
        })
        setDocumentFiles([])
        // Show success message
        toast({
          title: "Dokumen Berhasil Diupload!",
          description: `Nomor dokumen: ${data.document.docNumber}`,
        })
      } else {
        const errorData = await response.json()
        console.error('Document creation failed:', errorData)
        setDocumentSubmitStatus('error')
        toast({
          title: "Gagal Mengupload Dokumen",
          description: errorData.error || 'Terjadi kesalahan',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Document submit error:', error)
      setDocumentSubmitStatus('error')
      toast({
        title: "Terjadi Kesalahan",
        description: "Silakan coba lagi",
        variant: "destructive",
      })
    } finally {
      setDocumentLoading(false)
    }
  }

  const handleTrackDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    setDocumentTrackingLoading(true)
    setDocumentTrackingError('')
    setDocumentTrackingInfo(null)

    try {
      const response = await fetch(`/api/documents/track?docNumber=${encodeURIComponent(docNumber)}`)
      
      if (response.ok) {
        const data = await response.json()
        setDocumentTrackingInfo(data.document)
      } else if (response.status === 404) {
        setDocumentTrackingError('Dokumen tidak ditemukan')
      } else {
        setDocumentTrackingError('Terjadi kesalahan saat mencari dokumen')
      }
    } catch (error) {
      setDocumentTrackingError('Terjadi kesalahan koneksi')
    } finally {
      setDocumentTrackingLoading(false)
    }
  }

  const handleTrackingSubmit = async (e: React.FormEvent, type: 'complaint' | 'letter' | 'document') => {
    e.preventDefault()
    setIsTracking(true)
    setTrackingError('')
    setTrackingResult(null)
    setShowTrackingResult(false)

    try {
      let endpoint = ''
      let param = ''
      let value = ''
      
      if (type === 'complaint') {
        endpoint = '/api/complaints/track'
        param = 'ticketNo'
        value = trackingTicketNo
      } else if (type === 'letter') {
        endpoint = '/api/letters/track'
        param = 'letterNo'
        value = trackingLetterNo
      } else if (type === 'document') {
        endpoint = '/api/documents/track'
        param = 'docNumber'
        value = trackingDocNo
      }
      
      const response = await fetch(`${endpoint}?${param}=${encodeURIComponent(value)}`)
      const data = await response.json()

      if (response.ok) {
        setTrackingResult(data[type])
        setShowTrackingResult(true)
      } else {
        setTrackingError(data.error || `Terjadi kesalahan saat tracking ${type === 'complaint' ? 'pengaduan' : type === 'letter' ? 'surat' : 'dokumen'}`)
      }
    } catch (error) {
      setTrackingError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsTracking(false)
    }
  }

  const handleLogout = () => {
    // Handle logout logic here
    setUser(null)
    router.push('/')
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

  const getLetterTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      it_notification: 'IT & Informasi',
      material_request: 'Permintaan Barang',
      damage_report: 'Laporan Kerusakan',
      material_receipt: 'Penerimaan Barang',
      material_disbursement: 'Pengeluaran Barang',
      material_borrowing: 'Peminjaman Barang',
      material_maintenance: 'Pemeliharaan',
      material_return: 'Pengembalian',
      material_transfer: 'Pemindahan',
      other: 'Lainnya'
    }
    return labels[type] || type
  }

  const getLetterCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      it_info: 'IT Informasi',
      procurement: 'Pengadaan',
      inventory: 'Inventaris',
      maintenance: 'Pemeliharaan',
      administration: 'Administrasi',
      academic: 'Akademik',
      finance: 'Keuangan',
      hr: 'SDM',
      facility: 'Fasilitas',
      other: 'Lainnya'
    }
    return labels[category] || category
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Menunggu',
      in_progress: 'Dalam Proses',
      completed: 'Selesai',
      rejected: 'Ditolak'
    }
    return texts[status] || status
  }

  // Fetch statistics data
  useEffect(() => {
    fetchStats()
    fetchSchoolData()
  }, [])

  // Auto-dismiss success alerts after 5 seconds
  useEffect(() => {
    if (complaintSubmitStatus === 'success') {
      const timer = setTimeout(() => {
        setComplaintSubmitStatus('idle')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [complaintSubmitStatus])

  useEffect(() => {
    if (letterSubmitStatus === 'success') {
      const timer = setTimeout(() => {
        setLetterSubmitStatus('idle')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [letterSubmitStatus])

  useEffect(() => {
    if (documentSubmitStatus === 'success') {
      const timer = setTimeout(() => {
        setDocumentSubmitStatus('idle')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [documentSubmitStatus])

  const fetchSchoolData = async () => {
    try {
      setSchoolLoading(true)
      const response = await fetch('/api/school')
      if (response.ok) {
        const data = await response.json()
        if (data.schools && data.schools.length > 0) {
          setSchoolData(data.schools[0]) // Ambil sekolah pertama
        }
      }
    } catch (error) {
      console.error('Error fetching school data:', error)
    } finally {
      setSchoolLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      
      // Fetch complaints, letters, and documents data
      const [complaintsResponse, lettersResponse, documentsResponse] = await Promise.all([
        fetch('/api/complaints'),
        fetch('/api/letters'),
        fetch('/api/documents')
      ])

      let totalComplaints = 0
      let totalLetters = 0
      let totalDocuments = 0
      let inProgress = 0
      let completed = 0

      if (complaintsResponse.ok) {
        const complaintsData = await complaintsResponse.json()
        totalComplaints = complaintsData.complaints?.length || 0
        inProgress += complaintsData.complaints?.filter((c: any) => c.status === 'in_progress').length || 0
        completed += complaintsData.complaints?.filter((c: any) => c.status === 'resolved').length || 0
      }

      if (lettersResponse.ok) {
        const lettersData = await lettersResponse.json()
        totalLetters = lettersData.letters?.length || 0
        inProgress += lettersData.letters?.filter((l: any) => l.status === 'pending' || l.status === 'approved').length || 0
        completed += lettersData.letters?.filter((l: any) => l.status === 'processed').length || 0
      }

      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json()
        totalDocuments = documentsData.documents?.length || 0
        inProgress += documentsData.documents?.filter((d: any) => d.status === 'pending' || d.status === 'approved').length || 0
        completed += documentsData.documents?.filter((d: any) => d.status === 'processed').length || 0
      }

      setStats({
        totalComplaints,
        totalLetters,
        totalDocuments,
        inProgress,
        completed
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b ult-header-mobile" style={{position: 'fixed', top: '0', left: '0', right: '0', zIndex: 1}}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Mobile Logo with SIMANJA text */}
          <a href="/" className="flex items-center gap-3">
            <img 
              src="https://pusatinformasi.ult.kemendikdasmen.go.id/hc/theming_assets/01J983VNW433KA8D7TNET04RG7" 
              width="40px" 
              height="auto" 
              alt="Logo SIMANJA" 
            />
            <span className="text-lg font-bold text-gray-800">SIMANJA</span>
          </a>
          
          {/* Mobile Menu Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <div className="text-sm">Menu</div>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <a href="/" className="flex items-center gap-2 w-full">
                  <HelpCircle className="w-4 h-4" />
                  Fitur & Panduan
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/" className="flex items-center gap-2 w-full">
                  <HelpCircle className="w-4 h-4" />
                  Pusat Bantuan
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/" className="flex items-center gap-2 w-full">
                  <Search className="w-4 h-4" />
                  Lacak Status Pengajuan
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Email Support
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telepon
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center bg-white w-full border-b ult-header-desktop" style={{left: '0px', right: '0px', top: '0px', position: 'fixed', zIndex: 1}}>
        <div className="grid grid-flow-col-dense bg-white w-full hidden md:grid" id="navbarSection" style={{padding: '1rem 2rem', maxWidth: '1240px', margin: 'auto'}}>
          
          {/* Logo */}
          <div className="flex flex-row items-center row-span-3" style={{maxWidth: '280px'}}>
            <a href="/" className="flex items-center gap-3">
              <div>
                <img src="https://pusatinformasi.ult.kemendikdasmen.go.id/hc/theming_assets/01J983VNW433KA8D7TNET04RG7" width="80px" height="auto" alt="Logo SIMANJA" />
              </div>
              <span className="text-xl font-bold text-gray-800">SIMANJA</span>
            </a>
          </div>
          
          {/* Menu */}
          <div className="flex flex-row items-center w-full row-span-3 justify-between gap-3">
            <a href="/" className="text-blue-600 hover:text-blue-800 transition-colors" style={{textDecoration: 'none'}}>
              <p className="text-sm text-gray-700 hover:text-gray-900">Fitur & Panduan</p>
            </a>
            
            <a href="/" className="text-blue-600 hover:text-blue-800 transition-colors" style={{textDecoration: 'none'}}>
              <p className="text-sm text-gray-700 hover:text-gray-900">Pusat Bantuan</p>
            </a>
            
            <a href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
              <span className="text-sm text-gray-700 hover:text-gray-900">Portal Sekolah</span>
            </a>
            
            <a href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
              <span className="text-sm text-gray-700 hover:text-gray-900">Lacak Status Pengajuan</span>
            </a>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex flex-row items-center text-sm text-gray-700 hover:text-gray-900">
                  <div>Hubungi Kami</div>
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Email Support
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telepon
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/admin" className="flex items-center gap-2 w-full">
                    <User className="w-4 h-4" />
                    Login Admin
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#26316c] to-[#1e2459] text-white py-16 md:py-16" style={{marginTop: '60px'}}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            {schoolData?.logo ? (
              <img 
                src={schoolData.logo} 
                alt={schoolData.name}
                className="w-16 h-16 rounded-full bg-white p-2 object-contain"
              />
            ) : (
              <div className="p-3 bg-white/20 rounded-full">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {schoolLoading ? (
              "Sistem Manajemen Sekolah"
            ) : schoolData ? (
              schoolData.name
            ) : (
              "Sistem Manajemen Sekolah"
            )}
          </h1>
          {schoolData?.motto && (
            <p className="text-lg md:text-xl mb-4 text-blue-100 italic">
              "{schoolData.motto}"
            </p>
          )}
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
              Layanan Informasi dan Pengaduan
            </h2>
            <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
              Temukan kemudahan pengelolaan sekolah dengan berbagai fitur dan sumber gratis dari SIMANJA. Kunjungi website resmi kami untuk informasi selengkapnya.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Statistik Layanan
            </h2>
            <p className="text-gray-600">
              Pantau status pengaduan dan surat menyurat secara real-time
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Pengaduan</p>
                    {statsLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mt-1 w-12"></div>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalComplaints}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Layanan Pengaduan</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Surat</p>
                    {statsLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mt-1 w-12"></div>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalLetters}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Surat Menyurat</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Dokumen</p>
                    {statsLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mt-1 w-12"></div>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalDocuments || 0}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Arsip Dokumen</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <FolderOpen className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Layanan</p>
                    {statsLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mt-1 w-12"></div>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-indigo-600 mt-1">
                        {(stats.totalComplaints || 0) + (stats.totalLetters || 0) + (stats.totalDocuments || 0)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Semua Layanan</p>
                  </div>
                  <div className="p-3 bg-indigo-100 rounded-full">
                    <Shield className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div id="form-section" className="max-w-6xl mx-auto px-4 py-12">
        <Tabs defaultValue="complaint" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="complaint" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Pengaduan
            </TabsTrigger>
            <TabsTrigger value="letter" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Surat Menyurat
            </TabsTrigger>
            <TabsTrigger value="document" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Arsip Dokumen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="complaint" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Complaint Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Formulir Pengaduan</CardTitle>
                  <CardDescription>
                    Sampaikan keluhan atau saran Anda untuk perbaikan layanan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {complaintSubmitStatus === 'success' ? (
                    <Alert className="mb-4 border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>Pengaduan berhasil dikirim!</strong><br />
                        Nomor tiket: <span className="font-mono">{complaintTicketNumber}</span><br />
                        Simpan nomor tiket untuk tracking status pengaduan Anda.
                      </AlertDescription>
                    </Alert>
                  ) : complaintSubmitStatus === 'error' ? (
                    <Alert className="mb-4 border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        Terjadi kesalahan. Silakan coba lagi.
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  <form onSubmit={handleComplaintSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap *</Label>
                        <Input
                          id="name"
                          type="text"
                          value={complaintData.name}
                          onChange={(e) => handleComplaintInputChange('name', e.target.value)}
                          placeholder="Masukkan nama lengkap"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={complaintData.email}
                          onChange={(e) => handleComplaintInputChange('email', e.target.value)}
                          placeholder="email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={complaintData.phone}
                        onChange={(e) => handleComplaintInputChange('phone', e.target.value)}
                        placeholder="+62 812-3456-7890"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori *</Label>
                      <Select value={complaintData.category} onValueChange={(value) => handleComplaintInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {complaintCategories.map((category) => {
                            const IconComponent = category.icon
                            return (
                              <SelectItem key={category.value} value={category.value}>
                                <div className="flex items-start gap-3">
                                  <IconComponent className="w-4 h-4 mt-0.5" />
                                  <div>
                                    <div className="font-medium">{category.label}</div>
                                    <div className="text-sm text-gray-500">{category.description}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioritas</Label>
                      <Select value={complaintData.priority} onValueChange={(value) => handleComplaintInputChange('priority', value)}>
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
                      <Label htmlFor="subject">Subjek *</Label>
                      <Input
                        id="subject"
                        type="text"
                        value={complaintData.subject}
                        onChange={(e) => handleComplaintInputChange('subject', e.target.value)}
                        placeholder="Jelaskan secara singkat masalah Anda"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Deskripsi Lengkap *</Label>
                      <Textarea
                        id="description"
                        value={complaintData.description}
                        onChange={(e) => handleComplaintInputChange('description', e.target.value)}
                        placeholder="Jelaskan detail keluhan atau saran Anda..."
                        rows={4}
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-[#26316c] hover:bg-[#1e2459]"
                      disabled={isSubmittingComplaint}
                    >
                      {isSubmittingComplaint ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        'Kirim Pengaduan'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Complaint Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Cek Status Pengaduan</CardTitle>
                  <CardDescription>
                    Lacak status pengaduan menggunakan nomor tiket
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={(e) => handleTrackingSubmit(e, 'complaint')} className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Masukkan nomor tiket (contoh: REQ-202412-12345)"
                        value={trackingTicketNo}
                        onChange={(e) => setTrackingTicketNo(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-[#26316c] hover:bg-[#1e2459]"
                      disabled={isTracking}
                    >
                      {isTracking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mencari...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Cek Status
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Tracking Error */}
                  {trackingError && (
                    <Alert className="mt-4 border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {trackingError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Tracking Result */}
                  {showTrackingResult && trackingResult && trackingResult.ticketNo && (
                    <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Detail Pengaduan</h3>
                          <Badge variant="outline" className="font-mono">
                            {trackingResult.ticketNo}
                          </Badge>
                        </div>
                  
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Nama:</span>
                            <p className="text-muted-foreground">{trackingResult.name}</p>
                          </div>
                          <div>
                            <span className="font-medium">Email:</span>
                            <p className="text-muted-foreground">{trackingResult.email}</p>
                          </div>
                          <div>
                            <span className="font-medium">Kategori:</span>
                            <p className="text-muted-foreground">
                              {getCategoryLabel(trackingResult.category)}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Subjek:</span>
                            <p className="text-muted-foreground">{trackingResult.subject}</p>
                          </div>
                        </div>
                  
                        <div>
                          <span className="font-medium">Deskripsi:</span>
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {trackingResult.description}
                          </p>
                        </div>
                  
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium">Status:</span>
                            <div className="mt-1">{getStatusBadge(trackingResult.status)}</div>
                          </div>
                          <div>
                            <span className="font-medium">Prioritas:</span>
                            <div className="mt-1">{getPriorityBadge(trackingResult.priority)}</div>
                          </div>
                        </div>
                  
                        <div className="grid grid-cols-2 gap-4 pt-4">
                          <div>
                            <span className="font-medium">Dibuat:</span>
                            <p className="text-muted-foreground text-sm">
                              {new Date(trackingResult.createdAt).toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Diperbarui:</span>
                            <p className="text-muted-foreground text-sm">
                              {new Date(trackingResult.updatedAt).toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>                  
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="letter" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Letter Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Formulir Surat Menyurat</CardTitle>
                  <CardDescription>
                    Buat surat resmi untuk berbagai keperluan sekolah
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {letterSubmitStatus === 'success' ? (
                    <Alert className="mb-4 border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>Surat berhasil dibuat!</strong><br />
                        Nomor surat: <span className="font-mono">{letterNumber}</span><br />
                        Simpan nomor surat untuk tracking status surat Anda.
                      </AlertDescription>
                    </Alert>
                  ) : letterSubmitStatus === 'error' ? (
                    <Alert className="mb-4 border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        Terjadi kesalahan. Silakan coba lagi.
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  <form onSubmit={handleLetterSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Jenis Surat</Label>
                        <Select value={letterData.type} onValueChange={(value) => handleLetterInputChange('type', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis" />
                          </SelectTrigger>
                          <SelectContent>
                            {letterTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Kategori</Label>
                        <Select value={letterData.category} onValueChange={(value) => handleLetterInputChange('category', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            {letterCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subjek</Label>
                      <Input
                        id="subject"
                        value={letterData.subject}
                        onChange={(e) => handleLetterInputChange('subject', e.target.value)}
                        placeholder="Masukkan subjek surat"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Deskripsi</Label>
                      <Textarea
                        id="description"
                        value={letterData.description}
                        onChange={(e) => handleLetterInputChange('description', e.target.value)}
                        placeholder="Masukkan deskripsi surat"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sender">Pengirim</Label>
                        <Input
                          id="sender"
                          value={letterData.sender}
                          onChange={(e) => handleLetterInputChange('sender', e.target.value)}
                          placeholder="Nama pengirim"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="recipient">Penerima</Label>
                        <Input
                          id="recipient"
                          value={letterData.recipient}
                          onChange={(e) => handleLetterInputChange('recipient', e.target.value)}
                          placeholder="Nama penerima"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="senderEmail">Email Pengirim</Label>
                        <Input
                          id="senderEmail"
                          type="email"
                          value={letterData.senderEmail}
                          onChange={(e) => handleLetterInputChange('senderEmail', e.target.value)}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">Prioritas</Label>
                        <Select value={letterData.priority} onValueChange={(value) => handleLetterInputChange('priority', value)}>
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
                    </div>

                    <div className="space-y-2">
                      <Label>Upload Dokumen Pendukung</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            Klik untuk upload atau drag & drop file di sini
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            PDF, Word, Excel, JPG, PNG (Max. 10MB, Maksimal 4 file)
                          </p>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                            disabled={letterFiles.length >= 4}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('file-upload')?.click()}
                            disabled={letterFiles.length >= 4}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Pilih File
                          </Button>
                          {letterFiles.length >= 4 && (
                            <p className="text-xs text-orange-600 mt-2">
                              Maksimal 4 file tercapai
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {letterFiles.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">File yang Dipilih ({letterFiles.length}/4):</Label>
                          <div className="space-y-2">
                            {letterFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm truncate max-w-xs">{file.name}</span>
                                  <span className="text-xs text-gray-500">
                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                  </span>
                                </div>
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

                    <Button 
                      type="submit" 
                      className="w-full bg-[#26316c] hover:bg-[#1e2459]"
                      disabled={isSubmittingLetter}
                    >
                      {isSubmittingLetter ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Membuat...
                        </>
                      ) : (
                        'Buat Surat'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Letter Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Cek Status Surat</CardTitle>
                  <CardDescription>
                    Lacak status surat menggunakan nomor surat
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={(e) => handleTrackingSubmit(e, 'letter')} className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Masukkan nomor surat (contoh: LET-202412-12345)"
                        value={trackingLetterNo}
                        onChange={(e) => setTrackingLetterNo(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-[#26316c] hover:bg-[#1e2459]"
                      disabled={isTracking}
                    >
                      {isTracking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mencari...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Cek Status
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Tracking Error */}
                  {trackingError && (
                    <Alert className="mt-4 border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {trackingError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Tracking Result */}
                  {showTrackingResult && trackingResult && trackingResult.letterNo && (
                    <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Detail Surat</h3>
                          <Badge variant="outline" className="font-mono">
                            {trackingResult.letterNo}
                          </Badge>
                        </div>
                  
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Pengirim:</span>
                            <p className="text-muted-foreground">{trackingResult.sender}</p>
                          </div>
                          <div>
                            <span className="font-medium">Penerima:</span>
                            <p className="text-muted-foreground">{trackingResult.recipient}</p>
                          </div>
                          <div>
                            <span className="font-medium">Jenis Surat:</span>
                            <p className="text-muted-foreground">
                              {getLetterTypeLabel(trackingResult.type)}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Kategori:</span>
                            <p className="text-muted-foreground">
                              {getLetterCategoryLabel(trackingResult.category)}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Tanggal:</span>
                            <p className="text-muted-foreground">{trackingResult.date}</p>
                          </div>
                        </div>
                  
                        <div>
                          <span className="font-medium">Subjek:</span>
                          <p className="text-muted-foreground">{trackingResult.subject}</p>
                        </div>
                  
                        <div>
                          <span className="font-medium">Isi Surat:</span>
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {trackingResult.description}
                          </p>
                        </div>
                  
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium">Status:</span>
                            <div className="mt-1">{getStatusBadge(trackingResult.status)}</div>
                          </div>
                          <div>
                            <span className="font-medium">Prioritas:</span>
                            <div className="mt-1">{getPriorityBadge(trackingResult.priority)}</div>
                          </div>
                        </div>
                  
                        <div className="grid grid-cols-2 gap-4 pt-4">
                          <div>
                            <span className="font-medium">Dibuat:</span>
                            <p className="text-muted-foreground text-sm">
                              {new Date(trackingResult.createdAt).toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Diperbarui:</span>
                            <p className="text-muted-foreground text-sm">
                              {new Date(trackingResult.updatedAt).toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>                  
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="document" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Document Archive Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Formulir Arsip Dokumen</CardTitle>
                  <CardDescription>
                    Upload dan kelola dokumen arsip sekolah
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {documentSubmitStatus === 'success' ? (
                    <Alert className="mb-4 border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>Dokumen berhasil diupload!</strong><br />
                        Nomor dokumen: <span className="font-mono">{documentNumber}</span><br />
                        Simpan nomor dokumen untuk tracking status dokumen Anda.
                      </AlertDescription>
                    </Alert>
                  ) : documentSubmitStatus === 'error' ? (
                    <Alert className="mb-4 border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        Terjadi kesalahan. Silakan coba lagi.
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  <form onSubmit={handleDocumentSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="docName">Nama Dokumen</Label>
                      <Input
                        id="docName"
                        name="docName"
                        value={documentForm.docName}
                        onChange={handleDocumentChange}
                        placeholder="Masukkan nama dokumen"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="docDescription">Deskripsi</Label>
                      <Textarea
                        id="docDescription"
                        name="docDescription"
                        value={documentForm.docDescription}
                        onChange={handleDocumentChange}
                        placeholder="Deskripsi dokumen"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori Dokumen</Label>
                      <Select value={documentForm.category} onValueChange={handleDocumentCategoryChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Upload Dokumen Pendukung</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            Klik untuk upload atau drag & drop file di sini
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            PDF, Word, Excel, JPG, PNG (Max. 10MB, Maksimal 4 file)
                          </p>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                            onChange={handleDocumentFileChange}
                            className="hidden"
                            id="docFile"
                            name="docFile"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('docFile')?.click()}
                            disabled={documentFiles.length >= 4}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Pilih File
                          </Button>
                          {documentFiles.length >= 4 && (
                            <p className="text-xs text-orange-600 mt-2">
                              Maksimal 4 file tercapai
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {documentFiles.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">File yang Dipilih ({documentFiles.length}/4):</Label>
                          <div className="space-y-2">
                            {documentFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm truncate max-w-xs">{file.name}</span>
                                  <span className="text-xs text-gray-500">
                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDocumentFile(index)}
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
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#26316c] hover:bg-[#1e2459]"
                      disabled={documentLoading}
                    >
                      {documentLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mengupload...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Dokumen
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Document Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Cek Status Dokumen</CardTitle>
                  <CardDescription>
                    Lacak status dokumen menggunakan nomor dokumen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleTrackDocument} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="docNumber">Nomor Dokumen</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="docNumber"
                          value={docNumber}
                          onChange={(e) => setDocNumber(e.target.value)}
                          placeholder="DOC-YYYYMM-00000"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#26316c] hover:bg-[#1e2459]"
                      disabled={documentTrackingLoading}
                    >
                      {documentTrackingLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mencari...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Cek Status
                        </>
                      )}
                    </Button>
                  </form>
                  
                  {documentTrackingError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{documentTrackingError}</AlertDescription>
                    </Alert>
                  )}
                  
                  {documentTrackingInfo && (
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Detail Arsip</h3>
                            <Badge className={getStatusColor(documentTrackingInfo.docNumber)}>
                              {getStatusText(documentTrackingInfo.docNumber)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Nomor:</span>
                              <p className="text-muted-foreground">{documentTrackingInfo.docNumber}</p>
                            </div>
                            <div>
                              <span className="font-medium">Tanggal:</span>
                              <p className="text-muted-foreground">
                                {new Date(documentTrackingInfo.createdAt).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Nama Dokumen:</span>
                              <p className="text-muted-foreground">{documentTrackingInfo.title}</p>
                            </div>
                            <div>
                              <span className="font-medium">Kategori:</span>
                              <p className="text-muted-foreground">{documentTrackingInfo.category}</p>
                            </div>
                            <div>
                              <span className="font-medium">Ukuran File:</span>
                              <p className="text-muted-foreground">{documentTrackingInfo.fileSize ? formatFileSize(documentTrackingInfo.fileSize) : '-'}</p>
                            </div>
                            <div>
                              <span className="font-medium">Diterbitkan oleh:</span>
                              <p className="text-muted-foreground">{documentTrackingInfo.issuedBy || '-'}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium">Deskripsi:</span>
                              <p className="text-muted-foreground">{documentTrackingInfo.description || '-'}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium">Nama File:</span>
                              <div className="mt-1">
                                {documentTrackingInfo.fileName ? (
                                  documentTrackingInfo.fileUrl ? (
                                    <a 
                                      href={documentTrackingInfo.fileUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-xs break-all flex items-center gap-1"
                                    >
                                      <FileText className="w-3 h-3" />
                                      {documentTrackingInfo.fileName}
                                    </a>
                                  ) : (
                                    <p className="text-muted-foreground text-xs break-all">{documentTrackingInfo.fileName}</p>
                                  )
                                ) : (
                                  <p className="text-muted-foreground text-xs">-</p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {documentTrackingInfo.adminNotes && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm font-medium text-blue-800 mb-1">Catatan Admin:</p>
                              <p className="text-sm text-blue-700">{documentTrackingInfo.adminNotes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>



        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* School Info */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-4">
                {schoolData?.logo ? (
                  <img 
                    src={schoolData.logo} 
                    alt={schoolData.name}
                    className="w-8 h-8 rounded-full bg-white p-1 object-contain mr-2"
                  />
                ) : (
                  <MessageSquare className="w-6 h-6 text-[#26316c] mr-2" />
                )}
                <h3 className="text-lg font-bold">
                  {schoolData?.name || 'Sistem Manajemen Sekolah'}
                </h3>
              </div>
              {schoolData?.motto && (
                <p className="text-gray-500 text-sm italic">
                  "{schoolData.motto}"
                </p>
              )}
            </div>

            {/* Contact Info */}
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold mb-4">Kontak</h4>
              <div className="space-y-2 text-gray-400">
                {schoolData?.address && (
                  <p className="text-sm">
                    📍 {schoolData.address}
                  </p>
                )}
                {schoolData?.phone && (
                  <p className="text-sm">
                    📞 {schoolData.phone}
                  </p>
                )}
                {schoolData?.email && (
                  <p className="text-sm">
                    📧 {schoolData.email}
                  </p>
                )}
                {schoolData?.website && (
                  <p className="text-sm">
                    🌐 <a href={schoolData.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                      {schoolData.website}
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Leadership */}
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold mb-4">Kepemimpinan</h4>
              {schoolData?.principal && (
                <div className="space-y-2 text-gray-400">
                  <p className="text-sm">
                    👔 Kepala Sekolah
                  </p>
                  <p className="font-medium">{schoolData.principal}</p>
                </div>
              )}
              {schoolData?.vicePrincipal && (
                <div className="space-y-2 text-gray-400 mt-4">
                  <p className="text-sm">
                    👔 Wakil Kepala Sekolah
                  </p>
                  <p className="font-medium">{schoolData.vicePrincipal}</p>
                </div>
              )}
              
              {/* Visi & Misi */}
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <h5 className="text-sm font-semibold text-gray-300">🎯 Visi</h5>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {schoolData?.vision || 'Menjadi sekolah unggulan yang menghasilkan lulusan berkarakter, berprestasi, dan berdaya saing global.'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h5 className="text-sm font-semibold text-gray-300">📋 Misi</h5>
                  <ul className="text-xs text-gray-400 space-y-1 leading-relaxed">
                    {(() => {
                      const missionData = schoolData?.mission;
                      let missionItems: string[] = [];
                      
                      if (Array.isArray(missionData)) {
                        missionItems = missionData;
                      } else if (typeof missionData === 'string') {
                        try {
                          // Coba parse sebagai JSON array
                          const parsed = JSON.parse(missionData);
                          if (Array.isArray(parsed)) {
                            missionItems = parsed;
                          } else {
                            // Jika bukan array, pecah berdasarkan newline atau semicolon
                            missionItems = missionData.split(/[\n;]+/).filter(item => item.trim());
                          }
                        } catch {
                          // Jika gagal parse JSON, pecah berdasarkan newline atau semicolon
                          missionItems = missionData.split(/[\n;]+/).filter(item => item.trim());
                        }
                      }
                      
                      return missionItems.length > 0 ? (
                        missionItems.map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{item.trim()}</span>
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Menyelenggarakan pendidikan berkualitas dengan kurikulum yang relevan</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Mengembangkan potensi siswa melalui kegiatan ekstrakurikuler</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Membangun karakter siswa yang berintegritas dan bertanggung jawab</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Meningkatkan kompetensi guru dan staf pendukung</span>
                          </li>
                        </>
                      );
                    })()}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} {schoolData?.name || 'Sistem Manajemen Sekolah'}. All rights reserved.</p>
            <p className="mt-2">
              Powered by{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300">
                School Management System
              </a>
            </p>
          </div>
        </div>
      </footer>
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}
