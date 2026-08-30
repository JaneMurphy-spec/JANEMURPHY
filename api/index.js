const fs = require("node:fs");
const path = require("node:path");
let admin = null;
try {
  admin = require("firebase-admin");
} catch (e) {
  console.warn("firebase-admin import notice in serverless:", e.message);
}

// Firebase Admin SDK Firestore Initialization
let adminDb = null;
function getAdminFirestore() {
  if (!adminDb && admin) {
    try {
      if (!admin.apps.length) {
        admin.initializeApp({
          projectId: "janemarket-official",
          databaseURL: "https://janemarket-official-default-rtdb.asia-southeast1.firebasedatabase.app"
        });
      }
      try {
        adminDb = admin.firestore();
      } catch (e1) {
        try {
          const { getFirestore } = require("firebase-admin/firestore");
          adminDb = getFirestore(admin.apps[0]);
        } catch (e2) {
          console.warn("Admin firestore fallback notice:", e2.message);
        }
      }
    } catch (err) {
      console.warn("Firebase Admin SDK init notice in serverless:", err.message);
    }
  }
  return adminDb;
}

// Embedded Default Store Data (Guarantees 100% availability in Serverless)
const DEFAULT_STORE = {
  settings: {
    storeName: "JaneMarket",
    storeTagline: "Platform Aplikasi Premium, Topup Game & Jasa Desain Terpercaya",
    whatsappNumber: "6281234567890",
    adminPin: "123456",
    qrisImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
    qrisMerchantName: "JANEMARKET OFFICIAL (QRIS ALL PAYMENT)",
    paymentMethods: [
      { id: "dana", name: "DANA", number: "081234567890", owner: "Jane Market Admin", active: true, icon: "fa-solid fa-wallet" },
      { id: "gopay", name: "GoPay", number: "081234567890", owner: "Jane Market Admin", active: true, icon: "fa-solid fa-mobile-screen" },
      { id: "ovo", name: "OVO", number: "081234567890", owner: "Jane Market Admin", active: true, icon: "fa-solid fa-coins" },
      { id: "shopeepay", name: "ShopeePay", number: "081234567890", owner: "Jane Market Admin", active: true, icon: "fa-solid fa-bag-shopping" },
      { id: "bca", name: "Bank BCA", number: "8735091234", owner: "Jane Market Official", active: true, icon: "fa-solid fa-building-columns" },
      { id: "mandiri", name: "Bank Mandiri", number: "137001928374", owner: "Jane Market Official", active: true, icon: "fa-solid fa-building-columns" },
      { id: "seabank", name: "SeaBank", number: "90192837465", owner: "Jane Market Official", active: true, icon: "fa-solid fa-building-columns" }
    ],
    promoBanner: {
      title: "🔥 FLASH SALE SPESIAL HARI INI!",
      subtitle: "Diskon hingga 50% untuk Semua Aplikasi Premium & Free Konsultasi Desain Poster!",
      badge: "GARANSI RESMI FULL PERIODE",
      buttonText: "Klaim Promo WhatsApp",
      active: true
    },
    announcement: "⚡ Proses Cepat 1-5 Menit • Garansi Ganti Akun Baru Jika Bermasalah • Pembayaran QRIS & E-Wallet Lengkap"
  },
  stats: {
    totalVisitors: 1846,
    totalRevenue: 4850000,
    totalOrders: 142
  },
  orders: [
    {
      id: "ORD-17081",
      customerName: "Rian Pratama",
      productName: "Netflix Premium 4K UHD",
      category: "Aplikasi Premium",
      variant: "1 Bulan (1 Profil Private)",
      price: 35000,
      paymentMethod: "QRIS",
      timestamp: "2026-08-17T11:20:00Z",
      status: "Selesai"
    },
    {
      id: "ORD-17080",
      customerName: "Dimas Setiawan",
      productName: "Mobile Legends: Bang Bang",
      category: "Topup Game",
      variant: "296 Diamonds (Fast)",
      price: 78000,
      paymentMethod: "DANA",
      timestamp: "2026-08-17T10:45:00Z",
      status: "Selesai"
    }
  ],
  products: [
    {
      id: "prod-1",
      name: "Netflix Premium 4K Ultra HD",
      category: "Aplikasi Premium",
      price: 35000,
      originalPrice: 65000,
      image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=80",
      soldCount: 428,
      rating: 4.9,
      badge: "BEST SELLER",
      warranty: "Garansi 30 Hari",
      description: "Akun Netflix Premium kualitas Ultra HD 4K. Anti on-hold, anti screen limit. Support Android, iOS, Smart TV, Laptop/PC.",
      variants: [
        { name: "1 Bulan (1 Profil Private - 1 Device)", price: 35000 },
        { name: "3 Bulan (1 Profil Private - 1 Device)", price: 95000 },
        { name: "1 Bulan (Akun Full 5 Profil)", price: 140000 }
      ],
      features: ["Resolusi 4K HDR", "Bisa Smart TV / HP / PC", "Private PIN Profil", "Full Garansi"]
    },
    {
      id: "prod-2",
      name: "Spotify Premium Individual",
      category: "Aplikasi Premium",
      price: 20000,
      originalPrice: 55000,
      image: "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=600&auto=format&fit=crop&q=80",
      soldCount: 356,
      rating: 4.9,
      badge: "POPULER",
      warranty: "Garansi Full",
      description: "Dengarkan musik tanpa iklan, download lagu offline unlimited, kualitas audio tertinggi (320kbps). Bisa di akun pribadi atau akun baru.",
      variants: [
        { name: "1 Bulan (Plan Famhead/Indv)", price: 20000 },
        { name: "3 Bulan (Plan Indv)", price: 55000 },
        { name: "1 Tahun (Garansi 1 Tahun)", price: 180000 }
      ],
      features: ["Bebas Iklan", "Download Offline", "Audio HQ 320kbps", "Bisa Akun Pribadi"]
    },
    {
      id: "prod-3",
      name: "Canva Pro Edu & Lifetime",
      category: "Aplikasi Premium",
      price: 15000,
      originalPrice: 45000,
      image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&auto=format&fit=crop&q=80",
      soldCount: 512,
      rating: 5,
      badge: "HOT PROMO",
      warranty: "Garansi 1 Tahun / Lifetime",
      description: "Upgrade Canva Pro langsung di email pribadi. Akses 100+ juta foto, template, hapus background 1-klik, Brand Kit, magic resize.",
      variants: [
        { name: "1 Tahun (Email Pribadi)", price: 15000 },
        { name: "Lifetime Edu (Email Pribadi)", price: 30000 },
        { name: "1 Bulan Canva Pro Team", price: 10000 }
      ],
      features: ["100M+ Aset Premium", "Hapus Background 1 Klik", "Magic Studio AI", "Gunakan Email Sendiri"]
    },
    {
      id: "prod-4",
      name: "YouTube Premium + Music",
      category: "Aplikasi Premium",
      price: 18000,
      originalPrice: 49000,
      image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80",
      soldCount: 289,
      rating: 4.8,
      badge: "GARANSI",
      warranty: "Garansi Full",
      description: "Nonton video YouTube tanpa jeda iklan, pemutaran di latar belakang saat layar mati, serta akses gratis YouTube Music Premium.",
      variants: [
        { name: "1 Bulan (Invite Fam/Indv)", price: 18000 },
        { name: "3 Bulan (Invite Fam)", price: 48000 },
        { name: "6 Bulan (Invite Fam)", price: 90000 }
      ],
      features: ["Bebas Iklan Video", "Background Play", "Termasuk YouTube Music", "Legal & Aman"]
    },
    {
      id: "prod-5",
      name: "ChatGPT Plus / OpenAI Pro",
      category: "Aplikasi Premium",
      price: 45000,
      originalPrice: 320000,
      image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80",
      soldCount: 194,
      rating: 4.9,
      badge: "AI PRO",
      warranty: "Garansi 30 Hari",
      description: "Akses GPT-4o, DALL-E 3, Browsing, Advanced Data Analysis, pembuatan Custom GPTs tanpa batas kuota gratis.",
      variants: [
        { name: "1 Bulan (Shared Akun)", price: 45000 },
        { name: "1 Bulan (Semi-Private)", price: 85000 },
        { name: "1 Bulan (Private Full)", price: 275000 }
      ],
      features: ["Akses GPT-4o & DALL-E", "Voice Mode & Canvas", "Kecepatan Respon Tinggi", "Bisa Analisis File"]
    },
    {
      id: "prod-6",
      name: "CapCut Pro Video Editor",
      category: "Aplikasi Premium",
      price: 25000,
      originalPrice: 79000,
      image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80",
      soldCount: 220,
      rating: 4.9,
      badge: "EDITOR CHOICE",
      warranty: "Garansi Full",
      description: "Buka semua efek pro, transisi viral, auto-caption AI, cloud storage 100GB, dan ekspor 4K 60FPS tanpa watermark.",
      variants: [
        { name: "1 Bulan (Akun Pro)", price: 25000 },
        { name: "1 Tahun (Akun Pro)", price: 95000 }
      ],
      features: ["Semua Efek & Filter Pro", "AI Auto-Caption", "Cloud Storage 100GB", "Export 4K 60fps"]
    },
    {
      id: "prod-7",
      name: "Mobile Legends: Bang Bang",
      category: "Topup Game",
      price: 19000,
      originalPrice: 25000,
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
      soldCount: 840,
      rating: 5,
      badge: "INSTAN 1 MENIT",
      warranty: "100% Legal & Aman",
      description: "Top Up Diamond Mobile Legends Resmi, Cukup Masukkan User ID dan Zone ID. Proses kilat 1-5 menit langsung masuk!",
      variants: [
        { name: "86 Diamonds", price: 19000 },
        { name: "172 Diamonds", price: 38000 },
        { name: "257 Diamonds", price: 57000 },
        { name: "706 Diamonds (Best Deal)", price: 155000 },
        { name: "Weekly Diamond Pass (WDP)", price: 28000 },
        { name: "Twilight Pass", price: 145000 }
      ],
      features: ["Hanya Butuh User ID & Zone ID", "Proses Cepat 1-3 Menit", "100% Aman Anti Minus", "Bisa Request Jumlah"]
    },
    {
      id: "prod-8",
      name: "Free Fire (FF)",
      category: "Topup Game",
      price: 10000,
      originalPrice: 15000,
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80",
      soldCount: 670,
      rating: 4.9,
      badge: "MURAH",
      warranty: "100% Legal",
      description: "Top Up Diamond Free Fire termurah & terpercaya. Cukup cantumkan Player ID Free Fire Anda.",
      variants: [
        { name: "70 Diamonds", price: 10000 },
        { name: "140 Diamonds", price: 20000 },
        { name: "355 Diamonds", price: 48000 },
        { name: "720 Diamonds", price: 95000 },
        { name: "Membership Mingguan", price: 30000 },
        { name: "Membership Bulanan", price: 120000 }
      ],
      features: ["Hanya Player ID", "Instant Masuk", "Legal & Aman", "Bonus Event Aktif"]
    },
    {
      id: "prod-9",
      name: "Valorant Points (VP)",
      category: "Topup Game",
      price: 45000,
      originalPrice: 55000,
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
      soldCount: 310,
      rating: 4.9,
      badge: "RIOT OFFICIAL",
      warranty: "100% Legal",
      description: "Topup Valorant Points (Riot ID: Username#TAG) region Indonesia/Asia Pacific. Siap borong Night Market!",
      variants: [
        { name: "475 VP", price: 45000 },
        { name: "1000 VP", price: 95000 },
        { name: "2050 VP", price: 185000 },
        { name: "3650 VP", price: 320000 }
      ],
      features: ["Riot ID + Tagline", "Region ID/SEA", "Langsung Masuk", "Aman 100%"]
    },
    {
      id: "prod-10",
      name: "Jasa Desain Poster Event & Musik",
      category: "Jasa Design Poster",
      price: 50000,
      originalPrice: 100000,
      image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
      soldCount: 165,
      rating: 5,
      badge: "KREATIF",
      warranty: "Revisi Sampai Puas",
      description: "Desain poster profesional untuk konser, festival kampus, seminar, workshop, webinar, dan acara komersial.",
      variants: [
        { name: "Paket Basic (1 Konsep, Revisi 2x, JPEG/PNG)", price: 50000 },
        { name: "Paket Pro (2 Konsep, Revisi 5x, File Cetak PDF High-Res)", price: 90000 },
        { name: "Paket Ultimate (Konsep Bebas, Master File PSD/AI + Banner IG)", price: 150000 }
      ],
      features: ["Desain Modern & Eye-Catching", "Resolusi Siap Cetak (300 DPI)", "Pengerjaan 1x24 Jam", "Garansi Revisi"]
    },
    {
      id: "prod-11",
      name: "Jasa Desain Banner Promosi & Usaha",
      category: "Jasa Design Poster",
      price: 40000,
      originalPrice: 80000,
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&auto=format&fit=crop&q=80",
      soldCount: 210,
      rating: 4.9,
      badge: "BRANDING",
      warranty: "Revisi Cepat",
      description: "Desain banner jualan, spanduk toko, flyer brosur, menu makanan/minuman, banner marketplace Tokopedia/Shopee.",
      variants: [
        { name: "Single Banner Jualan (JPEG/PNG)", price: 40000 },
        { name: "Banner Toko + Spanduk Cetak (File PDF/TIFF)", price: 75000 },
        { name: "Branding Kit Paket Lengkap (Banner + Feed + Story)", price: 130000 }
      ],
      features: ["Meningkatkan Penjualan", "Format Sesuai Kebutuhan", "Pengerjaan Cepat", "Free Mockup Visual"]
    },
    {
      id: "prod-12",
      name: "Jasa Desain Feed & Story Instagram",
      category: "Jasa Design Poster",
      price: 35000,
      originalPrice: 70000,
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      soldCount: 180,
      rating: 5,
      badge: "ESTETIK",
      warranty: "Revisi Siap",
      description: "Desain konten media sosial aesthetic & profesional. Meningkatkan engagement dan kepercayaan customer olshop/personal branding.",
      variants: [
        { name: "1 Post Feed / Story (Single Image)", price: 35000 },
        { name: "Paket Carousel 5 Slide (Microblog/Edu)", price: 85000 },
        { name: "Paket Mingguan (6 Feed + 6 Story)", price: 175000 }
      ],
      features: ["Warna Selaras Brand", "Copywriting Menarik", "Format HD 1080x1080 / 1080x1920", "Template Canva / PSD"]
    }
  ]
};

// In-Memory store cache for serverless execution
let memoryStore = JSON.parse(JSON.stringify(DEFAULT_STORE));

function getStoreData() {
  const storeFilePath = path.join(process.cwd(), "data", "store.json");
  try {
    if (fs.existsSync(storeFilePath)) {
      const data = JSON.parse(fs.readFileSync(storeFilePath, "utf8"));
      memoryStore = { ...memoryStore, ...data };
      return memoryStore;
    }
  } catch (e) {
    // If running in read-only environment or file missing, return memoryStore
  }
  return memoryStore;
}

function saveStoreData(data) {
  memoryStore = data;
  const dataDir = path.join(process.cwd(), "data");
  const storeFilePath = path.join(dataDir, "store.json");
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(storeFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    // Serverless environments may have read-only disk
  }
  return true;
}

let inMemoryChats = [
  {
    id: "msg-101",
    sessionId: "cust-101",
    customerName: "Rian Pratama",
    sender: "customer",
    text: "Halo min, akun Netflix Premium 4K yang 1 bulan ready stock?",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: true
  },
  {
    id: "msg-102",
    sessionId: "cust-101",
    customerName: "Rian Pratama",
    sender: "admin",
    text: "Halo kak Rian! Ready stock ya kak, akun private profile 4K Ultra HD. Langsung kami kirim setelah verifikasi pembayaran.",
    timestamp: new Date(Date.now() - 3500000).toISOString(),
    read: true
  },
  {
    id: "msg-103",
    sessionId: "cust-101",
    customerName: "Rian Pratama",
    sender: "customer",
    text: "Oke min, saya transfer via QRIS sekarang ya.",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: false
  },
  {
    id: "msg-201",
    sessionId: "cust-102",
    customerName: "Dimas Setiawan",
    sender: "customer",
    text: "Malam min, mau tanya topup 296 Diamond MLBB proses berapa menit?",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: true
  },
  {
    id: "msg-202",
    sessionId: "cust-102",
    customerName: "Dimas Setiawan",
    sender: "admin",
    text: "Malam kak Dimas! Proses kilat 1-3 menit langsung masuk ke akun MLBB kakak cukup cantumkan User ID dan Zone ID ya.",
    timestamp: new Date(Date.now() - 7000000).toISOString(),
    read: true
  }
];

function getChatsData() {
  const chatsPath = path.join(dataDir, "chats.json");
  const tmpPath = path.join("/tmp", "chats.json");

  try {
    if (fs.existsSync(tmpPath)) {
      const data = JSON.parse(fs.readFileSync(tmpPath, "utf8"));
      if (Array.isArray(data) && data.length > 0) return data;
    }
    if (fs.existsSync(chatsPath)) {
      const data = JSON.parse(fs.readFileSync(chatsPath, "utf8"));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {}

  return inMemoryChats;
}

function saveChatsData(data) {
  inMemoryChats = data;
  try {
    const chatsPath = path.join(dataDir, "chats.json");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(chatsPath, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {}

  try {
    fs.writeFileSync(path.join("/tmp", "chats.json"), JSON.stringify(data, null, 2), "utf8");
  } catch (e) {}

  return true;
}

// Lazy Gemini AI Client
let aiClient = null;
function getAIClient() {
  if (!aiClient) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const { GoogleGenAI } = require("@google/genai");
        aiClient = new GoogleGenAI({ apiKey });
      }
    } catch (e) {
      console.warn("AI Init note:", e.message);
    }
  }
  return aiClient;
}

function parseBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(data));
}

module.exports = async (req, res) => {
  const method = req.method || "GET";
  const urlParts = (req.url || "/").split("?");
  const pathname = urlParts[0];

  // CORS Preflight
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
    });
    return res.end();
  }

  const store = getStoreData();

  // 1. GET /api/store-data
  if (pathname === "/api/store-data" || pathname === "/store-data") {
    return sendJson(res, 200, { success: true, ...store });
  }

  // 2. POST /api/products
  if ((pathname === "/api/products" || pathname === "/products") && method === "POST") {
    const body = await parseBody(req);
    if (!body.name) {
      return sendJson(res, 400, { success: false, error: "Nama produk harus diisi" });
    }

    const newProduct = {
      id: body.id || "prod-" + Date.now(),
      name: body.name.trim(),
      category: body.category || "Aplikasi Premium",
      price: Number(body.price) || 0,
      originalPrice: Number(body.originalPrice) || (Number(body.price) ? Number(body.price) * 1.4 : 0),
      image: body.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      soldCount: Number(body.soldCount) || 0,
      stockStatus: body.stockStatus || "ready",
      stockCount: Number(body.stockCount || 0),
      rating: Number(body.rating) || 5.0,
      badge: body.badge || "BARU",
      warranty: body.warranty || "Garansi Penuh",
      description: body.description || "",
      variants: Array.isArray(body.variants) && body.variants.length > 0 ? body.variants : [
        { name: "Paket Standar", price: Number(body.price) || 0 }
      ],
      features: Array.isArray(body.features) ? body.features : ["Proses Cepat", "Garansi Terpercaya", "Pelayanan 24/7"]
    };

    store.products.unshift(newProduct);
    saveStoreData(store);
    return sendJson(res, 201, { success: true, product: newProduct, message: "Produk berhasil ditambahkan!" });
  }

  // 3. PUT /api/products/:id
  if (pathname.includes("/products/") && method === "PUT") {
    const id = pathname.split("/products/")[1];
    const body = await parseBody(req);
    const index = store.products.findIndex(p => String(p.id) === String(id));

    if (index === -1) {
      return sendJson(res, 404, { success: false, error: "Produk tidak ditemukan" });
    }

    store.products[index] = {
      ...store.products[index],
      ...body,
      id: store.products[index].id,
      price: body.price !== undefined ? Number(body.price) : store.products[index].price,
      soldCount: body.soldCount !== undefined ? Number(body.soldCount) : store.products[index].soldCount,
      rating: body.rating !== undefined ? Number(body.rating) : store.products[index].rating
    };

    saveStoreData(store);
    return sendJson(res, 200, { success: true, product: store.products[index], message: "Produk berhasil diperbarui!" });
  }

  // 4. DELETE /api/products/:id
  if (pathname.includes("/products/") && method === "DELETE") {
    const id = pathname.split("/products/")[1];
    const prevLen = store.products.length;
    store.products = store.products.filter(p => String(p.id) !== String(id));

    if (store.products.length === prevLen) {
      return sendJson(res, 404, { success: false, error: "Produk tidak ditemukan" });
    }

    saveStoreData(store);
    return sendJson(res, 200, { success: true, message: "Produk berhasil dihapus!" });
  }

  // 5. POST /api/settings
  if ((pathname === "/api/settings" || pathname === "/settings") && method === "POST") {
    const body = await parseBody(req);
    store.settings = { ...store.settings, ...body };
    saveStoreData(store);
    return sendJson(res, 200, { success: true, settings: store.settings, message: "Pengaturan berhasil disimpan!" });
  }

  // 6. POST /api/track-visit
  if ((pathname === "/api/track-visit" || pathname === "/track-visit") && method === "POST") {
    store.stats.totalVisitors = (store.stats.totalVisitors || 0) + 1;
    saveStoreData(store);
    return sendJson(res, 200, { success: true, visitors: store.stats.totalVisitors });
  }

  // 7. POST /api/orders
  if ((pathname === "/api/orders" || pathname === "/orders") && method === "POST") {
    const body = await parseBody(req);
    const newOrder = {
      id: "ORD-" + Math.floor(10000 + Math.random() * 90000),
      customerName: body.customerName || "Customer",
      customerPhone: body.customerPhone || "",
      productName: body.productName || "-",
      category: body.category || "-",
      variant: body.variant || "-",
      price: Number(body.price) || 0,
      paymentMethod: body.paymentMethod || "QRIS",
      timestamp: new Date().toISOString(),
      status: "Selesai",
      accountId: body.accountId || "",
      notes: body.notes || ""
    };

    store.orders.unshift(newOrder);
    store.stats.totalOrders = (store.stats.totalOrders || 0) + 1;
    store.stats.totalRevenue = (store.stats.totalRevenue || 0) + (newOrder.price || 0);

    if (body.productId) {
      const prod = store.products.find(p => String(p.id) === String(body.productId));
      if (prod) {
        prod.soldCount = (Number(prod.soldCount) || 0) + 1;
      }
    }

    saveStoreData(store);
    return sendJson(res, 201, { success: true, order: newOrder, products: store.products });
  }

  // 7c. PATCH /api/orders/:id (Update order status)
  if ((pathname.startsWith("/api/orders/") || pathname.startsWith("/orders/")) && method === "PATCH") {
    const orderId = pathname.replace(/^\/(api\/)?orders\//, "");
    const body = await parseBody(req);
    const target = store.orders.find(o => String(o.id) === String(orderId));
    if (target) {
      if (body.status) target.status = body.status;
      if (body.notes) target.notes = body.notes;
      saveStoreData(store);
      return sendJson(res, 200, { success: true, order: target });
    }
    return sendJson(res, 404, { success: false, error: "Pesanan tidak ditemukan" });
  }

  // 7b. POST /api/reviews
  if ((pathname === "/api/reviews" || pathname === "/reviews") && method === "POST") {
    const body = await parseBody(req);
    const { productId, name, rating, comment } = body;

    if (!productId || !comment || !comment.trim()) {
      return sendJson(res, 400, { success: false, error: "ID produk dan ulasan harus diisi" });
    }

    const prod = store.products.find(p => String(p.id) === String(productId));
    if (!prod) {
      return sendJson(res, 404, { success: false, error: "Produk tidak ditemukan" });
    }

    if (!Array.isArray(prod.reviews)) {
      prod.reviews = [];
    }

    const newReview = {
      id: "rev-" + Date.now(),
      name: (name && name.trim()) ? name.trim() : "Pembeli Terverifikasi",
      rating: Math.max(1, Math.min(5, Number(rating) || 5)),
      date: "Baru saja",
      comment: comment.trim(),
      verified: true,
      timestamp: new Date().toISOString()
    };

    prod.reviews.unshift(newReview);

    // Recalculate average rating
    const sum = prod.reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    prod.rating = Number((sum / prod.reviews.length).toFixed(1));

    saveStoreData(store);

    // Persist review to Firestore if connected
    const firestore = getAdminFirestore();
    if (firestore) {
      try {
        await firestore.collection("products").doc(String(prod.id)).set({
          reviews: prod.reviews,
          rating: prod.rating
        }, { merge: true });
        await firestore.collection("reviews").doc(newReview.id).set({
          ...newReview,
          productId: String(prod.id),
          productName: prod.name || "",
          createdAt: new Date().toISOString()
        });
      } catch (fErr) {
        console.warn("Firestore review sync notice:", fErr.message);
      }
    }

    return sendJson(res, 201, { success: true, review: newReview, product: prod, message: "Ulasan berhasil dikirim!" });
  }

  // 7c. POST /api/auth/google
  if ((pathname === "/api/auth/google" || pathname === "/api/auth/login" || pathname === "/auth/google" || pathname === "/auth/login") && method === "POST") {
    const body = await parseBody(req);
    const email = (body.email || "").toLowerCase().trim();
    const name = body.name || email.split("@")[0] || "User";
    const uid = body.uid || (email === "ererex4youu@gmail.com" ? "owner-ererex4youu" : "usr-" + Date.now());

    // Check if user is owner / admin strictly by email ererex4youu@gmail.com
    const isAdmin = (email === "ererex4youu@gmail.com");

    const user = {
      uid: uid,
      id: uid,
      email: email || "member@janemurphy.store",
      name: isAdmin ? (body.name || "Owner JaneMurphy") : name,
      picture: body.picture || body.avatar || "",
      avatar: body.picture || body.avatar || "",
      role: isAdmin ? "admin" : "customer",
      isAdmin: isAdmin,
      lastLogin: new Date().toISOString(),
      token: "tok-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9)
    };

    // Persist user in Firestore via Admin SDK
    const firestore = getAdminFirestore();
    if (firestore) {
      try {
        await firestore.collection("users").doc(user.uid).set({
          uid: user.uid,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          isAdmin: user.isAdmin,
          lastLogin: user.lastLogin
        }, { merge: true });
      } catch (fErr) {
        console.warn("Firestore user sync notice in serverless:", fErr.message);
      }
    }

    return sendJson(res, 200, { success: true, user, message: isAdmin ? "Selamat datang Owner JaneMurphy (Admin)!" : "Berhasil masuk!" });
  }

  // 8. POST /api/chat-ai
  if ((pathname === "/api/chat-ai" || pathname === "/chat-ai") && method === "POST") {
    const body = await parseBody(req);
    const userMessage = body.message || "";

    if (!userMessage.trim()) {
      return sendJson(res, 400, { success: false, error: "Pesan tidak boleh kosong" });
    }

    const productCatalogText = store.products.map(p => 
      `- ${p.name} [Kategori: ${p.category}]: Harga mulai Rp ${p.price.toLocaleString('id-ID')}, Terjual ${p.soldCount || 0}x, Garansi: ${p.warranty || 'Garansi Resmi'}. ${p.description}`
    ).join("\n");

    const systemPrompt = `Kamu adalah JaneMarket AI Assistant, asisten cerdas, ramah, dan profesional dari toko JaneMarket.
JaneMarket menjual:
1. Aplikasi Premium (Netflix 4K, Spotify, Canva Pro, YouTube Premium, ChatGPT Plus, CapCut Pro, dll.)
2. Topup Game Instan (Mobile Legends, Free Fire, Valorant, dll.)
3. Jasa Desain Poster & Banner (Poster Event, Spanduk Promosi, Feed Instagram, dll.)

Berikut katalog produk lengkap yang tersedia:
${productCatalogText}

Info Tambahan:
- Nomor WhatsApp Resmi Admin: ${store.settings.whatsappNumber || '6281234567890'}
- Metode Pembayaran: QRIS All Payment (BCA, Mandiri, DANA, GoPay, OVO, ShopeePay, SeaBank, dll.)
- Keunggulan: Proses kilat 1-5 menit, Garansi akun/ganti baru jika bermasalah, Legal & Aman 100%.

Instruksi:
- Jawablah dengan bahasa Indonesia yang ramah, sopan, ringkas, dan jelas.
- Berikan rekomendasi produk yang tepat sesuai kebutuhan pembeli.
- Berikan info harga dan keuntungan.
- Arahkan pembeli untuk klik tombol 'Beli Sekarang' atau hubungi WhatsApp Admin untuk proses order cepat.
- Jangan mengarang produk yang tidak relevan dengan JaneMarket.`;

    let reply = "";
    const client = getAIClient();
    if (client) {
      try {
        const aiResponse = await client.models.generateContent({
          model: "gemini-3.7-flash",
          contents: userMessage,
          config: {
            systemInstruction: systemPrompt
          }
        });
        reply = aiResponse.text || "";
      } catch (err) {
        console.warn("AI generation note:", err.message);
      }
    }

    if (!reply) {
      const lower = userMessage.toLowerCase();
      if (lower.includes("netflix")) {
        reply = "Halo kak! Netflix Premium 4K UHD di JaneMarket tersedia mulai Rp 35.000 (1 Bulan Private PIN) anti on-hold dan full garansi! Mau kami bantu pesankan via WhatsApp?";
      } else if (lower.includes("canva")) {
        reply = "Canva Pro tersedia mulai Rp 15.000 (1 Tahun aktif) langsung upgrade ke email pribadi kakak dengan garansi penuh! Fitur Brand Kit dan AI Magic Studio aktif.";
      } else if (lower.includes("spotify")) {
        reply = "Spotify Premium Individual mulai Rp 20.000/bulan, bebas iklan dan download lagu 320kbps! Bisa menggunakan akun pribadi.";
      } else if (lower.includes("topup") || lower.includes("diamond") || lower.includes("ml") || lower.includes("ff")) {
        reply = "Untuk Top Up Game (Mobile Legends & Free Fire), proses super kilat 1-3 menit langsung masuk, 100% legal dan aman anti minus! Cukup berikan User ID dan Zone ID Anda.";
      } else if (lower.includes("desain") || lower.includes("poster") || lower.includes("banner")) {
        reply = "Jasa Desain Poster & Banner di JaneMarket siap dikerjakan cepat 1x24 jam dengan hasil resolusi tinggi (300 DPI) siap cetak dan revisi sampai puas. Mulai dari Rp 35.000 saja kak!";
      } else if (lower.includes("bayar") || lower.includes("qris") || lower.includes("rekening")) {
        reply = "Kami menerima pembayaran otomatis via QRIS (semua e-wallet & m-banking), serta transfer manual Bank BCA, Mandiri, SeaBank, DANA, GoPay, OVO, dan ShopeePay.";
      } else {
        reply = `Halo kak! Selamat datang di JaneMarket. Kami menyediakan Aplikasi Premium bergaransi, Topup Game kilat, dan Jasa Desain profesional. Ada produk yang sedang kakak cari hari ini? 😊`;
      }
    }

    return sendJson(res, 200, { success: true, reply });
  }

  // 9. GET /api/chat/threads
  if ((pathname === "/api/chat/threads" || pathname === "/chat/threads") && method === "GET") {
    let allChats = getChatsData();

    // Try fetching from Firestore via Admin SDK
    const firestore = getAdminFirestore();
    if (firestore) {
      try {
        const snap = await firestore.collection("chats").orderBy("timestamp", "asc").get();
        if (!snap.empty) {
          const firestoreChats = [];
          snap.forEach(doc => {
            firestoreChats.push({ id: doc.id, ...doc.data() });
          });
          if (firestoreChats.length > 0) {
            allChats = firestoreChats;
            saveChatsData(allChats);
          }
        }
      } catch (fErr) {
        console.warn("Firestore read threads notice in serverless:", fErr.message);
      }
    }

    const threadMap = new Map();

    for (const msg of allChats) {
      const sId = msg.sessionId || "anonymous";
      if (!threadMap.has(sId)) {
        threadMap.set(sId, {
          sessionId: sId,
          customerName: msg.customerName || "Customer Web",
          customerUid: msg.customerUid || "",
          lastMessage: msg.text || "",
          lastSender: msg.sender || "customer",
          lastTimestamp: msg.timestamp || new Date().toISOString(),
          unreadCount: 0,
          totalMessages: 0
        });
      }

      const thread = threadMap.get(sId);
      thread.totalMessages += 1;
      if (msg.customerName && msg.sender === "customer") {
        thread.customerName = msg.customerName;
      }
      if (msg.customerUid) {
        thread.customerUid = msg.customerUid;
      }
      if (new Date(msg.timestamp) >= new Date(thread.lastTimestamp)) {
        thread.lastMessage = msg.text;
        thread.lastSender = msg.sender;
        thread.lastTimestamp = msg.timestamp;
      }
      if (msg.sender === "customer" && !msg.read) {
        thread.unreadCount += 1;
      }
    }

    const threads = Array.from(threadMap.values()).sort((a, b) => 
      new Date(b.lastTimestamp) - new Date(a.lastTimestamp)
    );

    return sendJson(res, 200, { success: true, threads });
  }

  // 10. GET /api/chat/messages
  if ((pathname === "/api/chat/messages" || pathname === "/chat/messages") && method === "GET") {
    const searchParams = new URLSearchParams(urlParts[1] || "");
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return sendJson(res, 400, { success: false, error: "sessionId diperlukan" });
    }

    let allChats = getChatsData();

    // Try fetching from Firestore via Admin SDK
    const firestore = getAdminFirestore();
    if (firestore) {
      try {
        const snap = await firestore.collection("chats")
          .where("sessionId", "==", sessionId)
          .get();
        if (!snap.empty) {
          const list = [];
          snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
          list.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          return sendJson(res, 200, { success: true, messages: list });
        }
      } catch (fErr) {
        console.warn("Firestore get messages notice in serverless:", fErr.message);
      }
    }

    const messages = allChats.filter(m => m.sessionId === sessionId);
    return sendJson(res, 200, { success: true, messages });
  }

  // 11. POST /api/chat/send
  if ((pathname === "/api/chat/send" || pathname === "/chat/send") && method === "POST") {
    const body = await parseBody(req);
    const { sessionId, customerName, customerUid, sender, senderUid, text } = body;

    if (!sessionId || !text || !text.trim()) {
      return sendJson(res, 400, { success: false, error: "sessionId dan text pesan harus diisi" });
    }

    const allChats = getChatsData();
    const cleanSessionId = String(sessionId).trim();
    const cleanSender = sender === "admin" ? "admin" : "customer";
    const cleanText = String(text).trim();

    const now = Date.now();
    const isDuplicate = allChats.some(m => 
      m.sessionId === cleanSessionId &&
      m.sender === cleanSender &&
      m.text === cleanText &&
      (now - new Date(m.timestamp).getTime() < 1500)
    );

    let newMsg = null;
    if (!isDuplicate) {
      newMsg = {
        id: "msg-" + now + "-" + Math.floor(Math.random() * 1000),
        sessionId: cleanSessionId,
        customerName: customerName ? String(customerName).trim() : "Customer Web",
        customerUid: customerUid || "",
        sender: cleanSender,
        senderUid: senderUid || (cleanSender === "admin" ? "owner-ererex4youu" : (customerUid || "")),
        ownerEmail: "ererex4youu@gmail.com",
        text: cleanText,
        timestamp: new Date().toISOString(),
        read: cleanSender === "admin"
      };

      allChats.push(newMsg);
      saveChatsData(allChats);

      // Firestore Admin SDK write
      const firestore = getAdminFirestore();
      if (firestore) {
        try {
          await firestore.collection("chats").doc(newMsg.id).set(newMsg, { merge: true });
        } catch (fErr) {
          console.warn("Firestore Admin SDK write in serverless:", fErr.message);
        }
      }
    }

    const sessionMessages = allChats.filter(m => m.sessionId === cleanSessionId);
    return sendJson(res, 201, { success: true, message: newMsg, messages: sessionMessages });
  }

  // 12. POST /api/chat/read
  if ((pathname === "/api/chat/read" || pathname === "/chat/read") && method === "POST") {
    const body = await parseBody(req);
    const { sessionId, role } = body;

    if (!sessionId) {
      return sendJson(res, 400, { success: false, error: "sessionId diperlukan" });
    }

    const allChats = getChatsData();
    let updated = false;

    for (const msg of allChats) {
      if (msg.sessionId === sessionId) {
        if (role === "admin" && msg.sender === "customer" && !msg.read) {
          msg.read = true;
          updated = true;
        } else if (role === "customer" && msg.sender === "admin" && !msg.read) {
          msg.read = true;
          updated = true;
        }
      }
    }

    if (updated) {
      saveChatsData(allChats);
    }

    // Update in Firestore via Admin SDK
    const firestore = getAdminFirestore();
    if (firestore) {
      try {
        const snap = await firestore.collection("chats")
          .where("sessionId", "==", sessionId)
          .get();
        const batch = firestore.batch();
        let count = 0;
        snap.forEach(doc => {
          const data = doc.data();
          if ((role === "admin" && data.sender === "customer" && !data.read) ||
              (role === "customer" && data.sender === "admin" && !data.read)) {
            batch.update(doc.ref, { read: true });
            count++;
          }
        });
        if (count > 0) {
          await batch.commit();
        }
      } catch (fErr) {
        console.warn("Firestore batch read update in serverless:", fErr.message);
      }
    }

    return sendJson(res, 200, { success: true, message: "Pesan telah ditandai dibaca" });
  }

  // 13. DELETE /api/chat/threads/:sessionId
  if (pathname.includes("/chat/threads/") && method === "DELETE") {
    const sessionId = pathname.split("/chat/threads/")[1];
    let allChats = getChatsData();
    const initialCount = allChats.length;
    allChats = allChats.filter(m => m.sessionId !== sessionId);

    if (allChats.length === initialCount) {
      return sendJson(res, 404, { success: false, error: "Thread chat tidak ditemukan" });
    }

    saveChatsData(allChats);

    // Delete from Firestore via Admin SDK
    const firestore = getAdminFirestore();
    if (firestore) {
      try {
        const snap = await firestore.collection("chats")
          .where("sessionId", "==", sessionId)
          .get();
        const batch = firestore.batch();
        snap.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
      } catch (fErr) {
        console.warn("Firestore delete thread in serverless:", fErr.message);
      }
    }

    return sendJson(res, 200, { success: true, message: "Percakapan customer berhasil dihapus!" });
  }

  // Fallback 404 for unknown api routes
  return sendJson(res, 404, { success: false, error: "Endpoint API tidak ditemukan" });
};
