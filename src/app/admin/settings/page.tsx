'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from "sonner"
import { Toaster } from '@/components/ui/sonner'
import { 
  Shield, 
  LogOut, 
  Settings,
  School,
  Building,
  Phone,
  Mail,
  Globe,
  User,
  FileText,
  Eye,
  Edit,
  Trash2,
  Plus,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Database,
  Key,
  MessageSquare,
  Smartphone,
  Clock,
  ShieldCheck,
  RefreshCw,
  Download,
  Calendar,
  Loader2
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface SchoolData {
  id: string
  name: string
  description?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  logo?: string
  principal?: string
  motto?: string
  vision?: string
  mission?: string
  createdAt: string
  updatedAt: string
}

interface SystemSettings {
  whatsappApiToken?: string
  whatsappSender?: string
  whatsappEnabled: boolean
  autoBackupEnabled: boolean
  backupSchedule: string
}

interface ProfileData {
  adminName: string
  adminEmail: string
  adminPhone?: string
  adminRole: string
  lastLogin: string
}

export default function SettingsPage() {
  
  const [user, setUser] = useState<any>(null)
  const [school, setSchool] = useState<SchoolData | null>(null)
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    autoBackupEnabled: false,
    backupSchedule: 'daily',
    whatsappSender: '',
    whatsappEnabled: false
  })
  const [profileData, setProfileData] = useState<ProfileData>({
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminRole: 'admin',
    lastLogin: ''
  })
  const [loading, setLoading] = useState(true)
  const [isEditingSchool, setIsEditingSchool] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingSystem, setIsEditingSystem] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')
  const [activeTab, setActiveTab] = useState('identity')
  const [backupHistory, setBackupHistory] = useState<any[]>([])
  const [backupLoading, setBackupLoading] = useState(false)
  const [isWhatsAppTestDialogOpen, setIsWhatsAppTestDialogOpen] = useState(false)
  const [testPhoneNumber, setTestPhoneNumber] = useState('')
  const [isSendingTest, setIsSendingTest] = useState(false)
  
  const [schoolFormData, setSchoolFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: '',
    principal: '',
    motto: '',
    vision: '',
    mission: ''
  })
  
  const [profileFormData, setProfileFormData] = useState({
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminRole: 'admin'
  })
  
  const [systemFormData, setSystemFormData] = useState({
    whatsappApiToken: '',
    whatsappSender: '',
    whatsappEnabled: false,
    autoBackupEnabled: false,
    backupSchedule: 'daily'
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
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setProfileData({
        adminName: parsedUser.name || 'Admin User',
        adminEmail: parsedUser.email || 'admin@school.sch.id',
        adminPhone: parsedUser.phone || '',
        adminRole: parsedUser.role || 'admin',
        lastLogin: new Date().toLocaleString('id-ID')
      })
      fetchSchool()
      fetchSystemSettings()
      fetchBackupHistory()
    } catch (error) {
      router.push('/admin')
    }
  }, [router])

  const fetchSchool = async () => {
    try {
      const response = await fetch('/api/school')
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched school data:', data)
        // Get the first school or set to null if no schools exist
        setSchool(data.schools.length > 0 ? data.schools[0] : null)
      } else {
        toast.error("Gagal memuat data sekolah")
      }
    } catch (error) {
      console.error('Error fetching school:', error)
      toast.error("Gagal memuat data sekolah")
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemSettings = async () => {
    try {
      const response = await fetch('/api/system-settings')
      if (response.ok) {
        const data = await response.json()
        setSystemSettings(data)
      } else {
        toast.warning("Gagal memuat pengaturan sistem")
      }
    } catch (error) {
      console.error('Error fetching system settings:', error)
      toast.error("Gagal memuat pengaturan sistem")
    }
  }

  const fetchBackupHistory = async () => {
    setBackupLoading(true)
    try {
      console.log('Fetching backup history...')
      const response = await fetch('/api/backup')
      console.log('Backup history response status:', response.status)
      console.log('Backup history response ok:', response.ok)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Backup history data:', data)
        setBackupHistory(data.backups || [])
        console.log('Set backup history:', data.backups || [])
      } else {
        console.error('Failed to fetch backup history, status:', response.status)
        toast.error("Gagal memuat riwayat backup")
      }
    } catch (error) {
      console.error('Error fetching backup history:', error)
      toast.error("Gagal memuat riwayat backup")
    } finally {
      setBackupLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownloadBackup = async (backup: any) => {
    try {
      console.log('Attempting to download backup:', backup)
      console.log('Backup ID:', backup.id)
      console.log('Backup filename:', backup.filename)
      
      // Create download link for the backup file using query parameter
      const response = await fetch(`/api/backup/download?id=${backup.id}`)
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (response.ok) {
        const blob = await response.blob()
        console.log('Blob size:', blob.size)
        console.log('Blob type:', blob.type)
        
        if (blob.size === 0) {
          throw new Error('Downloaded file is empty')
        }
        
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = backup.filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast.success(`File ${backup.filename} berhasil diunduh`)
      } else {
        // Try to get error details from response
        let errorMessage = "Gagal mengunduh file backup"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
          console.log('Error response:', errorData)
        } catch (e) {
          console.log('Could not parse error response')
        }
        
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error(`Terjadi kesalahan saat mengunduh file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    toast.success("Anda telah berhasil logout")
    setTimeout(() => {
      router.push('/admin')
    }, 1000)
  }

  const handleEditSchool = () => {
    if (school) {
      setSchoolFormData({
        name: school.name,
        description: school.description || '',
        address: school.address || '',
        phone: school.phone || '',
        email: school.email || '',
        website: school.website || '',
        logo: school.logo || '',
        principal: school.principal || '',
        motto: school.motto || '',
        vision: school.vision || '',
        mission: school.mission || ''
      })
      setIsEditingSchool(true)
    }
  }

  const handleEditProfile = () => {
    setProfileFormData({
      adminName: profileData.adminName,
      adminEmail: profileData.adminEmail,
      adminPhone: profileData.adminPhone || '',
      adminRole: profileData.adminRole
    })
    setIsEditingProfile(true)
  }

  const handleEditSystem = () => {
    setSystemFormData({
      whatsappApiToken: systemSettings.whatsappApiToken || '',
      whatsappSender: systemSettings.whatsappSender || '',
      whatsappEnabled: systemSettings.whatsappEnabled,
      autoBackupEnabled: systemSettings.autoBackupEnabled,
      backupSchedule: systemSettings.backupSchedule
    })
    setIsEditingSystem(true)
  }

  const handleSubmitSchool = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitStatus('idle')
    setSubmitMessage('')

    // Validasi dasar
    if (!schoolFormData.name || !schoolFormData.name.trim()) {
      toast.warning("Nama sekolah tidak boleh kosong")
      return
    }

    try {
      const url = school ? `/api/school/${school.id}` : '/api/school'
      const method = school ? 'PUT' : 'POST'

      console.log('Submitting school data:', schoolFormData)
      console.log('URL:', url, 'Method:', method)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schoolFormData),
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        fetchSchool()
        setIsEditingSchool(false)
        toast.success(`Data sekolah berhasil ${school ? 'diperbarui' : 'dibuat'}`)
      } else {
        const errorData = await response.json()
        console.log('Error response:', errorData)
        toast.error(errorData.error || 'Terjadi kesalahan. Silakan coba lagi.')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error("Terjadi kesalahan. Silakan coba lagi.")
    }
  }

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitStatus('idle')
    setSubmitMessage('')

    try {
      // Simulate API call
      setProfileData(prev => ({ ...prev, ...profileFormData }))
      setIsEditingProfile(false)
      toast.success("Profile berhasil diperbarui")
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.")
    }
  }

  const handleSubmitSystem = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitStatus('idle')
    setSubmitMessage('')

    // Validation: Check if WhatsApp is enabled but API key or sender is empty
    if (systemFormData.whatsappEnabled && (!systemFormData.whatsappApiToken?.trim() || !systemFormData.whatsappSender?.trim())) {
      toast.warning("Silakan lengkapi API Key dan Sender Number terlebih dahulu sebelum mengaktifkan layanan WhatsApp.")
      return
    }

    // Additional validation: If API fields are filled, they should be valid
    if (systemFormData.whatsappApiToken?.trim() && !systemFormData.whatsappSender?.trim()) {
      toast.warning("Silakan lengkapi Sender Number jika Anda sudah mengisi API Key.")
      return
    }

    if (!systemFormData.whatsappApiToken?.trim() && systemFormData.whatsappSender?.trim()) {
      toast.warning("Silakan lengkapi API Key jika Anda sudah mengisi Sender Number.")
      return
    }

    // NEW VALIDATION: Prevent saving completely empty API configuration
    // If both fields are empty, show toast notification
    if (!systemFormData.whatsappApiToken?.trim() && !systemFormData.whatsappSender?.trim()) {
      toast.warning("Anda akan menyimpan konfigurasi API dengan data kosong. Ini akan menonaktifkan layanan WhatsApp.")
      return
    }

    try {
      // Save to API
      const response = await fetch('/api/system-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(systemFormData),
      })

      if (response.ok) {
        const oldSettings = { ...systemSettings }
        setSystemSettings(prev => ({ ...prev, ...systemFormData }))
        setIsEditingSystem(false)
        
        // Reset API status if tokens were changed
        if (oldSettings.whatsappApiToken !== systemFormData.whatsappApiToken) {
          // WhatsApp API status reset logic can be added here if needed
        }
        
        toast.success("Pengaturan sistem berhasil diperbarui")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Gagal menyimpan pengaturan sistem')
      }
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.")
    }
  }

  const handleSchoolInputChange = (field: string, value: string) => {
    setSchoolFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleProfileInputChange = (field: string, value: string) => {
    setProfileFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSystemInputChange = (field: string, value: string | boolean) => {
    setSystemFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleBackupScheduleChange = async (value: string) => {
    try {
      // Save to API
      const response = await fetch('/api/system-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...systemSettings, backupSchedule: value }),
      })

      if (response.ok) {
        setSystemSettings(prev => ({ ...prev, backupSchedule: value }))
        toast.success(`Jadwal backup diubah menjadi ${value === 'daily' ? 'harian' : value === 'weekly' ? 'mingguan' : 'bulanan'}`)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Gagal mengubah jadwal backup')
      }
    } catch (error) {
      toast.error("Gagal mengubah jadwal backup")
    }
  }

  const handleAutoBackupToggle = async (checked: boolean) => {
    try {
      // Save to API
      const response = await fetch('/api/system-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...systemSettings, autoBackupEnabled: checked }),
      })

      if (response.ok) {
        setSystemSettings(prev => ({ ...prev, autoBackupEnabled: checked }))
        toast.success(`Auto backup ${checked ? 'diaktifkan' : 'dinonaktifkan'}`)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Gagal mengubah pengaturan auto backup')
      }
    } catch (error) {
      toast.error("Gagal mengubah pengaturan auto backup")
    }
  }

  const handleBackup = async () => {
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Backup berhasil dibuat. File: ${result.backup.filename}`)
        // Refresh backup history
        fetchBackupHistory()
      } else {
        toast.error(result.error || 'Gagal membuat backup')
      }
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.")
    }
  }

  const handleTestWhatsApp = async () => {
    if (!systemSettings.whatsappApiToken || !systemSettings.whatsappSender) {
      toast.error("API Key dan Sender Number harus diisi terlebih dahulu")
      return
    }

    // Open the dialog instead of using prompt
    setIsWhatsAppTestDialogOpen(true)
  }

  const handleSendTestWhatsApp = async () => {
    // Validate phone number format
    if (!testPhoneNumber.startsWith('08') || testPhoneNumber.length < 10) {
      toast.error("Format nomor WhatsApp tidak valid. Gunakan format: 08xxxxxxxxxx")
      return
    }

    setIsSendingTest(true)
    try {
      toast.info("Mengirim pesan test...")

      const response = await fetch('/api/test-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: systemSettings.whatsappApiToken,
          phoneNumber: testPhoneNumber,
          sender: systemSettings.whatsappSender
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`✅ Test berhasil! Pesan terkirim ke ${testPhoneNumber}`)
        console.log('WhatsApp test result:', result)
        setIsWhatsAppTestDialogOpen(false)
        setTestPhoneNumber('')
      } else {
        toast.error(`❌ Test gagal: ${result.error || 'Terjadi kesalahan'}`)
        console.error('WhatsApp test error:', result)
      }
    } catch (error) {
      console.error('Test WhatsApp error:', error)
      toast.error("Gagal melakukan test koneksi WhatsApp")
    } finally {
      setIsSendingTest(false)
    }
  }

  const handleRestore = async () => {
    // First, get available backups
    try {
      const response = await fetch('/api/restore')
      const result = await response.json()

      if (!result.success || result.backups.length === 0) {
        toast.warning("Tidak ditemukan file backup untuk di-restore")
        return
      }

      // Show confirmation with backup selection
      const latestBackup = result.backups[0]
      const confirmed = confirm(
        `Apakah Anda yakin ingin merestore data dari backup terakhir?\n\n` +
        `File: ${latestBackup.filename}\n` +
        `Tanggal: ${new Date(latestBackup.createdAt).toLocaleString('id-ID')}\n\n` +
        `PERINGATAN: Semua data saat ini akan ditimpa!`
      )

      if (!confirmed) return

      // Perform restore
      const restoreResponse = await fetch('/api/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ backupId: latestBackup.id }),
      })

      const restoreResult = await restoreResponse.json()

      if (restoreResult.success) {
        toast.success("Data berhasil di-restore. Halaman akan di-refresh.")
        
        // Refresh page after successful restore
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        toast.error(restoreResult.error || 'Gagal restore data')
      }
    } catch (error) {
      toast.error("Terjadi kesalahan. Silakan coba lagi.")
    }
  }

  const handleCancelSchool = () => {
    setIsEditingSchool(false)
    if (school) {
      setSchoolFormData({
        name: school.name,
        description: school.description || '',
        address: school.address || '',
        phone: school.phone || '',
        email: school.email || '',
        website: school.website || '',
        logo: school.logo || '',
        principal: school.principal || '',
        motto: school.motto || '',
        vision: school.vision || '',
        mission: school.mission || ''
      })
    } else {
      setSchoolFormData({
        name: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        logo: '',
        principal: '',
        motto: '',
        vision: '',
        mission: ''
      })
    }
    toast("Pengeditan data sekolah dibatalkan")
  }

  const handleCancelProfile = () => {
    setIsEditingProfile(false)
    setProfileFormData({
      adminName: profileData.adminName,
      adminEmail: profileData.adminEmail,
      adminPhone: profileData.adminPhone || '',
      adminRole: profileData.adminRole
    })
    toast("Pengeditan profile dibatalkan")
  }

  const handleCancelSystem = () => {
    setIsEditingSystem(false)
    setSystemFormData({
      whatsappApiToken: systemSettings.whatsappApiToken || '',
      whatsappSender: systemSettings.whatsappSender || '',
      whatsappEnabled: systemSettings.whatsappEnabled,
      autoBackupEnabled: systemSettings.autoBackupEnabled,
      backupSchedule: systemSettings.backupSchedule
    })
    toast("Pengeditan pengaturan sistem dibatalkan")
  }

  const maskApiKey = (key?: string) => {
    if (!key) return 'Tidak diatur'
    if (key.length <= 8) return key
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4)
  }

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
                  Admin Panel - Pengaturan
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
                <DropdownMenuItem onClick={() => router.push('/admin/dashboard')} className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Dashboard
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
        {/* Alert Messages */}
        {submitStatus !== 'idle' && (
          <Alert className={`mb-6 ${
            submitStatus === 'success' 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            {submitStatus === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={
              submitStatus === 'success' ? 'text-green-800' : 'text-red-800'
            }>
              {submitMessage}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="identity" className="flex items-center gap-2">
              <School className="w-4 h-4" />
              Identitas Sekolah
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Backup & Data
            </TabsTrigger>
            <TabsTrigger value="integration" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Integrasi Sistem
            </TabsTrigger>
          </TabsList>

          {/* Identitas Sekolah Tab */}
          <TabsContent value="identity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* School Information */}
              <div>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <School className="w-5 h-5" />
                          Data Sekolah
                        </CardTitle>
                        <CardDescription>
                          Kelola identitas dan informasi sekolah
                        </CardDescription>
                      </div>
                      {school && (
                        <Button onClick={handleEditSchool} className="flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!school ? (
                      <div className="text-center py-8">
                        <School className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Belum ada data sekolah
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Tambahkan data sekolah untuk memulai
                        </p>
                        <Button onClick={() => {
                          setSchoolFormData({
                            name: '',
                            description: '',
                            address: '',
                            phone: '',
                            email: '',
                            website: '',
                            logo: '',
                            principal: '',
                            motto: '',
                            vision: '',
                            mission: ''
                          });
                          setIsEditingSchool(true);
                        }} className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Tambah Data Sekolah
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          {school.logo ? (
                            <img 
                              src={school.logo} 
                              alt={school.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <School className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-semibold">{school.name}</h3>
                            <p className="text-sm text-gray-500">{school.description}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Alamat</Label>
                            <p className="text-sm">{school.address || '-'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Telepon</Label>
                            <p className="text-sm">{school.phone || '-'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Email</Label>
                            <p className="text-sm">{school.email || '-'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Website</Label>
                            <p className="text-sm">{school.website || '-'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Kepala Sekolah</Label>
                            <p className="text-sm">{school.principal || '-'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Motto</Label>
                            <p className="text-sm">{school.motto || '-'}</p>
                          </div>
                        </div>
                        
                        {school.vision && (
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Visi</Label>
                            <p className="text-sm mt-1">{school.vision}</p>
                          </div>
                        )}
                        
                        {school.mission && (
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Misi</Label>
                            <p className="text-sm mt-1 whitespace-pre-line">{school.mission}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Edit/Create School Form */}
              {isEditingSchool && (
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Edit className="w-5 h-5" />
                        {school ? 'Edit Data Sekolah' : 'Tambah Data Sekolah'}
                      </CardTitle>
                      <CardDescription>
                        {school ? 'Perbarui informasi sekolah' : 'Masukkan informasi sekolah baru'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitSchool} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Nama Sekolah *</Label>
                          <Input
                            id="name"
                            value={schoolFormData.name}
                            onChange={(e) => handleSchoolInputChange('name', e.target.value)}
                            required
                            placeholder="Masukkan nama sekolah"
                            className={!schoolFormData.name.trim() ? 'border-red-300 focus:border-red-500' : ''}
                          />
                          {!schoolFormData.name.trim() && (
                            <p className="text-red-500 text-sm mt-1">Nama sekolah wajib diisi</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="description">Deskripsi</Label>
                          <Textarea
                            id="description"
                            value={schoolFormData.description}
                            onChange={(e) => handleSchoolInputChange('description', e.target.value)}
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="address">Alamat</Label>
                          <Textarea
                            id="address"
                            value={schoolFormData.address}
                            onChange={(e) => handleSchoolInputChange('address', e.target.value)}
                            rows={2}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="phone">Telepon</Label>
                            <Input
                              id="phone"
                              value={schoolFormData.phone}
                              onChange={(e) => handleSchoolInputChange('phone', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={schoolFormData.email}
                              onChange={(e) => handleSchoolInputChange('email', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="website">Website</Label>
                            <Input
                              id="website"
                              value={schoolFormData.website}
                              onChange={(e) => handleSchoolInputChange('website', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="principal">Kepala Sekolah</Label>
                            <Input
                              id="principal"
                              value={schoolFormData.principal}
                              onChange={(e) => handleSchoolInputChange('principal', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="motto">Motto</Label>
                          <Input
                            id="motto"
                            value={schoolFormData.motto}
                            onChange={(e) => handleSchoolInputChange('motto', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="vision">Visi</Label>
                          <Textarea
                            id="vision"
                            value={schoolFormData.vision}
                            onChange={(e) => handleSchoolInputChange('vision', e.target.value)}
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="mission">Misi</Label>
                          <Textarea
                            id="mission"
                            value={schoolFormData.mission}
                            onChange={(e) => handleSchoolInputChange('mission', e.target.value)}
                            rows={4}
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={handleCancelSchool}>
                            Batal
                          </Button>
                          <Button type="submit" disabled={!schoolFormData.name.trim()}>
                            {school ? 'Perbarui' : 'Simpan'}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Profile Information */}
              <div>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Profile Admin
                        </CardTitle>
                        <CardDescription>
                          Kelola informasi akun admin
                        </CardDescription>
                      </div>
                      <Button onClick={handleEditProfile} className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{profileData.adminName}</h3>
                          <p className="text-sm text-gray-500 capitalize">{profileData.adminRole}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Nama Lengkap</Label>
                          <p className="text-sm">{profileData.adminName}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Email</Label>
                          <p className="text-sm">{profileData.adminEmail}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Telepon</Label>
                          <p className="text-sm">{profileData.adminPhone || '-'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Role</Label>
                          <p className="text-sm capitalize">{profileData.adminRole}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Terakhir Login</Label>
                          <p className="text-sm">{profileData.lastLogin}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Edit Profile Form */}
              {isEditingProfile && (
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Edit className="w-5 h-5" />
                        Edit Profile
                      </CardTitle>
                      <CardDescription>
                        Perbarui informasi profile admin
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitProfile} className="space-y-4">
                        <div>
                          <Label htmlFor="adminName">Nama Lengkap</Label>
                          <Input
                            id="adminName"
                            value={profileFormData.adminName}
                            onChange={(e) => handleProfileInputChange('adminName', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="adminEmail">Email</Label>
                          <Input
                            id="adminEmail"
                            type="email"
                            value={profileFormData.adminEmail}
                            onChange={(e) => handleProfileInputChange('adminEmail', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="adminPhone">Telepon</Label>
                          <Input
                            id="adminPhone"
                            value={profileFormData.adminPhone}
                            onChange={(e) => handleProfileInputChange('adminPhone', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="adminRole">Role</Label>
                          <Select 
                            value={profileFormData.adminRole} 
                            onValueChange={(value) => handleProfileInputChange('adminRole', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={handleCancelProfile}>
                            Batal
                          </Button>
                          <Button type="submit">
                            Perbarui
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Backup & Data Tab */}
          <TabsContent value="backup" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Manual Backup */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Backup Manual
                  </CardTitle>
                  <CardDescription>
                    Buat backup data secara manual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Buat backup lengkap dari semua data sistem termasuk data sekolah, pengguna, dan pengaturan.
                    </p>
                    <Button onClick={handleBackup} className="w-full flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Buat Backup Sekarang
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Restore Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Restore Data
                  </CardTitle>
                  <CardDescription>
                    Kembalikan data dari backup
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Upload file backup untuk mengembalikan data sistem ke kondisi sebelumnya.
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-2">
                        Klik untuk upload atau drag & drop
                      </p>
                      <p className="text-xs text-gray-400">
                        Format: .backup, .sql
                      </p>
                    </div>
                    <Button onClick={handleRestore} variant="outline" className="w-full flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Restore dari File
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Auto Backup Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Auto Backup Schedule
                  </CardTitle>
                  <CardDescription>
                    Atur jadwal backup otomatis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoBackup">Auto Backup</Label>
                      <Switch
                        id="autoBackup"
                        checked={systemSettings.autoBackupEnabled}
                        onCheckedChange={handleAutoBackupToggle}
                      />
                    </div>
                    
                    {systemSettings.autoBackupEnabled && (
                      <div>
                        <Label htmlFor="schedule">Jadwal</Label>
                        <Select 
                          value={systemSettings.backupSchedule} 
                          onValueChange={handleBackupScheduleChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Harian</SelectItem>
                            <SelectItem value="weekly">Mingguan</SelectItem>
                            <SelectItem value="monthly">Bulanan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      {systemSettings.autoBackupEnabled && (
                        <p>Backup akan dibuat {systemSettings.backupSchedule === 'daily' ? 'setiap hari' : systemSettings.backupSchedule === 'weekly' ? 'setiap minggu' : 'setiap bulan'} secara otomatis.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Backup History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Riwayat Backup
                </CardTitle>
                <CardDescription>
                  Daftar backup yang telah dibuat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {backupLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      <span className="ml-2 text-gray-500">Memuat riwayat backup...</span>
                    </div>
                  ) : backupHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Belum ada riwayat backup</p>
                      <p className="text-sm text-gray-400">Buat backup pertama Anda menggunakan tombol di atas</p>
                    </div>
                  ) : (
                    backupHistory.map((backup) => (
                      <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Database className={`w-4 h-4 ${backup.status === 'completed' ? 'text-green-600' : 'text-red-600'}`} />
                          <div>
                            <p className="text-sm font-medium">{backup.filename}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(backup.createdAt).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            backup.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {backup.status === 'completed' ? 'Selesai' : 'Gagal'}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {formatFileSize(backup.fileSize)}
                          </span>
                          {backup.status === 'completed' && (
                            <Button size="sm" variant="outline" onClick={() => handleDownloadBackup(backup)}>
                              <Download className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrasi Sistem Tab */}
          <TabsContent value="integration" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* API Configuration */}
              <div>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5" />
                          Konfigurasi API
                        </CardTitle>
                        <CardDescription>
                          Kelola API key untuk integrasi sistem. Test koneksi untuk memastikan API berfungsi.
                        </CardDescription>
                      </div>
                      <Button onClick={handleEditSystem} className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium text-gray-500">WhatsApp Service</Label>
                          <p className="text-xs text-gray-500">Status layanan WhatsApp notifikasi</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${systemSettings.whatsappEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={`text-sm font-medium ${systemSettings.whatsappEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                            {systemSettings.whatsappEnabled ? 'Aktif' : 'Non-aktif'}
                          </span>
                        </div>
                      </div>
                      
                      {systemSettings.whatsappEnabled && (
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-sm font-medium text-gray-500">Test Koneksi</Label>
                            <p className="text-xs text-gray-500">Uji koneksi API WhatsApp</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleTestWhatsApp}
                            className="flex items-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Test Koneksi
                          </Button>
                        </div>
                      )}
                      
                      {/* WhatsApp Test Dialog */}
                      <Dialog open={isWhatsAppTestDialogOpen} onOpenChange={setIsWhatsAppTestDialogOpen}>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Test Koneksi WhatsApp</DialogTitle>
                            <DialogDescription>
                              Masukkan nomor WhatsApp untuk mengirim pesan test
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex items-center space-x-2">
                            <div className="grid flex-1 gap-2">
                              <Label htmlFor="testPhone" className="sr-only">
                                Nomor WhatsApp
                              </Label>
                              <Input
                                id="testPhone"
                                placeholder="08xxxxxxxxxx"
                                value={testPhoneNumber}
                                onChange={(e) => setTestPhoneNumber(e.target.value)}
                                className="col-span-3"
                              />
                              <p className="text-xs text-gray-500">
                                Format: 08xxxxxxxxxx (minimal 10 digit)
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setIsWhatsAppTestDialogOpen(false)
                                setTestPhoneNumber('')
                              }}
                            >
                              Batal
                            </Button>
                            <Button 
                              type="button" 
                              onClick={handleSendTestWhatsApp}
                              disabled={isSendingTest || !testPhoneNumber.trim()}
                            >
                              {isSendingTest ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Mengirim...
                                </>
                              ) : (
                                'Kirim Test'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      {systemSettings.whatsappApiToken && (
                        <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
                          <p className="font-medium mb-1">📱 Provider: wanotif.shb.sch.id</p>
                          <p>• Status: {systemSettings.whatsappEnabled ? 'Terintegrasi' : 'Tidak aktif'}</p>
                          <p>• Sender: {systemSettings.whatsappSender || 'Belum dikonfigurasi'}</p>
                          <p>• API Key: {systemSettings.whatsappApiToken ? '✅ Terkonfigurasi' : '❌ Belum dikonfigurasi'}</p>
                        </div>
                      )}
                      
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Edit API Configuration Form */}
              {isEditingSystem && (
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Edit className="w-5 h-5" />
                        Edit Konfigurasi API
                      </CardTitle>
                      <CardDescription>
                        Perbarui API key dan token integrasi
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitSystem} className="space-y-4">
                        <div>
                          <Label htmlFor="whatsappApiToken">WhatsApp API Key (Wanotif)</Label>
                          <Input
                            id="whatsappApiToken"
                            type="password"
                            value={systemFormData.whatsappApiToken}
                            onChange={(e) => handleSystemInputChange('whatsappApiToken', e.target.value)}
                            placeholder="Masukkan API Key WhatsApp"
                            className={
                              (systemFormData.whatsappApiToken?.trim() && !systemFormData.whatsappSender?.trim()) || 
                              (systemFormData.whatsappEnabled && !systemFormData.whatsappApiToken?.trim())
                                ? 'border-red-300 focus:border-red-500' : ''
                            }
                          />
                          <p className="text-xs text-gray-500 mt-1">API Key dari wanotif.shb.sch.id • <span className="text-blue-600">Gunakan key real Anda</span></p>
                          {(systemFormData.whatsappApiToken?.trim() && !systemFormData.whatsappSender?.trim()) && (
                            <p className="text-red-500 text-sm mt-1">Sender Number juga harus diisi</p>
                          )}
                          {systemFormData.whatsappEnabled && !systemFormData.whatsappApiToken?.trim() && (
                            <p className="text-red-500 text-sm mt-1">API Key wajib diisi saat WhatsApp aktif</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="whatsappSender">WhatsApp Sender Number</Label>
                          <Input
                            id="whatsappSender"
                            type="text"
                            value={systemFormData.whatsappSender}
                            onChange={(e) => handleSystemInputChange('whatsappSender', e.target.value)}
                            placeholder="Masukkan nomor sender (08xxxxxxxxxx)"
                            className={
                              (!systemFormData.whatsappApiToken?.trim() && systemFormData.whatsappSender?.trim()) || 
                              (systemFormData.whatsappEnabled && !systemFormData.whatsappSender?.trim())
                                ? 'border-red-300 focus:border-red-500' : ''
                            }
                          />
                          <p className="text-xs text-gray-500 mt-1">Nomor sender terdaftar di Wanotif (format: 08xxxxxxxxxx)</p>
                          {(!systemFormData.whatsappApiToken?.trim() && systemFormData.whatsappSender?.trim()) && (
                            <p className="text-red-500 text-sm mt-1">API Key juga harus diisi</p>
                          )}
                          {systemFormData.whatsappEnabled && !systemFormData.whatsappSender?.trim() && (
                            <p className="text-red-500 text-sm mt-1">Sender Number wajib diisi saat WhatsApp aktif</p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="whatsappEnabled">WhatsApp Service</Label>
                            <p className="text-xs text-gray-500">Aktifkan layanan WhatsApp notifikasi</p>
                          </div>
                          <Switch
                            id="whatsappEnabled"
                            checked={systemFormData.whatsappEnabled}
                            onCheckedChange={(checked) => {
                              if (checked && (!systemFormData.whatsappApiToken?.trim() || !systemFormData.whatsappSender?.trim())) {
                                // Show toast notification that data is still empty
                                toast.warning("Silakan lengkapi API Key dan Sender Number terlebih dahulu sebelum mengaktifkan layanan WhatsApp.")
                                return;
                              }
                              handleSystemInputChange('whatsappEnabled', checked);
                            }}
                          />
                        </div>
                        
                        
                        
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={handleCancelSystem}>
                            Batal
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={
                              (systemFormData.whatsappEnabled && (!systemFormData.whatsappApiToken?.trim() || !systemFormData.whatsappSender?.trim())) ||
                              (systemFormData.whatsappApiToken?.trim() && !systemFormData.whatsappSender?.trim()) ||
                              (!systemFormData.whatsappApiToken?.trim() && systemFormData.whatsappSender?.trim()) ||
                              (!systemFormData.whatsappApiToken?.trim() && !systemFormData.whatsappSender?.trim())
                            }
                          >
                            Simpan
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Integration Status */}
            {systemSettings.whatsappEnabled && (
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Status Integrasi Notifikasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="text-green-600 mt-0.5">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-green-800 mb-1">Layanan Notifikasi Terintegrasi</h4>
                          <p className="text-xs text-green-700">
                            WhatsApp notifikasi siap digunakan. Gunakan toggle di Konfigurasi API untuk mengaktifkan/menonaktifkan layanan.
                          </p>
                        </div>
                      </div>
                    </div>
                </CardContent>
              </Card>
            </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Toaster />
    </div>
  )
}
