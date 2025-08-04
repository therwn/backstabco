# BACKSTAB CO - Albion Online Guild Management System

BACKSTAB CO guild'iniz için gelişmiş Black Market takip sistemi. Caerleon'dan diğer şehirlere, tüm ticaret verilerinizi tek yerden yönetin.

## 🎯 Özellikler

- **Discord Authentication**: Guild üyeleri Discord hesaplarıyla giriş yapabilir
- **Role-based Access**: Discord rollerine göre admin/player yetkilendirmesi
- **Black Market Tracking**: Caerleon Black Market itemlerini takip edin
- **Multi-city Analysis**: Diğer şehirlerdeki fiyatları karşılaştırın
- **Modern UI**: Albion Online temalı animasyonlu arayüz
- **Real-time Data**: Albion Online Data API entegrasyonu

## 🚀 Teknolojiler

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Authentication**: NextAuth.js, Discord OAuth
- **Database**: Vercel Postgres
- **Deployment**: Vercel

## 📋 Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd backstabco
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Environment Variables

`.env.local` dosyası oluşturun:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Discord OAuth
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# Discord Guild Settings
DISCORD_ADMIN_ROLE_IDS=role-id-1,role-id-2

# Database (Vercel Postgres)
POSTGRES_URL=your-vercel-postgres-url
POSTGRES_PRISMA_URL=your-vercel-postgres-prisma-url
POSTGRES_URL_NON_POOLING=your-vercel-postgres-non-pooling-url
POSTGRES_USER=your-postgres-user
POSTGRES_HOST=your-postgres-host
POSTGRES_PASSWORD=your-postgres-password
POSTGRES_DATABASE=your-postgres-database
```

### 4. Discord Application Kurulumu

1. [Discord Developer Portal](https://discord.com/developers/applications)'a gidin
2. Yeni bir uygulama oluşturun
3. OAuth2 ayarlarını yapılandırın:
   - Redirect URL: `http://localhost:3000/api/auth/callback/discord`
4. Client ID ve Client Secret'ı `.env.local` dosyasına ekleyin

### 5. Development Server'ı Başlatın

```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacak.

## 🎮 Kullanım

### 1. Discord ile Giriş
- Ana sayfada "Discord ile Başla" butonuna tıklayın
- Discord hesabınızla giriş yapın

### 2. Tablo Oluşturma
- Dashboard'da "Yeni Tablo Oluştur" butonuna tıklayın
- Tablo adını ve şifresini girin
- Item bilgilerini ekleyin

### 3. Black Market Takibi
- Caerleon'dan aldığınız itemleri girin
- Diğer şehirlerdeki fiyatları karşılaştırın
- Kar marjı hesaplamaları yapın

## 📊 API Entegrasyonları

- **Albion Online Data**: Market fiyatları ve item bilgileri
- **Discord API**: Kullanıcı kimlik doğrulama ve rol yönetimi
- **Vercel Postgres**: Veri depolama

## 🚀 Deployment

### Vercel'de Deploy

1. [Vercel](https://vercel.com)'e giriş yapın
2. GitHub repository'nizi bağlayın
3. Environment variables'ları Vercel'de ayarlayın
4. Deploy edin

### Environment Variables (Production)

Vercel'de şu environment variables'ları ayarlayın:

- `NEXTAUTH_URL`: Production URL'iniz
- `NEXTAUTH_SECRET`: Güvenli bir secret key
- `DISCORD_CLIENT_ID`: Discord Client ID
- `DISCORD_CLIENT_SECRET`: Discord Client Secret
- `DISCORD_ADMIN_ROLE_IDS`: Admin rol ID'leri (virgülle ayrılmış)
- Postgres connection string'leri

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje BACKSTAB CO guild'i için özel olarak geliştirilmiştir.

## 🆘 Destek

Sorularınız için Discord sunucumuzda #proj-backstabco kanalını kullanın.

---

**BACKSTAB CO** - Albion Online Guild Management System
