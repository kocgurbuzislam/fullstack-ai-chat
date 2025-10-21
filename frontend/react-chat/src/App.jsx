import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./app.css";

const API = import.meta.env.VITE_API_BASE;
const S = {
  get: (k) => window.sessionStorage.getItem(k),
  set: (k, v) => window.sessionStorage.setItem(k, v),
  del: (k) => window.sessionStorage.removeItem(k),
  clearUser: () => { S.del("nn"); S.del("uid"); }
};

// sentiment → rozet sınıfı
const badgeClass = (s) =>
  s === "POSITIVE" ? "badge pos" : s === "NEGATIVE" ? "badge neg" : "badge neu";

export default function App() {
  const [nickname, setNickname] = useState(S.get("nn") || "");
  const [userId, setUserId] = useState(S.get("uid") || "");
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [lastAt, setLastAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  // ilk yükleme
  useEffect(() => {
    const boot = async () => {
      if (!nickname) return;
      if (!userId) {
        try {
          const r = await axios.post(`${API}/api/users`, { nickname });
          setUserId(r.data.id); S.set("uid", r.data.id);
        } catch { }
      }
      const r = await axios.get(`${API}/api/messages`);
      setMsgs(r.data);
      if (r.data?.length) setLastAt(r.data[r.data.length - 1].createdAt);
    };
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nickname]);

  // artımlı polling (3 sn)
  useEffect(() => {
    if (!nickname || !userId) return;
    const t = setInterval(async () => {
      try {
        setLoading(true);
        const params = lastAt ? { since: lastAt } : {};
        const r = await axios.get(`${API}/api/messages`, { params });
        if (r.data?.length) {
          setMsgs((prev) => {
            const seen = new Set(prev.map((m) => m.id));
            const merged = [...prev];
            for (const m of r.data) if (!seen.has(m.id)) merged.push(m);
            return merged;
          });
          setLastAt(r.data[r.data.length - 1].createdAt);
        }
      } finally { setLoading(false); }
    }, 3000);
    return () => clearInterval(t);
  }, [nickname, userId, lastAt]);

  // auto-scroll
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [msgs.length]);

  const send = async () => {
    const t = text.trim();
    if (!t || !userId) return;
    const r = await axios.post(`${API}/api/messages`, { userId: +userId, text: t });
    setMsgs((p) => [...p, r.data]);
    setText("");
    setLastAt(r.data.createdAt);
  };

  /* --------------- Nickname ekranı --------------- */
  if (!nickname) {
    return (
      <div className="nickWrap">
        <div className="nickCard">
          <h2>Takma adını seç</h2>
          <p>2–20 karakter. Bu isim sohbet listesinde görünecek.</p>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const raw = e.currentTarget.nn.value || "";
            const nn = raw.trim();
            if (nn.length < 2 || nn.length > 20) return;
            S.clearUser(); S.set("nn", nn);
            setNickname(nn);
            try {
              const r = await axios.post(`${API}/api/users`, { nickname: nn });
              setUserId(r.data.id); S.set("uid", r.data.id);
            } catch { }
          }}>
            <input name="nn" className="nickInput" placeholder="ör. kerem19" maxLength={20} autoFocus />
            <button className="nickBtn" type="submit">Devam</button>
          </form>
        </div>
      </div>
    );
  }

  /* --------------- Chat ekranı --------------- */
  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="dot" />
          <div className="title">AI Chat</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginLeft: 8 }}>
            {loading ? "Senkronize ediliyor…" : "Canlı"}
          </div>
        </div>
        <button
          className="logout"
          onClick={() => { S.clearUser(); setNickname(""); setUserId(""); }}
        >
          Çıkış yap
        </button>
      </header>

      <main className="main">
        <section className="panel chat" style={{ minHeight: 420 }}>
          <div ref={listRef} className="messages">
            {!msgs.length && <div className="empty">Henüz mesaj yok. İlk mesajını gönder.</div>}
            {msgs.map((m) => {
              const mine = Number(m.user?.id ?? m.userId) === Number(userId);
              return (
                <div key={m.id ?? Math.random()} className={`row ${mine ? "me" : "other"}`}>
                  <div className={`bubble ${mine ? "me" : ""}`}>
                    <div style={{ fontWeight: 600, marginBottom: 6, opacity: .9 }}>
                      {m.user?.nickname ?? nickname}
                    </div>
                    <div>{m.text}</div>
                    <div className="meta">
                      <span className={badgeClass(m.sentiment)}>
                        {m.sentiment}
                      </span>
                      <span>{(m.sentimentScore ?? 0).toFixed(2)}</span>
                      <span>•</span>
                      <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="footer">
            <form className="inputBar" onSubmit={(e) => { e.preventDefault(); send(); }}>
              <input
                className="input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Bir mesaj yaz..."
              />
              <button className="send" type="submit">Gönder</button>
            </form>
            <div className="hint">Enter ile gönder, 3 sn’de bir otomatik senkron.

            </div>
          </div>


        </section>
      </main>
    </div>
  );
}
