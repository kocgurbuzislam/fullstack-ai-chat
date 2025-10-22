# 💬 Full Stack + AI Chat Uygulaması

Kullanıcıların anlık mesajlaşabildiği, her mesajın **AI destekli duygu analizi (Sentiment Analysis)** ile etiketlendiği tam kapsamlı bir **Full Stack Chat Uygulaması**.  
Uygulama hem **web (React)** hem **mobil (React Native)** tarafında çalışır ve **.NET Backend** ile **Python tabanlı AI servisine** bağlıdır.

---

## 🧠 Proje Özeti

Kullanıcılar takma ad (nickname) ile giriş yapar.  
Her mesaj gönderildiğinde backend üzerinden **Hugging Face API**’sine istek atılır, mesajın duygu durumu (pozitif, nötr, negatif) belirlenir ve sonuç anlık olarak arayüzde gösterilir.

---

## 🌐 Canlı Demo Bağlantıları

| Platform | Link |
|-----------|------|
| 🌍 **Web (Vercel)** | [https://fullstack-ai-chat-n3zas7paz-islams-projects-0e144e92.vercel.app](https://fullstack-ai-chat-n3zas7paz-islams-projects-0e144e92.vercel.app) |
| 🧠 **AI Servisi (Hugging Face)** | [https://kocgurbuz-sentiment-api.hf.space](https://kocgurbuz-sentiment-api.hf.space) |
| ⚙️ **Backend (Render)** | [https://fullstack-ai-chat-edry.onrender.com](https://fullstack-ai-chat-edry.onrender.com) |
| 📱 **Mobil APK (Android)** | [https://drive.google.com/file/d/13v99uKHoRvxtLU5dvsxXYErGg1uAYT9e/view?usp=sharing](https://drive.google.com/file/d/13v99uKHoRvxtLU5dvsxXYErGg1uAYT9e/view?usp=sharing) |

---

## 📁 Güncel Klasör Yapısı

```
fullstack-ai-chat/
│
├── ai-service/                  # AI servis (Hugging Face Spaces)
│   ├── app.py                   # Gradio tabanlı sentiment API
│   ├── requirements.txt         # Python bağımlılıkları
│   ├── Dockerfile
│   └── README.md
│
├── backend/                     # .NET 8 Web API (Render üzerinde)
│   └── ChatApi/
│       ├── Data/
│       │   └── AppDb.cs         # SQLite veritabanı bağlantısı
│       ├── Models/
│       │   ├── User.cs          # Kullanıcı modeli (unique nickname)
│       │   └── Message.cs       # Mesaj modeli
│       ├── Migrations/          # EF Core migration dosyaları
│       ├── Controllers/
│       │   ├── UserController.cs
│       │   └── MessageController.cs
│       ├── appsettings.json
│       ├── ChatApi.csproj
│       ├── Dockerfile
│       └── Program.cs
│
├── frontend/
│   └── react-chat/
│       ├── src/
│       │   ├── assets/
│       │   ├── App.jsx          # Ana bileşen (chat arayüzü)
│       │   ├── main.jsx
│       │   └── app.css, index.css
│       ├── .env, .env.production
│       ├── vite.config.js
│       └── package.json
│
└── mobile/
    ├── src/
    │   └── api.js               # Mobil istek yöneticisi
    ├── App.tsx                  # React Native giriş noktası
    ├── app.json, index.js
    ├── babel.config.js
    ├── metro.config.js
    └── package.json
```

---

## Ekran Görüntüleri
# Web
<p align="center"> <img width="1916" height="965" alt="image" src="https://github.com/user-attachments/assets/cafa80bd-7657-4e36-918c-2f67e1583fdb" /></p> <p align="center"> <img width="1914" height="974" alt="image" src="https://github.com/user-attachments/assets/912f4d0b-66ea-4d26-a6ec-3c716e2b030a" />
 </p>

# Mobil
<p align="center"> <img width="386" height="834" alt="image" src="https://github.com/user-attachments/assets/71bf0476-2dbe-44a1-bd7f-e438053d0992" />

</p> <p align="center"> <img width="383" height="833" alt="image" src="https://github.com/user-attachments/assets/cb753592-906e-4c0f-b49f-e3a1294dff77" />

 </p>



## 🧱 Kullanılan Teknolojiler

| Katman | Teknoloji |
|--------|------------|
| **Frontend (Web)** | React + Vite + Axios + CSS |
| **Frontend (Mobil)** | React Native CLI + AsyncStorage |
| **Backend** | ASP.NET Core 8 + Entity Framework Core + SQLite |
| **AI Servisi** | Python + Gradio + Transformers (Hugging Face) |
| **Deployment** | Vercel (Web) + Render (API) + HF Spaces (AI) |
| **Veritabanı** | SQLite (otomatik migration destekli) |

---

## ⚙️ Kurulum Adımları

### 1️⃣ Backend (.NET API)

```bash
cd backend/ChatApi
dotnet restore
dotnet ef database update
dotnet run
```

API localhost:5000 üzerinde çalışır.  
**Render** ortamında barındırma için `appsettings.json` dosyasına environment değişkenleri eklenmiştir.

---

### 2️⃣ AI Servisi (Python)

```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

Bu servis Hugging Face Spaces üzerinde yayınlanmıştır.  
Girilen metin `transformers` modeli ile analiz edilip JSON formatında sonuç döner.
Kullanılan model: "cardiffnlp/twitter-roberta-base-sentiment"

## 🧠 AI Model

Uygulamanın duygu analizi (sentiment analysis) kısmında, **Hugging Face** üzerinde barındırılan **CardiffNLP Twitter RoBERTa Base Sentiment** modeli kullanılmıştır.

- **Model:** `cardiffnlp/twitter-roberta-base-sentiment`
- **Kütüphane:** 🤗 Transformers (Hugging Face)
- **Yapı:** RoBERTa (BERT türevi, optimized pretraining)
- **Sınıflar:** `NEGATIVE`, `NEUTRAL`, `POSITIVE`
- **Veri seti:** Twitter (Cardiff University NLP Group)
- **API:** FastAPI + Python (`/analyze` endpoint)
- **Barındırma:** Hugging Face Spaces (`https://kocgurbuz-sentiment-api.hf.space`)

Bu model kısa metinlerdeki duygusal tonu başarılı şekilde tespit eder ve backend servisinde REST API olarak entegre edilmiştir.


---

### 3️⃣ Web (React)

```bash
cd frontend/react-chat
npm install
npm run dev
```

`.env.production` dosyasında backend ve AI API URL'leri bulunur:

```
VITE_API_URL=https://fullstack-ai-chat-edry.onrender.com
VITE_AI_URL=https://kocgurbuz-sentiment-api.hf.space
```

---

### 4️⃣ Mobil (React Native CLI)

```bash
cd mobile
npm install
npx react-native run-android
```

APK dosyası ayrıca Google Drive’da paylaşılmıştır.  
Mobil uygulama da aynı API endpoint’lerini kullanır.

---

## 🧩 Elle Yazılan Kısımlar (Manuel Kodlama)

Projede AI yardımı olmadan **tamamen manuel** yazılmış bölümler bulunmaktadır. AI nin yazdığı kodlar ise detaylıca incelenip projeye eklenmiştir.

### 🟦 Backend (.NET Core)

**`UserController.cs`**
- Takma adın (`nickname`) **benzersiz (unique)** olmasını sağlayan kontrol.  
- Eğer kullanıcı zaten kayıtlıysa, aynı ID ile döndürülür.  

**`MessageController.cs`**
- Her gelen mesajı AI servisine `HttpClient` üzerinden gönderir.  
- Dönen sentiment ve skor verilerini veritabanına kaydeder.  
- Asenkron işlem yönetimi (async/await) manuel yazılmıştır.

**`AppDb.cs`**
- Entity Framework Core yapılandırması.  
- `DbSet<User>` ve `DbSet<Message>` koleksiyonları elle oluşturulmuştur.  

---

### 🟩 Web (React - `App.jsx`)
- `createUser()` fonksiyonu tamamen el ile yazılmıştır.  
  - Nickname kontrolü, localStorage kaydı, backend isteği yapılır.  
- `useEffect` ile otomatik mesaj güncelleme (polling) ve auto-scroll yönetimi.  
- Klavye açılışında/gizlenmesinde son mesaja kaydırma mantığı.  
- Logout işlemi sonrası input sıfırlama ve session temizleme.  

---

### 🟨 Mobil (React Native - `App.tsx`)
- Kullanıcı oturum bilgileri `AsyncStorage` ile saklanır.  
- Giriş sonrası API’ye bağlanma, mesaj gönderimi, liste güncelleme işlemleri tamamen manuel olarak tanımlanmıştır.  
- Klavye açılınca görünümün yukarı kayması (KeyboardAvoidingView) optimize edilmiştir.

---

### 🟥 AI Servisi (`app.py`)
- Hugging Face modeli (`distilbert-base-uncased-finetuned-sst-2-english`) ile sentiment analizi yapılır.  
- Gradio API wrapper elle yapılandırılmıştır.  
- Modele gelen text parametresi direkt işlenip JSON olarak döner.  

---

## 🧭 Mimari Akış

```
Kullanıcı (Web/Mobil)
      ↓
    Backend (.NET)
      ↓
AI Servisi (Python - Hugging Face)
      ↓
Sentiment Sonucu + SQLite’e Kaydetme
      ↓
Ekrana Anında Gösterim (React/React Native)
```

---

