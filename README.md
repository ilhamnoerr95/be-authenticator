# BE Authenticator

Dedicated Two-Factor Authentication (2FA) service berbasis TOTP (Time-based One-Time Password). Berfungsi sebagai server 2FA terpusat yang bisa dipakai oleh banyak aplikasi berbeda.

---

## Daftar Isi

- [Cara Setup & Jalankan](#cara-setup--jalankan)
- [Cara Daftarkan Aplikasi (ClientApp)](#cara-daftarkan-aplikasi-clientapp)
- [Alur Lengkap Penggunaan 2FA](#alur-lengkap-penggunaan-2fa)
- [API Reference](#api-reference)
- [Diagram Arsitektur](#diagram-arsitektur)
- [Catatan Keamanan](#catatan-keamanan)
- [Development](#development)

---

## Cara Setup & Jalankan

### 1. Clone & Install

```bash
git clone <repo-url>
cd be-authenticator
pnpm install
```

### 2. Setup Environment

Buat file `.env` di root project:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/be_authenticator"
ENCRYPTION_KEY="<64-karakter-hex>"   # generate: openssl rand -hex 32
APP_NAME="MyApp Authenticator"
PORT=3000
```

### 3. Setup Database

```bash
# Jalankan semua migration
pnpm prisma migrate deploy

# Generate Prisma client
pnpm prisma generate
```

### 4. Jalankan Server

```bash
# Development (hot reload)
pnpm start:dev

# Production
pnpm build
pnpm start:prod
```

Server berjalan di `http://localhost:3000`  
Swagger docs di `http://localhost:3000/api/docs`

---

## Cara Daftarkan Aplikasi (ClientApp)

Setiap aplikasi yang ingin menggunakan 2FA service ini perlu memiliki `clientId` dan `clientSecret`. Ini dilakukan **satu kali** saat onboarding aplikasi baru.

Masukkan data ke tabel `ClientApp` di database (bisa via Prisma Studio atau SQL langsung):

```sql
INSERT INTO "ClientApp" (id, name, "clientId", "clientSecret", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Nama Aplikasi Saya',
  'my-app-client-id',
  'my-app-client-secret-yang-kuat',
  NOW(),
  NOW()
);
```

Atau gunakan Prisma Studio:

```bash
pnpm prisma studio
# Buka http://localhost:5555, masuk ke tabel ClientApp, tambah record baru
```

Simpan `clientId` dan `clientSecret` di secret manager aplikasi Anda. Dua nilai ini wajib dikirim di setiap request ke BE Authenticator.

---

## Alur Lengkap Penggunaan 2FA

### Gambaran Besar

```
User                  Frontend (FE)          Backend Aplikasi (BE)     BE Authenticator
 │                        │                          │                        │
 │  1. Klik "Aktifkan 2FA"│                          │                        │
 │──────────────────────> │                          │                        │
 │                        │ 2. POST /enable-2fa      │                        │
 │                        │ ──────────────────────> │                        │
 │                        │                          │ 3. POST /api/v1/two-factors/setup
 │                        │                          │ ─────────────────────────────> │
 │                        │                          │                        │ 4. Generate secret,
 │                        │                          │                        │    QR code, backup codes
 │                        │                          │ <───────────────────────────── │
 │                        │ 5. Return QR code        │                        │
 │                        │ <────────────────────── │                        │
 │  6. Tampilkan QR code  │                          │                        │
 │  <─────────────────── │                          │                        │
 │                        │                          │                        │
 │  7. Scan QR dengan     │                          │                        │
 │     Google Auth App    │                          │                        │
 │                        │                          │                        │
 │  8. Masukkan kode OTP  │                          │                        │
 │  (6 digit dari app)    │                          │                        │
 │──────────────────────> │                          │                        │
 │                        │ 9. POST /verify-2fa      │                        │
 │                        │ ──────────────────────> │                        │
 │                        │                          │ 10. POST /api/v1/two-factors/verify
 │                        │                          │ ─────────────────────────────> │
 │                        │                          │                        │ 11. Validasi OTP,
 │                        │                          │                        │     aktifkan 2FA
 │                        │                          │ <───────────────────────────── │
 │                        │ 12. 2FA aktif!           │                        │
 │  <─────────────────── │                          │                        │
```

---

### Fase 1: Register User

Sebelum bisa setup 2FA, user harus terdaftar di BE Authenticator. Ini biasanya dilakukan saat user pertama kali login atau daftar di aplikasi Anda.

**Di BE Aplikasi Anda**, panggil:

```http
POST http://localhost:3000/api/v1/auth/register
x-client-id: my-app-client-id
x-client-secret: my-app-client-secret-yang-kuat
Content-Type: application/json

{
  "email": "budi@gmail.com",
  "username": "budi",
  "externalUserId": "user-id-di-database-aplikasi-anda"
}
```

Response:
```json
{
  "userId": "uuid-internal-di-authenticator",
  "email": "budi@gmail.com",
  "username": "budi",
  "clientAppId": "uuid-client-app",
  "isTwoFactorEnabled": false,
  "createdAt": "2026-05-20T10:00:00.000Z"
}
```

**Penting:** Simpan `userId` dari response ini di database aplikasi Anda. Ini yang akan dipakai untuk semua operasi 2FA selanjutnya.

---

### Fase 2: Setup 2FA (Generate QR Code)

Dipanggil saat user klik tombol "Aktifkan 2FA" di settings profil.

**Di BE Aplikasi Anda**, panggil:

```http
POST http://localhost:3000/api/v1/two-factors/setup
x-client-id: my-app-client-id
x-client-secret: my-app-client-secret-yang-kuat
Content-Type: application/json

{
  "userId": "uuid-internal-di-authenticator"
}
```

Response:
```json
{
  "userId": "uuid-internal-di-authenticator",
  "qrCodeDataUrl": "data:image/png;base64,iVBORw0KGgo...",
  "manualEntryKey": "JBSWY3DPEHPK3PXP",
  "backupCodes": [
    "A1B2C3D4E5",
    "F6G7H8I9J0",
    "..."
  ]
}
```

**Apa yang dilakukan FE:**
- Tampilkan `qrCodeDataUrl` sebagai gambar: `<img src={qrCodeDataUrl} />`
- Tampilkan `manualEntryKey` sebagai alternatif jika tidak bisa scan QR
- Tampilkan `backupCodes` dan minta user menyimpannya di tempat aman (hanya muncul sekali!)

**User kemudian:**
1. Buka Google Authenticator / Authy / app TOTP apapun
2. Tap tombol "+" atau "Tambah akun"
3. Scan QR code yang ditampilkan FE

Akun akan muncul di app authenticator dan mulai generate kode 6 digit yang berganti setiap 30 detik.

---

### Fase 3: Verify & Aktifkan 2FA

Setelah scan QR, user harus memasukkan kode OTP pertama sebagai konfirmasi bahwa setup berhasil.

**Di FE:** Tampilkan form input 6 digit.

**Di BE Aplikasi Anda**, setelah terima input dari FE:

```http
POST http://localhost:3000/api/v1/two-factors/verify
x-client-id: my-app-client-id
x-client-secret: my-app-client-secret-yang-kuat
Content-Type: application/json

{
  "userId": "uuid-internal-di-authenticator",
  "token": "123456"
}
```

Response sukses:
```json
{
  "success": true,
  "message": "Two factor authentication enabled successfully"
}
```

Setelah ini, `isTwoFactorEnabled` user berubah menjadi `true`. Update juga status di database aplikasi Anda.

---

### Fase 4: Login dengan 2FA (Alur Sehari-hari)

Setelah 2FA aktif, setiap login user harus melewati 2 tahap:

**Tahap 1 — Verifikasi password** (di BE Aplikasi Anda sendiri, tidak lewat BE Authenticator):

```
User → FE → BE Aplikasi → cek password di database aplikasi
```

Jika password benar, jangan langsung berikan access token. Tandai session sebagai "pending 2FA".

**Tahap 2 — Verifikasi OTP:**

```
User buka Google Auth App → lihat kode 6 digit → masukkan di FE
```

**Di BE Aplikasi Anda**, panggil:

```http
POST http://localhost:3000/api/v1/two-factors/validate
x-client-id: my-app-client-id
x-client-secret: my-app-client-secret-yang-kuat
Content-Type: application/json

{
  "userId": "uuid-internal-di-authenticator",
  "token": "789012"
}
```

Response:
```json
{
  "valid": true
}
```

Jika `valid: true` → buat dan kirim access token ke FE.  
Jika `valid: false` → tolak login, minta user coba lagi.

---

### Fase 5: Nonaktifkan 2FA

Dipanggil saat user klik "Matikan 2FA" di settings. Butuh OTP sebagai konfirmasi keamanan.

```http
POST http://localhost:3000/api/v1/two-factors/disable
x-client-id: my-app-client-id
x-client-secret: my-app-client-secret-yang-kuat
Content-Type: application/json

{
  "userId": "uuid-internal-di-authenticator",
  "token": "345678"
}
```

Response:
```json
{
  "success": true,
  "message": "Two factor authentication disabled successfully"
}
```

---

## API Reference

Base URL: `http://localhost:3000/api/v1`

Semua endpoint butuh header:
```
x-client-id: <client-id-aplikasi>
x-client-secret: <client-secret-aplikasi>
```

### Auth

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/auth/register` | Daftarkan user baru |
| `GET` | `/auth/users` | Ambil semua user aplikasi ini |
| `GET` | `/auth/users/:userId` | Ambil detail user by ID |

### Two-Factors

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/two-factors/setup` | Mulai setup 2FA, dapat QR code |
| `POST` | `/two-factors/verify` | Konfirmasi setup dengan OTP pertama |
| `POST` | `/two-factors/validate` | Validasi OTP saat login |
| `POST` | `/two-factors/disable` | Nonaktifkan 2FA |

---

## Diagram Arsitektur

### Hubungan Antar Komponen

```
┌─────────────────────────────────────────────────────────────────┐
│                        EKOSISTEM APLIKASI                        │
│                                                                   │
│  ┌──────────────┐     ┌──────────────────────┐                  │
│  │              │     │   Backend Aplikasi A  │                  │
│  │   User       │────>│   (Node/Laravel/dll)  │──────┐           │
│  │   Browser    │     │                       │      │           │
│  │              │     │ - Kelola user         │      │           │
│  └──────────────┘     │ - Autentikasi password│      │           │
│                        │ - Business logic      │      │           │
│                        └──────────────────────┘      │           │
│                                                       │ HTTP +    │
│  ┌──────────────┐     ┌──────────────────────┐      │ x-client  │
│  │              │     │   Backend Aplikasi B  │      │ headers   │
│  │   User       │────>│   (aplikasi lain)     │──────│           │
│  │   Mobile App │     │                       │      │           │
│  │              │     └──────────────────────┘      │           │
│  └──────────────┘                                    ▼           │
│                                          ┌───────────────────┐   │
│  ┌──────────────────┐                   │                   │   │
│  │  Google Auth /   │  scan QR /        │  BE Authenticator │   │
│  │  Authy / TOTP App│  generate OTP     │                   │   │
│  │                  │<─────────────────>│  - Manage secrets │   │
│  └──────────────────┘                   │  - Generate QR    │   │
│                                          │  - Validate OTP   │   │
│                                          │                   │   │
│                                          └────────┬──────────┘   │
│                                                   │              │
│                                          ┌────────▼──────────┐   │
│                                          │    PostgreSQL DB   │   │
│                                          │                   │   │
│                                          │  - ClientApp      │   │
│                                          │  - IdentityUser   │   │
│                                          │  - TwoFactorSecret│   │
│                                          │  - UserApplication│   │
│                                          └───────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Sequence Diagram Login dengan 2FA

```
FE              BE App          BE Authenticator    Google Auth App
│               │               │                   │
│─── login ──> │               │                   │
│  (email+pass) │               │                   │
│               │─ cek password │                   │
│               │  di DB App    │                   │
│               │               │                   │
│ <─ "masukkan  │               │                   │
│     kode 2FA" │               │                   │
│               │               │                   │
│               │               │    ┌──────────────┤
│               │               │    │ User buka    │
│               │               │    │ app, lihat   │
│               │               │    │ kode 6 digit │
│               │               │    └──────────────┤
│               │               │                   │
│─ submit OTP ─>│               │                   │
│  "123456"     │               │                   │
│               │── POST /two-factors/validate ────>│
│               │   { userId, token: "123456" }     │
│               │               │                   │
│               │ <─ { valid: true } ──────────────│
│               │               │                   │
│               │ generate JWT  │                   │
│               │ access token  │                   │
│               │               │                   │
│ <── JWT ──── │               │                   │
│  (login berhasil)             │                   │
```

---

## Catatan Keamanan

1. **Jangan expose BE Authenticator ke public internet.** Ini adalah internal service — hanya BE aplikasi Anda yang boleh memanggil.

2. **Simpan `clientSecret` dengan aman.** Gunakan secret manager (AWS Secrets Manager, Vault, dsb.), jangan hardcode di code.

3. **`ENCRYPTION_KEY` harus 32 bytes (64 karakter hex).** Jika bocor, semua secret TOTP di database bisa didekripsi. Rotate key secara berkala.

4. **Backup codes hanya ditampilkan sekali** saat setup. Pastikan FE memberi tahu user untuk menyimpannya. Jika user kehilangan akses ke authenticator app dan backup codes, 2FA tidak bisa dinonaktifkan (perlu admin reset manual).

5. **Rate limiting.** Tambahkan rate limiting di endpoint `/validate` di sisi BE Aplikasi Anda untuk mencegah brute force OTP.

---

## Development

```bash
# Jalankan test
pnpm test

# Test dengan coverage
pnpm test:cov

# Prisma Studio (GUI database)
pnpm prisma studio

# Format code
pnpm format

# Lint
pnpm lint
```
