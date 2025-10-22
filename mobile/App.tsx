import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Keyboard, Platform, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';


// ==== Types ====
type Sentiment = "POSITIVE" | "NEGATIVE" | "NEUTRAL";

interface User {
  id: number;
  nickname: string;
  createdAt: string;
}

interface Message {
  id: number;
  userId: number;
  text: string;
  sentiment: Sentiment;
  sentimentScore?: number;
  createdAt: string;
  user?: User;
}

const mergeUnique = (a: Message[], b: Message[]) => {
  const map = new Map<number, Message>();
  [...a, ...b].forEach(m => map.set(m.id, m));
  return Array.from(map.values())
    .sort((x, y) => new Date(x.createdAt).getTime() - new Date(y.createdAt).getTime());
};


// ==== API base ====
const API = "https://fullstack-ai-chat-edry.onrender.com";

// ==== UI helpers ====
const Badge: React.FC<{ label?: Sentiment }> = ({ label }) => {
  const type = (label ?? "NEUTRAL").toUpperCase() as Sentiment;
  const bg = type === "POSITIVE" ? "#DCFCE7" : type === "NEGATIVE" ? "#FEE2E2" : "#E2E8F0";
  const fg = type === "POSITIVE" ? "#166534" : type === "NEGATIVE" ? "#991B1B" : "#334155";
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: fg }]}>{type}</Text>
    </View>
  );
};

export default function App() {
  const [nickname, setNickname] = useState<string>("");
  const [userId, setUserId] = useState<number | null>(null);
  const [text, setText] = useState<string>("");
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flatListRef = useRef<FlatList<Message>>(null);
  const inputRef = useRef<TextInput>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const USER_KEY = "chat.user";


  useEffect(() => {
    const loadUser = async () => {
      try {
        const raw = await AsyncStorage.getItem("chat.user");
        if (raw) {
          const u = JSON.parse(raw);
          if (u?.id && u?.nickname) {
            setUserId(u.id);
            setNickname(u.nickname);
          }
        }
      } catch { }
    };
    loadUser();
  }, []);



  // tüm mesajları yükle
  const loadAll = async (): Promise<void> => {
    try {
      const r = await axios.get<Message[]>(`${API}/api/messages`);
      setMsgs(prev => mergeUnique(prev, r.data ?? []));
    } catch {
      // sessiz geç
    }
  };

  

  // 3sn polling
  useEffect((): (() => void) | void => {
    if (!userId) return;
    loadAll();
    timerRef.current = setInterval(loadAll, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [userId]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }),
        Platform.OS === "android" ? 60 : 0);
    });
  };

  // kullanıcının pozisyonunu takip et
  const onListScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - (layoutMeasurement.height + contentOffset.y);
    // 120px’den daha azsa "alta yakın" say (otomatik kaydır)
    setAutoScroll(distanceFromBottom < 120);
  };

  useEffect(() => {
    if (autoScroll && msgs.length > 0) {
      scrollToBottom();
    }
  }, [msgs, autoScroll]);



  // kullanıcı oluştur
  const createUser = async (): Promise<void> => {
    const nn = nickname.trim();
    if (nn.length < 2 || nn.length > 20) return;

    try {
      const r = await axios.post<User>(`${API}/api/users`, { nickname: nn });
      setUserId(r.data.id);
      await AsyncStorage.setItem("chat.user", JSON.stringify(r.data));
    } catch (e: any) {
      // Hata olursa: zaten var olabilir → tekrar GET ile dene
      try {
        const r2 = await axios.get<User>(`${API}/api/users/by-nickname`, { params: { nickname: nn } });
        setUserId(r2.data.id);
        await AsyncStorage.setItem("chat.user", JSON.stringify(r2.data));
      } catch (e2: any) {
        console.warn("user create/login failed", e2?.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("chat.user");
      setUserId(null);
      setNickname("");
      setUserId(null);
      setText("");       // ✅ input’u temizle

    } catch (e) {
      console.warn("Logout failed", e);
    }
  };



  // mesaj gönder
  const send = async (): Promise<void> => {
    const t = text.trim();
    if (!t || !userId) return;
    setLoading(true);
    try {
      const r = await axios.post<Message>(`${API}/api/messages`, { userId, text: t });
      setMsgs(prev => mergeUnique(prev, [r.data]));
      setText("");
      requestAnimationFrame(() => inputRef.current?.focus());
      scrollToBottom();
    } catch (e: any) {
      console.warn("send failed", e?.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const mine = Number(item?.user?.id ?? item?.userId) === Number(userId);
    return (
      <View style={[styles.msgRow, mine ? styles.right : styles.left]}>
        <View style={[styles.bubble, mine && styles.mine]}>
          <Text style={styles.nick}>{item?.user?.nickname ?? "user"}</Text>
          <Text style={styles.text}>{item.text}</Text>
          <View style={styles.meta}>
            <Badge label={item.sentiment} />
            <Text style={styles.metaText}>{(item.sentimentScore ?? 0).toFixed(2)}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>
              {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // nickname ekranı
  if (!userId) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.wrapNickName}>
          <View style={styles.nicknameCard}>
            <Text style={styles.title}>Choose a nickname</Text>
            <Text style={styles.help}>2–20 characters. This name will appear in the chat list.</Text>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="e.g. kerem19"
              style={styles.input}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.primary} onPress={createUser}>
              <Text style={styles.primaryText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>

    );
  }

  // chat ekranı
  return (

    <SafeAreaProvider>
      <SafeAreaView style={styles.wrap}>
        <View style={styles.header}>
          <Text style={styles.brand}>Mood Chat</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>Log Out</Text>
          </TouchableOpacity>
        </View>


        <FlatList<Message>
          ref={flatListRef}
          data={msgs}
          keyExtractor={(it, idx) => `${it.id}-${it.createdAt}-${idx}`}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12, paddingBottom: 84 }} // inputBar yüksekliği kadar boşluk
          style={styles.list}
          onScroll={onListScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => { if (autoScroll) scrollToBottom(); }} // içerik büyüdükçe (yeni mesaj), alta in
        />


        <View style={styles.inputBar}>
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder="Send a message..."
            style={styles.textbox}
            multiline
            blurOnSubmit={false}
            returnKeyType="send"
            onSubmitEditing={() => {
              if (!loading && text.trim()) send();
            }}
          />

          <TouchableOpacity onPress={send} style={[styles.sendBtn, loading && { opacity: 0.6 }]} disabled={loading}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#0b0f17" },
  header: {
    height: 56, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#1f2937",
    backgroundColor: "#121826", flexDirection: "row", alignItems: "center", justifyContent: "space-between"
  },
  brand: { color: "#e2e8f0", fontWeight: "700", fontSize: 16 },
  logout: { color: "#94a3b8", fontSize: 12 },
  list: { flex: 1 },
  msgRow: { flexDirection: "row", marginBottom: 10 },
  left: { justifyContent: "flex-start" },
  right: { justifyContent: "flex-end" },
  bubble: {
    maxWidth: "78%", backgroundColor: "#0f172a", borderWidth: 1, borderColor: "#1f2937",
    padding: 10, borderRadius: 12
  },
  mine: { backgroundColor: "#0b1222" },
  nick: { color: "#e2e8f0", fontWeight: "700", marginBottom: 6 },
  text: { color: "#e2e8f0" },
  meta: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  metaText: { color: "#94a3b8", fontSize: 12, marginLeft: 6 },
  metaDot: { color: "#475569", marginHorizontal: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontWeight: "700", fontSize: 12 },
  card: {
    margin: 16, padding: 18, borderRadius: 14, backgroundColor: "#121826",
    borderWidth: 1, borderColor: "#1f2937"
  },
  title: { color: "#e2e8f0", fontWeight: "700", fontSize: 18, marginBottom: 8 },
  help: { color: "#94a3b8", fontSize: 12, marginBottom: 12 },
  input: {
    backgroundColor: "#0a101c", color: "#e2e8f0", borderWidth: 1, borderColor: "#1f2937",
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10
  },
  primary: { marginTop: 12, backgroundColor: "#3b82f6", padding: 12, borderRadius: 10, alignItems: "center" },
  primaryText: { color: "white", fontWeight: "700" },
  inputBar: {
    flexDirection: "row", padding: 10, borderTopWidth: 1, borderTopColor: "#1f2937", backgroundColor: "#0c1321"
  },
  textbox: {
    flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: "#0a101c", color: "#e2e8f0",
    borderWidth: 1, borderColor: "#1f2937", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10
  },
  sendText: { color: "#fff", fontWeight: "700" },
  nicknameCard: {
    width: "90%",
    backgroundColor: "#121826",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  wrapNickName: {
    flex: 1,
    backgroundColor: "#0b0f17",
    justifyContent: "center",
    alignItems: "center"
  },
});
