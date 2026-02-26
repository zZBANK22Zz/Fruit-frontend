import { useState, useEffect } from "react";
import Head from "next/head";
import { useLanguage } from "../utils/LanguageContext";

// ─── Colour tokens ──────────────────────────────────────────────────────────
const C = {
  bg: "#0d1117",
  surface: "#161b22",
  border: "#30363d",
  accent: "#f97316",   // orange
  accentDim: "#7c3aed", // purple
  green: "#3fb950",
  blue: "#58a6ff",
  text: "#e6edf3",
  muted: "#8b949e",
};

// ─── Badge ───────────────────────────────────────────────────────────────────
function Badge({ children, color = C.accent }) {
  return (
    <span style={{
      background: color + "22",
      color,
      border: `1px solid ${color}44`,
      borderRadius: 6,
      padding: "2px 10px",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
    }}>
      {children}
    </span>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <h2 style={{ color: C.text, fontSize: 20, fontWeight: 700, margin: 0 }}>{title}</h2>
      </div>
      {subtitle && (
        <p style={{ color: C.muted, fontSize: 13, marginTop: 6, marginLeft: 36 }}>{subtitle}</p>
      )}
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: "20px 24px",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Code Block ──────────────────────────────────────────────────────────────
function Code({ children, language = "" }) {
  return (
    <div style={{
      background: "#010409",
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: "16px 20px",
      fontFamily: "'Fira Code', 'Cascadia Code', monospace",
      fontSize: 13,
      color: "#e6edf3",
      lineHeight: 1.7,
      overflowX: "auto",
      position: "relative",
    }}>
      {language && (
        <span style={{
          position: "absolute", top: 8, right: 12,
          color: C.muted, fontSize: 11, fontFamily: "sans-serif",
        }}>{language}</span>
      )}
      <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{children}</pre>
    </div>
  );
}

// ─── Flow Step ───────────────────────────────────────────────────────────────
function FlowStep({ step, label, desc, last = false }) {
  return (
    <div style={{ display: "flex", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: C.accent + "22", border: `2px solid ${C.accent}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: C.accent, fontWeight: 700, fontSize: 13, flexShrink: 0,
        }}>{step}</div>
        {!last && <div style={{ width: 2, flex: 1, background: C.border, marginBlock: 4 }} />}
      </div>
      <div style={{ paddingBottom: last ? 0 : 20 }}>
        <div style={{ color: C.text, fontWeight: 600, fontSize: 14 }}>{label}</div>
        {desc && <div style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>{desc}</div>}
      </div>
    </div>
  );
}

// ─── API Row ─────────────────────────────────────────────────────────────────
function ApiRow({ method, path, desc, auth }) {
  const methodColor = {
    GET: C.green, POST: C.blue, PUT: C.accent, DELETE: "#f85149",
  }[method] || C.text;
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "60px 1fr 1fr auto",
      gap: 12,
      padding: "10px 0",
      borderBottom: `1px solid ${C.border}`,
      alignItems: "center",
      fontSize: 13,
    }}>
      <span style={{ color: methodColor, fontWeight: 700, fontFamily: "monospace" }}>{method}</span>
      <code style={{ color: C.blue, fontFamily: "monospace", fontSize: 12 }}>{path}</code>
      <span style={{ color: C.muted }}>{desc}</span>
      {auth && <Badge color={C.accentDim}>🔒 Auth</Badge>}
    </div>
  );
}

// ─── DB Table Row ─────────────────────────────────────────────────────────────
function DbTableRow({ table, columns, desc }) {
  return (
    <Card style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
        <span style={{ color: C.accent, fontWeight: 700, fontFamily: "monospace", fontSize: 14 }}>
          {table}
        </span>
        <span style={{ color: C.muted, fontSize: 12 }}>{desc}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {columns.map(col => (
          <span key={col} style={{
            background: "#0d1117", border: `1px solid ${C.border}`,
            borderRadius: 4, padding: "2px 8px", fontSize: 11,
            fontFamily: "monospace", color: C.muted,
          }}>{col}</span>
        ))}
      </div>
    </Card>
  );
}

// ─── Sidebar nav items ────────────────────────────────────────────────────────
export const NAV = (t) => [
  { id: "overview",     label: t('docsNavOverview') || "ภาพรวม",          icon: "🍎" },
  { id: "structure",    label: t('docsNavStructure') || "โครงสร้าง",         icon: "🏗️" },
  { id: "system-flow",  label: "Request Flow",     icon: "🔄" },
  { id: "auth",         label: t('docsNavAuth') || "ระบบล็อกอิน",       icon: "🔐" },
  { id: "order-flow",   label: t('docsNavOrderFlow') || "ระบบออร์เดอร์",     icon: "🛒" },
  { id: "payment",      label: t('docsNavPayment') || "การชำระเงิน",       icon: "💳" },
  { id: "delivery",     label: t('docsNavDelivery') || "ค่าจัดส่ง",          icon: "🚚" },
  { id: "pdf",          label: "Invoice PDF",       icon: "📄" },
  { id: "line",         label: "LINE Notify",       icon: "💬" },
  { id: "database",     label: t('docsNavDatabase') || "ฐานข้อมูล",          icon: "🗄️" },
  { id: "api",          label: "API Reference",    icon: "🌐" },
  { id: "tech",         label: "Tech Stack",       icon: "🛠️" },
];

// ─── System Flow Data ─────────────────────────────────────────────────────────
const FLOW_NODES = (t) => [
  { icon: "🌐", title: "Browser",           sub: "User Device" },
  { icon: "⚛️", title: "Next.js Frontend",  sub: "fruit-app/src/pages/" },
  { icon: "⚡", title: "Express Server",    sub: "backend/server.js" },
  { icon: "🛡️", title: "Middleware",        sub: "authMiddleware.js" },
  { icon: "🎯", title: "Controller",        sub: "app/controller/" },
  { icon: "📦", title: "Model",             sub: "app/model/" },
  { icon: "🗄️", title: "PostgreSQL (Neon)", sub: "Cloud Database" },
];

const SCENARIOS = (t) => [
  {
    tab: `📋 ${t('scenGetProductsTitle') || 'GET สินค้า'}`, method: "GET", path: "/api/fruits", color: "#3fb950",
    steps: [
      { action: t('scenGetProductsStep1Action') || "ผู้ใช้เปิดหน้าเว็บ",            data: "window.location → /",                    note: t('scenGetProductsStep1Note') || "Public route ไม่ต้อง login" },
      { action: t('scenGetProductsStep2Action') || "loadProducts() ใน useEffect",  data: "fetch(`${API_URL}/api/fruits`)",         note: "pages/index.js" },
      { action: t('scenGetProductsStep3Action') || "Express รับ GET /api/fruits",  data: "app.use('/api/fruits', fruitRoutes)",     note: "server.js" },
      { action: t('scenGetProductsStep4Action') || "Public Route → ผ่านเลย ✓",    data: t('scenGetProductsStep4Data') || "ไม่ต้องตรวจ Token",                       note: t('scenGetProductsStep4Note') || "fruitRoutes ไม่มี authMiddleware" },
      { action: "fruitController.getAllFruits", data: "req.query: { category, search }",         note: "controller/fruitController.js" },
      { action: "fruitModel.getAll()",          data: "SELECT * FROM fruits JOIN categories",    note: "model/fruitModel.js" },
      { action: t('scenGetProductsStep7Action') || "DB ส่ง rows กลับ",             data: "[{id, name, price, image_base64, ...}]", note: t('scenGetProductsStep7Note') || "JSON 200 OK → Frontend แสดงผล" },
    ],
  },
  {
    tab: `🛒 ${t('scenOrderTitle') || 'สั่งซื้อ'}`, method: "POST", path: "/api/orders", color: "#f97316",
    steps: [
      { action: t('scenOrderStep1Action') || "กด 'ยืนยันคำสั่งซื้อ'",              data: "{ items, address_id, notes }",                   note: "cart/index.js" },
      { action: t('scenOrderStep2Action') || "ส่ง POST พร้อม JWT Token",          data: "Authorization: Bearer eyJ...",                  note: t('scenOrderStep2Note') || "token จาก localStorage" },
      { action: t('scenOrderStep3Action') || "Express จับ route",                 data: "router.post('/', authMiddleware, createOrder)",  note: "routes/orderRoutes.js" },
      { action: "jwt.verify(token, JWT_SECRET)",     data: "req.user = { id:42, role:'user' }",             note: "middleware/authMiddleware.js" },
      { action: t('scenOrderStep5Action') || "ตรวจสต็อก + คำนวณราคา",            data: "totalAmount + deliveryFee (Google Maps)",       note: "controller/orderController.js" },
      { action: "INSERT INTO orders, order_items",  data: "BEGIN → INSERT → COMMIT",                       note: "model/orderModel.js" },
      { action: t('scenOrderStep7Action') || "บันทึกสำเร็จ",                      data: "{ order_number: 'ORD-2025-0222-42' }",          note: "201 Created → response" },
    ],
  },
  {
    tab: `💳 ${t('scenUploadSlipTitle') || 'อัพสลิป'}`, method: "POST", path: "/api/orders/:id/upload-slip", color: "#58a6ff",
    steps: [
      { action: t('scenUploadSlipStep1Action') || "ถ่ายรูปสลิป + อัพโหลด",             data: "{ image: base64, amount: 350 }",                     note: "payment/index.js" },
      { action: "POST /api/orders/42/upload-slip",  data: "+ Authorization: Bearer eyJ...",                     note: t('scenUploadSlipStep2Note') || "พร้อม JWT Token" },
      { action: "router.post('/:id/upload-slip')",  data: "authMiddleware → uploadPaymentSlip",                 note: "routes/orderRoutes.js" },
      { action: t('scenUploadSlipStep4Action') || "ตรวจว่าเป็นเจ้าของออร์เดอร์",      data: "order.user_id === req.user.id",                      note: t('scenUploadSlipStep4Note') || "403 Forbidden ถ้าไม่ใช่" },
      { action: t('scenUploadSlipStep5Action') || "บันทึก slip + อัพสถานะ paid",       data: "createPaymentSlip() + updateOrderStatus('paid')",    note: "DB Transaction" },
      { action: "INSERT payment_slips + invoices",  data: "generateInvoice() + notifyAdmins()",                 note: t('scenUploadSlipStep6Note') || "model หลายตัว" },
      { action: t('scenUploadSlipStep7Action') || "ส่ง LINE Notify + response",        data: "LineMessagingService.sendPaymentConfirmation()",     note: "201 Created" },
    ],
  },
];

// ─── System Flow Component ────────────────────────────────────────────────────
function SystemFlowSection() {
  const { t } = useLanguage();
  const scenariosData = SCENARIOS(t);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const sc = scenariosData[scenarioIdx];
  const total = sc.steps.length + 1;

  useEffect(() => { setStep(0); }, [scenarioIdx]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setStep(s => (s + 1) % total), 950);
    return () => clearInterval(t);
  }, [playing, total]);

  const isDone = step >= sc.steps.length;
  const curStep = isDone ? null : sc.steps[step];

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {scenariosData.map((s, i) => (
          <button key={i} onClick={() => { setScenarioIdx(i); setStep(0); }} style={{
            padding: "7px 14px", borderRadius: 8,
            border: `1px solid ${scenarioIdx === i ? s.color : C.border}`,
            background: scenarioIdx === i ? s.color + "22" : "transparent",
            color: scenarioIdx === i ? s.color : C.muted,
            cursor: "pointer", fontSize: 12, fontWeight: scenarioIdx === i ? 700 : 400,
            transition: "all 0.2s",
          }}>
            <Badge color={s.color}>{s.method}</Badge> {s.tab}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
        {/* Left: flow nodes */}
        <div>
          {FLOW_NODES.map((node, i) => {
            const isActive = i === step && !isDone;
            const isPast   = i < step || isDone;
            const isLast   = i === FLOW_NODES.length - 1;
            return (
              <div key={i}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  border: `1px solid ${isActive ? sc.color : isPast ? sc.color + "44" : C.border}`,
                  borderRadius: 8, transition: "all 0.35s ease",
                  background: isActive ? sc.color + "18" : isPast ? sc.color + "08" : C.surface,
                  boxShadow: isActive ? `0 0 18px ${sc.color}44` : "none",
                  transform: isActive ? "scale(1.03)" : "scale(1)",
                }}>
                  <span style={{ fontSize: 18, minWidth: 24, textAlign: "center" }}>{node.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: isActive ? sc.color : isPast ? C.text : C.muted, fontWeight: isActive ? 700 : 500, fontSize: 12, transition: "color 0.3s" }}>{node.title}</div>
                    <div style={{ color: C.muted, fontSize: 10 }}>{node.sub}</div>
                  </div>
                  {isActive && <div style={{ width: 7, height: 7, borderRadius: "50%", background: sc.color, animation: "docsPulse 0.8s ease-in-out infinite", flexShrink: 0 }} />}
                  {isPast && !isActive && <span style={{ color: sc.color + "cc", fontSize: 13, flexShrink: 0 }}>✓</span>}
                </div>
                {!isLast && (
                  <div style={{ display: "flex", height: 28, paddingLeft: 22, position: "relative" }}>
                    <div style={{ width: 2, background: (isPast && !isActive) || isDone ? sc.color + "66" : C.border, position: "relative", transition: "background 0.3s" }}>
                      {isActive && (
                        <div style={{ position: "absolute", left: -3, width: 8, height: 8, borderRadius: "50%", background: sc.color, boxShadow: `0 0 8px ${sc.color}`, animation: "docsSlide 0.9s ease-in-out infinite" }} />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {isDone && (
            <div style={{ marginTop: 8, padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.green}`, background: C.green + "18", color: C.green, fontWeight: 700, fontSize: 13, textAlign: "center", animation: "docsFadeIn 0.3s ease" }}>
              ✅ {t('responseSuccess') || 'Response ส่งกลับสำเร็จ'}
            </div>
          )}
        </div>

        {/* Right: step details */}
        <div>
          {/* Endpoint */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "9px 14px", background: "#010409", borderRadius: 8, border: `1px solid ${C.border}` }}>
            <Badge color={sc.color}>{sc.method}</Badge>
            <code style={{ color: C.blue, fontSize: 12 }}>{sc.path}</code>
          </div>

          {/* Steps list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sc.steps.map((s, i) => {
              const isStepActive = i === step;
              const isStepPast   = i < step;
              return (
                <div key={i} style={{
                  padding: isStepActive ? "12px 14px" : "8px 14px",
                  borderRadius: 8, transition: "all 0.3s",
                  border: `1px solid ${isStepActive ? sc.color : isStepPast ? sc.color + "33" : C.border + "55"}`,
                  background: isStepActive ? sc.color + "12" : "transparent",
                  opacity: isStepPast || isStepActive ? 1 : 0.35,
                }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: isStepActive ? sc.color : isStepPast ? sc.color + "cc" : C.muted, fontWeight: 700, fontSize: 11, minWidth: 18, paddingTop: 1 }}>{i + 1}.</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: isStepActive ? C.text : isStepPast ? C.muted : C.border, fontSize: 12, fontWeight: isStepActive ? 600 : 400 }}>{s.action}</div>
                      {isStepActive && (
                        <>
                          <code style={{ display: "block", marginTop: 6, background: "#010409", border: `1px solid ${C.border}`, borderRadius: 4, padding: "5px 8px", fontSize: 11, color: sc.color, fontFamily: "monospace", wordBreak: "break-all" }}>{s.data}</code>
                          <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>💡 {s.note}</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
            <button onClick={() => setPlaying(p => !p)} style={{ padding: "5px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.surface, color: C.text, cursor: "pointer", fontSize: 12 }}>
              {playing ? `⏸ ${t('pause') || 'หยุด'}` : `▶ ${t('play') || 'เล่น'}`}
            </button>
            <button onClick={() => setStep(s => Math.max(0, s - 1))} style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.surface, color: C.muted, cursor: "pointer", fontSize: 12 }}>◀</button>
            <button onClick={() => setStep(s => Math.min(total - 1, s + 1))} style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.surface, color: C.muted, cursor: "pointer", fontSize: 12 }}>▶</button>
            <span style={{ color: C.muted, fontSize: 11 }}>Step {Math.min(step + 1, FLOW_NODES(t).length)} / {FLOW_NODES(t).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function DocsPage() {
  const { t } = useLanguage();
  const [active, setActive] = useState("overview");

  const scrollTo = (id) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Head>
        <title>Fruit WebApp — Developer Docs</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          @keyframes docsSlide {
            0%   { top: -4px; opacity: 0; }
            15%  { opacity: 1; }
            85%  { opacity: 1; }
            100% { top: 26px; opacity: 0; }
          }
          @keyframes docsPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50%       { transform: scale(1.7); opacity: 0.4; }
          }
          @keyframes docsFadeIn {
            from { opacity: 0; transform: translateY(-6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </Head>

      <div style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: "'Inter', sans-serif",
        display: "flex",
      }}>

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside style={{
          width: 240,
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
          background: C.surface,
          borderRight: `1px solid ${C.border}`,
          padding: "20px 0",
        }}>
          {/* Logo */}
          <div style={{ padding: "0 20px 20px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 28 }}>🍎</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Fruit WebApp</div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>Developer Docs</div>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <Badge color={C.green}>v1.0</Badge>
              <span style={{ marginLeft: 6 }}><Badge color={C.accentDim}>Next.js</Badge></span>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding: "12px 8px" }}>
            {NAV(t).map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "8px 12px",
                  background: active === item.id ? C.accent + "18" : "transparent",
                  border: active === item.id ? `1px solid ${C.accent}44` : "1px solid transparent",
                  borderRadius: 8,
                  color: active === item.id ? C.accent : C.muted,
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 13,
                  fontWeight: active === item.id ? 600 : 400,
                  transition: "all 0.15s",
                  marginBottom: 2,
                }}
                onMouseEnter={e => { if (active !== item.id) e.currentTarget.style.color = C.text; }}
                onMouseLeave={e => { if (active !== item.id) e.currentTarget.style.color = C.muted; }}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "12px 20px",
            borderTop: `1px solid ${C.border}`,
            fontSize: 10,
            color: C.muted,
          }}>
            {t('accessibleVia') || 'เข้าถึงได้ผ่าน'} <code style={{ color: C.blue }}>/docs</code> {t('only') || 'เท่านั้น'}<br />
            {t('notOnMainMenu') || 'ไม่แสดงบนเมนูหลัก'}
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <main style={{ flex: 1, overflowY: "auto", padding: "40px 48px", maxWidth: 900 }}>

          {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
          <section id="overview" style={{ marginBottom: 64 }}>
            <div style={{
              background: "linear-gradient(135deg, #f97316 0%, #7c3aed 100%)",
              borderRadius: 16,
              padding: "32px 36px",
              marginBottom: 32,
            }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: 0 }}>
                🍎 Fruit WebApp
              </h1>
              <p style={{ color: "rgba(255,255,255,0.85)", marginTop: 8, fontSize: 15, maxWidth: 560 }}>
                {t('docsOverviewDesc') || 'เว็บไซต์ขายผลไม้ออนไลน์ครบวงจร รองรับทั้งลูกค้าและแอดมิน มีระบบ PromptPay QR, LINE Notify, Invoice PDF และคำนวณค่าส่งอัตโนมัติ'}
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                {["Next.js 14", "Node.js", "PostgreSQL (Neon)", "Vercel", "LINE API", "PromptPay"].map(tag => (
                  <span key={tag} style={{
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: 6, padding: "3px 10px",
                    fontSize: 12, color: "#fff", fontWeight: 600,
                  }}>{tag}</span>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { icon: "👤", title: t('customerUser') || "ลูกค้า (User)", items: [t('customerItem1') || "ค้นหาและดูสินค้าผลไม้", t('customerItem2') || "เพิ่มลงตะกร้า + สั่งซื้อ", t('customerItem3') || "ชำระเงิน QR PromptPay", t('customerItem4') || "อัพโหลดสลิปยืนยันการชำระ", t('customerItem5') || "ติดตามสถานะออร์เดอร์", t('customerItem6') || "ดาวน์โหลด Invoice PDF", t('customerItem7') || "รับแจ้งเตือนทาง LINE"], color: C.green },
                { icon: "🛠️", title: t('adminUser') || "แอดมิน (Admin)", items: [t('adminItem1') || "จัดการสินค้า (CRUD)", t('adminItem2') || "ดูออร์เดอร์ทั้งหมด", t('adminItem3') || "อัพเดทสถานะออร์เดอร์", t('adminItem4') || "อัพโหลดหลักฐานจัดส่ง", t('adminItem5') || "ได้รับ Notification เมื่อมีชำระเงิน", t('adminItem6') || "จัดการหมวดหมู่ผลไม้"], color: C.accent },
              ].map(role => (
                <Card key={role.title}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: role.color }}>
                    {role.icon} {role.title}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 16, color: C.muted, fontSize: 13, lineHeight: 2 }}>
                    {role.items.map(i => <li key={i}>{i}</li>)}
                  </ul>
                </Card>
              ))}
            </div>
          </section>

          {/* ── STRUCTURE ────────────────────────────────────────────────── */}
          <section id="structure" style={{ marginBottom: 64, scrollMarginTop: 24 }}>
            <SectionHeader icon="🏗️" title={t('projectStructureTitle') || "โครงสร้างโปรเจกต์"} subtitle={t('projectStructureSubtitle') || "แบ่งเป็น 2 ส่วนหลัก: Frontend (fruit-app) และ Backend"} />
            <Code language="plaintext">{`fruit-WebApp/
├── fruit-app/          ← Frontend (Next.js) — ${t('whatUserSees') || 'สิ่งที่ user เห็น'}
│   └── src/
│       ├── pages/      ← ${t('pagesRouterBased') || 'หน้าต่างๆ (router-based)'}
│       │   ├── index.js          ${t('pageHome') || 'หน้าแรก'}
│       │   ├── docs.js           ${t('pageDocs') || 'หน้านี้ (Developer Docs)'}
│       │   ├── products/         ${t('pageProducts') || 'หน้าสินค้า + รายละเอียด'}
│       │   ├── cart/             ${t('pageCart') || 'ตะกร้าสินค้า'}
│       │   ├── payment/          ${t('pagePayment') || 'หน้าชำระเงิน QR'}
│       │   ├── bills/            ${t('pageBills') || 'ใบเสร็จ + ติดตามออร์เดอร์'}
│       │   ├── profile/          ${t('pageProfile') || 'โปรไฟล์ผู้ใช้'}
│       │   ├── admin/            ${t('pageAdmin') || 'หน้าแอดมิน'}
│       │   └── registration/     ${t('pageRegistration') || 'ล็อกอิน / สมัครสมาชิก'}
│       ├── components/ ← ${t('reusableUI') || 'UI ที่ใช้ซ้ำ (Navbar, Card, SearchBar...)'}
│       ├── utils/      ← ${t('helperFunctions') || 'Helper functions (imageUtils, liff, ...)'}
│       └── styles/     ← Global CSS
│
└── backend/            ← Backend (Node.js + Express)
    ├── server.js       ← ${t('entryPoint') || 'จุดเริ่มต้น — ลงทะเบียน routes ทั้งหมด'}
    └── app/
        ├── config/     ← Database connection pool
        ├── routes/     ← URL mapping
        ├── controller/ ← Business logic (${t('controllerDesc') || 'รับ req → ประมวลผล → ส่ง res'})
        ├── model/      ← SQL queries (${t('modelDesc') || 'คุยกับ PostgreSQL โดยตรง'})
        ├── middleware/ ← JWT auth guard, Admin guard
        └── services/   ← ${t('specialTasks') || 'งานพิเศษ (PDF, LINE, QR, Google Maps, ...)'}`}</Code>
          </section>

          {/* ── SYSTEM FLOW ───────────────────────────────────────────────── */}
          <section id="system-flow" style={{ marginBottom: 64, scrollMarginTop: 24 }}>
            <SectionHeader icon="🔄" title={t('systemFlowTitle') || "Request Flow Animation"} subtitle={t('systemFlowSubtitle') || "ติดตาม request จากลูกค้าผ่านทุก layer ในระบบ — เลือก scenario แล้วดูการทำงาน"} />
            <SystemFlowSection />
          </section>

          {/* ── AUTH ──────────────────────────────────────────────────────── */}
          <section id="auth" style={{ marginBottom: 64, scrollMarginTop: 24 }}>
            <SectionHeader icon="🔐" title={t('authSystemTitle') || "ระบบล็อกอิน (Authentication)"} subtitle={t('authSystemSubtitle') || "รองรับ 2 วิธี: Email/Password และ LINE Login"} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <Card>
                <div style={{ fontWeight: 700, color: C.blue, marginBottom: 12 }}>📧 Email + Password</div>
                {[
                  ["1", t('emailLoginStep1') || "ลูกค้ากรอก email + password"],
                  ["2", t('emailLoginStep2') || "ตรวจว่า email ซ้ำในระบบไหม"],
                  ["3", t('emailLoginStep3') || "เข้ารหัส password ด้วย bcrypt"],
                  ["4", t('emailLoginStep4') || "สร้าง JWT Token ส่งกลับ"],
                  ["5", t('emailLoginStep5') || "Frontend เก็บ Token ใน localStorage"],
                ].map(([n, text]) => (
                  <div key={n} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 13 }}>
                    <span style={{ color: C.blue, fontWeight: 700, minWidth: 16 }}>{n}.</span>
                    <span style={{ color: C.muted }}>{text}</span>
                  </div>
                ))}
              </Card>
              <Card>
                <div style={{ fontWeight: 700, color: C.green, marginBottom: 12 }}>💚 LINE Login (LIFF)</div>
                {[
                  ["1", t('lineLoginStep1') || "กด Login with LINE"],
                  ["2", t('lineLoginStep2') || "Redirect ไป LINE Authorization"],
                  ["3", t('lineLoginStep3') || "LINE ส่ง code กลับมา"],
                  ["4", t('lineLoginStep4') || "Backend แลก code เป็น access token"],
                  ["5", t('lineLoginStep5') || "ดึงโปรไฟล์ LINE → สร้าง/ค้นหา user"],
                  ["6", t('lineLoginStep6') || "ออก JWT Token เหมือน Email login"],
                ].map(([n, text]) => (
                  <div key={n} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 13 }}>
                    <span style={{ color: C.green, fontWeight: 700, minWidth: 16 }}>{n}.</span>
                    <span style={{ color: C.muted }}>{text}</span>
                  </div>
                ))}
              </Card>
            </div>
            <Code language="JWT Payload">{`{
  "id": 42,
  "username": "somchai",
  "email": "somchai@example.com",
  "role": "user"   // หรือ "admin"
}`}</Code>
            <p style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>
              {t('authReqHeader') || 'ทุก request ที่ต้องการ Auth จะต้องส่ง header:'} <code style={{ color: C.blue }}>Authorization: Bearer &lt;token&gt;</code>
            </p>
          </section>

          {/* ── ORDER FLOW ────────────────────────────────────────────────── */}
          <section id="order-flow" style={{ marginBottom: 64, scrollMarginTop: 24 }}>
            <SectionHeader icon="🛒" title={t('orderSystemTitle') || "ระบบออร์เดอร์"} subtitle={t('orderSystemSubtitle') || "Life cycle ของออร์เดอร์ตั้งแต่สร้างจนถึงจัดส่ง"} />

            <div style={{ marginBottom: 20 }}>
              <div style={{ color: C.muted, fontSize: 13, marginBottom: 12 }}>{t('orderStatusTitle') || 'สถานะออร์เดอร์ (Order Status)'}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                {[
                  ["pending", "#f0b429"],
                  ["paid", C.blue],
                  ["confirmed", C.green],
                  ["preparing", C.accent],
                  ["shipped", C.accentDim],
                  ["received", C.green],
                  ["completed", C.green],
                  ["cancelled", "#f85149"],
                ].map(([s, c], i, arr) => (
                  <span key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      background: c + "22", color: c, border: `1px solid ${c}44`,
                      borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600,
                    }}>{s}</span>
                    {i < arr.length - 1 && <span style={{ color: C.border, fontSize: 18 }}>→</span>}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card>
                <div style={{ fontWeight: 700, color: C.text, marginBottom: 16 }}>🙋 {t('userSide') || 'ฝั่ง User'}</div>
                <FlowStep step={1} label={t('userOrderStep1') || "เลือกสินค้า + กรอกที่อยู่"} />
                <FlowStep step={2} label={t('userOrderStep2') || "สร้างออร์เดอร์"} desc={t('userOrderStep2Desc') || "Backend ตรวจสต็อก, คำนวณราคา+ค่าส่ง"} />
                <FlowStep step={3} label={t('userOrderStep3') || "โอนเงินผ่าน QR PromptPay"} />
                <FlowStep step={4} label={t('userOrderStep4') || "อัพโหลดสลิป"} desc={t('userOrderStep4Desc') || "สถานะ → paid, สร้าง Invoice อัตโนมัติ"} last />
              </Card>
              <Card>
                <div style={{ fontWeight: 700, color: C.text, marginBottom: 16 }}>🛠️ {t('adminSide') || 'ฝั่ง Admin'}</div>
                <FlowStep step={1} label={t('adminOrderStep1') || "รับ Notification แจ้งเตือน"} desc={t('adminOrderStep1Desc') || "ทั้งใน app และ LINE"} />
                <FlowStep step={2} label={t('adminOrderStep2') || "ยืนยันออร์เดอร์"} desc={t('adminOrderStep2Desc') || "confirmed → ตัดสต็อกสินค้า"} />
                <FlowStep step={3} label={t('adminOrderStep3') || "เตรียมสินค้า"} desc={t('adminOrderStep3Desc') || "สถานะ → preparing"} />
                <FlowStep step={4} label={t('adminOrderStep4') || "จัดส่ง + อัพโหลดรูปหลักฐาน"} desc={t('adminOrderStep4Desc') || "สถานะ → shipped"} last />
              </Card>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>{t('orderNumberFormat') || 'เลขออร์เดอร์:'} <code style={{ color: C.blue }}>ORD-YYYY-MMDD-{"{id}"}</code> {t('example') || 'เช่น'} <code style={{ color: C.green }}>ORD-2025-0222-42</code></div>
            </div>

            <Code language="Stock Logic">{`// orderController.js — handleStockManagement()
// ตัดสต็อก: เมื่อออร์เดอร์เปลี่ยนจาก non-committed → committed
committedStatuses = ['confirmed', 'paid', 'preparing', 'shipped', 'received', 'completed']

if (!isOldCommitted && isNewCommitted)  → FruitModel.reduceStock()
if (isOldCommitted && newStatus === 'cancelled') → FruitModel.restoreStock()`}</Code>
          </section>

          {/* ── PAYMENT ──────────────────────────────────────────────────── */}
          <section id="payment" style={{ marginBottom: 64, scrollMarginTop: 24 }}>
            <SectionHeader icon="💳" title={t('paymentSystemTitle') || "ระบบชำระเงิน"} subtitle={t('paymentSystemSubtitle') || "Thai QR PromptPay — อัพโหลดสลิป"} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <FlowStep step={1} label={t('paymentStep1') || "ผู้ใช้กด 'สั่งซื้อ'"} desc={t('paymentStep1Desc') || "Backend สร้างออร์เดอร์ status=pending"} />
                <FlowStep step={2} label={t('paymentStep2') || "Frontend ขอ QR Code"} desc="GET /api/orders/:id/qr-code" />
                <FlowStep step={3} label={t('paymentStep3') || "Backend สร้าง QR PromptPay"} desc={t('paymentStep3Desc') || "ใช้ library promptpay-qr (เบอร์โทร + จำนวนเงิน)"} />
                <FlowStep step={4} label={t('paymentStep4') || "ผู้ใช้สแกน + โอนเงิน"} />
                <FlowStep step={5} label={t('paymentStep5') || "อัพโหลดรูปสลิป"} desc="POST /api/orders/:id/upload-slip (base64)" />
                <FlowStep step={6} label={t('paymentStep6') || "Backend อัพสถานะ paid"} desc={t('paymentStep6Desc') || "สร้าง Invoice + แจ้งเตือน Admin"} last />
              </div>
              <Code language="QRPromptPayService.js">{`// services/qrPromptPayService.js
static async generateQRCodeForOrder(order) {
  const phoneNumber = process.env.PROMPTPAY_PHONE;
  const payload = generatePayload(phoneNumber, {
    amount: order.total_amount,
  });
  const qrCodeDataURL = await QRCode.toDataURL(payload);
  return { qrCodeDataURL, payload, phoneNumber };
}`}</Code>
            </div>
          </section>

          {/* ── DELIVERY ─────────────────────────────────────────────────── */}
          <section id="delivery" style={{ marginBottom: 64, scrollMarginTop: 24 }}>
            <SectionHeader icon="🚚" title={t('deliverySystemTitle') || "ระบบค่าจัดส่ง"} subtitle={t('deliverySystemSubtitle') || "คำนวณอัตโนมัติตามระยะทาง (Google Maps API) + น้ำหนักสินค้า"} />
            <Card style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 24, fontSize: 13 }}>
                <div>
                  <div style={{ color: C.muted, marginBottom: 6 }}>{t('steps') || 'ขั้นตอน:'}</div>
                  {[
                    t('deliveryStep1') || "ลูกค้าเลือก/กรอกที่อยู่",
                    t('deliveryStep2') || "แปลงที่อยู่เป็น GPS (Google Geocoding API)",
                    t('deliveryStep3') || "คำนวณระยะทางจากร้าน → บ้านลูกค้า (Google Distance Matrix)",
                    t('deliveryStep4') || "ค่าส่ง = f(ระยะทาง, น้ำหนักรวมของสินค้า)",
                    t('deliveryStep5') || "แสดงค่าส่งก่อน user กด Checkout",
                  ].map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, color: C.muted }}>
                      <span style={{ color: C.accent, fontWeight: 700 }}>{i + 1}.</span> {s}
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: C.muted, marginBottom: 6 }}>{t('relatedFiles') || 'ไฟล์ที่เกี่ยวข้อง:'}</div>
                  {[
                    ["deliveryService.js", t('deliveryFile1Desc') || "Logic คำนวณค่าส่ง"],
                    ["googleMapsService.js", t('deliveryFile2Desc') || "เรียก Google Maps API"],
                    ["deliveryController.js", "POST /api/delivery/calculate"],
                    ["addressModel.js", t('deliveryFile4Desc') || "เก็บที่อยู่ + พิกัด GPS"],
                  ].map(([f, d]) => (
                    <div key={f} style={{ marginBottom: 6, fontSize: 12 }}>
                      <code style={{ color: C.blue }}>{f}</code>
                      <span style={{ color: C.muted }}> — {d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </section>

          {/* ── PDF ──────────────────────────────────────────────────────── */}
          <section id="pdf" style={{ marginBottom: 64, scrollMarginTop: 24 }}>
            <SectionHeader icon="📄" title={t('pdfSystemTitle') || "ระบบ Invoice & PDF"} subtitle={t('pdfSystemSubtitle') || "สร้างใบเสร็จ PDF อัตโนมัติเมื่อชำระเงินสำเร็จ"} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card>
                <div style={{ fontWeight: 700, marginBottom: 12, color: C.text, fontSize: 13 }}>{t('invoiceTriggerTitle') || 'สิ่งที่ทริกเกอร์การสร้าง Invoice'}</div>
                {[
                  t('invoiceTrigger1') || "ผู้ใช้อัพโหลดสลิป → status เปลี่ยนเป็น paid",
                  t('invoiceTrigger2') || "แอดมินอัพเดทสถานะเป็น paid",
                  t('invoiceTrigger3') || "ผู้ใช้กด Confirm Payment",
                ].map((text, i) => (
                  <div key={i} style={{ color: C.muted, fontSize: 13, marginBottom: 6, display: "flex", gap: 8 }}>
                    <span style={{ color: C.green }}>✓</span> {text}
                  </div>
                ))}
                <div style={{ marginTop: 16, fontWeight: 700, fontSize: 13, marginBottom: 8, color: C.text }}>
                  {t('invoiceContentTitle') || 'สิ่งที่อยู่ใน PDF:'}
                </div>
                {[t('invoiceContent1') || "โลโก้ร้าน", t('invoiceContent2') || "เลข Invoice", t('invoiceContent3') || "วันที่ชำระ", t('invoiceContent4') || "รายการสินค้า + ราคา", t('invoiceContent5') || "ค่าจัดส่ง", t('invoiceContent6') || "ยอดรวม", t('invoiceContent7') || "ข้อมูลผู้ซื้อ"].map(item => (
                  <div key={item} style={{ color: C.muted, fontSize: 13, marginBottom: 4, display: "flex", gap: 8 }}>
                    <span style={{ color: C.accent }}>•</span> {item}
                  </div>
                ))}
              </Card>
              <Code language="pdfService.js">{`// services/pdfService.js (ใช้ PDFKit)
// รองรับฟอนต์ภาษาไทย (thaiFont.js)

static generateInvoicePDF(invoiceData) {
  const doc = new PDFDocument({ margin: 50 });
  // Logo
  doc.image(shopLogo, 50, 45, { width: 80 });
  // Invoice Number
  doc.text(\`Invoice: \${invoiceData.invoice_number}\`);
  // Items table (สินค้า + ราคา + จำนวน)
  invoiceData.items.forEach(item => {
    doc.text(item.fruit_name);
    doc.text(\`฿\${item.price}\`);
  });
  // Total
  doc.text(\`รวม: ฿\${invoiceData.total_amount}\`);
  return doc;
}`}</Code>
            </div>
          </section>

          {/* ── LINE ──────────────────────────────────────────────────────── */}
          <section id="line" style={{ marginBottom: 64, scrollMarginTop: 24 }}>
            <SectionHeader icon="💬" title={t('lineNotificationTitle') || "LINE Messaging Notification"} subtitle={t('lineNotificationSubtitle') || "ส่งข้อความแจ้งเตือนหาผู้ใช้ผ่าน LINE Messaging API"} />
            <Card>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr>
                      {[t('lineHeader1') || "เหตุการณ์", t('lineHeader2') || "ผู้รับ", t('lineHeader3') || "เนื้อหา"].map(h => (
                        <th key={h} style={{
                          textAlign: "left", padding: "8px 12px",
                          color: C.muted, fontWeight: 600, fontSize: 12,
                          borderBottom: `1px solid ${C.border}`,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      [t('lineEvent1') || "ชำระเงินสำเร็จ", t('lineRecipient1') || "ลูกค้า (LINE User)", t('lineContent1') || "ยืนยันออร์เดอร์, รายการสินค้า, ยอดเงิน"],
                      [t('lineEvent2') || "New Payment Received", t('lineRecipient2') || "แอดมินทุกคน (In-app)", t('lineContent2') || "เลขออร์เดอร์ + ยอดเงิน"],
                      [t('lineEvent3') || "Slip ถูกอัพโหลด", t('lineRecipient3') || "แอดมินทุกคน (In-app)", t('lineContent3') || "แจ้งให้ตรวจสอบและยืนยัน"],
                    ].map(([ev, rec, msg]) => (
                      <tr key={ev}>
                        <td style={{ padding: "10px 12px", color: C.text, borderBottom: `1px solid ${C.border}22` }}>{ev}</td>
                        <td style={{ padding: "10px 12px", color: C.green, borderBottom: `1px solid ${C.border}22` }}>{rec}</td>
                        <td style={{ padding: "10px 12px", color: C.muted, borderBottom: `1px solid ${C.border}22` }}>{msg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <p style={{ color: C.muted, fontSize: 12, marginTop: 12 }}>
              {t('lineSetupText1') || 'ต้องตั้งค่า'} <code style={{ color: C.blue }}>LINE_CHANNEL_ACCESS_TOKEN</code> {t('lineSetupText2') || 'ใน'} <code style={{ color: C.blue }}>.env</code>
              {t('lineSetupText3') || 'และผู้ใช้ต้องล็อกอินด้วย LINE เพื่อให้ระบบมี'} <code style={{ color: C.blue }}>line_user_id</code>
            </p>
          </section>

          {/* ── DATABASE ─────────────────────────────────────────────────── */}
          <section id="database" style={{ marginBottom: 64, scrollMarginTop: 24 }}>
            <SectionHeader icon="🗄️" title={t('databaseTitle') || "ฐานข้อมูล (PostgreSQL)"} subtitle={t('databaseSubtitle') || "ใช้ Neon — Serverless PostgreSQL บน Cloud"} />
            <DbTableRow table="users" desc={t('dbUsersDesc') || "ข้อมูลผู้ใช้ทุกคน"}
              columns={["id", "username", "email", "password (bcrypt)", "first_name", "last_name", "phone_number", "role", "line_user_id", "image"]} />
            <DbTableRow table="fruits" desc={t('dbFruitsDesc') || "สินค้าผลไม้"}
              columns={["id", "name", "description", "price", "stock", "unit (kg/piece)", "weight", "image (bytea)", "category_id"]} />
            <DbTableRow table="categories" desc={t('dbCategoriesDesc') || "หมวดหมู่ผลไม้"}
              columns={["id", "name", "unit"]} />
            <DbTableRow table="orders" desc={t('dbOrdersDesc') || "ออร์เดอร์ทั้งหมด"}
              columns={["id", "order_number", "user_id", "total_amount", "delivery_fee", "status", "shipping_address", "payment_method", "notes", "created_at"]} />
            <DbTableRow table="order_items" desc={t('dbOrderItemsDesc') || "สินค้าในแต่ละออร์เดอร์"}
              columns={["id", "order_id", "fruit_id", "quantity", "price", "subtotal"]} />
            <DbTableRow table="addresses" desc={t('dbAddressesDesc') || "ที่อยู่จัดส่งของผู้ใช้"}
              columns={["id", "user_id", "address_line", "sub_district", "district", "province", "postal_code", "latitude", "longitude"]} />
            <DbTableRow table="invoices" desc={t('dbInvoicesDesc') || "ใบเสร็จ"}
              columns={["id", "order_id", "invoice_number", "payment_date", "total_amount", "payment_method"]} />
            <DbTableRow table="payment_slips" desc={t('dbPaymentSlipsDesc') || "สลิปโอนเงิน"}
              columns={["id", "order_id", "image_data (base64)", "amount", "payment_date", "notes"]} />
            <DbTableRow table="delivery_confirmations" desc={t('dbDeliveryConfirmationsDesc') || "หลักฐานจัดส่ง"}
              columns={["id", "order_id", "delivery_image", "delivery_date", "sender_name", "receiver_name", "receiver_phone"]} />
            <DbTableRow table="notifications" desc={t('dbNotificationsDesc') || "การแจ้งเตือนในแอป"}
              columns={["id", "user_id", "title", "message", "type", "related_id", "is_read"]} />
          </section>

          {/* ── API ──────────────────────────────────────────────────────── */}
          <section id="api" style={{ marginBottom: 64, scrollMarginTop: 24 }}>
            <SectionHeader icon="🌐" title={t('apiReferenceTitle') || "API Reference"} subtitle="Base URL: process.env.NEXT_PUBLIC_API_BACKEND" />

            {[
              {
                group: "🔐 Auth", rows: [
                  { method: "POST", path: "/api/auth/register", desc: t('apiAuthRegister') || "สมัครสมาชิก", auth: false },
                  { method: "POST", path: "/api/auth/login", desc: t('apiAuthLogin') || "เข้าสู่ระบบ (ได้ JWT token)", auth: false },
                  { method: "GET",  path: "/api/auth/line/callback", desc: "LINE OAuth callback", auth: false },
                ]
              },
              {
                group: t('apiFruitsGroup') || "🍎 ผลไม้ (Fruits)", rows: [
                  { method: "GET",  path: "/api/fruits", desc: t('apiFruitsGetAll') || "ดึงรายการสินค้าทั้งหมด", auth: false },
                  { method: "GET",  path: "/api/fruits/:id", desc: t('apiFruitsGetOne') || "รายละเอียดสินค้า", auth: false },
                  { method: "POST", path: "/api/fruits", desc: t('apiFruitsCreate') || "เพิ่มสินค้า (admin)", auth: true },
                  { method: "PUT",  path: "/api/fruits/:id", desc: t('apiFruitsUpdate') || "แก้ไขสินค้า (admin)", auth: true },
                ]
              },
              {
                group: t('apiOrdersGroup') || "🛒 ออร์เดอร์ (Orders)", rows: [
                  { method: "POST", path: "/api/orders", desc: t('apiOrdersCreate') || "สร้างออร์เดอร์ใหม่", auth: true },
                  { method: "GET",  path: "/api/orders/my-orders", desc: t('apiOrdersGetMy') || "ดูออร์เดอร์ของตัวเอง", auth: true },
                  { method: "GET",  path: "/api/orders/all", desc: t('apiOrdersGetAll') || "ดูออร์เดอร์ทั้งหมด (admin)", auth: true },
                  { method: "GET",  path: "/api/orders/most-bought", desc: t('apiOrdersGetMostBought') || "Top seller ทั่วโลก", auth: false },
                  { method: "GET",  path: "/api/orders/:id", desc: t('apiOrdersGetOne') || "รายละเอียดออร์เดอร์", auth: true },
                  { method: "PUT",  path: "/api/orders/:id/status", desc: t('apiOrdersUpdateStatus') || "อัพเดทสถานะ (admin)", auth: true },
                  { method: "POST", path: "/api/orders/:id/upload-slip", desc: t('apiOrdersUploadSlip') || "อัพโหลดสลิป", auth: true },
                  { method: "GET",  path: "/api/orders/:id/qr-code", desc: t('apiOrdersGetQR') || "QR PromptPay (JSON)", auth: true },
                  { method: "POST", path: "/api/orders/:id/delivery-confirmation", desc: t('apiOrdersDeliveryConf') || "ยืนยันจัดส่ง (admin)", auth: true },
                ]
              },
              {
                group: "📄 Invoice", rows: [
                  { method: "GET", path: "/api/invoices/:id", desc: t('apiInvoicesGetOne') || "รายละเอียด Invoice", auth: true },
                  { method: "GET", path: "/api/invoices/:id/pdf", desc: t('apiInvoicesGetPDF') || "ดาวน์โหลด PDF", auth: true },
                ]
              },
              {
                group: t('apiDeliveryGroup') || "📍 ที่อยู่ & จัดส่ง", rows: [
                  { method: "GET",  path: "/api/addresses", desc: t('apiAddressesGetMy') || "ดูที่อยู่ของตัวเอง", auth: true },
                  { method: "POST", path: "/api/addresses", desc: t('apiAddressesCreate') || "เพิ่มที่อยู่ใหม่", auth: true },
                  { method: "POST", path: "/api/delivery/calculate", desc: t('apiDeliveryCalculate') || "คำนวณค่าส่ง", auth: false },
                ]
              },
            ].map(({ group, rows }) => (
              <div key={group} style={{ marginBottom: 24 }}>
                <div style={{ color: C.text, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{group}</div>
                <Card style={{ padding: "0 20px" }}>
                  <div style={{ paddingTop: 4 }}>
                    {rows.map(r => <ApiRow key={r.path + r.method} {...r} />)}
                  </div>
                </Card>
              </div>
            ))}
          </section>

          {/* ── TECH STACK ────────────────────────────────────────────────── */}
          <section id="tech" style={{ marginBottom: 64, scrollMarginTop: 24 }}>
            <SectionHeader icon="🛠️" title="Tech Stack" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                {
                  title: "Frontend", color: C.blue, items: [
                    ["Next.js 14", t('techStackNextJS') || "React Framework (Pages Router)"],
                    ["Tailwind CSS", t('techStackTailwind') || "Utility-first CSS styling"],
                    ["Framer Motion", t('techStackFramer') || "Animation & transitions"],
                    ["Lucide Icons", t('techStackLucide') || "Icon library"],
                    ["LINE LIFF SDK", t('techStackLIFF') || "LINE Frontend Framework"],
                  ]
                },
                {
                  title: "Backend", color: C.green, items: [
                    ["Node.js", t('techStackNode') || "JavaScript runtime"],
                    ["Express.js", t('techStackExpress') || "HTTP server & routing"],
                    ["PostgreSQL (Neon)", t('techStackNeon') || "Serverless DB ผ่าน pg pool"],
                    ["bcrypt", t('techStackBcrypt') || "Password hashing"],
                    ["jsonwebtoken", t('techStackJWT') || "JWT auth tokens"],
                    ["PDFKit", t('techStackPDFKit') || "PDF generation"],
                    ["LINE Bot SDK", t('techStackLineBot') || "LINE Messaging API"],
                    ["promptpay-qr", t('techStackPromptPay') || "QR PromptPay generation"],
                    ["Google Maps API", t('techStackGoogleMaps') || "Geocoding & distance"],
                    ["node-cron", t('techStackCron') || "Auto-cancel expired orders"],
                  ]
                },
              ].map(({ title, color, items }) => (
                <Card key={title}>
                  <div style={{ fontWeight: 700, color, marginBottom: 16 }}>{title}</div>
                  {items.map(([name, desc]) => (
                    <div key={name} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13 }}>
                      <code style={{ color }}>{name}</code>
                      <span style={{ color: C.muted, textAlign: "right", maxWidth: "55%" }}>{desc}</span>
                    </div>
                  ))}
                </Card>
              ))}
            </div>

            <Card style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 12, color: C.text }}>☁️ Infrastructure & Deployment</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                {[
                  { name: "Vercel", desc: t('infraVercel') || "Hosting Frontend + Backend (Serverless Functions)", color: C.text },
                  { name: "Neon", desc: t('infraNeon') || "PostgreSQL Serverless Database", color: C.blue },
                  { name: "Google Maps", desc: t('infraGoogleMaps') || "Geocoding + Distance Matrix API", color: C.green },
                  { name: "LINE Developers", desc: t('infraLine') || "Messaging API + LIFF", color: "#06C755" },
                  { name: "PromptPay", desc: t('infraPromptPay') || "Thai QR Payment Standard", color: C.accent },
                  { name: "Vercel Cron", desc: t('infraCron') || "Auto-cleanup expired orders", color: C.accentDim },
                ].map(({ name, desc, color }) => (
                  <div key={name} style={{
                    background: "#010409", borderRadius: 8,
                    padding: "12px 14px", border: `1px solid ${C.border}`,
                  }}>
                    <div style={{ color, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{name}</div>
                    <div style={{ color: C.muted, fontSize: 11 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* ENV vars */}
            <div style={{ marginTop: 20 }}>
              <div style={{ color: C.muted, fontSize: 13, marginBottom: 12 }}>
                ⚠️ {t('envVarsTitle') || 'Environment Variables ที่จำเป็น'} (<code style={{ color: C.blue }}>backend/.env</code>)
              </div>
              <Code language=".env">{`DATABASE_URL=postgresql://...         # ${t('envNeon') || 'Neon connection string'}
JWT_SECRET=your_secret               # ${t('envJWT') || 'JWT signing key'}
LINE_CHANNEL_ID=...                  # ${t('envLineID') || 'LINE Login'}
LINE_CHANNEL_SECRET=...              # ${t('envLineSecret') || 'LINE Login'}
LINE_CHANNEL_ACCESS_TOKEN=...        # ${t('envLineToken') || 'LINE Messaging API'}
LINE_LIFF_ID=...                     # ${t('envLIFFID') || 'LIFF ID'}
PROMPTPAY_PHONE=0812345678           # ${t('envPromptPay') || 'เบอร์รับโอน PromptPay'}
GOOGLE_MAPS_API_KEY=...              # ${t('envGoogleMaps') || 'Google Maps API'}
CRON_SECRET=...                      # ${t('envCron') || 'ป้องกัน cron endpoint'}`}</Code>
            </div>
          </section>

          {/* Footer */}
          <div style={{
            borderTop: `1px solid ${C.border}`,
            paddingTop: 24,
            color: C.muted,
            fontSize: 12,
            textAlign: "center",
          }}>
            🍎 Fruit WebApp Developer Docs — {t('accessibleVia') || 'เข้าถึงได้ที่'} <code style={{ color: C.blue }}>/docs</code> • {t('notOnMainMenu') || 'ไม่แสดงบนเมนูหลัก'}<br />
            <span style={{ fontSize: 11, marginTop: 4, display: "block" }}>{t('footerMadeWith') || 'สร้างด้วย Next.js | อัพเดทล่าสุด'} {t('footerDate') || 'กุมภาพันธ์ 2026'}</span>
          </div>
        </main>
      </div>
    </>
  );
}
