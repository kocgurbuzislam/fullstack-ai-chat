### Full Stack AI Chat

Hazırlayan: İslam Koçgürbüz

## Proje Özeti

Bu proje, kullanıcıların sohbet ederek mesajlaşabildiği ve her mesajın AI tarafından duygu analizi (Positive / Neutral / Negative) ile etiketlendiği tam yığın bir chat uygulamasıdır.
Tüm sistem; React (Web), React Native (Mobil), .NET Core (Backend) ve Hugging Face Spaces (AI Servisi) katmanlarından oluşmaktadır.

🌍 Canlı Demo Linkleri</br>

💻 Web (Frontend)	Vercel:	https://fullstack-ai-chat-n3zas7paz-islams-projects-0e144e92.vercel.app</br>

⚙️ Backend API	Render:	https://fullstack-ai-chat-edry.onrender.com </br>

🧠 AI Servisi Hugging Face Spaces:	https://kocgurbuz-sentiment-api.hf.space</br>

📱 Mobil APK	Android Build (Drive):	https://drive.google.com/file/d/1_eBBfZKZjp4ieeQhR1YGsbmBS71kp0I3/view?usp=sharing</br>
🧩 Proje Mimarisi</br>
Frontend (React Web)   ─┐</br>
                        │   →  Backend API (.NET Core)</br>
Mobil (React Native) ───┘</br>
                             ↓</br>
                      AI Servisi (Hugging Face)</br>
                             ↓</br>
                          SQLite DB


Veri akışı:

Kullanıcı mesaj yazar → Backend’e gönderilir

Backend mesajı kaydeder ve AI servisine yollar

AI sonucu (pozitif, nötr, negatif) döndürür

Backend sonucu DB’ye yazar → Frontend’e gerçek zamanlı gösterilir

⚙️ Klasör Yapısı
/frontend    → React (Vite) web arayüzü
/mobile      → React Native (CLI) mobil uygulama
/backend     → .NET 8 Web API + EF Core + SQLite
/ai-service  → Hugging Face Spaces (transformers + gradio)

🧱 Kurulum Adımları
1️⃣ Ortak Gereksinimler

Node.js 20+

.NET SDK 8.0+

Python 3.10+

Android Studio (React Native CLI için)

Git ve npm yüklü olmalı

2️⃣ Backend (.NET Core)
cd backend/ChatApi
dotnet restore
dotnet ef database update
dotnet run


📦 Çalışma adresi: http://localhost:5259

appsettings.json veya .env:

{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=chat.db"
  },
  "AiServiceUrl": "https://kocgurbuz-sentiment-api.hf.space/analyze"
}

3️⃣ AI Servisi (Hugging Face)

Hugging Face Spaces ortamında gradio ve transformers kullanıldı.

analyze endpoint’i POST isteği ile JSON alır:

{ "text": "this is amazing" }


Dönüş:

{ "label": "POSITIVE", "score": 0.98 }

4️⃣ Web (React Vite)
cd frontend
npm install
npm run dev


.env

VITE_API_BASE=http://localhost:5259


.env.production

VITE_API_BASE=https://fullstack-ai-chat-edry.onrender.com

5️⃣ Mobil (React Native CLI)
cd mobile
npm install
npx react-native run-android


APK oluşturmak için:

cd android
./gradlew assembleRelease


APK yolu:

mobile/android/app/build/outputs/apk/release/app-release.apk

🧠 Kullanılan AI & Teknolojiler
Katman	Teknoloji
Frontend	React (Vite), Axios
Mobil	React Native CLI
Backend	.NET 8, Entity Framework Core, SQLite
AI	Hugging Face Transformers, Gradio
Hosting	Vercel, Render, Hugging Face Spaces
🧾 Kod Hakimiyeti Kanıtı

Projede aşağıdaki kısımlar tamamen manuel olarak tarafımdan yazılmıştır:

.NET Core API içindeki MessagesController.cs ve UserController.cs

EF Core migration işlemleri ve veritabanı şeması (Users, Messages)

React ve React Native tarafında auto-scroll, nickname kaydı, sentiment rozetleri ve çıkış yönetimi

CSS / UI düzenlemeleri

AI yardımı yalnızca tasarımsal CSS düzenlerinde ve açıklama metinlerinde alınmıştır.

📸 Ekran Görüntüleri
Web	Mobil

	
💡 Mimari Özeti

Kullanıcı oturumu: sessionStorage (web) ve AsyncStorage (mobil)

AI entegrasyonu: Backend → Hugging Face endpoint

Mesajlaşma: Backend’de polling ile her 3 sn’de güncelleme

Deploy zinciri:
Frontend → Vercel, Backend → Render, AI → Hugging Face

✅ Durum Özeti

✔️ AI servisi aktif
✔️ Backend API Render üzerinde çalışıyor
✔️ Web & Mobil arayüzleri canlı
✔️ Veritabanı bağlantısı SQLite ile
✔️ Kullanıcı oturumları ve sentiment analizi sorunsuz


