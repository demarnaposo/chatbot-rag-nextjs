# Next.js RAG Chatbot (Gemini + Vector DB)

Project ini adalah aplikasi Chatbot pintar berbasis RAG (Retrieval-Augmented Generation) yang dibangun menggunakan **Next.js**, **Gemini API (Google GenAI)**, dan **Vector Database** untuk kebutuhan basis pengetahuan (knowledge base).

---

## 🚀 Panduan Memulai (Getting Started)


Ikuti langkah-langkah di bawah ini secara berurutan untuk menjalankan project ini di lingkungan lokal Anda:
```bash

1. Clone Repository
Pertama, silakan clone project ini dan masuk ke dalam foldernya:

git clone [https://github.com/demarnaposo/chatbot-rag-nextjs.git](https://github.com/demarnaposo/chatbot-rag-nextjs.git)
cd chatbot-rag-nextjs



2. Setup Environment Variables (.env)
Buat sebuah file baru bernama .env di root folder project Anda (sejajar dengan package.json), lalu isi dengan API Key dan konfigurasi database yang Anda gunakan:

Cuplikan kode
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Konfigurasi Astra DB
ASTRA_DB_NAMESPACE=default
ASTRA_DB_APPLICATION_TOKEN=your_astra_token
ASTRA_DB_API_ENDPOINT=your_astra_endpoint
ASTRA_DB_COLLECTION=your_collection_name
3. Install Dependencies
Jalankan perintah berikut untuk mengisntall semua library yang dibutuhkan:

💡 Catatan Penting: Project ini menggunakan file .npmrc dengan konfigurasi legacy-peer-deps=true untuk menghindari konflik versi pada ekosistem library AI/LangChain. Anda cukup menjalankan perintah standar berikut:

Bash
npm install
(Opsional) Jika Anda menggunakan script Puppeteer untuk scraping data (dynamic seeding), jalankan perintah ini setelah instalasi selesai untuk memastikan binary browser Chrome terpasang dengan benar:

Bash
npm run install:chrome
4. Menjalankan Database Seed (npm run seed)
Sebelum menjalankan aplikasi, Anda perlu mengisi data pengetahuan ke dalam Vector DB terlebih dahulu dengan menjalankan script seeding (proses membaca dokumen, membuat embedding via Gemini, dan menyimpannya ke database):

Bash
npm run seed
Silakan tunggu sampai proses seeding selesai dan log menunjukkan data telah berhasil masuk ke database.

5. Jalankan Development Server
Setelah database terisi, sekarang Anda dapat menjalankan aplikasi Next.js:

Bash
npm run dev
Buka http://localhost:3000 di browser Anda untuk mencoba aplikasi chatbot tersebut.

🛠️ Tech Stack & Arsitektur
Framework: Next.js (App Router)

AI Model: Google GenAI SDK (gemini-embedding-001 & Gemini Pro/Flash)

Orchestration: LangChain / Text Splitters

Vector Database Options: Datastax Astra DB

📖 Dokumen Pendukung
Untuk mempelajari lebih lanjut tentang teknologi yang digunakan di project ini:

Next.js Documentation - Fitur dan API Next.js.

Google GenAI Docs - Dokumentasi API Gemini.
