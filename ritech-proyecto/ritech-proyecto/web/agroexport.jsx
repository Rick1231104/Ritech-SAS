import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  LayoutDashboard, Ship, Package, Coffee, Users, FileText, GitBranch,
  BarChart3, Settings, ChevronRight, ArrowLeft, Search, CheckCircle2,
  AlertTriangle, Sprout, Warehouse, Factory, Anchor, MapPin, Wifi,
  ChevronDown, Bell, Globe2, ShieldCheck, LogOut, Lock,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

/* ------------------------------------------------------------------ */
/* Tokens                                                             */
/* ------------------------------------------------------------------ */
const C = {
  ivory: "#F1ECE1",
  ivoryDim: "#E8E1D2",
  coffee: "#241812",
  coffeeSoft: "#3A2A1F",
  forest: "#1E3B2C",
  forestSoft: "#2B4E3A",
  olive: "#707A4E",
  oliveSoft: "#8B9468",
  charcoal: "#26221D",
  warmGray: "#8C8474",
  warmGrayLight: "#B8B0A0",
  accent: "#2E5CA6",
  accentSoft: "#4A76BE",
  amber: "#B87B2E",
  rust: "#9A4630",
  line: "rgba(36,24,18,0.10)",
  lineOnDark: "rgba(241,236,225,0.12)",
};

const FONT_DISPLAY = "'Fraunces', serif";
const FONT_BODY = "'Inter', sans-serif";
const FONT_MONO = "'IBM Plex Mono', monospace";

const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,340..600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
    * { box-sizing: border-box; }
    .agx-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
    .agx-scroll::-webkit-scrollbar-thumb { background: rgba(36,24,18,0.18); border-radius: 4px; }
    @keyframes agx-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
    @keyframes agx-dash { to { stroke-dashoffset: -200; } }
    @keyframes agx-fade-up { from { opacity: 0; transform: translateY(6px);} to { opacity: 1; transform: translateY(0);} }
    @keyframes agx-flash { 0% { background: rgba(46,92,166,0.16); } 100% { background: transparent; } }
    .agx-in { animation: agx-fade-up 0.5s cubic-bezier(.2,.8,.2,1) both; }
    .agx-flash { animation: agx-flash 1.4s ease-out; }
  `}</style>
);

/* ------------------------------------------------------------------ */
/* Seed data                                                          */
/* ------------------------------------------------------------------ */
const STATUS_ORDER = ["Borrador", "Preparación", "Documentación", "Listo para embarque", "En tránsito", "Entregado"];

const STATUS_META = {
  "Borrador": { dot: C.warmGray, text: C.warmGray, bg: "rgba(140,132,116,0.14)" },
  "Preparación": { dot: C.olive, text: C.olive, bg: "rgba(112,122,78,0.14)" },
  "Documentación": { dot: C.amber, text: C.amber, bg: "rgba(184,123,46,0.14)" },
  "Listo para embarque": { dot: C.accent, text: C.accent, bg: "rgba(46,92,166,0.12)" },
  "En tránsito": { dot: C.accent, text: C.accent, bg: "rgba(46,92,166,0.12)" },
  "Entregado": { dot: C.forest, text: C.forest, bg: "rgba(30,59,44,0.12)" },
};

const EXPORTS_SEED = [
  { id: "EXP-2026-0048", product: "Café Arábica", client: "Andes Coffee Export", country: "Alemania", flag: "🇩🇪", qty: 1200, value: 8400, status: "En tránsito", port: "Rotterdam", container: "MSCU-771204", lots: ["CAF-2026-0012"], docs: { factura: true, lista: true, certificado: true } },
  { id: "EXP-2026-0047", product: "Cacao", client: "Nariño Cacao S.A.S.", country: "Países Bajos", flag: "🇳🇱", qty: 850, value: 3825, status: "Preparación", port: "Rotterdam", container: "—", lots: ["CAC-2026-0007"], docs: { factura: true, lista: false, certificado: false } },
  { id: "EXP-2026-0046", product: "Café Especial", client: "Café Nariño Especial", country: "España", flag: "🇪🇸", qty: 2400, value: 19200, status: "Entregado", port: "Valencia", container: "TCLU-550187", lots: ["CAF-2026-0009", "CAF-2026-0010"], docs: { factura: true, lista: true, certificado: true } },
  { id: "EXP-2026-0045", product: "Cacao Fino", client: "Andes Coffee Export", country: "Francia", flag: "🇫🇷", qty: 600, value: 4200, status: "Documentación", port: "Barcelona", container: "—", lots: ["CAC-2026-0005"], docs: { factura: true, lista: true, certificado: false } },
  { id: "EXP-2026-0044", product: "Café Arábica", client: "Finca La Esperanza", country: "Italia", flag: "🇮🇹", qty: 1500, value: 10500, status: "Listo para embarque", port: "Hamburgo", container: "GESU-330912", lots: ["CAF-2026-0011"], docs: { factura: true, lista: true, certificado: true } },
  { id: "EXP-2026-0043", product: "Cacao", client: "Nariño Cacao S.A.S.", country: "Alemania", flag: "🇩🇪", qty: 900, value: 3150, status: "Borrador", port: "—", container: "—", lots: ["CAC-2026-0004"], docs: { factura: false, lista: false, certificado: false } },
];

const LOTS_SEED = {
  "CAF-2026-0012": { finca: "Finca El Porvenir", ubicacion: "Consacá, Nariño, Colombia", producto: "Café Arábica", cantidad: "1.200 kg", cosecha: "Agosto 2026", destino: "Alemania", flag: "🇩🇪", stage: 4,
    stages: [{ label: "Cultivo", detail: "Finca El Porvenir · 1.850 msnm", icon: Sprout }, { label: "Cosecha", detail: "Recolección manual · 04 ago 2026", icon: Coffee }, { label: "Procesamiento", detail: "Lavado y secado · beneficiadero Consacá", icon: Package }, { label: "Almacenamiento", detail: "Bodega Buenaventura · lote sellado", icon: Warehouse }, { label: "Exportación", detail: "EXP-2026-0048 · contenedor MSCU-771204", icon: Ship }, { label: "Alemania", detail: "Puerto de Rotterdam", icon: Anchor }] },
  "CAC-2026-0007": { finca: "Finca Los Alpes", ubicacion: "Tumaco, Nariño, Colombia", producto: "Cacao Fino de Aroma", cantidad: "850 kg", cosecha: "Julio 2026", destino: "Países Bajos", flag: "🇳🇱", stage: 1,
    stages: [{ label: "Cultivo", detail: "Finca Los Alpes · zona de Tumaco", icon: Sprout }, { label: "Cosecha", detail: "Recolección manual · 18 jul 2026", icon: Coffee }, { label: "Procesamiento", detail: "Fermentación y secado", icon: Package }, { label: "Almacenamiento", detail: "Pendiente de ingreso a bodega", icon: Warehouse }, { label: "Exportación", detail: "Sin programar", icon: Ship }, { label: "Países Bajos", detail: "Pendiente", icon: Anchor }] },
  "CAF-2026-0009": { finca: "Finca Buenavista", ubicacion: "Sandoná, Nariño, Colombia", producto: "Café Especial", cantidad: "1.200 kg", cosecha: "Junio 2026", destino: "España", flag: "🇪🇸", stage: 5,
    stages: [{ label: "Cultivo", detail: "Finca Buenavista · 1.780 msnm", icon: Sprout }, { label: "Cosecha", detail: "Recolección manual · 10 jun 2026", icon: Coffee }, { label: "Procesamiento", detail: "Proceso honey · beneficiadero Sandoná", icon: Package }, { label: "Almacenamiento", detail: "Bodega Buenaventura · lote sellado", icon: Warehouse }, { label: "Exportación", detail: "EXP-2026-0046 · contenedor TCLU-550187", icon: Ship }, { label: "España", detail: "Puerto de Valencia · entregado", icon: Anchor }] },
  "CAF-2026-0010": { finca: "Finca Buenavista", ubicacion: "Sandoná, Nariño, Colombia", producto: "Café Especial", cantidad: "1.200 kg", cosecha: "Junio 2026", destino: "España", flag: "🇪🇸", stage: 5,
    stages: [{ label: "Cultivo", detail: "Finca Buenavista · 1.780 msnm", icon: Sprout }, { label: "Cosecha", detail: "Recolección manual · 12 jun 2026", icon: Coffee }, { label: "Procesamiento", detail: "Proceso honey · beneficiadero Sandoná", icon: Package }, { label: "Almacenamiento", detail: "Bodega Buenaventura · lote sellado", icon: Warehouse }, { label: "Exportación", detail: "EXP-2026-0046 · contenedor TCLU-550187", icon: Ship }, { label: "España", detail: "Puerto de Valencia · entregado", icon: Anchor }] },
  "CAC-2026-0005": { finca: "Finca El Mirador", ubicacion: "Tumaco, Nariño, Colombia", producto: "Cacao Fino de Aroma", cantidad: "600 kg", cosecha: "Julio 2026", destino: "Francia", flag: "🇫🇷", stage: 2,
    stages: [{ label: "Cultivo", detail: "Finca El Mirador · zona de Tumaco", icon: Sprout }, { label: "Cosecha", detail: "Recolección manual · 20 jul 2026", icon: Coffee }, { label: "Procesamiento", detail: "Fermentación y secado completados", icon: Package }, { label: "Almacenamiento", detail: "Bodega Buenaventura · lote sellado", icon: Warehouse }, { label: "Exportación", detail: "Documentación en curso", icon: Ship }, { label: "Francia", detail: "Puerto de Barcelona · pendiente", icon: Anchor }] },
  "CAF-2026-0011": { finca: "Finca La Esperanza", ubicacion: "Sandoná, Nariño, Colombia", producto: "Café Arábica", cantidad: "1.500 kg", cosecha: "Julio 2026", destino: "Italia", flag: "🇮🇹", stage: 3,
    stages: [{ label: "Cultivo", detail: "Finca La Esperanza · 1.920 msnm", icon: Sprout }, { label: "Cosecha", detail: "Recolección manual · 22 jul 2026", icon: Coffee }, { label: "Procesamiento", detail: "Trilla y clasificación · Pasto", icon: Package }, { label: "Almacenamiento", detail: "Bodega Buenaventura · lote sellado", icon: Warehouse }, { label: "Exportación", detail: "EXP-2026-0044 · contenedor GESU-330912", icon: Ship }, { label: "Italia", detail: "Puerto de Hamburgo · listo para embarque", icon: Anchor }] },
  "CAC-2026-0004": { finca: "Finca San Rafael", ubicacion: "Consacá, Nariño, Colombia", producto: "Cacao", cantidad: "900 kg", cosecha: "Agosto 2026", destino: "Alemania", flag: "🇩🇪", stage: 0,
    stages: [{ label: "Cultivo", detail: "Finca San Rafael · 1.700 msnm", icon: Sprout }, { label: "Cosecha", detail: "Programada para esta semana", icon: Coffee }, { label: "Procesamiento", detail: "Pendiente", icon: Package }, { label: "Almacenamiento", detail: "Pendiente", icon: Warehouse }, { label: "Exportación", detail: "Sin programar", icon: Ship }, { label: "Alemania", detail: "Pendiente", icon: Anchor }] },
};

const ACTIVITY_SEED = [
  { ts: Date.now() - 1000 * 60 * 12, text: "EXP-2026-0048 cambió a En tránsito" },
  { ts: Date.now() - 1000 * 60 * 60, text: "Certificado de origen cargado para EXP-2026-0046" },
  { ts: Date.now() - 1000 * 60 * 60 * 3, text: "Nuevo lote registrado: CAC-2026-0007" },
  { ts: Date.now() - 1000 * 60 * 60 * 20, text: "EXP-2026-0044 lista para embarque en Buenaventura" },
  { ts: Date.now() - 1000 * 60 * 60 * 25, text: "Factura comercial emitida para EXP-2026-0045" },
];

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "exportaciones", label: "Exportaciones", icon: Ship },
  { key: "lotes", label: "Lotes", icon: Package },
  { key: "productos", label: "Productos", icon: Coffee },
  { key: "clientes", label: "Clientes", icon: Users },
  { key: "documentos", label: "Documentos", icon: FileText },
  { key: "trazabilidad", label: "Trazabilidad", icon: GitBranch },
  { key: "cumplimiento", label: "Cumplimiento", icon: ShieldCheck },
  { key: "reportes", label: "Reportes", icon: BarChart3 },
  { key: "configuracion", label: "Configuración", icon: Settings },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
function useCountUp(target, duration = 1100) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    let start = null;
    function step(ts) {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(target * eased);
      if (progress < 1) raf.current = requestAnimationFrame(step);
    }
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return val;
}

function relTime(ts, now) {
  const s = Math.round((now - ts) / 1000);
  if (s < 8) return "justo ahora";
  if (s < 60) return `hace ${s} s`;
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  return `hace ${h} h`;
}

function fmtKg(n) { return n.toLocaleString("es-CO") + " kg"; }
function fmtUSD(n) { return "$" + n.toLocaleString("en-US") + " USD"; }

function StatusPill({ status, size = "sm" }) {
  const meta = STATUS_META[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: size === "sm" ? "3px 9px" : "5px 12px",
      borderRadius: 5, background: meta.bg, color: meta.text,
      fontSize: size === "sm" ? 11.5 : 13, fontWeight: 600,
      fontFamily: FONT_BODY, letterSpacing: "0.01em", whiteSpace: "nowrap",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%", background: meta.dot,
        animation: status === "En tránsito" ? "agx-pulse 1.8s ease-in-out infinite" : "none",
      }} />
      {status}
    </span>
  );
}

function Panel({ title, action, children, style, className }) {
  return (
    <div style={{ background: "#FBF9F4", border: `1px solid ${C.line}`, borderRadius: 8, padding: "16px 18px 18px", ...style }} className={className || "agx-in"}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 500, color: C.coffee, margin: 0 }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function LiveBadge({ pulse, lastSync, now }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.warmGray }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.forest, animation: "agx-pulse 1.6s ease-in-out infinite" }} />
      <span style={{ color: C.forest, fontWeight: 600 }}>En vivo</span>
      <span>· sincronizado {relTime(lastSync, now)}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sidebar                                                            */
/* ------------------------------------------------------------------ */
function Sidebar({ view, setView, lastSync, now, user, nav, onLogout }) {
  return (
    <div style={{ width: 232, minWidth: 232, background: C.coffee, color: C.ivory, display: "flex", flexDirection: "column", height: "100%", fontFamily: FONT_BODY, borderRight: `1px solid ${C.lineOnDark}` }}>
      <div style={{ padding: "22px 20px 18px", borderBottom: `1px solid ${C.lineOnDark}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: C.olive, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, color: C.ivory, flexShrink: 0 }}>A</div>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16.5, fontWeight: 500, letterSpacing: "0.01em" }}>AgroExport</div>
            <div style={{ fontSize: 10.5, color: C.warmGrayLight, letterSpacing: "0.03em", marginTop: 1 }}>CAFÉ · CACAO · COLOMBIA → UE</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "14px 12px", overflowY: "auto" }} className="agx-scroll">
        <div style={{ fontSize: 10.5, color: C.warmGrayLight, letterSpacing: "0.08em", padding: "4px 10px 8px" }}>OPERACIÓN</div>
        {nav.filter((n) => !GESTION_KEYS.includes(n.key)).map((item) => <NavItem key={item.key} item={item} active={view === item.key} onClick={() => setView(item.key)} />)}
        <div style={{ fontSize: 10.5, color: C.warmGrayLight, letterSpacing: "0.08em", padding: "16px 10px 8px", display: nav.some((n) => GESTION_KEYS.includes(n.key)) ? "block" : "none" }}>GESTIÓN</div>
        {nav.filter((n) => GESTION_KEYS.includes(n.key)).map((item) => <NavItem key={item.key} item={item} active={view === item.key} onClick={() => setView(item.key)} />)}
      </div>

      <div style={{ padding: "14px 16px", borderTop: `1px solid ${C.lineOnDark}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.forestSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11.5, fontWeight: 600, color: C.ivory, flexShrink: 0 }}>{user.initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
            <div style={{ fontSize: 10.5, color: C.warmGrayLight, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.role}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: C.oliveSoft }}>
          <Wifi size={11} />
          <span>Conectado · sincronizado {relTime(lastSync, now)}</span>
          <button onClick={onLogout} title="Cerrar sesión" style={{ marginLeft: "auto", background: "none", border: "none", color: C.warmGrayLight, cursor: "pointer", display: "flex" }}><LogOut size={13} /></button>
        </div>
      </div>
    </div>
  );
}

function NavItem({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", marginBottom: 2,
      border: "none", borderRadius: 6, background: active ? "rgba(112,122,78,0.22)" : "transparent",
      color: active ? C.ivory : C.warmGrayLight, cursor: "pointer", fontFamily: FONT_BODY,
      fontSize: 13, fontWeight: active ? 600 : 500, textAlign: "left", transition: "background 0.15s, color 0.15s",
      borderLeft: active ? `2px solid ${C.oliveSoft}` : "2px solid transparent",
    }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(241,236,225,0.05)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
      <Icon size={15.5} strokeWidth={2} />
      {item.label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Route map (signature element)                                      */
/* ------------------------------------------------------------------ */
function RouteMap() {
  const ports = [
    { name: "Rotterdam", x: 478, y: 56 },
    { name: "Hamburgo", x: 500, y: 92 },
    { name: "Valencia", x: 462, y: 158 },
    { name: "Barcelona", x: 486, y: 182 },
  ];
  return (
    <svg viewBox="0 0 560 230" style={{ width: "100%", height: "auto" }}>
      <circle cx="44" cy="128" r="4" fill={C.forest} />
      <text x="52" y="122" fontFamily={FONT_BODY} fontSize="11.5" fontWeight="600" fill={C.coffee}>Colombia</text>
      <text x="52" y="135" fontFamily={FONT_BODY} fontSize="9.5" fill={C.warmGray}>Nariño</text>

      <circle cx="108" cy="150" r="3.5" fill={C.olive} />
      <text x="98" y="167" fontFamily={FONT_BODY} fontSize="9.5" fill={C.warmGray}>Buenaventura</text>
      <path d="M44,128 L108,150" stroke={C.line} strokeWidth="1.5" fill="none" />

      <path d="M108,150 C 210,190 280,60 360,104" stroke={C.accent} strokeWidth="1.6" fill="none" strokeDasharray="5 7" opacity="0.75" style={{ animation: "agx-dash 3.5s linear infinite" }} />
      <text x="205" y="205" fontFamily={FONT_BODY} fontSize="9" fill={C.warmGray} letterSpacing="0.04em">OCÉANO ATLÁNTICO</text>

      <circle r="3.4" fill={C.accent}>
        <animateMotion dur="6s" repeatCount="indefinite" path="M108,150 C 210,190 280,60 360,104" />
      </circle>

      {ports.map((p) => (
        <g key={p.name}>
          <path d={`M360,104 Q ${(360 + p.x) / 2},${(104 + p.y) / 2 - 8} ${p.x},${p.y}`} stroke={C.warmGray} strokeWidth="1" fill="none" strokeDasharray="2 5" opacity="0.55" />
          <circle cx={p.x} cy={p.y} r="3" fill={C.forest} />
          <circle cx={p.x} cy={p.y} r="6.5" fill="none" stroke={C.forest} strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="4;9;4" dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="2.6s" repeatCount="indefinite" />
          </circle>
          <text x={p.x + (p.name === "Valencia" || p.name === "Barcelona" ? -p.name.length * 4.6 - 8 : 8)} y={p.y + 3.5} fontFamily={FONT_BODY} fontSize="10" fontWeight="600" fill={C.coffee}>{p.name}</text>
        </g>
      ))}
      <circle cx="360" cy="104" r="2.2" fill={C.coffee} opacity="0.5" />
      <text x="330" y="90" fontFamily={FONT_BODY} fontSize="9" fill={C.warmGray} letterSpacing="0.04em">UNIÓN EUROPEA</text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                          */
/* ------------------------------------------------------------------ */
function StatBlock({ label, value, suffix, decimals, last }) {
  const v = useCountUp(value);
  const display = decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString("es-CO");
  return (
    <div style={{ paddingRight: 26, borderRight: last ? "none" : `1px solid ${C.line}` }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 27, fontWeight: 500, color: C.coffee, lineHeight: 1 }}>{display}{suffix}</div>
      <div style={{ fontSize: 11.5, color: C.warmGray, marginTop: 5, letterSpacing: "0.01em" }}>{label}</div>
    </div>
  );
}

function Dashboard({ exports, activity, openExport, lastSync, now, flashId }) {
  const activeExports = exports.filter((e) => e.status !== "Entregado" && e.status !== "Borrador");
  const columns = ["Preparación", "Documentación", "Listo para embarque", "En tránsito"];
  const totalTons = exports.reduce((s, e) => s + e.qty, 0) / 1000;
  const totalValue = exports.reduce((s, e) => s + e.value, 0);
  const countries = new Set(exports.map((e) => e.country)).size;

  return (
    <div style={{ padding: "26px 32px 40px", maxWidth: 1180 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 500, color: C.coffee, margin: 0 }}>Panorama general</h1>
          <div style={{ fontSize: 12.5, color: C.warmGray, marginTop: 3 }}>lunes, 17 de agosto de 2026</div>
        </div>
        <LiveBadge pulse lastSync={lastSync} now={now} />
      </div>

      <div style={{ display: "flex", gap: 26, marginBottom: 26, paddingBottom: 22, borderBottom: `1px solid ${C.line}` }}>
        <StatBlock label="Exportaciones activas" value={activeExports.length} />
        <StatBlock label="Toneladas exportadas (2026)" value={totalTons} decimals={2} suffix=" t" />
        <StatBlock label="Valor exportado (2026)" value={totalValue} suffix=" USD" />
        <StatBlock label="Países destino" value={countries} last />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 18, marginBottom: 18 }}>
        <Panel title="Ruta de exportación" action={<span style={{ fontSize: 11, color: C.warmGray }}>en vivo</span>}>
          <RouteMap />
        </Panel>
        <Panel title="Alertas de documentación">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {exports.filter((e) => e.status !== "Entregado" && (!e.docs.factura || !e.docs.lista || !e.docs.certificado)).map((e) => {
              const missing = ["factura", "lista", "certificado"].filter((d) => !e.docs[d]);
              const labels = { factura: "factura comercial", lista: "lista de empaque", certificado: "certificado de origen" };
              return (
                <div key={e.id} style={{ display: "flex", gap: 9, cursor: "pointer" }} onClick={() => openExport(e.id)} className={flashId === e.id ? "agx-flash" : ""}>
                  <AlertTriangle size={14} color={C.amber} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: C.coffee, fontWeight: 600 }}>{e.id}</div>
                    <div style={{ fontSize: 12, color: C.warmGray, marginTop: 1 }}>Falta {missing.map((m) => labels[m]).join(" y ")}</div>
                  </div>
                </div>
              );
            })}
            {exports.filter((e) => e.status !== "Entregado" && (!e.docs.factura || !e.docs.lista || !e.docs.certificado)).length === 0 && (
              <div style={{ fontSize: 12.5, color: C.warmGray }}>Toda la documentación está al día.</div>
            )}
          </div>
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 18 }}>
        <Panel title="Estado de embarques">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {columns.map((col) => (
              <div key={col}>
                <div style={{ fontSize: 10.5, color: STATUS_META[col].text, fontWeight: 600, letterSpacing: "0.02em", marginBottom: 8, paddingBottom: 6, borderBottom: `2px solid ${STATUS_META[col].dot}` }}>{col.toUpperCase()}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {activeExports.filter((e) => e.status === col).map((e) => (
                    <div key={e.id} onClick={() => openExport(e.id)}
                      className={flashId === e.id ? "agx-flash" : ""}
                      style={{ background: C.ivoryDim, borderRadius: 6, padding: "8px 9px", cursor: "pointer", border: `1px solid ${C.line}`, transition: "transform 0.15s" }}
                      onMouseEnter={(e2) => (e2.currentTarget.style.transform = "translateY(-1px)")}
                      onMouseLeave={(e2) => (e2.currentTarget.style.transform = "translateY(0)")}>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: C.coffee, fontWeight: 600 }}>{e.id.slice(9)}</div>
                      <div style={{ fontSize: 11, color: C.warmGray, marginTop: 2 }}>{e.product}</div>
                      <div style={{ fontSize: 11, marginTop: 3 }}>{e.flag} {e.country}</div>
                    </div>
                  ))}
                  {activeExports.filter((e) => e.status === col).length === 0 && <div style={{ fontSize: 11, color: C.warmGrayLight, fontStyle: "italic", padding: "4px 2px" }}>Sin envíos</div>}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Panel title="Actividad reciente">
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {activity.slice(0, 5).map((a, i) => (
                <div key={a.ts + i} style={{ display: "flex", gap: 9 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.olive, marginTop: 6, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, color: C.coffee }}>{a.text}</div>
                    <div style={{ fontSize: 10.5, color: C.warmGrayLight, marginTop: 1 }}>{relTime(a.ts, now)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Exportaciones list + detail                                        */
/* ------------------------------------------------------------------ */
function ExportacionesList({ exports, openExport, flashId }) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todas");
  const filtered = exports.filter((e) => {
    const matchesQ = (e.id + e.client + e.product + e.country).toLowerCase().includes(q.toLowerCase());
    const matchesStatus = statusFilter === "Todas" || e.status === statusFilter;
    return matchesQ && matchesStatus;
  });

  return (
    <div style={{ padding: "26px 32px 40px", maxWidth: 1180 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 500, color: C.coffee, margin: 0 }}>Exportaciones</h1>
        <button style={{ background: C.forest, color: C.ivory, border: "none", borderRadius: 6, padding: "8px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}>+ Nueva exportación</button>
      </div>
      <div style={{ fontSize: 12.5, color: C.warmGray, marginBottom: 20 }}>{filtered.length} registros</div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
          <Search size={14} color={C.warmGray} style={{ position: "absolute", left: 10, top: 9 }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por código, cliente, país…"
            style={{ width: "100%", padding: "8px 10px 8px 30px", borderRadius: 6, border: `1px solid ${C.line}`, fontSize: 12.5, fontFamily: FONT_BODY, background: "#FBF9F4", color: C.coffee, outline: "none" }} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "8px 10px", borderRadius: 6, border: `1px solid ${C.line}`, fontSize: 12.5, fontFamily: FONT_BODY, background: "#FBF9F4", color: C.coffee }}>
          <option>Todas</option>
          {STATUS_ORDER.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ border: `1px solid ${C.line}`, borderRadius: 8, overflow: "hidden", background: "#FBF9F4" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1.1fr 1.3fr 1fr 1fr 1.3fr 0.4fr", padding: "10px 16px", fontSize: 10.5, color: C.warmGray, letterSpacing: "0.04em", borderBottom: `1px solid ${C.line}` }}>
          <div>CÓDIGO</div><div>PRODUCTO</div><div>CLIENTE</div><div>DESTINO</div><div>CANTIDAD</div><div>ESTADO</div><div></div>
        </div>
        {filtered.map((e) => (
          <div key={e.id} onClick={() => openExport(e.id)} className={flashId === e.id ? "agx-flash" : ""}
            style={{ display: "grid", gridTemplateColumns: "1.3fr 1.1fr 1.3fr 1fr 1fr 1.3fr 0.4fr", padding: "13px 16px", borderBottom: `1px solid ${C.line}`, cursor: "pointer", fontSize: 12.5, color: C.coffee, alignItems: "center", transition: "background 0.12s" }}
            onMouseEnter={(ev) => (ev.currentTarget.style.background = C.ivoryDim)}
            onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 600 }}>{e.id}</div>
            <div>{e.product}</div>
            <div style={{ color: C.warmGray }}>{e.client}</div>
            <div>{e.flag} {e.country}</div>
            <div style={{ fontFamily: FONT_MONO }}>{fmtKg(e.qty)}</div>
            <div><StatusPill status={e.status} /></div>
            <div style={{ textAlign: "right" }}><ChevronRight size={15} color={C.warmGray} /></div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ padding: "28px 16px", textAlign: "center", color: C.warmGray, fontSize: 13 }}>No hay exportaciones que coincidan con la búsqueda.</div>}
      </div>
    </div>
  );
}

function DocRow({ label, ok }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 0", borderBottom: `1px solid ${C.line}` }}>
      {ok ? <CheckCircle2 size={15} color={C.forest} /> : <AlertTriangle size={15} color={C.amber} />}
      <span style={{ fontSize: 12.5, color: C.coffee }}>{label}</span>
      <span style={{ marginLeft: "auto", fontSize: 11, color: ok ? C.forest : C.amber, fontWeight: 600 }}>{ok ? "Completo" : "Pendiente"}</span>
    </div>
  );
}

function ExportDetail({ id, exports, back, openLot, role, advance }) {
  const e = exports.find((x) => x.id === id);
  if (!e) return null;
  const allDocsOk = e.docs.factura && e.docs.lista && e.docs.certificado;
  const stageIdx = STATUS_ORDER.indexOf(e.status);
  const checks = checkCompliance(e);
  const cumple = checks.every((c) => c.ok);
  const siguiente = STATUS_ORDER[stageIdx + 1];
  const bloqueado = siguiente === "Listo para embarque" && !cumple;

  return (
    <div style={{ padding: "26px 32px 40px", maxWidth: 980 }} className="agx-in" key={e.status}>
      <button onClick={back} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: C.warmGray, fontSize: 12.5, cursor: "pointer", marginBottom: 16, padding: 0, fontFamily: FONT_BODY }}>
        <ArrowLeft size={14} /> Exportaciones
      </button>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
        <div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: C.warmGray, marginBottom: 4 }}>{e.id}</div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 25, fontWeight: 500, color: C.coffee, margin: 0 }}>{e.product} → {e.flag} {e.country}</h1>
        </div>
        <StatusPill status={e.status} size="lg" />
      </div>

      <div style={{ display: "flex", alignItems: "center", margin: "26px 0 30px" }}>
        {STATUS_ORDER.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 30 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: i <= stageIdx ? STATUS_META[e.status].dot : C.line, border: i <= stageIdx ? "none" : `1.5px solid ${C.warmGrayLight}`, transition: "background 0.4s" }} />
            </div>
            {i < STATUS_ORDER.length - 1 && <div style={{ flex: 1, height: 1.5, background: i < stageIdx ? STATUS_META[e.status].dot : C.line, transition: "background 0.4s" }} />}
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Panel title="Seguimiento del envío">
          <div style={{ fontSize: 12.5, color: C.warmGray, marginBottom: 12 }}>Estado actual: <b style={{ color: C.coffee }}>{e.status}</b></div>
          {role === "Administrador" ? (
            siguiente ? (
              <button onClick={() => advance(e.id)} disabled={bloqueado}
                style={{ background: bloqueado ? C.warmGrayLight : C.forest, color: C.ivory, border: "none", borderRadius: 6, padding: "9px 14px", fontSize: 12.5, fontWeight: 600, cursor: bloqueado ? "not-allowed" : "pointer", fontFamily: FONT_BODY }}>
                Avanzar a «{siguiente}»
              </button>
            ) : <div style={{ fontSize: 12.5, color: C.forest, fontWeight: 600 }}>Envío entregado al cliente.</div>
          ) : <div style={{ fontSize: 12, color: C.warmGray }}>Solo el personal de RiTech actualiza el estado del envío.</div>}
          {bloqueado && role === "Administrador" && (
            <div style={{ marginTop: 12, fontSize: 12, color: C.amber, background: "rgba(184,123,46,0.1)", padding: "9px 10px", borderRadius: 6 }}>
              No se puede avanzar: faltan requisitos de cumplimiento normativo.
            </div>
          )}
        </Panel>
        <Panel title="Cumplimiento normativo UE" action={<span style={{ fontSize: 11, fontWeight: 600, color: cumple ? C.forest : C.amber }}>{cumple ? "Cumple" : "No cumple"}</span>}>
          {checks.map((c) => <DocRow key={c.label} label={c.label} ok={c.ok} />)}
        </Panel>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}>
        <Panel title="Información general">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 16, columnGap: 14 }}>
            {[["Cliente", e.client], ["Producto", e.product], ["Cantidad", fmtKg(e.qty)], ["Valor", fmtUSD(e.value)], ["Destino", `${e.flag} ${e.country}`], ["Puerto", e.port], ["Contenedor", e.container], ["Estado", e.status]].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 10.5, color: C.warmGray, letterSpacing: "0.03em", marginBottom: 3 }}>{k.toUpperCase()}</div>
                <div style={{ fontSize: 13, color: C.coffee, fontWeight: 500, fontFamily: k === "Contenedor" ? FONT_MONO : FONT_BODY }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.line}` }}>
            <div style={{ fontSize: 10.5, color: C.warmGray, letterSpacing: "0.03em", marginBottom: 8 }}>LOTES ASOCIADOS</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {e.lots.map((l) => (
                <button key={l} onClick={() => openLot(l)} style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: C.forest, background: "rgba(30,59,44,0.08)", border: `1px solid rgba(30,59,44,0.2)`, borderRadius: 5, padding: "5px 9px", cursor: "pointer" }}>{l}</button>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Documentos" action={<span style={{ fontSize: 11, fontWeight: 600, color: allDocsOk ? C.forest : C.amber }}>{allDocsOk ? "Completo" : "Pendiente"}</span>}>
          <DocRow label="Factura comercial" ok={e.docs.factura} />
          <DocRow label="Lista de empaque" ok={e.docs.lista} />
          <DocRow label="Certificado de origen" ok={e.docs.certificado} />
          {!allDocsOk && <div style={{ marginTop: 12, fontSize: 12, color: C.amber, background: "rgba(184,123,46,0.1)", padding: "9px 10px", borderRadius: 6 }}>Esta exportación no puede avanzar a "Listo para embarque" hasta completar los documentos pendientes.</div>}
        </Panel>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Lotes                                                               */
/* ------------------------------------------------------------------ */
function LotesView({ lots, openLot }) {
  return (
    <div style={{ padding: "26px 32px 40px", maxWidth: 1180 }}>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 500, color: C.coffee, margin: "0 0 4px" }}>Lotes</h1>
      <div style={{ fontSize: 12.5, color: C.warmGray, marginBottom: 22 }}>{Object.keys(lots).length} lotes registrados</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {Object.entries(lots).map(([code, lot]) => (
          <div key={code} onClick={() => openLot(code)} className="agx-in" style={{ background: "#FBF9F4", border: `1px solid ${C.line}`, borderRadius: 8, padding: "16px 18px", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.forest)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.line)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: C.forest, fontWeight: 600 }}>{code}</div>
              <div style={{ fontSize: 18 }}>{lot.flag}</div>
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, color: C.coffee, marginTop: 6 }}>{lot.finca}</div>
            <div style={{ fontSize: 11.5, color: C.warmGray, marginTop: 2 }}>{lot.producto} · {lot.cantidad}</div>
            <div style={{ marginTop: 12 }}>
              <div style={{ height: 4, background: C.ivoryDim, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(lot.stage / 5) * 100}%`, background: C.forest, transition: "width 0.6s ease" }} />
              </div>
              <div style={{ fontSize: 10.5, color: C.warmGray, marginTop: 5 }}>{lot.stages[lot.stage].label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Trazabilidad                                                       */
/* ------------------------------------------------------------------ */
function Trazabilidad({ lots, lotId, setLotId }) {
  const lot = lots[lotId];
  return (
    <div style={{ padding: "26px 32px 40px", maxWidth: 860 }}>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 500, color: C.coffee, margin: "0 0 4px" }}>Trazabilidad</h1>
      <div style={{ fontSize: 12.5, color: C.warmGray, marginBottom: 22 }}>Consulta el recorrido completo de un lote, del cultivo al destino.</div>

      <div style={{ position: "relative", maxWidth: 340, marginBottom: 26 }}>
        <select value={lotId} onChange={(e) => setLotId(e.target.value)} style={{ width: "100%", appearance: "none", padding: "10px 34px 10px 12px", borderRadius: 7, border: `1px solid ${C.line}`, background: "#FBF9F4", color: C.coffee, fontFamily: FONT_MONO, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          {Object.keys(lots).map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <ChevronDown size={15} color={C.warmGray} style={{ position: "absolute", right: 12, top: 12, pointerEvents: "none" }} />
      </div>

      <div key={lotId} className="agx-in" style={{ background: "#FBF9F4", border: `1px solid ${C.line}`, borderRadius: 10, padding: "22px 24px", marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.forest, fontWeight: 600, marginBottom: 6 }}>{lotId}</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 500, color: C.coffee }}>{lot.finca}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: C.warmGray, marginTop: 4 }}><MapPin size={12} /> {lot.ubicacion}</div>
          </div>
          <div style={{ fontSize: 26 }}>{lot.flag}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 20, paddingTop: 18, borderTop: `1px solid ${C.line}` }}>
          {[["Producto", lot.producto], ["Cantidad", lot.cantidad], ["Cosecha", lot.cosecha]].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 10.5, color: C.warmGray, letterSpacing: "0.03em", marginBottom: 3 }}>{k.toUpperCase()}</div>
              <div style={{ fontSize: 13, color: C.coffee, fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div key={lotId + "-tl"} style={{ position: "relative", paddingLeft: 6 }}>
        {lot.stages.map((s, i) => {
          const Icon = s.icon;
          const done = i <= lot.stage;
          return (
            <div key={s.label} style={{ display: "flex", gap: 16, animation: `agx-fade-up 0.5s ${0.06 * i}s cubic-bezier(.2,.8,.2,1) both` }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: done ? C.forest : "#EDE8DB", border: done ? "none" : `1.5px solid ${C.line}`, flexShrink: 0 }}>
                  <Icon size={16} color={done ? C.ivory : C.warmGray} />
                </div>
                {i < lot.stages.length - 1 && <div style={{ width: 1.5, flex: 1, minHeight: 30, background: i < lot.stage ? C.forest : C.line, margin: "2px 0" }} />}
              </div>
              <div style={{ paddingBottom: 26 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: done ? C.coffee : C.warmGray, marginTop: 6 }}>{s.label}</div>
                <div style={{ fontSize: 12.5, color: C.warmGray, marginTop: 2 }}>{s.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Productos                                                          */
/* ------------------------------------------------------------------ */
function ProductosView({ exports }) {
  const byProduct = useMemo(() => {
    const map = {};
    exports.forEach((e) => {
      if (!map[e.product]) map[e.product] = { qty: 0, value: 0, count: 0, countries: new Set() };
      map[e.product].qty += e.qty;
      map[e.product].value += e.value;
      map[e.product].count += 1;
      map[e.product].countries.add(e.country);
    });
    return map;
  }, [exports]);

  const isCoffee = (p) => p.toLowerCase().includes("café");

  return (
    <div style={{ padding: "26px 32px 40px", maxWidth: 1180 }}>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 500, color: C.coffee, margin: "0 0 4px" }}>Productos</h1>
      <div style={{ fontSize: 12.5, color: C.warmGray, marginBottom: 22 }}>Catálogo de productos exportados y su desempeño acumulado en 2026</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {Object.entries(byProduct).map(([name, d]) => (
          <div key={name} className="agx-in" style={{ background: "#FBF9F4", border: `1px solid ${C.line}`, borderRadius: 8, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 7, background: isCoffee(name) ? C.coffeeSoft : C.forestSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Coffee size={16} color={C.ivory} />
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, color: C.coffee }}>{name}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <div>
                <div style={{ fontSize: 10.5, color: C.warmGray }}>VOLUMEN</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 14, color: C.coffee, fontWeight: 600 }}>{fmtKg(d.qty)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: C.warmGray }}>VALOR</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 14, color: C.coffee, fontWeight: 600 }}>{fmtUSD(d.value)}</div>
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: C.warmGray }}>ENVÍOS</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 14, color: C.coffee, fontWeight: 600 }}>{d.count}</div>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 11.5, color: C.warmGray }}>Destinos: {Array.from(d.countries).join(", ")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Clientes                                                            */
/* ------------------------------------------------------------------ */
function ClientesView({ exports }) {
  const byClient = useMemo(() => {
    const map = {};
    exports.forEach((e) => {
      if (!map[e.client]) map[e.client] = { qty: 0, value: 0, count: 0, countries: new Set() };
      map[e.client].qty += e.qty;
      map[e.client].value += e.value;
      map[e.client].count += 1;
      map[e.client].countries.add(e.country);
    });
    return map;
  }, [exports]);

  return (
    <div style={{ padding: "26px 32px 40px", maxWidth: 1180 }}>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 500, color: C.coffee, margin: "0 0 4px" }}>Clientes</h1>
      <div style={{ fontSize: 12.5, color: C.warmGray, marginBottom: 22 }}>{Object.keys(byClient).length} clientes con exportaciones registradas</div>
      <div style={{ border: `1px solid ${C.line}`, borderRadius: 8, overflow: "hidden", background: "#FBF9F4" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 0.7fr 1.4fr", padding: "10px 16px", fontSize: 10.5, color: C.warmGray, letterSpacing: "0.04em", borderBottom: `1px solid ${C.line}` }}>
          <div>CLIENTE</div><div>VOLUMEN TOTAL</div><div>VALOR TOTAL</div><div>ENVÍOS</div><div>PAÍSES</div>
        </div>
        {Object.entries(byClient).map(([name, d]) => (
          <div key={name} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 0.7fr 1.4fr", padding: "13px 16px", borderBottom: `1px solid ${C.line}`, fontSize: 12.5, color: C.coffee, alignItems: "center" }}>
            <div style={{ fontWeight: 600 }}>{name}</div>
            <div style={{ fontFamily: FONT_MONO }}>{fmtKg(d.qty)}</div>
            <div style={{ fontFamily: FONT_MONO }}>{fmtUSD(d.value)}</div>
            <div>{d.count}</div>
            <div style={{ color: C.warmGray }}>{Array.from(d.countries).join(", ")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Documentos                                                         */
/* ------------------------------------------------------------------ */
function DocumentosView({ exports, openExport, flashId }) {
  return (
    <div style={{ padding: "26px 32px 40px", maxWidth: 1180 }}>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 500, color: C.coffee, margin: "0 0 4px" }}>Documentos</h1>
      <div style={{ fontSize: 12.5, color: C.warmGray, marginBottom: 22 }}>Estado de la documentación por exportación</div>
      <div style={{ border: `1px solid ${C.line}`, borderRadius: 8, overflow: "hidden", background: "#FBF9F4" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 1fr 1fr 1fr", padding: "10px 16px", fontSize: 10.5, color: C.warmGray, letterSpacing: "0.04em", borderBottom: `1px solid ${C.line}` }}>
          <div>EXPORTACIÓN</div><div>CLIENTE</div><div>FACTURA</div><div>LISTA DE EMPAQUE</div><div>CERT. DE ORIGEN</div>
        </div>
        {exports.map((e) => (
          <div key={e.id} onClick={() => openExport(e.id)} className={flashId === e.id ? "agx-flash" : ""} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.5fr 1fr 1fr 1fr", padding: "13px 16px", borderBottom: `1px solid ${C.line}`, fontSize: 12.5, color: C.coffee, alignItems: "center", cursor: "pointer" }}>
            <div style={{ fontFamily: FONT_MONO, fontWeight: 600 }}>{e.id}</div>
            <div style={{ color: C.warmGray }}>{e.client}</div>
            <div>{e.docs.factura ? <CheckCircle2 size={16} color={C.forest} /> : <AlertTriangle size={16} color={C.amber} />}</div>
            <div>{e.docs.lista ? <CheckCircle2 size={16} color={C.forest} /> : <AlertTriangle size={16} color={C.amber} />}</div>
            <div>{e.docs.certificado ? <CheckCircle2 size={16} color={C.forest} /> : <AlertTriangle size={16} color={C.amber} />}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reportes                                                            */
/* ------------------------------------------------------------------ */
function ReportesView({ exports }) {
  const byCountry = useMemo(() => {
    const map = {};
    exports.forEach((e) => { map[e.country] = (map[e.country] || 0) + e.value; });
    return Object.entries(map).map(([country, value]) => ({ country, value }));
  }, [exports]);

  const byProduct = useMemo(() => {
    const map = {};
    exports.forEach((e) => { map[e.product] = (map[e.product] || 0) + e.qty; });
    return Object.entries(map).map(([product, qty]) => ({ product, qty }));
  }, [exports]);

  return (
    <div style={{ padding: "26px 32px 40px", maxWidth: 1180 }}>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 500, color: C.coffee, margin: "0 0 4px" }}>Reportes</h1>
      <div style={{ fontSize: 12.5, color: C.warmGray, marginBottom: 22 }}>Valor y volumen exportado, calculados en tiempo real sobre el registro actual</div>
      <IndicadoresStrip exports={exports} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Panel title="Valor exportado por país (USD)">
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={byCountry} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 5" stroke={C.line} vertical={false} />
                <XAxis dataKey="country" tick={{ fontSize: 11, fontFamily: FONT_BODY, fill: C.warmGray }} axisLine={{ stroke: C.line }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontFamily: FONT_BODY, fill: C.warmGray }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontFamily: FONT_BODY, fontSize: 12, border: `1px solid ${C.line}`, borderRadius: 6 }} formatter={(v) => fmtUSD(v)} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {byCountry.map((entry, i) => <Cell key={i} fill={i % 2 === 0 ? C.forest : C.olive} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Volumen exportado por producto (kg)">
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={byProduct} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 5" stroke={C.line} vertical={false} />
                <XAxis dataKey="product" tick={{ fontSize: 10.5, fontFamily: FONT_BODY, fill: C.warmGray }} axisLine={{ stroke: C.line }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontFamily: FONT_BODY, fill: C.warmGray }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontFamily: FONT_BODY, fontSize: 12, border: `1px solid ${C.line}`, borderRadius: 6 }} formatter={(v) => fmtKg(v)} />
                <Bar dataKey="qty" radius={[4, 4, 0, 0]}>
                  {byProduct.map((entry, i) => <Cell key={i} fill={i % 2 === 0 ? C.accent : C.amber} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Configuración                                                       */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* Roles, usuarios y normativa                                         */
/* ------------------------------------------------------------------ */
const GESTION_KEYS = ["cumplimiento", "reportes", "configuracion"];
const CLIENTE_KEYS = ["dashboard", "exportaciones", "trazabilidad"];
const PAISES_UE = ["Alemania", "Países Bajos", "España", "Francia", "Italia", "Bélgica", "Portugal"];

const USERS = [
  { usuario: "admin", clave: "admin123", name: "Camila Noguera", role: "Administrador", initials: "CN" },
  { usuario: "cliente", clave: "cliente123", name: "Andes Coffee Export", role: "Cliente", initials: "AC", cliente: "Andes Coffee Export" },
];

function checkCompliance(e) {
  return [
    { label: "Factura comercial emitida", ok: !!e.docs.factura },
    { label: "Lista de empaque cargada", ok: !!e.docs.lista },
    { label: "Certificado de origen cargado", ok: !!e.docs.certificado },
    { label: "Lote de origen asociado (trazabilidad)", ok: e.lots.length > 0 },
    { label: "Puerto de salida definido", ok: !!e.port && e.port !== "—" },
    { label: "País destino dentro de la Unión Europea", ok: PAISES_UE.includes(e.country) },
  ];
}

function CumplimientoView({ exports, openExport }) {
  return (
    <div style={{ padding: "26px 32px 40px", maxWidth: 1180 }}>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 500, color: C.coffee, margin: "0 0 4px" }}>Cumplimiento normativo</h1>
      <div style={{ fontSize: 12.5, color: C.warmGray, marginBottom: 22 }}>Validación de requisitos de la Unión Europea por exportación, para evitar sanciones o rechazos en aduana</div>
      <div style={{ border: `1px solid ${C.line}`, borderRadius: 8, overflow: "hidden", background: "#FBF9F4" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.4fr 1fr 1fr", padding: "10px 16px", fontSize: 10.5, color: C.warmGray, letterSpacing: "0.04em", borderBottom: `1px solid ${C.line}` }}>
          <div>EXPORTACIÓN</div><div>DESTINO</div><div>REQUISITOS QUE FALTAN</div><div>CUMPLIDOS</div><div>RESULTADO</div>
        </div>
        {exports.map((e) => {
          const checks = checkCompliance(e);
          const ok = checks.filter((c) => c.ok).length;
          const faltan = checks.filter((c) => !c.ok);
          const cumple = faltan.length === 0;
          return (
            <div key={e.id} onClick={() => openExport(e.id)}
              style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.4fr 1fr 1fr", padding: "13px 16px", borderBottom: `1px solid ${C.line}`, fontSize: 12.5, color: C.coffee, alignItems: "center", cursor: "pointer" }}
              onMouseEnter={(ev) => (ev.currentTarget.style.background = C.ivoryDim)}
              onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}>
              <div style={{ fontFamily: FONT_MONO, fontWeight: 600 }}>{e.id}</div>
              <div>{e.flag} {e.country}</div>
              <div style={{ color: C.warmGray, fontSize: 11.5 }}>{cumple ? "—" : faltan.map((f) => f.label).join(", ")}</div>
              <div style={{ fontFamily: FONT_MONO }}>{ok}/{checks.length}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: cumple ? C.forest : C.amber }}>
                {cumple ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                {cumple ? "Cumple" : "No cumple"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IndicadoresStrip({ exports }) {
  const kg = (f) => exports.filter(f).reduce((s, e) => s + e.qty, 0);
  const items = [
    ["Kg por embarcar", kg((e) => ["Preparación", "Documentación", "Listo para embarque"].includes(e.status)).toLocaleString("es-CO")],
    ["Kg en tránsito", kg((e) => e.status === "En tránsito").toLocaleString("es-CO")],
    ["Kg entregados", kg((e) => e.status === "Entregado").toLocaleString("es-CO")],
    ["Clientes con envíos activos", new Set(exports.filter((e) => !["Entregado", "Borrador"].includes(e.status)).map((e) => e.client)).size],
    ["Documentos pendientes", exports.reduce((s, e) => s + ["factura", "lista", "certificado"].filter((d) => !e.docs[d]).length, 0)],
    ["Cumplen normativa UE", `${exports.filter((e) => checkCompliance(e).every((c) => c.ok)).length}/${exports.length}`],
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14, marginBottom: 22, paddingBottom: 20, borderBottom: `1px solid ${C.line}` }}>
      {items.map(([label, value]) => (
        <div key={label}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 500, color: C.coffee, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 11, color: C.warmGray, marginTop: 5 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const entrar = () => {
    const u = USERS.find((x) => x.usuario === usuario.trim() && x.clave === clave);
    if (u) onLogin(u);
    else setError("Usuario o contraseña incorrectos.");
  };
  const campo = { width: "100%", padding: "10px 12px", borderRadius: 6, border: `1px solid ${C.line}`, fontSize: 13, fontFamily: FONT_BODY, background: "#FBF9F4", color: C.coffee, outline: "none", marginBottom: 14 };
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexWrap: "wrap", background: C.ivory, fontFamily: FONT_BODY }}>
      <FontStyles />
      <div style={{ flex: "1 1 340px", background: C.coffee, color: C.ivory, padding: "48px 52px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 260 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: C.olive, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 16 }}>A</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 500 }}>AgroExport</div>
        </div>
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 500, lineHeight: 1.2, maxWidth: 360 }}>Exportaciones de café y cacao, con trazabilidad de origen a destino.</div>
          <div style={{ fontSize: 12.5, color: C.warmGrayLight, marginTop: 14 }}>Colombia → Unión Europea · RiTech SAS</div>
        </div>
        <div style={{ fontSize: 11, color: C.warmGrayLight }}>Acceso para personal de RiTech SAS y clientes</div>
      </div>
      <div style={{ flex: "1 1 340px", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ width: "100%", maxWidth: 340 }}>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 500, color: C.coffee, margin: "0 0 4px" }}>Iniciar sesión</h1>
          <div style={{ fontSize: 12.5, color: C.warmGray, marginBottom: 22 }}>Ingresa con tu usuario según tu rol</div>
          <label style={{ fontSize: 11, color: C.warmGray, letterSpacing: "0.03em" }}>USUARIO</label>
          <input value={usuario} onChange={(e) => { setUsuario(e.target.value); setError(""); }} style={{ ...campo, marginTop: 5 }} />
          <label style={{ fontSize: 11, color: C.warmGray, letterSpacing: "0.03em" }}>CONTRASEÑA</label>
          <input type="password" value={clave} onChange={(e) => { setClave(e.target.value); setError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") entrar(); }} style={{ ...campo, marginTop: 5 }} />
          {error && <div style={{ fontSize: 12, color: C.rust, marginBottom: 12 }}>{error}</div>}
          <button onClick={entrar} style={{ width: "100%", background: C.forest, color: C.ivory, border: "none", borderRadius: 6, padding: "11px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Lock size={14} /> Entrar
          </button>
          <div style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid ${C.line}`, fontSize: 11.5, color: C.warmGray }}>
            <div style={{ marginBottom: 8, letterSpacing: "0.03em" }}>ACCESOS DE PRUEBA</div>
            {USERS.map((u) => (
              <div key={u.usuario} onClick={() => { setUsuario(u.usuario); setClave(u.clave); setError(""); }}
                style={{ cursor: "pointer", padding: "6px 0", display: "flex", justifyContent: "space-between" }}>
                <span><b style={{ color: C.coffee }}>{u.role}</b> · {u.usuario} / {u.clave}</span>
                <span style={{ color: C.forest }}>usar</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ on }) {
  return (
    <div style={{ width: 34, height: 19, borderRadius: 10, background: on ? C.forest : C.line, position: "relative", flexShrink: 0 }}>
      <div style={{ width: 15, height: 15, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: on ? 17 : 2, transition: "left 0.2s" }} />
    </div>
  );
}

function ConfiguracionView() {
  return (
    <div style={{ padding: "26px 32px 40px", maxWidth: 720 }}>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 500, color: C.coffee, margin: "0 0 4px" }}>Configuración</h1>
      <div style={{ fontSize: 12.5, color: C.warmGray, marginBottom: 22 }}>Empresa, usuario y preferencias de la plataforma</div>

      <Panel title="Empresa" style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 16, columnGap: 14 }}>
          {[["Razón social", "Andes Coffee Export"], ["País", "🇨🇴 Colombia"], ["Sede", "Pasto, Nariño"], ["Productos", "Café, Cacao"]].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 10.5, color: C.warmGray, letterSpacing: "0.03em", marginBottom: 3 }}>{k.toUpperCase()}</div>
              <div style={{ fontSize: 13, color: C.coffee, fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Notificaciones" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[["Cambios de estado de embarque", true], ["Documentación pendiente", true], ["Nuevos lotes registrados", false], ["Resumen semanal por correo", true]].map(([label, on], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: C.coffee }}>{label}</span>
              <Toggle on={on} />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Sincronización">
        <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: C.coffee }}>
          <Bell size={15} color={C.forest} />
          Esta plataforma sincroniza el estado de embarques, documentos y lotes en vivo mientras la sesión está abierta.
        </div>
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */
export default function App() {
  const [view, setView] = useState("dashboard");
  const [selectedExport, setSelectedExport] = useState(null);
  const [lotId, setLotId] = useState("CAF-2026-0012");
  const [sim, setSim] = useState({ exports: EXPORTS_SEED, lots: LOTS_SEED });
  const [activity, setActivity] = useState(ACTIVITY_SEED);
  const [lastSync, setLastSync] = useState(Date.now());
  const [now, setNow] = useState(Date.now());
  const [flashId, setFlashId] = useState(null);
  const [user, setUser] = useState(null);

  // clock tick for relative time labels
  useEffect(() => {
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(clock);
  }, []);

  // simulated real-time sync engine — advances one export/document/lot per tick
  useEffect(() => {
    const engine = setInterval(() => {
      setSim((prev) => {
        const exportsNext = prev.exports.map((e) => ({ ...e, docs: { ...e.docs } }));
        const lotsNext = { ...prev.lots };
        const actions = [];
        exportsNext.forEach((e, i) => {
          if (e.status !== "Entregado") {
            const missingDoc = ["factura", "lista", "certificado"].find((d) => !e.docs[d]);
            if (missingDoc) actions.push({ type: "doc", i, doc: missingDoc });
            else {
              const idx = STATUS_ORDER.indexOf(e.status);
              if (idx < STATUS_ORDER.length - 1 && (STATUS_ORDER[idx + 1] !== "Listo para embarque" || checkCompliance(e).every((c) => c.ok))) actions.push({ type: "advance", i });
            }
          }
        });
        if (actions.length === 0) return prev;
        const action = actions[Math.floor(Math.random() * actions.length)];
        let logText = "";
        if (action.type === "doc") {
          exportsNext[action.i].docs[action.doc] = true;
          const label = action.doc === "factura" ? "Factura comercial" : action.doc === "lista" ? "Lista de empaque" : "Certificado de origen";
          logText = `${label} cargado para ${exportsNext[action.i].id}`;
        } else {
          const idx = STATUS_ORDER.indexOf(exportsNext[action.i].status);
          exportsNext[action.i].status = STATUS_ORDER[idx + 1];
          logText = `${exportsNext[action.i].id} cambió a ${exportsNext[action.i].status}`;
          exportsNext[action.i].lots.forEach((l) => {
            if (lotsNext[l] && lotsNext[l].stage < 5) lotsNext[l] = { ...lotsNext[l], stage: lotsNext[l].stage + 1 };
          });
        }
        setActivity((a) => [{ ts: Date.now(), text: logText }, ...a].slice(0, 8));
        setFlashId(exportsNext[action.i].id);
        setTimeout(() => setFlashId(null), 1400);
        return { exports: exportsNext, lots: lotsNext };
      });
      setLastSync(Date.now());
    }, 9000);
    return () => clearInterval(engine);
  }, []);

  const openExport = (id) => { setSelectedExport(id); setView("exportacion-detalle"); };
  const openLot = (id) => { setLotId(id); setView("trazabilidad"); };
  const goNav = (key) => { setSelectedExport(null); setView(key); };

  const advanceExport = (id) => {
    setSim((prev) => {
      const exportsNext = prev.exports.map((x) => ({ ...x, docs: { ...x.docs } }));
      const lotsNext = { ...prev.lots };
      const e = exportsNext.find((x) => x.id === id);
      if (!e) return prev;
      const next = STATUS_ORDER[STATUS_ORDER.indexOf(e.status) + 1];
      if (!next) return prev;
      if (next === "Listo para embarque" && !checkCompliance(e).every((c) => c.ok)) return prev;
      e.status = next;
      e.lots.forEach((l) => {
        if (lotsNext[l] && lotsNext[l].stage < 5) lotsNext[l] = { ...lotsNext[l], stage: lotsNext[l].stage + 1 };
      });
      setActivity((a) => [{ ts: Date.now(), text: `${e.id} cambió a ${next} (por ${user.name})` }, ...a].slice(0, 8));
      setFlashId(e.id);
      setTimeout(() => setFlashId(null), 1400);
      return { exports: exportsNext, lots: lotsNext };
    });
    setLastSync(Date.now());
  };

  if (!user) return <Login onLogin={(u) => { setUser(u); setView("dashboard"); setSelectedExport(null); }} />;

  const nav = NAV.filter((n) => user.role === "Administrador" || CLIENTE_KEYS.includes(n.key));
  const misExports = user.role === "Cliente" ? sim.exports.filter((x) => x.client === user.cliente) : sim.exports;
  const actVis = user.role === "Cliente" ? activity.filter((a) => misExports.some((x) => a.text.includes(x.id))) : activity;
  const lotsVis = user.role === "Cliente"
    ? Object.fromEntries(Object.entries(sim.lots).filter(([k]) => misExports.some((x) => x.lots.includes(k))))
    : sim.lots;
  const lotSel = lotsVis[lotId] ? lotId : Object.keys(lotsVis)[0];

  let content;
  if (view === "dashboard") content = <Dashboard exports={misExports} activity={actVis} openExport={openExport} lastSync={lastSync} now={now} flashId={flashId} />;
  else if (view === "exportaciones") content = <ExportacionesList exports={misExports} openExport={openExport} flashId={flashId} />;
  else if (view === "exportacion-detalle") content = <ExportDetail id={selectedExport} exports={misExports} back={() => setView("exportaciones")} openLot={openLot} role={user.role} advance={advanceExport} />;
  else if (view === "lotes") content = <LotesView lots={sim.lots} openLot={openLot} />;
  else if (view === "productos") content = <ProductosView exports={sim.exports} />;
  else if (view === "clientes") content = <ClientesView exports={sim.exports} />;
  else if (view === "documentos") content = <DocumentosView exports={sim.exports} openExport={openExport} flashId={flashId} />;
  else if (view === "trazabilidad") content = <Trazabilidad lots={lotsVis} lotId={lotSel} setLotId={setLotId} />;
  else if (view === "cumplimiento") content = <CumplimientoView exports={sim.exports} openExport={openExport} />;
  else if (view === "reportes") content = <ReportesView exports={sim.exports} />;
  else if (view === "configuracion") content = <ConfiguracionView />;

  const activeNavKey = view === "exportacion-detalle" ? "exportaciones" : view;

  return (
    <div style={{ display: "flex", height: "100vh", background: C.ivory, fontFamily: FONT_BODY, color: C.coffee }}>
      <FontStyles />
      <Sidebar view={activeNavKey} setView={goNav} lastSync={lastSync} now={now} user={user} nav={nav} onLogout={() => setUser(null)} />
      <div style={{ flex: 1, overflowY: "auto" }} className="agx-scroll">
        {content}
      </div>
    </div>
  );
}
