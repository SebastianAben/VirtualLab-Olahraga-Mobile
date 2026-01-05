# Virtual Lab Olahraga - Mobile Application

## Deskripsi Proyek

**Virtual Lab Olahraga** adalah sebuah aplikasi mobile berbasis simulasi yang dirancang untuk mendukung pembelajaran dalam bidang Ilmu Keolahragaan (Sport Science). Aplikasi ini bertujuan untuk memberikan pemahaman mendalam mengenai dinamika detak jantung (*heart rate*) dan zona latihan (*training zones*) melalui pendekatan interaktif dan *real-time*.

Aplikasi ini memungkinkan pengguna untuk:
- Melakukan simulasi aktivitas fisik (Rest, Jog, Sprint) dan memantau perubahan detak jantung secara *real-time*.
- Mempelajari materi edukasi melalui modul *Learning Chapter*.
- Menganalisis hasil simulasi berdasarkan zona intensitas latihan.
- Mengelola profil pengguna dan riwayat aktivitas.

Proyek ini dikembangkan sebagai bagian dari tugas mata kuliah **Pengembangan Web dan Aplikasi Mobile (II3160)**.

## Teknologi yang Digunakan (*Tech Stack*)

Aplikasi ini dibangun menggunakan arsitektur *client-server* modern dengan teknologi berikut:

### Frontend (Mobile & Web)
- **Framework:** React Native (via Expo SDK 50+)
- **Language:** TypeScript
- **State Management & Navigation:** React Hooks, React Navigation
- **Visualization:** React Native SVG (untuk grafik detak jantung real-time)
- **Communication:** Socket.io-client (untuk komunikasi data real-time dengan server)

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Real-time Engine:** Socket.io (WebSocket)
- **Database:** MongoDB (menyimpan data user, histori simulasi, dan materi pembelajaran)
- **Authentication:** JWT (JSON Web Token)

### DevOps & Infrastructure
- **Containerization:** Docker & Docker Compose
- **Cloud Provider:** Google Cloud Platform (GCP) Compute Engine

---

## Anggota Kelompok

Berikut adalah pembagian tugas dan tanggung jawab anggota tim dalam pengembangan proyek ini:

| Nama | NIM | Tugas dan Tanggung Jawab |
| :--- | :--- | :--- |
| **Keane Putra Lim** | 18223056 | • Mengembangkan antarmuka utama (*Frontend Main UI*).<br>• Mengimplementasikan logika fitur simulasi latihan.<br>• Mengembangkan fitur *Toggle Dark/Light Mode*.<br>• Penyusunan laporan dokumentasi proyek. |
| **Sebastian Albern Nugroho** | 18223074 | • Mengembangkan modul *Learning Chapter*.<br>• Melakukan integrasi antara Frontend dan Backend.<br>• Mengimplementasikan komunikasi *Real-time* (WebSocket).<br>• Melakukan *Deployment* aplikasi dan server.<br>• Penyusunan laporan dokumentasi proyek. |

---

## Akses Publik

Platform ini dapat diakses secara publik pada alamat berikut:

**URL:** `http://34.177.95.61`

---

## Panduan Instalasi & Menjalankan Aplikasi (Lokal)

Anda dapat menjalankan proyek ini menggunakan dua metode: **Docker Compose** (Otomatis & Full Stack) atau **Manual (npm)**.

### Metode 1: Menggunakan Docker Compose (Disarankan)
Metode ini akan menjalankan **Backend** dan **Frontend (Versi Web)** sekaligus dalam container yang terisolasi.

**Prasyarat:**
- Docker Desktop & Docker Compose sudah terinstal.

**Langkah-langkah:**
1. Clone repositori ini.
2. Buat file `.env` di root direktori (sejajar dengan `docker-compose.yml`) dan isi konfigurasi:
   ```env
   PORT=5001
   MONGODB_URI=<URI MongoDB Atlas Anda>
   JWT_SECRET=rahasia_anda
   EXPO_PUBLIC_API_URL=http://localhost:5001
   ```
3. Jalankan perintah berikut di terminal:
   ```bash
   docker-compose up --build
   ```
4. Akses aplikasi melalui browser:
   - **Frontend (Web App):** `http://localhost` (Port 80)
   - **Backend API:** `http://localhost:5001`

---

### Metode 2: Instalasi Manual (npm) & Expo Go

Gunakan metode ini jika Anda ingin menjalankan aplikasi di **HP Android/iOS** menggunakan Expo Go, atau mengembangkan kode secara aktif.

**Prasyarat:**
- Node.js (Versi 18+)
- MongoDB (Lokal atau Cloud)
- Aplikasi **Expo Go** di HP Anda.

**1. Menjalankan Backend**
1. Masuk ke direktori backend:
   ```bash
   cd backend
   ```
2. Instal dependensi dan jalankan server:
   ```bash
   npm install
   npm start
   ```

**2. Menjalankan Mobile App (Expo Go)**
1. Buka terminal baru dan masuk ke direktori mobile:
   ```bash
   cd mobile
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Buat file `.env` di folder `mobile/` dan arahkan ke IP server backend Anda:
   ```env
   # Gunakan IP Address Laptop (bukan localhost) agar bisa diakses dari HP
   EXPO_PUBLIC_API_URL=http://192.168.1.XX:5001 
   ```
4. Jalankan Expo Development Server:
   ```bash
   npx expo start
   ```
5. Scan QR Code yang muncul menggunakan aplikasi **Expo Go**.

---

## Lisensi
Proyek ini dibuat untuk tujuan pendidikan di Institut Teknologi Bandung. Hak cipta sepenuhnya milik tim pengembang.