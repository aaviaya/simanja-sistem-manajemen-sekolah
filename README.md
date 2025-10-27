# SIMANJA - Sistem Manajemen Sekolah

SiManja adalah platform manajemen sekolah berbasis web yang dirancang untuk mempermudah pengelolaan administrasi dan komunikasi di lingkungan sekolah. Dengan tampilan yang ramah, ringan, dan mudah digunakan, SiManja membantu guru, siswa, dan tenaga administrasi menjalankan kegiatan sekolah dengan lebih teratur dan efisien.

## 🌟 Fitur Utama

### 📝 **Sistem Pengaduan**
Platform untuk menampung aspirasi dan pengaduan dari seluruh warga sekolah:

- **Formulir Pengaduan** - Interface yang user-friendly dengan validasi lengkap
- **Kategori Lengkap** - Akademik, Fasilitas, Layanan, dan lainnya
- **Auto-Generated Ticket** - Nomor tiket otomatis format `REQ-YYYYMM-00000`
- **Tracking System** - Lacak status pengaduan secara real-time
- **UUID System** - Setiap pengaduan memiliki identifier unik
- **Responsive Design** - Optimal di semua perangkat

### 📄 **Surat Menyurat**
Manajemen surat masuk dan keluar yang terintegrasi:

- **Formulir Surat** - Pembuatan surat resmi dengan template
- **Nomor Surat Otomatis** - Format `LET-YYYYMM-00000`
- **Kategori Surat** - Berbagai jenis surat sekolah
- **Tracking Status** - Monitor proses surat
- **Evidence Upload** - Lampirkan dokumen pendukung
- **Digital Archive** - Arsip surat terdigitalisasi

### 📁 **Arsip Dokumen**
Sistem manajemen dokumen sekolah yang modern:

- **Upload Dokumen** - Drag & drop interface yang intuitif
- **Multi-format Support** - PDF, Word, Excel, Images
- **Nomor Dokumen Unik** - Format `DOC-YYYYMM-00000`
- **File Management** - Organisir dokumen dengan mudah
- **Search & Filter** - Cari dokumen berdasarkan kriteria
- **Secure Storage** - Penyimpanan yang aman dan terstruktur

### 🔐 **Admin Panel**
Dashboard administratif yang powerful:

- **Authentication System** - Login dengan JWT token security
- **Analytics Dashboard** - Statistik real-time dan visualisasi data
- **CRUD Operations** - Kelola semua data dengan mudah
- **Advanced Filtering** - Filter berdasarkan status, kategori, tanggal
- **Status Management** - Update progress pengaduan dan surat
- **Priority Control** - Atur prioritas setiap item
- **Admin Notes** - Tambahkan catatan internal
- **Export Data** - Generate laporan dan analisis

### 🏫 **Profil Sekolah**
Informasi sekolah yang terintegrasi:

- **School Identity** - Nama, logo, motto, dan deskripsi
- **Contact Information** - Alamat, telepon, email, website
- **Leadership Info** - Kepala sekolah dan wakil kepala sekolah
- **Vision & Mission** - Visi dan misi sekolah (database-driven)
- **Dynamic Content** - Update langsung dari admin panel

## 🛠️ Teknologi yang Digunakan

### Frontend Stack
- **Framework**: Next.js 15 dengan App Router
- **Language**: TypeScript 5 untuk type safety
- **Styling**: Tailwind CSS 4 dengan custom design
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React icons
- **State Management**: Zustand + TanStack Query

### Backend Stack
- **API**: Next.js API Routes
- **Database**: Prisma ORM dengan SQLite
- **Authentication**: JWT token system
- **File Upload**: Multer untuk file handling
- **Real-time**: Socket.IO untuk live updates

### Development Tools
- **Code Quality**: ESLint + Prettier
- **Type Safety**: Strict TypeScript configuration
- **Build System**: Next.js optimized builds
- **Development Server**: Hot reload dengan fast refresh

## 🚀 Cara Akses

### 1. Halaman Publik
- **URL**: `http://localhost:3000`
- **Fungsi**: 
  - Submit pengaduan
  - Buat surat menyurat
  - Upload dokumen arsip
  - Tracking status
- **Akses**: Terbuka untuk umum

### 2. Admin Panel
- **URL**: `http://localhost:3000/admin`
- **Login Default**:
  - Email: `admin@shb.sch.id`
  - Password: `admin123`
- **Features**: Full administrative access

## 📊 Struktur Database

### Tabel Users
```sql
- id (String, Primary Key, UUID)
- email (String, Unique)
- name (String, Optional)
- role (String: user/admin)
- createdAt (DateTime)
- updatedAt (DateTime)
```

### Tabel School
```sql
- id (String, Primary Key, UUID)
- name (String, Unique)
- description (String, Optional)
- address (String, Optional)
- phone (String, Optional)
- email (String, Optional)
- website (String, Optional)
- logo (String, Optional)
- principal (String, Optional)
- motto (String, Optional)
- vision (String, Optional)
- mission (String, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)
```

### Tabel Complaints
```sql
- id (String, Primary Key, UUID)
- uuid (String, Unique)
- ticketNo (String, Unique) - Format: REQ-YYYYMM-00000
- name (String)
- email (String)
- phone (String, Optional)
- category (String) - academic/facility/service/other
- subject (String)
- description (String)
- status (String) - pending/in_progress/completed/rejected
- priority (String) - low/medium/high
- adminNotes (String, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)
```

### Tabel Letters
```sql
- id (String, Primary Key, UUID)
- uuid (String, Unique)
- letterNo (String, Unique) - Format: LET-YYYYMM-00000
- type (String) - masuk/keluar
- category (String)
- subject (String)
- description (String)
- sender (String)
- recipient (String)
- senderEmail (String)
- date (String)
- status (String) - pending/in_progress/completed/rejected
- priority (String) - low/medium/high
- evidenceImages (String, Optional)
- adminNotes (String, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)
```

### Tabel DocumentArchive
```sql
- id (String, Primary Key, UUID)
- docNumber (String, Unique) - Format: DOC-YYYYMM-00000
- docName (String)
- docDescription (String, Optional)
- fileName (String)
- fileSize (Integer)
- fileType (String)
- filePath (String)
- status (String) - pending/in_progress/completed/rejected
- adminNotes (String, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)
```

## 🔌 API Endpoints

### Public API
- `POST /api/complaints` - Buat pengaduan baru
- `GET /api/complaints` - List pengaduan dengan filter
- `POST /api/letters` - Buat surat baru
- `GET /api/letters` - List surat dengan filter
- `POST /api/documents` - Upload dokumen baru
- `GET /api/documents` - List dokumen dengan filter
- `GET /api/school` - Get informasi sekolah

### Tracking API
- `GET /api/complaints/track?ticketNo={ticketNo}` - Track pengaduan
- `GET /api/letters/track?letterNo={letterNo}` - Track surat
- `GET /api/documents/track?docNumber={docNumber}` - Track dokumen

### Admin API
- `POST /api/admin/auth/login` - Login admin
- `GET /api/complaints/[uuid]` - Detail pengaduan
- `PUT /api/complaints/[uuid]` - Update pengaduan
- `DELETE /api/complaints/[uuid]` - Hapus pengaduan
- `GET /api/letters/[uuid]` - Detail surat
- `PUT /api/letters/[uuid]` - Update surat
- `DELETE /api/letters/[uuid]` - Hapus surat
- `GET /api/documents/[id]` - Detail dokumen
- `PUT /api/documents/[id]` - Update dokumen
- `DELETE /api/documents/[id]` - Hapus dokumen
- `POST /api/school` - Update informasi sekolah

## 🎨 Fitur UI/UX

### Design System
- **Modern Interface**: Clean dan professional design
- **Responsive Layout**: Mobile-first approach
- **Color Scheme**: Consistent brand colors
- **Typography**: Hierarki yang jelas dan readable
- **Micro-interactions**: Smooth animations dan transitions
- **Loading States**: Informative loading indicators
- **Error Handling**: User-friendly error messages

### Accessibility
- **Semantic HTML**: Proper heading structure
- **ARIA Support**: Screen reader compatibility
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG compliant colors
- **Focus Management**: Clear focus indicators

## 📋 Cara Penggunaan

### Untuk Pengguna Umum:
1. **Buka halaman utama** `http://localhost:3000`
2. **Pilih layanan** yang dibutuhkan (Pengaduan/Surat/Dokumen)
3. **Isi formulir** dengan data lengkap
4. **Upload file** jika diperlukan
5. **Submit dan simpan** nomor tracking
6. **Monitor status** secara real-time

### Untuk Admin:
1. **Login ke admin panel** `http://localhost:3000/admin`
2. **Gunakan kredensial** yang tersedia
3. **Dashboard analytics** untuk overview
4. **Kelola entries** dari masing-masing module
5. **Update status** dan tambahkan catatan
6. **Generate reports** untuk analisis

## 🔒 Keamanan

- **JWT Authentication**: Token-based authentication untuk admin
- **Input Validation**: Comprehensive validation dan sanitization
- **SQL Injection Prevention**: Prisma ORM protection
- **CORS Protection**: Cross-origin resource sharing control
- **File Upload Security**: File type dan size validation
- **XSS Prevention**: Output sanitization dan escaping
- **Rate Limiting**: Dapat ditambahkan untuk API protection

## 🚀 Deployment

### Platform Support
- **Vercel** (Recommended untuk Next.js)
- **Netlify** dengan serverless functions
- **Railway** untuk full-stack deployment
- **Digital Ocean App Platform**
- **AWS Amplify** atau **Google Cloud Run**

### Environment Variables
```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Build Commands
```bash
npm install
npm run build
npm start
```

## 🔮 Future Enhancements

### Short Term
- **Email Notifications** - Status update notifications
- **SMS Integration** - WhatsApp/SMS alerts
- **Advanced Reporting** - Charts dan analytics
- **File Preview** - Inline document preview
- **Bulk Operations** - Multiple items processing

### Long Term
- **Mobile App** - React Native mobile application
- **Multi-language Support** - Bahasa Indonesia & English
- **ERP Integration** - Integration dengan sistem lain
- **AI Features** - Smart categorization dan routing
- **Video Conferencing** - Integrated meeting system
- **Parent Portal** - Dedicated parent access

## 📞 Support

Untuk bantuan dan pertanyaan mengenai SIMANJA:
- **Email**: support@simanja.sch.id
- **Documentation**: [Link ke dokumentasi]
- **Bug Reports**: [Link ke issue tracker]
- **Feature Requests**: [Link ke feature request]

## 📄 License

MIT License - Copyright © 2025 SIMANJA Team

---

**SIMANJA** - *Simplifying School Management, Empowering Education* 🎓