const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = 3000;
const HOST = "0.0.0.0";
const root = path.resolve(process.cwd());
const dataDir = path.join(root, "data");
const storeFile = path.join(dataDir, "store.json");
const chatsFile = path.join(dataDir, "chats.json");

// Ensure data folder and file exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function getChatsData() {
  try {
    if (fs.existsSync(chatsFile)) {
      return JSON.parse(fs.readFileSync(chatsFile, "utf8"));
    }
  } catch (err) {
    console.error("Error reading chats.json:", err);
  }
  // Default seed threads
  const initialChats = [
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
  saveChatsData(initialChats);
  return initialChats;
}

function saveChatsData(data) {
  try {
    fs.writeFileSync(chatsFile, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing chats.json:", err);
    return false;
  }
}

function getStoreData() {
  try {
    if (fs.existsSync(storeFile)) {
      return JSON.parse(fs.readFileSync(storeFile, "utf8"));
    }
  } catch (err) {
    console.error("Error reading store.json:", err);
  }
  return { settings: {}, stats: { totalVisitors: 0, totalRevenue: 0, totalOrders: 0 }, orders: [], products: [] };
}

function saveStoreData(data) {
  try {
    fs.writeFileSync(storeFile, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing store.json:", err);
    return false;
  }
}

// Lazy Gemini SDK loader
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
      console.warn("AI Client initialization note:", e.message);
    }
  }
  return aiClient;
}

let manifest = { fallback: "index.html", routes: { "/": "index.html" }, spaRoutes: [] };
try {
  manifest = JSON.parse(fs.readFileSync(path.join(root, "route-manifest.json"), "utf8"));
} catch {
  /* legacy archive without a route manifest */
}

let assetsMap = new Map();
try {
  const assetsData = JSON.parse(fs.readFileSync(path.join(root, "assets.json"), "utf8"));
  for (const item of assetsData) {
    if (item.localPath) {
      assetsMap.set("/" + item.localPath.replace(/^\/+/, ""), path.basename(item.localPath));
    }
  }
} catch {
  /* no assets.json */
}

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".apng": "image/apng",
  ".bmp": "image/bmp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".woff3": "font/woff",
  ".eot": "application/vnd.ms-fontobject",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".flac": "audio/flac",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".m4v": "video/mp4",
  ".3gp": "video/3gpp",
  ".wasm": "application/wasm",
  ".webmanifest": "application/manifest+json",
  ".map": "application/json",
  ".xml": "application/xml",
  ".csv": "text/csv",
  ".txt": "text/plain",
  ".pdf": "application/pdf"
};

const assetExtension = /\.(?:css|m?js|cjs|map|json|xml|txt|csv|png|jpe?g|gif|webp|avif|svg|ico|woff[23]?|eot|ttf|otf|mp3|wav|ogg|m4a|flac|mp4|webm|mov|m4v|3gp|wasm|webmanifest|pdf)$/i;

function routeKey(value) {
  let pathname = value;
  try { pathname = decodeURIComponent(pathname); } catch {}
  pathname = ("/" + pathname).replace(/\/{2,}/g, "/");
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
}

function existing(relative) {
  if (!relative) return null;
  let cleanRel = String(relative).replace(/^\/+/, "");
  
  // 1. Check exact file relative to root
  let file = path.resolve(root, cleanRel);
  if (file === root || file.startsWith(root + path.sep)) {
    try {
      if (fs.existsSync(file)) {
        if (fs.statSync(file).isDirectory()) {
          const indexFile = path.join(file, "index.html");
          if (fs.existsSync(indexFile) && fs.statSync(indexFile).isFile()) return indexFile;
        } else if (fs.statSync(file).isFile()) {
          return file;
        }
      }
    } catch {}
  }

  // 2. Check assetsMap
  const key = "/" + cleanRel;
  if (assetsMap.has(key)) {
    const mapped = path.resolve(root, assetsMap.get(key));
    try {
      if (fs.existsSync(mapped) && fs.statSync(mapped).isFile()) return mapped;
    } catch {}
  }

  // 3. Check basename in root
  const baseName = path.basename(cleanRel);
  const baseFile = path.resolve(root, baseName);
  if (baseFile.startsWith(root + path.sep)) {
    try {
      if (fs.existsSync(baseFile) && fs.statSync(baseFile).isFile()) return baseFile;
    } catch {}
  }

  return null;
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
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

const appHandler = async (request, response) => {
  const method = request.method || "GET";
  const urlParts = (request.url || "/").split("?");
  const pathname = urlParts[0];

  // Handle CORS Preflight
  if (method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
    });
    return response.end();
  }

  // --- API ROUTES ---
  if (pathname.startsWith("/api/")) {
    const store = getStoreData();

    // 1. GET /api/store-data
    if (pathname === "/api/store-data" && method === "GET") {
      return sendJson(response, 200, { success: true, ...store });
    }

    // 2. POST /api/products (Add product)
    if (pathname === "/api/products" && method === "POST") {
      const body = await parseBody(request);
      if (!body.name) {
        return sendJson(response, 400, { success: false, error: "Nama produk harus diisi" });
      }

      const newProduct = {
        id: body.id || "prod-" + Date.now(),
        name: body.name.trim(),
        category: body.category || "Aplikasi Premium",
        price: Number(body.price) || 0,
        originalPrice: Number(body.originalPrice) || (Number(body.price) ? Number(body.price) * 1.4 : 0),
        image: body.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
        soldCount: Number(body.soldCount) || 0,
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
      return sendJson(response, 201, { success: true, product: newProduct, message: "Produk berhasil ditambahkan!" });
    }

    // 3. PUT /api/products/:id (Update product)
    if (pathname.startsWith("/api/products/") && method === "PUT") {
      const id = pathname.replace("/api/products/", "");
      const body = await parseBody(request);
      const index = store.products.findIndex(p => String(p.id) === String(id));

      if (index === -1) {
        return sendJson(response, 404, { success: false, error: "Produk tidak ditemukan" });
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
      return sendJson(response, 200, { success: true, product: store.products[index], message: "Produk berhasil diperbarui!" });
    }

    // 4. DELETE /api/products/:id (Delete product)
    if (pathname.startsWith("/api/products/") && method === "DELETE") {
      const id = pathname.replace("/api/products/", "");
      const prevLen = store.products.length;
      store.products = store.products.filter(p => String(p.id) !== String(id));

      if (store.products.length === prevLen) {
        return sendJson(response, 404, { success: false, error: "Produk tidak ditemukan" });
      }

      saveStoreData(store);
      return sendJson(response, 200, { success: true, message: "Produk berhasil dihapus!" });
    }

    // 5. POST /api/settings (Update settings)
    if (pathname === "/api/settings" && method === "POST") {
      const body = await parseBody(request);
      store.settings = { ...store.settings, ...body };
      saveStoreData(store);
      return sendJson(response, 200, { success: true, settings: store.settings, message: "Pengaturan berhasil disimpan!" });
    }

    // 6. POST /api/track-visit (Increment visitors)
    if (pathname === "/api/track-visit" && method === "POST") {
      store.stats.totalVisitors = (store.stats.totalVisitors || 0) + 1;
      saveStoreData(store);
      return sendJson(response, 200, { success: true, visitors: store.stats.totalVisitors });
    }

    // 7. POST /api/orders (Record new order / inquiry)
    if (pathname === "/api/orders" && method === "POST") {
      const body = await parseBody(request);
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

      // Increment sold count automatically for matching product
      if (body.productId) {
        const prod = store.products.find(p => String(p.id) === String(body.productId));
        if (prod) {
          prod.soldCount = (Number(prod.soldCount) || 0) + 1;
        }
      }

      saveStoreData(store);
      return sendJson(response, 201, { success: true, order: newOrder, products: store.products });
    }

    // 7b. POST /api/reviews (Add product review)
    if (pathname === "/api/reviews" && method === "POST") {
      const body = await parseBody(request);
      const { productId, name, rating, comment } = body;

      if (!productId || !comment || !comment.trim()) {
        return sendJson(response, 400, { success: false, error: "ID produk dan ulasan harus diisi" });
      }

      const prod = store.products.find(p => String(p.id) === String(productId));
      if (!prod) {
        return sendJson(response, 404, { success: false, error: "Produk tidak ditemukan" });
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
      return sendJson(response, 201, { success: true, review: newReview, product: prod, message: "Ulasan berhasil dikirim!" });
    }

    // 7c. POST /api/auth/google & POST /api/auth/login
    if ((pathname === "/api/auth/google" || pathname === "/api/auth/login") && method === "POST") {
      const body = await parseBody(request);
      const email = (body.email || "").toLowerCase().trim();
      const name = body.name || email.split("@")[0] || "User";
      const pin = body.pin || body.password || "";
      const ownerEmail = (store.settings.ownerEmail || "ererex4youu@gmail.com").toLowerCase().trim();
      const adminPin = String(store.settings.adminPin || "123456").trim();

      // Check if user is owner / admin
      let isAdmin = false;
      if (email === ownerEmail || email === "ererex4youu@gmail.com") {
        isAdmin = true;
      } else if (pin && String(pin).trim() === adminPin) {
        isAdmin = true;
      }

      const user = {
        email: email || (isAdmin ? ownerEmail : "member@janemurphy.store"),
        name: isAdmin ? (body.name || "Owner JaneMurphy (Admin)") : name,
        picture: body.picture || "",
        role: isAdmin ? "admin" : "customer",
        isAdmin: isAdmin,
        token: "tok-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9)
      };

      return sendJson(response, 200, { success: true, user, message: isAdmin ? "Selamat datang Admin!" : "Berhasil masuk!" });
    }

    // 8. POST /api/chat-ai (Gemini AI Assistant)
    if (pathname === "/api/chat-ai" && method === "POST") {
      const body = await parseBody(request);
      const userMessage = body.message || "";

      if (!userMessage.trim()) {
        return sendJson(response, 400, { success: false, error: "Pesan tidak boleh kosong" });
      }

      // Catalog context
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
          console.warn("Gemini API call failed, falling back to smart local responder:", err.message);
        }
      }

      if (!reply) {
        // Smart fallback when offline or no API key
        const lower = userMessage.toLowerCase();
        if (lower.includes("netflix") || lower.includes("film") || lower.includes("nonton")) {
          reply = "Untuk Netflix Premium 4K UHD, kami menyediakan paket mulai dari Rp 35.000 (1 Bulan Private Profile). Anti limit & garansi 30 hari penuh! Mau langsung order melalui WhatsApp?";
        } else if (lower.includes("spotify") || lower.includes("musik") || lower.includes("lagu")) {
          reply = "Spotify Premium kami bebas iklan dan bisa download lagu offline, mulai dari Rp 20.000 per bulan. Bisa dihubungkan langsung ke email pribadi Anda dengan garansi aman!";
        } else if (lower.includes("canva") || lower.includes("desain") || lower.includes("poster")) {
          reply = "Kami menyediakan Canva Pro (mulai Rp 15.000) dan juga Jasa Pembuatan Desain Poster/Banner profesional (mulai Rp 40.000 - Rp 50.000) dengan revisi sampai puas. Konsep apa yang ingin Anda buat?";
        } else if (lower.includes("game") || lower.includes("ml") || lower.includes("topup") || lower.includes("diamond") || lower.includes("ff") || lower.includes("valorant")) {
          reply = "Untuk Top Up Game (Mobile Legends, Free Fire, Valorant Points), proses sangat cepat hanya 1-5 menit cukup dengan User ID & Zone ID. Legal 100% dan harga mulai dari Rp 10.000!";
        } else if (lower.includes("bayar") || lower.includes("qris") || lower.includes("transfer") || lower.includes("dana")) {
          reply = "Kami menerima pembayaran otomatis via QRIS All Payment (BCA, Mandiri, BRI, BNI, DANA, OVO, GoPay, ShopeePay). Anda bisa klik tombol 'Metode Pembayaran' di menu atas untuk scan QRIS!";
        } else if (lower.includes("garansi") || lower.includes("aman") || lower.includes("legal")) {
          reply = "Semua produk aplikasi premium dan topup di JaneMarket bergaransi resmi. Jika ada kendala akun selama masa aktif, admin kami akan langsung bantu ganti akun baru atau perbaikan kilat!";
        } else {
          reply = `Halo kak! Ada yang bisa JaneMarket bantu? Kami menyediakan berbagai Aplikasi Premium (Netflix, Spotify, Canva, YouTube, ChatGPT), Topup Game kilat (MLBB, FF, Valorant), serta Jasa Desain Poster & Banner estetik. Silakan pilih produk atau tanya rekomendasi ya!`;
        }
      }

      return sendJson(response, 200, { success: true, reply });
    }

    // 9. GET /api/chat/threads (Admin: List all customer chat threads/blocks)
    if (pathname === "/api/chat/threads" && method === "GET") {
      const allChats = getChatsData();
      const threadMap = new Map();

      for (const msg of allChats) {
        const sId = msg.sessionId || "anonymous";
        if (!threadMap.has(sId)) {
          threadMap.set(sId, {
            sessionId: sId,
            customerName: msg.customerName || "Customer Web",
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

      return sendJson(response, 200, { success: true, threads });
    }

    // 10. GET /api/chat/messages (Fetch messages for a specific session)
    if (pathname === "/api/chat/messages" && method === "GET") {
      const searchParams = new URLSearchParams(urlParts[1] || "");
      const sessionId = searchParams.get("sessionId");

      if (!sessionId) {
        return sendJson(response, 400, { success: false, error: "sessionId diperlukan" });
      }

      const allChats = getChatsData();
      const messages = allChats.filter(m => m.sessionId === sessionId);
      return sendJson(response, 200, { success: true, messages });
    }

    // 11. POST /api/chat/send (Send message from Customer or Admin)
    if (pathname === "/api/chat/send" && method === "POST") {
      const body = await parseBody(request);
      const { sessionId, customerName, sender, text } = body;

      if (!sessionId || !text || !text.trim()) {
        return sendJson(response, 400, { success: false, error: "sessionId dan text pesan harus diisi" });
      }

      const allChats = getChatsData();
      const cleanSessionId = String(sessionId).trim();
      const cleanSender = sender === "admin" ? "admin" : "customer";
      const cleanText = String(text).trim();

      // Guard against rapid duplicate clicks (within 1.5s for same session, sender, and text)
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
          sender: cleanSender,
          text: cleanText,
          timestamp: new Date().toISOString(),
          read: cleanSender === "admin"
        };

        allChats.push(newMsg);
        saveChatsData(allChats);
      }

      const sessionMessages = allChats.filter(m => m.sessionId === cleanSessionId);
      return sendJson(response, 201, { success: true, message: newMsg, messages: sessionMessages });
    }

    // 12. POST /api/chat/read (Mark messages as read for a session)
    if (pathname === "/api/chat/read" && method === "POST") {
      const body = await parseBody(request);
      const { sessionId, role } = body;

      if (!sessionId) {
        return sendJson(response, 400, { success: false, error: "sessionId diperlukan" });
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

      return sendJson(response, 200, { success: true, message: "Pesan telah ditandai dibaca" });
    }

    // 13. DELETE /api/chat/threads/:sessionId (Admin: Delete chat session/thread)
    if (pathname.startsWith("/api/chat/threads/") && method === "DELETE") {
      const sessionId = pathname.replace("/api/chat/threads/", "");
      let allChats = getChatsData();
      const initialCount = allChats.length;
      allChats = allChats.filter(m => m.sessionId !== sessionId);

      if (allChats.length === initialCount) {
        return sendJson(response, 404, { success: false, error: "Thread chat tidak ditemukan" });
      }

      saveChatsData(allChats);
      return sendJson(response, 200, { success: true, message: "Percakapan customer berhasil dihapus!" });
    }

    return sendJson(response, 404, { success: false, error: "API route not found" });
  }

  // --- STATIC FILE SERVING ---
  if (!["GET", "HEAD"].includes(method)) {
    response.writeHead(405, { Allow: "GET, HEAD" });
    return response.end("Method not allowed");
  }

  let relative;
  try { relative = decodeURIComponent(pathname); }
  catch { response.writeHead(400); return response.end("Bad request"); }

  const key = routeKey(relative);
  let resolution = "exact";
  let file = existing(relative);
  const isAsset = assetExtension.test(key);

  if (!file && manifest.routes && manifest.routes[key]) {
    file = existing(manifest.routes[key]);
    resolution = "captured-route";
  }
  if (!file && !isAsset) {
    file = existing(manifest.fallback || "index.html");
    resolution = "spa-fallback";
  }
  if (!file) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" });
    return response.end("Not found");
  }

  const stat = fs.statSync(file);
  response.writeHead(200, {
    "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
    "Content-Length": String(stat.size),
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-SiteGrabber-Route": resolution
  });

  if (method === "HEAD") return response.end();
  fs.createReadStream(file).on("error", () => response.destroy()).pipe(response);
};

const server = http.createServer(appHandler);

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  server.listen(PORT, HOST, () => {
    console.log(`JaneMarket Server running on http://${HOST}:${PORT}`);
  });
}

module.exports = appHandler;
