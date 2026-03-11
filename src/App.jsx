import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0A0E1A",
  card: "#111827",
  cardAlt: "#1A2234",
  accent: "#3B82F6",
  accentGlow: "rgba(59,130,246,0.15)",
  green: "#10B981",
  greenGlow: "rgba(16,185,129,0.15)",
  red: "#EF4444",
  redGlow: "rgba(239,68,68,0.12)",
  orange: "#F59E0B",
  orangeGlow: "rgba(245,158,11,0.12)",
  text: "#F1F5F9",
  muted: "#94A3B8",
  border: "#1E293B",
  aws: "#FF9900",
  gcp: "#4285F4",
  kaione: "#10B981",
};

function fmt(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}
function fmtMXN(n) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}
function fmtPct(n) {
  return n.toFixed(0) + "%";
}

const GlowCard = ({ children, color = COLORS.accent, style = {}, onClick, active }) => (
  <div
    onClick={onClick}
    style={{
      background: COLORS.card,
      border: `1px solid ${active ? color : COLORS.border}`,
      borderRadius: 16,
      padding: "24px",
      position: "relative",
      overflow: "hidden",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.3s ease",
      boxShadow: active ? `0 0 30px ${color}22, inset 0 1px 0 ${color}33` : "0 4px 24px rgba(0,0,0,0.3)",
      ...style,
    }}
  >
    {active && (
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      }} />
    )}
    {children}
  </div>
);

const Badge = ({ children, color }) => (
  <span style={{
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
    background: `${color}22`,
    color: color,
    border: `1px solid ${color}44`,
  }}>{children}</span>
);

const Slider = ({ label, value, onChange, min, max, step = 1, unit = "", format }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
      <span style={{ color: COLORS.muted, fontSize: 13, fontWeight: 500 }}>{label}</span>
      <span style={{ color: COLORS.text, fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
        {format ? format(value) : value}{unit}
      </span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{ width: "100%", accentColor: COLORS.accent, height: 6, cursor: "pointer" }}
    />
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
      <span style={{ color: COLORS.muted, fontSize: 10 }}>{format ? format(min) : min}{unit}</span>
      <span style={{ color: COLORS.muted, fontSize: 10 }}>{format ? format(max) : max}{unit}</span>
    </div>
  </div>
);

const BarChart = ({ items, maxVal }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    {items.map((item, i) => (
      <div key={i}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color }} />
            <span style={{ color: COLORS.text, fontSize: 13, fontWeight: 600 }}>{item.label}</span>
          </div>
          <span style={{ color: item.color, fontSize: 15, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(item.value)}/mo</span>
        </div>
        <div style={{ height: 28, background: COLORS.bg, borderRadius: 8, overflow: "hidden", position: "relative" }}>
          <div style={{
            height: "100%",
            width: `${Math.max((item.value / maxVal) * 100, 2)}%`,
            background: `linear-gradient(90deg, ${item.color}CC, ${item.color})`,
            borderRadius: 8,
            transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)",
            boxShadow: `0 0 20px ${item.color}44`,
          }} />
        </div>
      </div>
    ))}
  </div>
);

const AnimNum = ({ value, prefix = "", suffix = "", color = COLORS.text, size = 28 }) => {
  const [displayed, setDisplayed] = useState(value);
  const ref = useRef(null);
  useEffect(() => {
    let start = displayed;
    const diff = value - start;
    if (Math.abs(diff) < 1) { setDisplayed(value); return; }
    const duration = 500;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(start + diff * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);
  return (
    <span style={{ color, fontSize: size, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", letterSpacing: -0.5 }}>
      {prefix}{typeof displayed === "number" ? displayed.toLocaleString() : displayed}{suffix}
    </span>
  );
};

// ===== INLINE EDITABLE INPUT =====
const inlineInputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 6,
  color: COLORS.text,
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  fontWeight: 600,
  padding: "4px 8px",
  width: 80,
  textAlign: "right",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const InlineInput = ({ value, onChange, prefix = "$", color = COLORS.text, width = 80 }) => {
  const [editing, setEditing] = useState(false);
  const [localVal, setLocalVal] = useState(String(value));
  const inputRef = useRef(null);

  useEffect(() => {
    if (!editing) setLocalVal(String(value));
  }, [value, editing]);

  const commit = () => {
    setEditing(false);
    const parsed = parseFloat(localVal);
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(parsed);
    } else {
      setLocalVal(String(value));
    }
  };

  if (!editing) {
    return (
      <span
        onClick={() => { setEditing(true); setTimeout(() => inputRef.current?.select(), 50); }}
        style={{
          ...inlineInputStyle,
          display: "inline-block",
          cursor: "pointer",
          width,
          color,
          borderColor: "transparent",
          background: "transparent",
          padding: "4px 2px",
        }}
        title="Haz clic para editar"
      >
        {prefix}{Math.round(value).toLocaleString()}
        <span style={{ fontSize: 8, marginLeft: 3, opacity: 0.4 }}>✎</span>
      </span>
    );
  }

  return (
    <input
      ref={inputRef}
      type="number"
      value={localVal}
      onChange={e => setLocalVal(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setLocalVal(String(value)); setEditing(false); } }}
      autoFocus
      style={{
        ...inlineInputStyle,
        width,
        color,
        borderColor: COLORS.accent,
        boxShadow: `0 0 8px ${COLORS.accent}33`,
      }}
    />
  );
};

// Toggle for included/not-included features
const TogglePill = ({ included, onToggle, labelIncluded = "Incluido", labelNotIncluded = "No incluido" }) => (
  <button
    onClick={onToggle}
    style={{
      background: included ? `${COLORS.green}22` : `${COLORS.orange}22`,
      color: included ? COLORS.green : COLORS.orange,
      border: `1px solid ${included ? COLORS.green : COLORS.orange}44`,
      borderRadius: 12,
      padding: "2px 10px",
      fontSize: 10,
      fontWeight: 700,
      cursor: "pointer",
      fontFamily: "'JetBrains Mono', monospace",
      transition: "all 0.2s",
    }}
  >
    {included ? labelIncluded : labelNotIncluded}
  </button>
);


// ===== MAIN COMPONENT =====
export default function App() {
  const [tab, setTab] = useState("comparativa");
  const [editMode, setEditMode] = useState(false);

  // Comparison state - type de cambio shared across tabs
  const [tcUSD, setTcUSD] = useState(17.5);

  // ROI state
  const [salarioMensual, setSalarioMensual] = useState(18000);
  const [revisionesMes, setRevisionesMes] = useState(20);
  const [costoLuz, setCostoLuz] = useState(2500);
  const [costoServidor, setCostoServidor] = useState(3500);

  // === EDITABLE AWS STATE ===
  const [awsBase, setAwsBase] = useState(621.69);
  const [awsDataTransfer, setAwsDataTransfer] = useState(45);
  const [awsMonitoring, setAwsMonitoring] = useState(15);
  const [awsBackup, setAwsBackup] = useState(30);
  const [awsOpsIncluded, setAwsOpsIncluded] = useState(false);
  const [awsSslIncluded, setAwsSslIncluded] = useState(false);
  const [awsSpecs, setAwsSpecs] = useState("8 vCPU · 32 GB · NVIDIA L4 · 512 GB EBS");
  const [awsSub, setAwsSub] = useState("g6.2xlarge (Reserved 1yr)");

  // === EDITABLE GCP STATE ===
  const [gcpBase, setGcpBase] = useState(623.15);
  const [gcpStorage, setGcpStorage] = useState(51);
  const [gcpDataTransfer, setGcpDataTransfer] = useState(45);
  const [gcpMonitoring, setGcpMonitoring] = useState(0);
  const [gcpBackup, setGcpBackup] = useState(0);
  const [gcpOpsIncluded, setGcpOpsIncluded] = useState(false);
  const [gcpSpecs, setGcpSpecs] = useState("8 vCPU · 32 GB · NVIDIA L4 (24GB) · 512 GB Balanced PD");
  const [gcpSub, setGcpSub] = useState("g2-standard-8 (On-Demand)");

  // === EDITABLE KAIONE STATE ===
  const [kaioneInfra, setKaioneInfra] = useState(199);
  const [kaioneSoporte, setKaioneSoporte] = useState(60);
  const [kaioneBackup, setKaioneBackup] = useState(30);
  const [kaioneDataIncluded, setKaioneDataIncluded] = useState(true);
  const [kaioneSslIncluded, setKaioneSslIncluded] = useState(true);
  const [kaioneOpsIncluded, setKaioneOpsIncluded] = useState(true);
  const [kaioneSpecs, setKaioneSpecs] = useState("4 vCPU · 16 GB · GPU + Neural Engine · 100 GB NVMe");
  const [kaioneSub, setKaioneSub] = useState("Nube Privada Gestionada");

  // === AUTO-CALCULATED TOTALS ===
  const awsTotal = awsBase + awsDataTransfer + awsMonitoring + awsBackup;
  const gcpTotal = gcpBase + gcpStorage + gcpDataTransfer + gcpMonitoring + gcpBackup;
  const kaioneTotal = kaioneInfra + kaioneSoporte + kaioneBackup;

  const savingsVsAws = awsTotal > 0 ? ((awsTotal - kaioneTotal) / awsTotal * 100) : 0;
  const savingsVsGcp = gcpTotal > 0 ? ((gcpTotal - kaioneTotal) / gcpTotal * 100) : 0;

  // --- ROI DATA (uses kaioneTotal from cloud tab) ---
  const salarioHora = salarioMensual / 160;
  const horasAntes = 24;
  const horasAhora = 4;

  const costoRevisionAntes = salarioHora * horasAntes;
  const costoRevisionAhora = salarioHora * horasAhora;

  const costoMensualAntes = (costoRevisionAntes * revisionesMes) + costoLuz + costoServidor;
  const costoMensualAhora = (costoRevisionAhora * revisionesMes) + (kaioneTotal * tcUSD);

  const ahorroMensual = costoMensualAntes - costoMensualAhora;
  const ahorroAnual = ahorroMensual * 12;
  const ahorroTiempoHrs = (horasAntes - horasAhora) * revisionesMes;
  const ahorroTiempoPct = ((horasAntes - horasAhora) / horasAntes) * 100;

  // Cheapest provider detection
  const allTotals = [
    { name: "AWS", total: awsTotal },
    { name: "Google Cloud", total: gcpTotal },
    { name: "Kaione", total: kaioneTotal },
  ];
  const cheapest = allTotals.reduce((a, b) => a.total < b.total ? a : b).name;

  const tabs = [
    { id: "comparativa", label: "☁ Comparativa Cloud" },
    { id: "roi", label: "📊 Calculadora ROI" },
  ];

  // Editable text input for specs
  const EditableText = ({ value, onChange, style = {} }) => {
    const [editing, setEditing] = useState(false);
    const [local, setLocal] = useState(value);
    const ref = useRef(null);

    useEffect(() => { if (!editing) setLocal(value); }, [value, editing]);

    if (!editMode) return <span style={style}>{value}</span>;
    if (!editing) return (
      <span onClick={() => { setEditing(true); setTimeout(() => ref.current?.select(), 50); }}
        style={{ ...style, cursor: "pointer", borderBottom: `1px dashed ${COLORS.muted}44` }}
        title="Clic para editar">
        {value}<span style={{ fontSize: 8, marginLeft: 3, opacity: 0.4 }}>✎</span>
      </span>
    );
    return (
      <input ref={ref} value={local} onChange={e => setLocal(e.target.value)} autoFocus
        onBlur={() => { setEditing(false); onChange(local); }}
        onKeyDown={e => { if (e.key === "Enter") { setEditing(false); onChange(local); } if (e.key === "Escape") { setLocal(value); setEditing(false); } }}
        style={{
          ...style, background: "rgba(255,255,255,0.06)", border: `1px solid ${COLORS.accent}`,
          borderRadius: 6, padding: "2px 6px", outline: "none", color: COLORS.text, width: "100%",
          fontFamily: style.fontFamily || "inherit", fontSize: style.fontSize || 11,
        }}
      />
    );
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: "'Outfit', 'SF Pro Display', -apple-system, sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${COLORS.border}`,
        padding: "24px 32px",
        background: "linear-gradient(180deg, #0F1629 0%, #0A0E1A 100%)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.green})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 900, color: "#fff",
            }}>K</div>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Kaione</span>
            <span style={{ color: COLORS.muted, fontSize: 14, fontWeight: 400, marginLeft: 4 }}>Nube Privada Gestionada</span>
          </div>
          <p style={{ color: COLORS.muted, fontSize: 13, margin: "8px 0 16px 0", maxWidth: 600 }}>
            Análisis comparativo de infraestructura y retorno de inversión para FDV Consultores
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Tab nav */}
            <div style={{ display: "flex", gap: 4, background: COLORS.card, borderRadius: 12, padding: 4, width: "fit-content" }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                  background: tab === t.id ? COLORS.accent : "transparent",
                  color: tab === t.id ? "#fff" : COLORS.muted,
                }}>{t.label}</button>
              ))}
            </div>

            {/* Edit mode toggle */}
            {tab === "comparativa" && (
              <button
                onClick={() => setEditMode(!editMode)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: `1px solid ${editMode ? COLORS.accent : COLORS.border}`,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                  background: editMode ? `${COLORS.accent}22` : "transparent",
                  color: editMode ? COLORS.accent : COLORS.muted,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {editMode ? "✓ Modo Edición Activo" : "✎ Editar Precios"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 32px 60px" }}>

        {/* Edit mode hint */}
        {tab === "comparativa" && editMode && (
          <div style={{
            background: `${COLORS.accent}11`,
            border: `1px solid ${COLORS.accent}33`,
            borderRadius: 12,
            padding: "12px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            color: COLORS.muted,
          }}>
            <span style={{ fontSize: 18 }}>💡</span>
            <span>
              <strong style={{ color: COLORS.accent }}>Modo edición activo.</strong> Haz clic en cualquier precio, spec o beneficio con el ícono <span style={{ opacity: 0.6 }}>✎</span> para modificarlo.
              Los totales y comparativas se recalculan automáticamente.
            </span>
          </div>
        )}

        {/* ========= TAB: COMPARATIVA ========= */}
        {tab === "comparativa" && (
          <div>
            {/* Provider Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
              {[
                {
                  name: "AWS", color: COLORS.aws, isBest: cheapest === "AWS",
                  sub: awsSub, setSub: setAwsSub,
                  specs: awsSpecs, setSpecs: setAwsSpecs,
                  price: awsTotal,
                  extras: [
                    { l: "Instancia EC2", v: awsBase, setter: setAwsBase, editable: true },
                    { l: "Data Transfer (~500GB)", v: awsDataTransfer, setter: setAwsDataTransfer, editable: true },
                    { l: "CloudWatch Monitoring", v: awsMonitoring, setter: setAwsMonitoring, editable: true },
                    { l: "AWS Backup", v: awsBackup, setter: setAwsBackup, editable: true },
                    { l: "Ops Gestionadas", toggle: true, included: awsOpsIncluded, onToggle: () => setAwsOpsIncluded(!awsOpsIncluded) },
                    { l: "SSL / DDoS", toggle: true, included: awsSslIncluded, onToggle: () => setAwsSslIncluded(!awsSslIncluded), labelNotIncluded: "Costo extra" },
                  ],
                },
                {
                  name: "Google Cloud", color: COLORS.gcp, isBest: cheapest === "Google Cloud",
                  sub: gcpSub, setSub: setGcpSub,
                  specs: gcpSpecs, setSpecs: setGcpSpecs,
                  price: gcpTotal,
                  extras: [
                    { l: "Instancia Compute", v: gcpBase, setter: setGcpBase, editable: true },
                    { l: "SSD Persistent (100GB)", v: gcpStorage, setter: setGcpStorage, editable: true },
                    { l: "Data Transfer (~500GB)", v: gcpDataTransfer, setter: setGcpDataTransfer, editable: true },
                    { l: "Cloud Monitoring", v: gcpMonitoring, setter: setGcpMonitoring, editable: true },
                    { l: "Snapshots Backup", v: gcpBackup, setter: setGcpBackup, editable: true },
                    { l: "Ops Gestionadas", toggle: true, included: gcpOpsIncluded, onToggle: () => setGcpOpsIncluded(!gcpOpsIncluded) },
                  ],
                },
                {
                  name: "Kaione", color: COLORS.kaione, isBest: cheapest === "Kaione",
                  sub: kaioneSub, setSub: setKaioneSub,
                  specs: kaioneSpecs, setSpecs: setKaioneSpecs,
                  price: kaioneTotal,
                  extras: [
                    { l: "Infraestructura completa", v: kaioneInfra, setter: setKaioneInfra, editable: true },
                    { l: "Soporte 24/7 + SLA 99%", v: kaioneSoporte, setter: setKaioneSoporte, editable: true },
                    { l: "Backup & DR (14 días)", v: kaioneBackup, setter: setKaioneBackup, editable: true },
                    { l: "Data Transfer", toggle: true, included: kaioneDataIncluded, onToggle: () => setKaioneDataIncluded(!kaioneDataIncluded) },
                    { l: "SSL + DDoS", toggle: true, included: kaioneSslIncluded, onToggle: () => setKaioneSslIncluded(!kaioneSslIncluded) },
                    { l: "Ops Gestionadas", toggle: true, included: kaioneOpsIncluded, onToggle: () => setKaioneOpsIncluded(!kaioneOpsIncluded) },
                  ],
                },
              ].map((p, i) => (
                <GlowCard key={i} color={p.color} active={p.isBest} style={p.isBest ? { transform: "scale(1.02)" } : {}}>
                  {p.isBest && (
                    <div style={{ position: "absolute", top: 16, right: 16 }}>
                      <Badge color={COLORS.green}>Mejor Precio</Badge>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                    <span style={{ fontSize: 18, fontWeight: 800 }}>{p.name}</span>
                  </div>
                  <EditableText value={p.sub} onChange={p.setSub}
                    style={{ color: COLORS.muted, fontSize: 11, display: "block", marginBottom: 8 }} />
                  <EditableText value={p.specs} onChange={p.setSpecs}
                    style={{ color: COLORS.muted, fontSize: 11, display: "block", marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }} />

                  <div style={{ marginBottom: 16 }}>
                    <span style={{ color: p.color, fontSize: 32, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(p.price)}</span>
                    <span style={{ color: COLORS.muted, fontSize: 12 }}> /mes</span>
                  </div>

                  <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
                    {p.extras.map((e, j) => (
                      <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", fontSize: 12 }}>
                        <span style={{ color: COLORS.muted }}>{e.l}</span>
                        {e.toggle ? (
                          editMode ? (
                            <TogglePill
                              included={e.included}
                              onToggle={e.onToggle}
                              labelNotIncluded={e.labelNotIncluded || "No incluido"}
                            />
                          ) : (
                            <span style={{
                              fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                              color: e.included ? COLORS.green : COLORS.orange,
                              fontSize: 11,
                            }}>{e.included ? "Incluido" : (e.labelNotIncluded || "No incluido")}</span>
                          )
                        ) : (
                          editMode ? (
                            <InlineInput value={e.v} onChange={e.setter} color={COLORS.text} width={90} />
                          ) : (
                            <span style={{
                              fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                              color: COLORS.text, fontSize: 11,
                            }}>{fmt(e.v)}</span>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                </GlowCard>
              ))}
            </div>

            {/* Visual Bar Comparison */}
            <GlowCard color={COLORS.accent} style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>
                Costo Total Mensual Comparado
              </h3>
              <BarChart
                maxVal={Math.max(awsTotal, gcpTotal, kaioneTotal)}
                items={[
                  { label: `AWS (${awsSub})`, value: awsTotal, color: COLORS.aws },
                  { label: `GCP (${gcpSub})`, value: gcpTotal, color: COLORS.gcp },
                  { label: "Kaione Nube Privada", value: kaioneTotal, color: COLORS.kaione },
                ]}
              />
            </GlowCard>

            {/* Savings summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
              <GlowCard color={savingsVsAws > 0 ? COLORS.green : COLORS.red}>
                <p style={{ color: COLORS.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px 0" }}>Ahorro vs AWS</p>
                <AnimNum value={Math.round(savingsVsAws)} suffix="%" color={savingsVsAws > 0 ? COLORS.green : COLORS.red} size={36} />
                <p style={{ color: COLORS.muted, fontSize: 12, margin: "8px 0 0 0" }}>
                  {savingsVsAws > 0 ? `${fmt(awsTotal - kaioneTotal)} menos al mes` : `${fmt(kaioneTotal - awsTotal)} más al mes`}
                </p>
              </GlowCard>
              <GlowCard color={savingsVsGcp > 0 ? COLORS.green : COLORS.red}>
                <p style={{ color: COLORS.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px 0" }}>Ahorro vs GCP</p>
                <AnimNum value={Math.round(savingsVsGcp)} suffix="%" color={savingsVsGcp > 0 ? COLORS.green : COLORS.red} size={36} />
                <p style={{ color: COLORS.muted, fontSize: 12, margin: "8px 0 0 0" }}>
                  {savingsVsGcp > 0 ? `${fmt(gcpTotal - kaioneTotal)} menos al mes` : `${fmt(kaioneTotal - gcpTotal)} más al mes`}
                </p>
              </GlowCard>
              <GlowCard color={COLORS.accent}>
                <p style={{ color: COLORS.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px 0" }}>Ahorro Anual vs AWS</p>
                <AnimNum value={Math.round(Math.abs((awsTotal - kaioneTotal) * 12))} prefix="$" color={savingsVsAws > 0 ? COLORS.accent : COLORS.red} size={36} />
                <p style={{ color: COLORS.muted, fontSize: 12, margin: "8px 0 0 0" }}>USD en 12 meses</p>
              </GlowCard>
            </div>

            {/* Detailed feature comparison table */}
            <GlowCard color={COLORS.border}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Comparativa Detallada de Características</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr>
                      {["Característica", "AWS", "GCP", "Kaione"].map((h, i) => (
                        <th key={i} style={{
                          textAlign: i === 0 ? "left" : "center", padding: "12px 16px",
                          borderBottom: `2px solid ${COLORS.border}`,
                          color: i === 3 ? COLORS.green : COLORS.muted, fontWeight: 700, fontSize: 11,
                          textTransform: "uppercase", letterSpacing: 1,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Costo Base", fmt(awsBase), fmt(gcpBase), fmt(kaioneInfra)],
                      ["Total Mensual", fmt(awsTotal), fmt(gcpTotal), fmt(kaioneTotal)],
                      ["Data Transfer Out", awsDataTransfer > 0 ? fmt(awsDataTransfer) + "/mo" : "Incluido", gcpDataTransfer > 0 ? fmt(gcpDataTransfer) + "/mo" : "Incluido", kaioneDataIncluded ? "Incluido ∞" : "No incluido"],
                      ["Monitoreo 24/7", awsMonitoring > 0 ? "+" + fmt(awsMonitoring) + "/mo" : "Incluido", gcpMonitoring > 0 ? "+" + fmt(gcpMonitoring) + "/mo" : "Incluido", "Incluido"],
                      ["Backups", awsBackup > 0 ? "+" + fmt(awsBackup) + "/mo" : "Incluido", gcpBackup > 0 ? "+" + fmt(gcpBackup) + "/mo" : "Incluido", "Incluido (14 días)"],
                      ["SSL / DDoS", awsSslIncluded ? "Incluido" : "Costo extra", "Managed SSL ($)", kaioneSslIncluded ? "Incluido" : "No incluido"],
                      ["Operación Gestionada", awsOpsIncluded ? "Incluido" : "No disponible", gcpOpsIncluded ? "Incluido" : "No disponible", kaioneOpsIncluded ? "Incluido" : "No disponible"],
                      ["SLA", "99.99% (solo infra)", "99.5%", "99%"],
                    ].map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : `${COLORS.bg}88` }}>
                        {row.map((cell, j) => (
                          <td key={j} style={{
                            padding: "10px 16px",
                            textAlign: j === 0 ? "left" : "center",
                            color: j === 0 ? COLORS.text : cell.includes("Incluido") ? COLORS.green : cell.includes("$") || cell.includes("+") || cell === "No disponible" || cell === "Costo extra" ? COLORS.orange : COLORS.muted,
                            fontWeight: j === 0 || cell.includes("Incluido") ? 600 : 400,
                            fontFamily: j > 0 ? "'JetBrains Mono', monospace" : "inherit",
                            fontSize: 11,
                            borderBottom: `1px solid ${COLORS.border}44`,
                          }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ color: COLORS.muted, fontSize: 10, marginTop: 16, fontStyle: "italic" }}>
                * Todos los precios en USD. {editMode ? "Los valores son editables desde las tarjetas superiores." : "Activa el modo edición para personalizar precios."}
              </p>
            </GlowCard>
          </div>
        )}

        {/* ========= TAB: ROI ========= */}
        {tab === "roi" && (
          <div>
            {/* Kaione sync indicator */}
            <div style={{
              background: `${COLORS.green}11`,
              border: `1px solid ${COLORS.green}33`,
              borderRadius: 12,
              padding: "10px 20px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 12,
              color: COLORS.muted,
            }}>
              <span style={{ fontSize: 14 }}>🔗</span>
              <span>
                Precio Kaione sincronizado desde Comparativa Cloud: <strong style={{ color: COLORS.green }}>{fmt(kaioneTotal)}/mes</strong>
                {" "}({fmtMXN(kaioneTotal * tcUSD)} MXN) — Modifícalo en la pestaña Comparativa Cloud.
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, marginBottom: 32 }}>
              {/* Controls Panel */}
              <GlowCard color={COLORS.accent} style={{ position: "sticky", top: 20, alignSelf: "start" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: COLORS.text }}>
                  <span style={{ marginRight: 8 }}>⚙</span>Parámetros del Proceso
                </h3>
                <Slider label="Sueldo mensual empleado (MXN)" value={salarioMensual} onChange={setSalarioMensual}
                  min={8000} max={40000} step={1000} format={v => fmtMXN(v)} />
                <Slider label="Revisiones al mes" value={revisionesMes} onChange={setRevisionesMes}
                  min={5} max={60} step={1} />
                <Slider label="Costo luz mensual (MXN)" value={costoLuz} onChange={setCostoLuz}
                  min={500} max={8000} step={250} format={v => fmtMXN(v)} />
                <Slider label="Soporte servidor on-prem (MXN)" value={costoServidor} onChange={setCostoServidor}
                  min={1000} max={15000} step={500} format={v => fmtMXN(v)} />
                <Slider label="Tipo de cambio USD/MXN" value={tcUSD} onChange={setTcUSD}
                  min={15} max={22} step={0.5} format={v => "$" + v.toFixed(1)} />
              </GlowCard>

              {/* Results Panel */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Before vs After Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {/* BEFORE */}
                  <GlowCard color={COLORS.red}>
                    <Badge color={COLORS.red}>ANTES</Badge>
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: "12px 0 16px 0", color: COLORS.text }}>
                      Proceso Manual + Servidor On-Premise
                    </h4>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "10px 14px", background: COLORS.redGlow, borderRadius: 10 }}>
                      <span style={{ fontSize: 24 }}>⏱</span>
                      <div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.red, fontFamily: "'JetBrains Mono', monospace" }}>24 hrs</div>
                        <div style={{ fontSize: 10, color: COLORS.muted }}>por revisión</div>
                      </div>
                    </div>
                    {[
                      { l: "Costo por revisión (mano de obra)", v: fmtMXN(costoRevisionAntes) },
                      { l: `${revisionesMes} revisiones × mano de obra`, v: fmtMXN(costoRevisionAntes * revisionesMes) },
                      { l: "Electricidad", v: fmtMXN(costoLuz) },
                      { l: "Soporte y mantenimiento servidor", v: fmtMXN(costoServidor) },
                    ].map((r, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${COLORS.border}44` }}>
                        <span style={{ color: COLORS.muted, fontSize: 11 }}>{r.l}</span>
                        <span style={{ color: COLORS.text, fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{r.v}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 16, padding: "12px", background: COLORS.redGlow, borderRadius: 10, textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Total Mensual</div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.red, fontFamily: "'JetBrains Mono', monospace" }}>
                        {fmtMXN(costoMensualAntes)}
                      </div>
                    </div>
                  </GlowCard>

                  {/* AFTER */}
                  <GlowCard color={COLORS.green} active>
                    <Badge color={COLORS.green}>AHORA</Badge>
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: "12px 0 16px 0", color: COLORS.text }}>
                      Proceso Optimizado + Kaione Cloud
                    </h4>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "10px 14px", background: COLORS.greenGlow, borderRadius: 10 }}>
                      <span style={{ fontSize: 24 }}>⚡</span>
                      <div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.green, fontFamily: "'JetBrains Mono', monospace" }}>4 hrs</div>
                        <div style={{ fontSize: 10, color: COLORS.muted }}>por revisión</div>
                      </div>
                    </div>
                    {[
                      { l: "Costo por revisión (mano de obra)", v: fmtMXN(costoRevisionAhora) },
                      { l: `${revisionesMes} revisiones × mano de obra`, v: fmtMXN(costoRevisionAhora * revisionesMes) },
                      { l: `Kaione Nube Privada (${fmt(kaioneTotal)} USD)`, v: fmtMXN(kaioneTotal * tcUSD) },
                      { l: "Electricidad + Servidor", v: fmtMXN(0), good: true },
                    ].map((r, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${COLORS.border}44` }}>
                        <span style={{ color: COLORS.muted, fontSize: 11 }}>{r.l}</span>
                        <span style={{ color: r.good ? COLORS.green : COLORS.text, fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{r.v}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 16, padding: "12px", background: COLORS.greenGlow, borderRadius: 10, textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Total Mensual</div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.green, fontFamily: "'JetBrains Mono', monospace" }}>
                        {fmtMXN(costoMensualAhora)}
                      </div>
                    </div>
                  </GlowCard>
                </div>

                {/* Impact Summary */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                  {[
                    { label: "Ahorro Mensual", value: Math.round(ahorroMensual), prefix: "$", suffix: "", color: ahorroMensual > 0 ? COLORS.green : COLORS.red, sub: "MXN" },
                    { label: "Ahorro Anual", value: Math.round(ahorroAnual), prefix: "$", suffix: "", color: ahorroAnual > 0 ? COLORS.green : COLORS.red, sub: "MXN" },
                    { label: "Horas Liberadas/Mes", value: ahorroTiempoHrs, prefix: "", suffix: " hrs", color: COLORS.accent, sub: `${Math.round(ahorroTiempoHrs / 8)} días laborales` },
                    { label: "Reducción de Tiempo", value: Math.round(ahorroTiempoPct), prefix: "", suffix: "%", color: COLORS.accent, sub: "por revisión" },
                  ].map((m, i) => (
                    <GlowCard key={i} color={m.color} style={{ textAlign: "center", padding: 16 }}>
                      <p style={{ color: COLORS.muted, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px 0" }}>{m.label}</p>
                      <AnimNum value={m.value} prefix={m.prefix} suffix={m.suffix} color={m.color} size={26} />
                      <p style={{ color: COLORS.muted, fontSize: 10, margin: "6px 0 0 0" }}>{m.sub}</p>
                    </GlowCard>
                  ))}
                </div>

                {/* Visual: Cost bar comparison */}
                <GlowCard color={COLORS.border}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Comparativa de Costos del Proceso de Revisión</h3>
                  <BarChart
                    maxVal={Math.max(costoMensualAntes, costoMensualAhora)}
                    items={[
                      { label: "Antes (Manual + On-Premise)", value: costoMensualAntes, color: COLORS.red },
                      { label: "Ahora (Optimizado + Kaione)", value: costoMensualAhora, color: COLORS.green },
                    ]}
                  />
                  <div style={{ marginTop: 20, padding: "14px 20px", background: `linear-gradient(135deg, ${COLORS.greenGlow}, transparent)`, borderRadius: 12, border: `1px solid ${COLORS.green}33` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ color: COLORS.muted, fontSize: 12 }}>El proceso de revisión que antes tomaba </span>
                        <span style={{ color: COLORS.red, fontWeight: 800, fontSize: 14 }}>24 horas</span>
                        <span style={{ color: COLORS.muted, fontSize: 12 }}> ahora se completa en </span>
                        <span style={{ color: COLORS.green, fontWeight: 800, fontSize: 14 }}>4 horas</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: COLORS.green, fontSize: 22, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace" }}>6x</div>
                        <div style={{ color: COLORS.muted, fontSize: 10 }}>más rápido</div>
                      </div>
                    </div>
                  </div>
                </GlowCard>

                {/* 12-month projection */}
                <GlowCard color={COLORS.accent}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Proyección de Ahorro a 12 Meses</h3>
                  <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 160, padding: "0 4px" }}>
                    {Array.from({ length: 12 }, (_, i) => {
                      const acumulado = ahorroMensual * (i + 1);
                      const maxAcum = ahorroMensual * 12;
                      const h = Math.max((Math.abs(acumulado) / Math.abs(maxAcum)) * 140, 4);
                      return (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                          <span style={{ fontSize: 8, color: COLORS.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                            {acumulado > 0 ? "+" : ""}{(acumulado / 1000).toFixed(0)}k
                          </span>
                          <div style={{
                            width: "100%",
                            height: h,
                            borderRadius: 4,
                            background: acumulado > 0
                              ? `linear-gradient(180deg, ${COLORS.green}, ${COLORS.green}88)`
                              : `linear-gradient(180deg, ${COLORS.red}88, ${COLORS.red})`,
                            transition: "height 0.5s ease",
                          }} />
                          <span style={{ fontSize: 9, color: COLORS.muted }}>M{i + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ textAlign: "center", marginTop: 16 }}>
                    <span style={{ color: COLORS.muted, fontSize: 12 }}>Ahorro acumulado al cierre del año: </span>
                    <span style={{
                      color: ahorroAnual > 0 ? COLORS.green : COLORS.red,
                      fontSize: 20, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {fmtMXN(ahorroAnual)}
                    </span>
                  </div>
                </GlowCard>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
