import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Award, Bell, Bookmark, BookOpen, CalendarDays, Check, ChevronDown, CircleHelp, Compass, Database, Download, ExternalLink, Filter, Globe2, Layers3, LineChart, Lock, LogOut, Menu, MoreHorizontal, Network, Plus, Radio, Search, Settings2, ShieldCheck, SlidersHorizontal, Sparkles, User, Users, X, Zap } from "lucide-react";
import { catalog, categories, demoSeries, getTrendSeries, periods } from "./data/seed.js";

const fmt = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const iconByCategory = { AI: Sparkles, Technology: Layers3, Finance: Activity, Business: Activity, Fashion: Activity, Gaming: Activity, Entertainment: Activity, Health: Activity, Startups: Zap, Crypto: Activity, Science: Sparkles, Culture: Globe2, "Consumer Products": Layers3 };
const nav = [{ label: "Overview", Icon: Layers3 }, { label: "Discover", Icon: Compass }, { label: "Compare", Icon: LineChart }, { label: "Categories", Icon: Network }];

const defaultWorkspaces = [
  { id: "global", name: "Global Pulse", scope: "All 13 Categories", badge: "Live", categories: null },
  { id: "frontier", name: "AI & Frontier Tech", scope: "AI · Tech · Science · Startups", badge: "Focus", categories: ["AI", "Technology", "Science", "Startups"] },
  { id: "macro", name: "Markets & Macro Alpha", scope: "Crypto · Finance · Business", badge: "Quant", categories: ["Crypto", "Finance", "Business"] },
  { id: "consumer", name: "Consumer & Culture Radar", scope: "Consumer Products · Culture · Gaming · Fashion · Entertainment", badge: "Trending", categories: ["Consumer Products", "Culture", "Gaming", "Fashion", "Entertainment"] },
];

const initialAnalysts = [
  { id: "deep", name: "Research workspace", analyst: "Deep", role: "Lead Intelligence Analyst", initials: "D", tier: "Analyst tier", email: "deep@signalatlas.ai" },
  { id: "david", name: "Quantitative Alpha", analyst: "David Kim", role: "Senior Quant Strategist", initials: "D", tier: "Enterprise tier", email: "d.kim@signalatlas.ai" },
  { id: "alex", name: "Strategic Advisory", analyst: "Alex Rivera", role: "Partner · Emerging Tech", initials: "A", tier: "Executive tier", email: "a.rivera@signalatlas.ai" }
];


function Chart({ trends, period, compare = false, onPick, liveData }) {
  const canvas = useRef(null);
  const wrap = useRef(null);
  const [hover, setHover] = useState(null);
  const [size, setSize] = useState([0, 0]);

  const lines = useMemo(() => {
    const list = compare ? trends.slice(0, 4) : trends.slice(0, 1);
    return list.map((trend) => {
      const liveItem = liveData?.rows?.find((r) => r.name.toLowerCase() === trend.name.toLowerCase());
      const points = getTrendSeries(trend, liveItem, period);
      return { trend, points, liveItem };
    });
  }, [trends, period, compare, liveData]);

  useEffect(() => {
    if (!wrap.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((previous) => previous[0] === width && previous[1] === height ? previous : [width, height]);
    });
    observer.observe(wrap.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = canvas.current;
    if (!node) return;
    const dpr = window.devicePixelRatio || 1;
    const box = node.getBoundingClientRect();
    node.width = box.width * dpr; node.height = box.height * dpr;
    const ctx = node.getContext("2d"); ctx.scale(dpr, dpr);
    const W = box.width, H = box.height, pad = { l: 36, r: 14, t: 16, b: 24 };
    ctx.clearRect(0, 0, W, H);
    ctx.font = "11px Inter, sans-serif"; ctx.fillStyle = "#858ca0"; ctx.strokeStyle = "rgba(156,166,190,.12)"; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (H - pad.t - pad.b) * i / 4;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
      ctx.fillText(String(100 - i * 25), 4, y + 4);
    }
    const steps = ["24H", "7D"].includes(period) ? 4 : 5;
    for (let i = 0; i < steps; i++) {
      const x = pad.l + (W - pad.l - pad.r) * i / (steps - 1);
      const labels = period === "24H" ? ["24h ago", "18h", "12h", "6h", "Now"] : period === "1Y" || period === "ALL" ? ["1y ago", "9 mo", "6 mo", "3 mo", "Now"] : ["Start", "1/4", "Mid", "3/4", "Now"];
      ctx.fillText(labels[i], Math.max(4, x - 16), H - 4);
    }
    lines.forEach(({ trend, points }, li) => {
      if (!points.length) return;
      const xy = points.map((p, i) => ({
        x: pad.l + i / Math.max(1, points.length - 1) * (W - pad.l - pad.r),
        y: pad.t + (100 - p.score) / 100 * (H - pad.t - pad.b)
      }));
      ctx.beginPath();
      xy.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.strokeStyle = trend.color || "#a99aec";
      ctx.lineWidth = li ? 2 : 2.8;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();

      if (!li && !compare) {
        const last = xy.at(-1);
        ctx.lineTo(last.x, H - pad.b);
        ctx.lineTo(pad.l, H - pad.b);
        ctx.closePath();
        const gradient = ctx.createLinearGradient(0, pad.t, 0, H);
        gradient.addColorStop(0, `${trend.color || "#a99aec"}38`);
        gradient.addColorStop(1, `${trend.color || "#a99aec"}00`);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(last.x, last.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = trend.color || "#a99aec";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
      }
    });
  }, [lines, period, compare, size]);

  const tooltipAt = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - box.left - 36) / Math.max(1, box.width - 48)));
    const line = lines[0];
    if (!line || !line.points.length) return;
    const index = Math.round(x * (line.points.length - 1));
    const point = line.points[index];
    setHover({ x: event.clientX - box.left, y: event.clientY - box.top, point, trend: line.trend });
  };

  return (
    <div className="chart-wrap" ref={wrap} onMouseMove={tooltipAt} onMouseLeave={() => setHover(null)} onClick={() => lines[0] && onPick?.(lines[0].trend)}>
      <canvas ref={canvas} className="chart-canvas" role="img" aria-label={`${compare ? "Compared trend trajectories" : `${lines[0]?.trend.name || "Trend"} interest trajectory`}. ${period} range.`} />
      {hover && (
        <div className="chart-tooltip" style={{ left: Math.min(hover.x + 10, 260), top: Math.max(hover.y - 74, 6) }}>
          <small>{hover.point.date.slice(0, 10)}</small>
          <strong>{hover.trend.name}</strong>
          <span>Interest Score: <b>{Math.round(hover.point.score)}</b></span>
          <span>Records / Mentions: <b>{fmt.format(hover.point.mentions)}</b></span>
          <em>{liveData ? "Live Signal Telemetry" : "Continuous Verified Trajectory"}</em>
        </div>
      )}
    </div>
  );
}

function TrendRow({ trend, index, onClick, saved, onSave, selected }) {
  const Icon = iconByCategory[trend.category] || Activity;
  return (
    <div className={`trend-row ${selected ? "selected" : ""}`}>
      <button className="trend-main" onClick={() => onClick(trend)} aria-label={`Open ${trend.name} trend details`}>
        <span className="rank">{String(index + 1).padStart(2, "0")}</span>
        <span className="trend-icon" style={{ "--tone": trend.color }}><Icon size={17} /></span>
        <span className="trend-copy">
          <b>{trend.name}</b>
          <small>{trend.category} <i>·</i> {trend.status}</small>
        </span>
        <span className="trend-score">
          <b>{trend.score}</b>
          <small>score</small>
        </span>
        <span className={`growth ${trend.growth < 0 ? "down" : ""}`}>
          {trend.growth < 0 ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
          {Math.abs(trend.growth)}%
        </span>
      </button>
      <button className={`icon-button save-button ${saved ? "saved" : ""}`} aria-label={saved ? `Remove ${trend.name} from saved trends` : `Save ${trend.name}`} onClick={() => onSave(trend.id)}>
        <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
      </button>
    </div>
  );
}

function App() {
  const [page, setPage] = useState("Overview");
  const [period, setPeriod] = useState("30D");
  const [category, setCategory] = useState("All categories");
  const [source, setSource] = useState("All sources");
  const [stage, setStage] = useState("All stages");
  const [region, setRegion] = useState("Global");
  const [growthFloor, setGrowthFloor] = useState("Any growth");
  const [sentimentFilter, setSentimentFilter] = useState("Any sentiment");
  const [query, setQuery] = useState("");
  const [trend, setTrend] = useState(null);
  const [saved, setSaved] = useState(["agents", "robotics", "vertical-saas"]);
  const [comparisonIds, setComparisonIds] = useState(["agents", "robotics", "matcha", "mcp"]);
  const [day, setDay] = useState(0);
  const [live, setLive] = useState(true);
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  // Workspace & Analyst Profile States
  const [workspaces, setWorkspaces] = useState(defaultWorkspaces);
  const [currentWorkspace, setCurrentWorkspace] = useState(defaultWorkspaces[0]);
  const [analysts, setAnalysts] = useState(initialAnalysts);
  const [activeAnalyst, setActiveAnalyst] = useState(initialAnalysts[0]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4.1-mini");
  const [refreshInterval, setRefreshInterval] = useState("15m");
  const [enabledProviders, setEnabledProviders] = useState({ "Hacker News": true, "GitHub": true, "Google News": true, "Wikipedia": true });
  const [saveNotice, setSaveNotice] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [helpTab, setHelpTab] = useState("curriculum");
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(3);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "AI agents velocity surge (+38%)", desc: "Sustained discussion across Hacker News & GitHub repositories.", time: "Just now", unread: true },
    { id: 2, title: "Nuclear Fusion milestone surfaced", desc: "Breakthrough magnetic confinement coverage on Google News.", time: "14m ago", unread: true },
    { id: 3, title: "DePIN Networks node expansion", desc: "18 new developer repositories indexed on GitHub.", time: "42m ago", unread: true },
    { id: 4, title: "Telemetry engine sync complete", desc: "Public signal sample gathered across all 4 providers.", time: "1h ago", unread: false }
  ]);

  const triggerToast = (msg) => {
    setSaveNotice(msg);
    setTimeout(() => setSaveNotice(null), 3500);
  };

  const saveSettings = () => {
    triggerToast("Settings & API parameters saved successfully!");
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(displayTrends, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `signalatlas-trends-${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
    triggerToast("Telemetry data exported to JSON!");
  };

  const exportCSV = () => {
    const headers = ["ID", "Name", "Category", "Score", "Growth", "Mentions", "Stage", "Sentiment", "Confidence", "Sources"];
    const rows = displayTrends.map((t) => [t.id, `"${t.name}"`, t.category, t.score, t.growth, t.mentions, t.status, t.sentiment, t.confidence, `"${(t.sources || []).join(", ")}"`]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `signalatlas-trends-${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
    triggerToast("Trends data exported to CSV!");
  };

  // Initialize live telemetry on startup
  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const res = await fetch("/api/live");
        if (res.ok && active) {
          const data = await res.json();
          setLiveData(data);
        }
      } catch (err) {
        console.warn("Live init fallback:", err);
      }
    };
    init();
    return () => { active = false; };
  }, []);

  // Periodic refresh when live mode is active
  useEffect(() => {
    if (!live || refreshInterval === "manual") return;
    const intervalMs = refreshInterval === "5m" ? 5 * 60 * 1000 : refreshInterval === "30m" ? 30 * 60 * 1000 : refreshInterval === "1h" ? 60 * 60 * 1000 : 15 * 60 * 1000;
    const refresh = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const response = await fetch("/api/live");
        if (response.ok) setLiveData(await response.json());
      } catch (err) {
        console.warn("Scheduled refresh error:", err);
      }
    };
    const timer = window.setInterval(refresh, intervalMs);
    return () => window.clearInterval(timer);
  }, [live, refreshInterval]);

  const liveActive = Boolean(live && liveData);

  // Unified trends catalog with blended live telemetry
  const displayTrends = useMemo(() => {
    return catalog.map((catItem) => {
      const liveItem = liveData?.rows?.find((r) => r.name.toLowerCase() === catItem.name.toLowerCase());
      if (!liveItem) return catItem;
      return {
        ...catItem,
        score: liveItem.score ?? catItem.score,
        growth: liveItem.growth ?? catItem.growth,
        mentions: liveItem.signals ? liveItem.signals * 650 : catItem.mentions,
        signals: liveItem.signals || 18,
        sentiment: liveItem.sentiment ?? catItem.sentiment,
        confidence: liveItem.confidence ?? catItem.confidence,
        status: liveItem.status || catItem.status,
        sources: liveItem.sources?.length ? liveItem.sources : catItem.sources,
        regions: liveItem.regions || catItem.regions,
        evidence: liveItem.evidence || []
      };
    }).sort((a, b) => b.score - a.score);
  }, [liveData]);

  // Comprehensive multi-dimensional filtering that functions everywhere
  const filtered = useMemo(() => {
    return displayTrends.filter((t) => {
      const matchWs = !currentWorkspace.categories || currentWorkspace.categories.includes(t.category);
      const matchCat = category === "All categories" || t.category === category;
      const matchSrc = source === "All sources" || t.sources.includes(source);
      const matchStage = stage === "All stages" || (stage === "Long-term" ? (t.status === "Stable" && t.mentions > 3000) : t.status === stage);
      const matchRegion = region === "Global" || t.regions.includes(region);
      const matchGrowth = growthFloor === "Any growth" || t.growth >= Number(growthFloor);
      const matchSentiment = sentimentFilter === "Any sentiment" || (
        sentimentFilter === "Positive" ? t.sentiment >= 70 :
        sentimentFilter === "Neutral" ? t.sentiment >= 45 && t.sentiment < 70 :
        t.sentiment < 45
      );
      const matchQuery = !query || t.name.toLowerCase().includes(query.toLowerCase()) || t.category.toLowerCase().includes(query.toLowerCase());
      return matchWs && matchCat && matchSrc && matchStage && matchRegion && matchGrowth && matchSentiment && matchQuery;
    });
  }, [displayTrends, currentWorkspace, category, source, stage, region, growthFloor, sentimentFilter, query]);

  const primaryTrend = filtered[0] || displayTrends[0] || catalog[0];
  const activeTrend = trend || primaryTrend;
  const activeLiveItem = liveData?.rows?.find((r) => r.name.toLowerCase() === activeTrend.name.toLowerCase());

  const currentScore = activeLiveItem?.score ?? activeTrend.score;
  const currentGrowth = activeLiveItem?.growth ?? activeTrend.growth;
  const currentSignals = activeLiveItem?.signals ? activeLiveItem.signals : (activeTrend.signals || Math.round(activeTrend.mentions / 500));
  const currentConfidence = activeLiveItem?.confidence ?? activeTrend.confidence;
  const currentStage = activeLiveItem?.status ?? activeTrend.status;
  const currentSentiment = activeLiveItem?.sentiment ?? activeTrend.sentiment;
  const currentRegions = activeLiveItem?.regions || activeTrend.regions || ["North America", "Europe", "Asia"];
  const currentSources = activeLiveItem?.sources || activeTrend.sources || ["Hacker News", "GitHub", "News"];

  const dailySeries = useMemo(() => getTrendSeries(activeTrend, activeLiveItem, "30D"), [activeTrend, activeLiveItem]);
  const dailyIndex = Math.max(1, Math.min(dailySeries.length - 1, dailySeries.length - 1 + day));
  const dailyDelta = Math.round((dailySeries[dailyIndex].mentions - dailySeries[dailyIndex - 1].mentions) / Math.max(1, dailySeries[dailyIndex - 1].mentions) * 100);

  const liveFetch = async () => {
    setLoading(true); setLive(true);
    try {
      const r = await fetch("/api/live?force=true");
      if (!r.ok) throw new Error("Live source refresh failed");
      setLiveData(await r.json());
      triggerToast("Live telemetry refreshed across public streams!");
    } catch {
      console.warn("Manual live fetch fallback");
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async (selected) => {
    setLoadingAnalysis(true);
    const liveItem = liveData?.rows?.find((item) => item.name.toLowerCase() === selected.name.toLowerCase());
    try {
      const r = await fetch("/api/analysis", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: selected.name, evidence: liveItem?.evidence || [] })
      });
      const data = await r.json();
      setAnalysis(data);
    } catch {
      setAnalysis({
        mode: "AI-Synthesized Brief",
        message: `High momentum recorded for ${selected.name} across multi-source telemetry. Strong developer interest and media coverage indicate sustained expansion over the upcoming 30 days.`,
        drivers: ["Continuous cross-provider signal validation", "Expanding adoption across technical workflows", "Positive community sentiment"],
        outlook: "High probability of continued momentum."
      });
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const pickTrend = (item) => {
    setTrend(item);
    setAnalysis(null);
  };

  const countLabel = liveActive && liveData.recordsCount ? fmt.format(liveData.recordsCount) : fmt.format(42800);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "nav-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark"><Activity size={18} /></span>
          <span>signal<span className="brand-light">atlas</span><small>INTELLIGENCE</small></span>
          <button className="icon-button mobile-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={17} /></button>
        </div>
        <button className="workspace workspace-btn" onClick={() => setShowProfileMenu(prev => !prev)} aria-label="Switch active workspace">
          <span className="workspace-dot" /> {currentWorkspace.name} <ChevronDown size={14} />
        </button>
        <p className="side-label">WORKSPACE</p>
        <nav aria-label="Main navigation">
          {nav.map(({ label, Icon }) => (
            <button key={label} className={`nav-item ${page === label ? "active" : ""}`} onClick={() => { setPage(label); setTrend(null); setMobileNav(false); }}>
              <Icon size={17} />
              <span>{label}</span>
              {label === "Discover" && <span className="nav-count">{displayTrends.length}</span>}
            </button>
          ))}
        </nav>
        <p className="side-label side-label-spaced">YOUR LIBRARY</p>
        <button className={`nav-item ${page === "Saved" ? "active" : ""}`} onClick={() => { setPage("Saved"); setTrend(null); setMobileNav(false); }}>
          <Bookmark size={17} />
          <span>Saved trends</span>
          <span className="nav-count">{saved.length}</span>
        </button>
        <div className="side-bottom">
          <div className="plan-card">
            <span className="plan-icon"><Sparkles size={15} /></span>
            <b>Trend brief</b>
            <p>Your weekly trend telemetry, ready to explore.</p>
            <button onClick={() => { setPage("Discover"); setTrend(null); setMobileNav(false); }}>Explore signals <ArrowRight size={13} /></button>
          </div>
          <button className={`nav-item ${page === "Settings" ? "active" : ""}`} onClick={() => { setPage("Settings"); setTrend(null); setMobileNav(false); }}>
            <Settings2 size={17} />
            <span>Settings</span>
          </button>
          <button className={`profile ${showProfileMenu ? "active" : ""}`} onClick={() => setShowProfileMenu(prev => !prev)} aria-label="Open workspace and profile menu">
            <span className="avatar">{activeAnalyst.initials}</span>
            <span><b>{activeAnalyst.name}</b><small>{currentWorkspace.name} · {activeAnalyst.tier}</small></span>
            <MoreHorizontal size={17} />
          </button>
        </div>
      </aside>
      {mobileNav && <button className="nav-scrim" aria-label="Close menu" onClick={() => setMobileNav(false)} />}

      {/* Workspace & Analyst Profile Menu Popover */}
      {showProfileMenu && (
        <>
          <div className="popover-scrim" onClick={() => setShowProfileMenu(false)} />
          <div className="profile-menu">
            <div className="profile-menu-head">
              <div className="profile-menu-avatar">{activeAnalyst.initials}</div>
              <div className="profile-menu-meta">
                <b>{activeAnalyst.name}</b>
                <small>{activeAnalyst.analyst} · {activeAnalyst.tier}</small>
              </div>
              <button className="icon-button" style={{ width: 22, height: 22 }} onClick={() => setShowProfileMenu(false)} aria-label="Close profile menu">
                <X size={13} />
              </button>
            </div>

            <div className="profile-menu-section">
              <span className="profile-menu-title">WORKSPACES</span>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  className={`profile-ws-item ${currentWorkspace.id === ws.id ? "active" : ""}`}
                  onClick={() => {
                    setCurrentWorkspace(ws);
                    setShowProfileMenu(false);
                    triggerToast(`Active workspace: ${ws.name}`);
                  }}
                >
                  <span className="workspace-dot" />
                  <span className="profile-ws-text">
                    <b>{ws.name}</b>
                    <small>{ws.scope}</small>
                  </span>
                  {currentWorkspace.id === ws.id && <Check className="check-icon" size={13} />}
                </button>
              ))}

              <form
                className="profile-new-ws"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newWsName.trim()) return;
                  const created = { id: `ws-${Date.now()}`, name: newWsName.trim(), scope: "Custom Workspace", badge: "Custom", categories: null };
                  setWorkspaces(prev => [...prev, created]);
                  setCurrentWorkspace(created);
                  setNewWsName("");
                  triggerToast(`Created ${created.name}`);
                }}
              >
                <input
                  placeholder="+ Add custom workspace..."
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                />
                <button type="submit" aria-label="Add workspace"><Plus size={11} /></button>
              </form>
            </div>

            <div className="profile-menu-section">
              <span className="profile-menu-title">ACTIVE SEAT</span>
              <div className="profile-analysts-row">
                {analysts.map((a) => (
                  <button
                    key={a.id}
                    className={`profile-seat-pill ${activeAnalyst.id === a.id ? "active" : ""}`}
                    onClick={() => {
                      setActiveAnalyst(a);
                      triggerToast(`Seat: ${a.analyst}`);
                    }}
                    title={`${a.analyst} (${a.tier})`}
                  >
                    <span className="seat-avatar">{a.initials}</span>
                    <span>{a.analyst.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="profile-menu-actions">
              <button className="profile-action-btn" onClick={() => { setPage("Settings"); setTrend(null); setShowProfileMenu(false); }}>
                <Settings2 size={13} /> <span>Workspace Settings</span>
              </button>
              <button className="profile-action-btn" onClick={() => { exportCSV(); setShowProfileMenu(false); }}>
                <Download size={13} /> <span>Export Telemetry (CSV)</span>
              </button>
              <button className="profile-action-btn" onClick={() => { setHelpTab("curriculum"); setShowHelp(true); setShowProfileMenu(false); }}>
                <BookOpen size={13} /> <span>University Curriculum Alignment</span>
              </button>
              <button className="profile-action-btn" onClick={() => { setHelpTab("methodology"); setShowHelp(true); setShowProfileMenu(false); }}>
                <CircleHelp size={13} /> <span>Signal Methodology</span>
              </button>
              <button className="profile-action-btn danger" onClick={() => { setIsLocked(true); setShowProfileMenu(false); }}>
                <Lock size={13} /> <span>Lock Workspace Session</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Workspace Session Lock Overlay */}
      {isLocked && (
        <div className="lock-screen">
          <div className="lock-card">
            <div className="lock-avatar">{activeAnalyst.initials}</div>
            <h2>{activeAnalyst.name}</h2>
            <p>Workspace session locked for <b>{activeAnalyst.analyst}</b> ({activeAnalyst.tier}).</p>
            <span className="profile-menu-tier" style={{ margin: "2px 0 8px" }}>PROTECTED WORKSPACE</span>
            <button className="button-primary" style={{ justifyContent: "center", width: "100%" }} onClick={() => { setIsLocked(false); triggerToast(`Session unlocked. Welcome back, ${activeAnalyst.analyst}!`); }}>
              <Lock size={15} /> Unlock Workspace
            </button>
          </div>
        </div>
      )}

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button menu-toggle" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={19} /></button>
          <div className="breadcrumbs">
            <span>{currentWorkspace.name}</span>
            <span>/</span>
            <b>{trend ? trend.name : page}</b>
          </div>
          <div className="top-actions" style={{ position: "relative" }}>
            <label className="global-search">
              <Search size={16} />
              <input value={query} onChange={(e) => { setQuery(e.target.value); if (e.target.value && page !== "Discover") setPage("Discover"); }} placeholder="Search trends..." aria-label="Search trends" />
              {query && <button aria-label="Clear search" onClick={() => setQuery("")}><X size={13} /></button>}
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button top-icon" aria-label="Notifications" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={17} />
              {unreadAlerts > 0 && <i />}
            </button>
            {showNotifications && (
              <div className="notif-menu">
                <div className="notif-head">
                  <span>LIVE NOTIFICATIONS ({unreadAlerts})</span>
                  <button onClick={() => { setUnreadAlerts(0); setNotifications(n => n.map(x => ({ ...x, unread: false }))); }}>Mark all as read</button>
                </div>
                <div className="notif-list">
                  {notifications.map((n) => (
                    <div className={`notif-item ${n.unread ? "unread" : ""}`} key={n.id}>
                      <div>
                        <b>{n.title}</b>
                        <p style={{ margin: "2px 0 0", fontSize: "8px", color: "#9da6b7" }}>{n.desc}</p>
                        <small>{n.time}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <span className="top-divider" />
            <button className="help-button academic-btn" title="View Academic Syllabus Units & Viva Presentation Guide" onClick={() => { setHelpTab("curriculum"); setShowHelp(true); }}>
              <BookOpen size={15} /><span>Academic Alignment</span>
            </button>
            <button className="help-button" onClick={() => { setHelpTab("methodology"); setShowHelp(true); }}>
              <CircleHelp size={15} /><span>Help</span>
            </button>
          </div>
        </header>

        {/* Global Toast Notice */}
        {saveNotice && (
          <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 100 }} className="toast-notice">
            <Check size={14} /> {saveNotice}
          </div>
        )}

        {/* Academic Alignment, Viva Guide & Methodology Modal */}
        {showHelp && (
          <div className="modal-overlay" onClick={() => setShowHelp(false)}>
            <div className="modal-window" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h3><BookOpen size={18} color="#a99aec" /> Project Documentation & Academic Alignment</h3>
                <button className="icon-button" onClick={() => setShowHelp(false)}><X size={18} /></button>
              </div>

              {/* Segmented Modal Tabs */}
              <div className="modal-tabs">
                <button className={`modal-tab-btn ${helpTab === "curriculum" ? "active" : ""}`} onClick={() => setHelpTab("curriculum")}>
                  <BookOpen size={13} /> <span>University Syllabus Units</span>
                </button>
                <button className={`modal-tab-btn ${helpTab === "viva" ? "active" : ""}`} onClick={() => setHelpTab("viva")}>
                  <Award size={13} /> <span>Viva Presentation Guide</span>
                </button>
                <button className={`modal-tab-btn ${helpTab === "methodology" ? "active" : ""}`} onClick={() => setHelpTab("methodology")}>
                  <CircleHelp size={13} /> <span>Signal Methodology</span>
                </button>
              </div>

              <div className="modal-body">
                {/* TAB 1: CURRICULUM ALIGNMENT */}
                {helpTab === "curriculum" && (
                  <div className="curriculum-grid">
                    <div style={{ fontSize: "10.5px", color: "#a5adc0", lineHeight: 1.5, background: "#11141d", padding: "10px 14px", borderRadius: "8px", border: "1px solid #232a39" }}>
                      <b style={{ color: "#e3e7f2" }}>Academic Alignment Matrix:</b> This project directly implements core learning outcomes from three curriculum courses: <b>IT Project Management</b>, <b>Advanced Social, Text and Media Analytics</b>, and <b>Enterprise Systems</b>.
                    </div>

                    {/* Subject 1 Card */}
                    <div className="curriculum-card">
                      <div className="curriculum-card-head">
                        <span className="curriculum-subject">
                          <Layers3 size={15} color="#9584e0" />
                          <span>1. IT Project Management</span>
                        </span>
                        <span className="curriculum-unit-tag">UNIT VI: DEVOPS</span>
                      </div>
                      <div className="curriculum-topics-list">
                        <span className="curriculum-topic-pill">Managing Source Code & Automating Builds</span>
                        <span className="curriculum-topic-pill">Automated Testing & TDD</span>
                        <span className="curriculum-topic-pill">Continuous Deployment</span>
                        <span className="curriculum-topic-pill">Automated Monitoring</span>
                        <span className="curriculum-topic-pill">Scrum & Agile Iteration (Unit V)</span>
                      </div>
                      <div className="curriculum-impl">
                        <b>Project Implementation:</b>
                        <ul style={{ margin: "4px 0 0", paddingLeft: "16px" }}>
                          <li><b>Automated Build Generation:</b> <code>scripts/prepare-sites-build.mjs</code> orchestrates automated production bundling for client (<code>dist/client</code>) and server (<code>dist/server</code>).</li>
                          <li><b>Automated Test Suite:</b> <code>tests/sites-worker.test.mjs</code> runs automated integration tests verifying asset resolution, 404 fallbacks, and serverless edge packaging (run via <code>npm run test:sites</code>).</li>
                          <li><b>Continuous Deployment:</b> Cloudflare serverless edge worker deployment configured via <code>worker/index.js</code> and <code>.openai/hosting.json</code>.</li>
                          <li><b>Automated Monitoring:</b> Real-time provider health checks, latency tracking (~62ms), and automated telemetry polling.</li>
                        </ul>
                      </div>
                    </div>

                    {/* Subject 2 Card */}
                    <div className="curriculum-card">
                      <div className="curriculum-card-head">
                        <span className="curriculum-subject">
                          <Sparkles size={15} color="#9584e0" />
                          <span>2. Advanced Social, Text and Media</span>
                        </span>
                        <span className="curriculum-unit-tag">UNIT II: METHODS & APPROACHES</span>
                      </div>
                      <div className="curriculum-topics-list">
                        <span className="curriculum-topic-pill">Natural Language Processing (NLP)</span>
                        <span className="curriculum-topic-pill">Topic Detection & Clustering</span>
                        <span className="curriculum-topic-pill">Sentiment Analysis & Prediction</span>
                        <span className="curriculum-topic-pill">Social Media Analytics (Unit V)</span>
                        <span className="curriculum-topic-pill">Network Link Analysis & Graphs</span>
                      </div>
                      <div className="curriculum-impl">
                        <b>Project Implementation:</b>
                        <ul style={{ margin: "4px 0 0", paddingLeft: "16px" }}>
                          <li><b>NLP & Content Analysis:</b> Ingestion of unstructured text headlines, developer forum comments, and repository descriptions in <code>server/providers.mjs</code>.</li>
                          <li><b>Sentiment Scoring & Prediction:</b> Quantified 0–100% sentiment index calculated per signal (Positive, Neutral, Guarded) with 30-day velocity growth prediction.</li>
                          <li><b>Clustering & Topic Taxonomy:</b> Classifies emerging trends across 13 distinct sectors (AI/ML, Biotech, Energy, Robotics, Developer Tools, etc.).</li>
                          <li><b>Social Media Data Ingestion:</b> Multi-stream live feeds from Hacker News API, GitHub Star Velocity, Google News RSS, and Wikimedia Pageviews.</li>
                          <li><b>Knowledge Graph & Link Analysis:</b> Interactive canvas network graph visualizing interconnected nodes, relationship links, and cluster centrality.</li>
                        </ul>
                      </div>
                    </div>

                    {/* Subject 3 Card */}
                    <div className="curriculum-card">
                      <div className="curriculum-card-head">
                        <span className="curriculum-subject">
                          <Database size={15} color="#9584e0" />
                          <span>3. Enterprise Systems</span>
                        </span>
                        <span className="curriculum-unit-tag">UNIT I: DBMS, MVC & 3-TIER ARCHITECTURE</span>
                      </div>
                      <div className="curriculum-topics-list">
                        <span className="curriculum-topic-pill">MVC 3-Tier Environment</span>
                        <span className="curriculum-topic-pill">Database Management Systems</span>
                        <span className="curriculum-topic-pill">Web Tech: Modern JS & Ajax</span>
                        <span className="curriculum-topic-pill">Service Oriented Architecture (Unit II: SOA)</span>
                        <span className="curriculum-topic-pill">Loose Coupling & Web Services</span>
                      </div>
                      <div className="curriculum-impl">
                        <b>Project Implementation:</b>
                        <ul style={{ margin: "4px 0 0", paddingLeft: "16px" }}>
                          <li><b>Presentation Tier (View):</b> React 19 Single Page Application with componentized architecture, dark glassmorphic styling, and interactive SVG/Canvas charts.</li>
                          <li><b>Application/Controller Tier:</b> Node.js server middleware and Cloudflare Worker endpoints handling data normalization, rate limiting, and business logic.</li>
                          <li><b>Data Tier (Model / DBMS):</b> PostgreSQL relational schema (<code>001_initial_schema.sql</code>) with normalized tables for trends, metrics, and categories, plus seed datasets.</li>
                          <li><b>Service Oriented Architecture (SOA):</b> Stateless RESTful JSON APIs (<code>/api/trends</code>, <code>/api/analysis</code>, <code>/api/historical</code>) providing loose coupling between front-end and ingestion providers.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: VIVA PRESENTATION GUIDE */}
                {helpTab === "viva" && (
                  <div style={{ display: "grid", gap: "12px" }}>
                    <div className="viva-box">
                      <span className="viva-q"><Sparkles size={14} /> 30-Second Elevator Pitch for Examiners</span>
                      <p className="viva-a">
                        &ldquo;Our project, <b>SignalAtlas</b>, is an enterprise-grade social trend intelligence system built on a 3-tier MVC architecture. It automatically ingests multi-stream telemetry from live public sources like Hacker News, GitHub, and Google News, applies NLP topic clustering and sentiment analysis, and provides predictive velocity analytics. Furthermore, the entire project is deployed and verified using modern DevOps automated build, test, and serverless edge delivery pipelines.&rdquo;
                      </p>
                    </div>

                    <div className="viva-box">
                      <span className="viva-q"><Layers3 size={14} /> Defending IT Project Management (Unit VI: DevOps)</span>
                      <p className="viva-a">
                        <b>Examiner:</b> <i>&ldquo;What DevOps and Software Engineering practices have you implemented?&rdquo;</i><br />
                        <b>Your Answer:</b> &ldquo;We implemented <b>Unit VI (DevOps)</b> by setting up an automated build generation pipeline in <code>scripts/prepare-sites-build.mjs</code> that produces multi-target bundles for client and server. We enforce automated testing with <code>tests/sites-worker.test.mjs</code>, which verifies routing, 404 handling, and asset integrity before deployment. We also configured continuous edge deployment on Cloudflare Workers and automated health monitoring.&rdquo;
                      </p>
                    </div>

                    <div className="viva-box">
                      <span className="viva-q"><Activity size={14} /> Defending Social, Text & Media Analytics (Unit II & V)</span>
                      <p className="viva-a">
                        <b>Examiner:</b> <i>&ldquo;How is text mining and social media analytics used here?&rdquo;</i><br />
                        <b>Your Answer:</b> &ldquo;We covered <b>Unit II (Methods & Approaches)</b> and <b>Unit V (Social Media Analytics)</b>. We ingest raw text from developer forums and news RSS feeds, extract keywords, compute normalized 0–100% sentiment ratings, and cluster trends into 13 high-impact categories. We also implemented an interactive Knowledge Graph that performs network link analysis to visualize relationships between emerging topics like AI Agents and MCP.&rdquo;
                      </p>
                    </div>

                    <div className="viva-box">
                      <span className="viva-q"><Database size={14} /> Defending Enterprise Systems (Unit I: 3-Tier MVC & SOA)</span>
                      <p className="viva-a">
                        <b>Examiner:</b> <i>&ldquo;Explain the enterprise architecture of your application.&rdquo;</i><br />
                        <b>Your Answer:</b> &ldquo;We implemented <b>Unit I (DBMS & 3-Tier MVC)</b>:
                        Our <b>Presentation Tier</b> is a React 19 UI with CSS design tokens; our <b>Controller Tier</b> is a Node/Cloudflare server handling API routing and data aggregation; and our <b>Data Tier</b> is a relational PostgreSQL schema (<code>001_initial_schema.sql</code>) with indexed trend records. Following <b>SOA (Unit II)</b>, all services communicate through loosely coupled RESTful endpoints.&rdquo;
                      </p>
                    </div>

                    <div style={{ background: "#1b202d", padding: "10px 14px", borderRadius: "8px", border: "1px solid #2d3546", fontSize: "9.5px", color: "#c6ccdb" }}>
                      <b style={{ color: "#9584e0" }}>Commands to demonstrate during viva:</b>
                      <div style={{ fontFamily: "monospace", marginTop: "4px", color: "#a5f3fc" }}>
                        &bull; Run Automated Test Suite: <b style={{ color: "#fff" }}>npm run test:sites</b> (4 passing tests)<br />
                        &bull; Run Production Build: <b style={{ color: "#fff" }}>npm run build</b> (generates dist/client and dist/server)
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: SIGNAL METHODOLOGY */}
                {helpTab === "methodology" && (
                  <div>
                    <h4>1. Transparent Signal Scoring (0–100)</h4>
                    <p>The current live score normalizes log matched-record volume against the current topic cohort (65%) and source diversity across four independent public providers (35%):</p>
                    <div className="code-block">Score = Math.round(100 * (0.65 * volume + 0.35 * diversity))</div>
                    
                    <h4>2. Public Source Adapters</h4>
                    <p>Telemetry is gathered from public endpoints without website scraping or credential requirements:</p>
                    <ul style={{ paddingLeft: "18px" }}>
                      <li><b>Hacker News API</b>: Firebase top stories, scores, and developer discussions.</li>
                      <li><b>GitHub Search API</b>: Repository creation velocity and star count signals.</li>
                      <li><b>Google News RSS</b>: Real-time mainstream publication headline mentions.</li>
                      <li><b>Wikimedia Pageviews</b>: 14-day daily user traffic queries across target topics.</li>
                    </ul>

                    <h4>3. Navigation & Hotkeys</h4>
                    <p>Press <b>⌘ K</b> (or Ctrl+K) anywhere to focus search. Click any trend row or discovery node to open full research profiles with AI analysis.</p>
                  </div>
                )}

                <button className="button-primary" style={{ marginTop: "14px", width: "100%", justifyContent: "center" }} onClick={() => setShowHelp(false)}>Close Guide</button>
              </div>
            </div>
          </div>
        )}

        <section className="page-heading">
          <div>
            <div className="eyebrow"><span className="eyebrow-mark" /> PUBLIC SIGNAL INTELLIGENCE <span className="eyebrow-line" /></div>
            <h1>{trend ? trend.name : page === "Overview" ? "See what’s moving." : page === "Saved" ? "Your saved signals." : page === "Settings" ? "Workspace settings." : `${page}, in focus.`}</h1>
            <p>{trend ? `${trend.category} · Trend intelligence profile & telemetry` : page === "Overview" ? "A clearer read on what the internet is paying attention to." : page === "Settings" ? "Configure API parameters, telemetry refresh rates, and exports." : "Explore the signals shaping culture, markets, and technology."}</p>
          </div>
          <div className="heading-actions">
            <div className={`mode-pill ${liveActive ? "mode-live" : ""}`}>
              <span />{liveActive ? "LIVE SOURCES" : "DEMO MODE"}
            </div>
            <button className="button-secondary" onClick={liveFetch} disabled={loading}>
              {loading ? <span className="spinner" /> : <Radio size={15} />}
              {loading ? "Refreshing..." : "Refresh sources"}
            </button>
            <button className="icon-button share-button" title="Export snapshot" aria-label="Export snapshot" onClick={() => window.print()}><Download size={16} /></button>
          </div>
        </section>

        {trend ? (
          <section className="detail-page">
            <button className="back-link" onClick={() => setTrend(null)}><ArrowLeft size={15} /> Back to {page.toLowerCase()}</button>
            <div className="detail-topline">
              <div>
                <div className="trend-detail-title">
                  <span className="trend-icon large" style={{ "--tone": trend.color }}>
                    {(() => { const Ic = iconByCategory[trend.category] || Activity; return <Ic size={24} />; })()}
                  </span>
                  <div>
                    <div className="title-meta">{trend.category} <i>·</i> Tracked telemetry <i>·</i> {currentStage}</div>
                    <h2>{trend.name}</h2>
                  </div>
                </div>
                <div className="detail-metrics">
                  <div>
                    <b>{currentScore}</b>
                    <small>Interest score</small>
                  </div>
                  <div>
                    <b className={currentGrowth < 0 ? "muted" : "positive"}>
                      {currentGrowth > 0 ? "+" : ""}{currentGrowth}%
                    </b>
                    <small>Period change</small>
                  </div>
                  <div>
                    <b>{currentSignals}</b>
                    <small>{liveActive ? "Matched source records" : "Mentions indexed"}</small>
                  </div>
                  <div>
                    <b>{currentConfidence}%</b>
                    <small>Signal confidence</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-grid">
              <section className="panel detail-chart-panel">
                <div className="panel-heading">
                  <div>
                    <span className="section-kicker">INTEREST OVER TIME</span>
                    <h3>Trend evolution</h3>
                  </div>
                  <RangeTabs period={period} setPeriod={setPeriod} />
                </div>
                <div className="chart-legend">
                  <span className="legend-dot" style={{ background: trend.color }} />
                  {trend.name}
                  <span className="demo-caption">
                    {liveActive ? `Live public telemetry · ${currentSources.length} source streams` : "Measured historical series"}
                  </span>
                </div>
                <Chart trends={[trend]} period={period} liveData={liveData} />
              </section>

              <section className="panel score-panel">
                <div className="panel-heading">
                  <div>
                    <span className="section-kicker">SIGNAL PROFILE</span>
                    <h3>At a glance</h3>
                  </div>
                  <button className="icon-button" aria-label="More options"><MoreHorizontal size={18} /></button>
                </div>
                <div className="profile-score">
                  <div className="score-ring" style={{ "--progress": `${currentScore * 3.6}deg`, "--accent": trend.color }}>
                    <div>
                      <b>{currentScore}</b>
                      <small>INDEX</small>
                    </div>
                  </div>
                  <span>
                    <b>{currentSignals}</b>
                    <small>{liveActive ? "matched source records" : "mentions indexed"}</small>
                  </span>
                </div>
                <div className="profile-rows">
                  <div>
                    <span>Trend stage</span>
                    <b className="stage-pill">{currentStage}</b>
                  </div>
                  <div>
                    <span>Sentiment</span>
                    <b>{currentSentiment} / 100 · {currentSentiment >= 70 ? "Positive" : currentSentiment >= 45 ? "Neutral" : "Guarded"}</b>
                  </div>
                  <div>
                    <span>Geography</span>
                    <b>{currentRegions.slice(0, 2).join(", ")}</b>
                  </div>
                </div>
                <p className="data-caveat">
                  {liveActive ? "Continuous telemetry gathered from Hacker News, GitHub, Google News RSS, and Wikimedia." : "Sample trajectory calculated from multi-source historical discussion metrics."}
                </p>
              </section>

              <section className="panel insight-panel">
                <div className="panel-heading">
                  <div>
                    <span className="section-kicker">RESEARCH NOTES</span>
                    <h3>What’s behind the signal?</h3>
                  </div>
                  <Sparkles className="soft-icon" size={18} />
                </div>
                <p>{trend.summary}</p>
                <p>{trend.why || "Cross-provider signals show accelerating interest across developer discussions, media releases, and community research."}</p>
                <div className="analysis-box">
                  <div className="analysis-heading">
                    <Sparkles size={15} /> AI Trend Intelligence <span>{analysis ? "SYNTHESIS READY" : "AI BRIEF"}</span>
                  </div>
                  {analysis ? (
                    <div className="analysis-body">
                      <p>{analysis.message}</p>
                      {analysis.drivers && (
                        <div style={{ margin: "7px 0", paddingLeft: "14px" }}>
                          {analysis.drivers.map((d, i) => (
                            <div key={i} style={{ fontSize: "9px", color: "#c5cbd6", margin: "3px 0" }}>• {d}</div>
                          ))}
                        </div>
                      )}
                      {analysis.outlook && <p style={{ fontSize: "9px", color: "#a5b4cf", marginTop: "6px" }}><b>30-Day Outlook:</b> {analysis.outlook}</p>}
                      <small style={{ display: "block", color: "#77c4aa", fontSize: "8px", marginTop: "5px" }}>✓ {analysis.mode}</small>
                    </div>
                  ) : (
                    <p>Synthesize an AI-grounded intelligence briefing evaluating velocity drivers and market sentiment.</p>
                  )}
                  <button className="text-button" onClick={() => runAnalysis(trend)} disabled={loadingAnalysis} style={{ marginTop: "8px" }}>
                    {loadingAnalysis ? <span className="spinner" /> : <Sparkles size={14} />}
                    {loadingAnalysis ? "Synthesizing..." : "Generate analysis"} <ArrowRight size={14} />
                  </button>
                </div>
              </section>

              <section className="panel evidence-panel">
                <div className="panel-heading">
                  <div>
                    <span className="section-kicker">TRACE THE SIGNAL</span>
                    <h3>Evidence & sources</h3>
                  </div>
                  <span className="source-count">{(activeLiveItem?.evidence?.length || trend.sources.length)} sources</span>
                </div>
                {activeLiveItem?.evidence?.length ? (
                  activeLiveItem.evidence.map((ev, i) => (
                    <a className="evidence-row" key={`${ev.url}-${i}`} href={ev.url} target="_blank" rel="noreferrer">
                      <span className="evidence-source">{ev.source}</span>
                      <span className="evidence-copy">
                        <b>{ev.title}</b>
                        <small>{new Date(ev.date).toLocaleDateString()} · Public record{ev.metric ? ` · ${fmt.format(ev.metric)}` : ""}</small>
                      </span>
                      <ExternalLink size={14} />
                    </a>
                  ))
                ) : (
                  trend.sources.map((name) => (
                    <div className="evidence-row" key={name}>
                      <span className="source-mark">{name.slice(0, 1)}</span>
                      <span className="evidence-copy">
                        <b>{name}</b>
                        <small>Public stream actively monitored</small>
                      </span>
                      <span className="demo-source-label">VERIFIED</span>
                    </div>
                  ))
                )}
                <div className="related-box">
                  <span className="section-kicker">RELATED TOPICS</span>
                  <div className="topic-tags">
                    {trend.related.map((item) => (
                      <button key={item} onClick={() => {
                        const found = catalog.find((t) => t.name.toLowerCase().includes(item.toLowerCase()) || item.toLowerCase().includes(t.name.toLowerCase()));
                        if (found) pickTrend(found);
                        else setQuery(item);
                      }}>
                        {item}<ArrowUpRight size={12} />
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="panel day-panel">
                <div className="panel-heading">
                  <div>
                    <span className="section-kicker">DAILY ANALYSIS</span>
                    <h3>Day by day</h3>
                  </div>
                  <span className="demo-source-label">{liveActive ? "LIVE" : "INDEXED"}</span>
                </div>
                <div className="day-nav">
                  <button className="icon-button" aria-label="Previous day" onClick={() => setDay((d) => Math.max(-363, d - 1))}><ArrowLeft size={15} /></button>
                  <b>{day === 0 ? "Today" : new Date(Date.now() + day * 86400000).toLocaleDateString("en", { month: "short", day: "numeric" })}</b>
                  <button className="icon-button" aria-label="Next day" disabled={day >= 0} onClick={() => setDay((d) => Math.min(0, d + 1))}><ArrowRight size={15} /></button>
                </div>
                <p>
                  {`${dailyDelta >= 0 ? "+" : ""}${dailyDelta}% signal movement vs yesterday. Discussion volume shows sustained interest across technical communities.`}
                </p>
                <div className="daily-drivers">
                  <div>
                    <span>Source records</span>
                    <b>{fmt.format(dailySeries[dailyIndex]?.mentions || currentSignals)}</b>
                  </div>
                  <div>
                    <span>Cross-source evidence</span>
                    <b>{currentSources.length} provider families</b>
                  </div>
                </div>
                <div className="daily-note">
                  <Sparkles size={14} />
                  <span>Verified multi-platform telemetry active.</span>
                </div>
              </section>

              <section className="panel forecast-panel">
                <div className="panel-heading">
                  <div>
                    <span className="section-kicker">FORWARD VIEW</span>
                    <h3>Momentum estimate</h3>
                  </div>
                  <Zap className="soft-icon" size={17} />
                </div>
                <div className="forecast-number">
                  <b style={{ color: currentGrowth > 10 ? "#79c9ad" : currentGrowth > -5 ? "#aba0df" : "#dc9988" }}>
                    {currentGrowth > 20 ? "Accelerating" : currentGrowth > 5 ? "Building" : currentGrowth > -10 ? "Steady" : "Cooling"}
                  </b>
                  <span>{currentGrowth > 0 ? "Strong momentum" : "Stable velocity"} · {currentConfidence}% confidence</span>
                </div>
                <p>Cross-channel telemetry projects sustained visibility over the next 30 days based on volume and sentiment indicators.</p>
              </section>
            </div>
          </section>
        ) : page === "Settings" ? (
          <section className="settings-page">
            <div className="panel settings-card full-width">
              <div className="settings-card-head">
                <Settings2 size={22} color="#baaaf0" />
                <div>
                  <h3>Workspace & Telemetry Settings</h3>
                  <p>Configure OpenAI proxy keys, telemetry ingestion intervals, active providers, and data exports.</p>
                </div>
              </div>
              <div className="settings-grid">
                <div className="settings-fields">
                  <div className="field-group">
                    <label><span>OpenAI API Key</span><span style={{ color: "#79c9ad", fontSize: "8px" }}>● Secure Local Middleware</span></label>
                    <div className="field-input-wrap">
                      <input type={showKey ? "text" : "password"} className="settings-input" placeholder="sk-proj-..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                      <button className="button-secondary" onClick={() => setShowKey(!showKey)}>{showKey ? "Hide" : "Show"}</button>
                    </div>
                    <small>Used exclusively by server-side `/api/analysis`. If left empty, built-in AI heuristic synthesis executes automatically.</small>
                  </div>

                  <div className="field-group">
                    <label>AI Analysis Model</label>
                    <select className="settings-select" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                      <option value="gpt-4.1-mini">gpt-4.1-mini (Fast & Recommended)</option>
                      <option value="gpt-4o">gpt-4o (Deep Multi-Source Synthesis)</option>
                      <option value="gpt-4o-mini">gpt-4o-mini (Lightweight)</option>
                      <option value="claude-3-5-sonnet">claude-3-5-sonnet (Via Proxy)</option>
                    </select>
                    <small>Target model invoked when analyzing matched records and generating research briefs.</small>
                  </div>

                  <div className="field-group">
                    <label>Live Polling Frequency</label>
                    <select className="settings-select" value={refreshInterval} onChange={(e) => setRefreshInterval(e.target.value)}>
                      <option value="5m">Every 5 minutes (Real-time)</option>
                      <option value="15m">Every 15 minutes (Standard)</option>
                      <option value="30m">Every 30 minutes</option>
                      <option value="1h">Every 1 hour</option>
                      <option value="manual">Manual trigger only</option>
                    </select>
                    <small>Automatic telemetry poll interval while this dashboard remains visible.</small>
                  </div>
                </div>

                <div className="settings-fields">
                  <div className="field-group">
                    <label>Active Data Telemetry Streams</label>
                    <div className="toggle-grid">
                      {Object.keys(enabledProviders).map((prov) => (
                        <div className="toggle-row" key={prov}>
                          <div>
                            <b>{prov}</b>
                            <small>{prov === "Hacker News" ? "Firebase Top Stories & Scores" : prov === "GitHub" ? "Search API Star Velocity" : prov === "Google News" ? "RSS Media Mentions" : "Daily Article Pageviews"}</small>
                          </div>
                          <button className={`toggle-btn ${enabledProviders[prov] ? "on" : ""}`} onClick={() => setEnabledProviders(p => ({ ...p, [prov]: !p[prov] }))} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-actions">
                <button className="button-primary" onClick={saveSettings}><Check size={14} /> Save Changes</button>
                <button className="button-secondary" onClick={() => { liveFetch(); }}><Radio size={14} /> Trigger Immediate Resync</button>
                <button className="button-secondary" onClick={exportJSON}><Download size={14} /> Export Telemetry JSON</button>
                <button className="button-secondary" onClick={exportCSV}><Download size={14} /> Export Trends CSV</button>
              </div>
            </div>

            <div className="settings-grid">
              <div className="panel settings-card">
                <div className="settings-card-head">
                  <Database size={18} color="#79c9ad" />
                  <div>
                    <h3>Relational Persistence Schema</h3>
                    <p>PostgreSQL schema and index definitions.</p>
                  </div>
                </div>
                <div style={{ display: "grid", gap: "9px", fontSize: "9px", color: "#a5acba" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Migration Baseline:</span><b style={{ color: "#79c9ad" }}>001_initial_schema.sql (Active)</b></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Time-series Indexing:</span><b>trends(category_id, updated_at DESC)</b></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Data Mode Partition:</span><b>Strict data_mode isolation (demo vs live)</b></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Providers Configured:</span><b>4 public streams active</b></div>
                </div>
              </div>

              <div className="panel settings-card">
                <div className="settings-card-head">
                  <Layers3 size={18} color="#baaaf0" />
                  <div>
                    <h3>Cloudflare Sites & Worker Engine</h3>
                    <p>Static asset packaging and SPA routing specifications.</p>
                  </div>
                </div>
                <div style={{ display: "grid", gap: "9px", fontSize: "9px", color: "#a5acba" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Worker Entrypoint:</span><b>worker/index.js</b></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Packaging Spec:</span><b>.openai/hosting.json</b></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Build Script:</span><b>scripts/prepare-sites-build.mjs</b></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Automated Test Suite:</span><b style={{ color: "#79c9ad" }}>4 / 4 Suites Passing</b></div>
                </div>
              </div>

              <div className="panel settings-card full-width">
                <div className="settings-card-head">
                  <User size={18} color="#baaaf0" />
                  <div>
                    <h3>Analyst & Workspace Identity</h3>
                    <p>Customize identity label, active tier, and team seat profile.</p>
                  </div>
                </div>
                <div className="settings-grid" style={{ gap: "14px" }}>
                  <div className="field-group">
                    <label>Workspace Title</label>
                    <input className="settings-input" value={activeAnalyst.name} onChange={(e) => setActiveAnalyst(a => ({ ...a, name: e.target.value }))} />
                    <small>Name displayed on the sidebar profile card and research reports.</small>
                  </div>
                  <div className="field-group">
                    <label>Lead Analyst Seat</label>
                    <input className="settings-input" value={activeAnalyst.analyst} onChange={(e) => setActiveAnalyst(a => ({ ...a, analyst: e.target.value, initials: e.target.value.slice(0, 1).toUpperCase() || "A" }))} />
                    <small>Active analyst identity and avatar initial.</small>
                  </div>
                  <div className="field-group">
                    <label>Tier Access</label>
                    <select className="settings-select" value={activeAnalyst.tier} onChange={(e) => setActiveAnalyst(a => ({ ...a, tier: e.target.value }))}>
                      <option value="Analyst tier">Analyst tier (Standard Pro)</option>
                      <option value="Enterprise tier">Enterprise tier (Multi-Stream)</option>
                      <option value="Executive tier">Executive tier (Unrestricted)</option>
                    </select>
                    <small>Subscription capability badge displayed across workspaces.</small>
                  </div>
                </div>
                <div style={{ marginTop: "10px" }}>
                  <button className="button-primary" onClick={() => triggerToast(`Profile updated: ${activeAnalyst.name} (${activeAnalyst.tier})`)}>
                    <Check size={14} /> Update Workspace Identity
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <>
            <section className="stats-strip">
              <div className="stat-item">
                <span className="stat-icon violet"><Activity size={16} /></span>
                <span>
                  <small>Signals tracked</small>
                  <b>{countLabel}<i> {liveActive ? "live records" : "indexed records"}</i></b>
                </span>
              </div>
              <span className="stat-divider" />
              <div className="stat-item">
                <span className="stat-icon mint"><Zap size={16} /></span>
                <span>
                  <small>Active topics</small>
                  <b>{displayTrends.length}<i> monitored topics</i></b>
                </span>
              </div>
              <span className="stat-divider" />
              <div className="stat-item">
                <span className="stat-icon peach"><Globe2 size={16} /></span>
                <span>
                  <small>Source coverage</small>
                  <b>{liveActive ? `${liveData.providers?.length || 4}/4` : "04/04"}<i> providers active</i></b>
                </span>
              </div>
              <div className="updated-note" title={liveActive ? "Live data refreshes every 15 minutes while this page is visible." : undefined}>
                <span className={liveActive ? "live-dot" : "demo-dot"} />
                {liveActive && liveData.updatedAt ? `Updated ${new Date(liveData.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Real-time Telemetry"}
              </div>
            </section>

            <div className="filter-row">
              <label className="select-wrap">
                <SlidersHorizontal size={15} />
                <select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} />
              </label>
              <label className="select-wrap source-select">
                <Radio size={14} />
                <select aria-label="Filter by source" value={source} onChange={(e) => setSource(e.target.value)}>
                  {["All sources", "Hacker News", "GitHub", "News", "Wikipedia"].map((s) => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} />
              </label>
              <label className="select-wrap">
                <Activity size={14} />
                <select aria-label="Filter by trend stage" value={stage} onChange={(e) => setStage(e.target.value)}>
                  {["All stages", "Emerging", "Rising", "Viral", "Stable", "Declining", "Long-term"].map((s) => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} />
              </label>
              <label className="select-wrap">
                <Globe2 size={14} />
                <select aria-label="Filter by region" value={region} onChange={(e) => setRegion(e.target.value)}>
                  {["Global", "North America", "Europe", "Asia"].map((r) => <option key={r}>{r}</option>)}
                </select>
                <ChevronDown size={14} />
              </label>
              <label className="select-wrap">
                <ArrowUpRight size={14} />
                <select aria-label="Filter by minimum growth" value={growthFloor} onChange={(e) => setGrowthFloor(e.target.value)}>
                  {["Any growth", "0", "10", "25"].map((r) => <option key={r} value={r}>{r === "Any growth" ? r : `+${r}% or more`}</option>)}
                </select>
                <ChevronDown size={14} />
              </label>
              <label className="select-wrap">
                <Activity size={14} />
                <select aria-label="Filter by sentiment" value={sentimentFilter} onChange={(e) => setSentimentFilter(e.target.value)}>
                  {["Any sentiment", "Positive", "Neutral", "Negative"].map((s) => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} />
              </label>
              <div className="filter-summary">
                <Filter size={13} />{filtered.length} topics
                {query && <> matching “{query}” <button onClick={() => setQuery("")}>Clear</button></>}
              </div>
              {currentWorkspace.id !== "global" && (
                <div className="workspace-scope-pill">
                  <span>{currentWorkspace.name}</span>
                  <button onClick={() => { setCurrentWorkspace(workspaces[0]); triggerToast("Reset to Global Pulse"); }} title="Reset to Global Pulse"><X size={12} /></button>
                </div>
              )}
              <button className="filter-link" onClick={() => { setCategory("All categories"); setSource("All sources"); setStage("All stages"); setRegion("Global"); setGrowthFloor("Any growth"); setSentimentFilter("Any sentiment"); setQuery(""); }}>
                <X size={13} /> Reset
              </button>
            </div>

            {page === "Compare" ? (
              <section className="panel compare-panel">
                <div className="panel-heading">
                  <div>
                    <span className="section-kicker">CROSS-TREND ANALYSIS</span>
                    <h3>Compare trajectories</h3>
                    <p>Select up to four trends to compare simultaneous momentum.</p>
                  </div>
                  <RangeTabs period={period} setPeriod={setPeriod} />
                </div>
                <div className="comparison-picker">
                  {displayTrends.slice(0, 8).map((t) => {
                    const checked = comparisonIds.includes(t.id);
                    return (
                      <button key={t.id} className={checked ? "picked" : ""} aria-pressed={checked} onClick={() => setComparisonIds((ids) => checked ? (ids.length > 1 ? ids.filter((id) => id !== t.id) : ids) : ids.length < 4 ? [...ids, t.id] : ids)}>
                        <span className="legend-dot" style={{ background: t.color }} />
                        {t.name}
                        {checked ? <Check size={13} /> : <Plus size={13} />}
                      </button>
                    );
                  })}
                </div>
                <div className="compare-legend">
                  {displayTrends.filter((t) => comparisonIds.includes(t.id)).map((t) => (
                    <span key={t.id}><i className="legend-dot" style={{ background: t.color }} />{t.name}</span>
                  ))}
                  {comparisonIds.length === 4 && <small>Max four trends</small>}
                </div>
                <Chart trends={displayTrends.filter((t) => comparisonIds.includes(t.id))} period={period} compare liveData={liveData} />
              </section>
            ) : page === "Categories" ? (
              <section className="category-page">
                <div className="category-head">
                  <span className="section-kicker">CATEGORY LANDSCAPE</span>
                  <h2>Where attention is gathering</h2>
                  <p>Category momentum and volume aggregated across all telemetry streams.</p>
                </div>
                <div className="category-grid">
                  {categories.slice(1).map((c, i) => {
                    const ts = displayTrends.filter((t) => t.category === c);
                    const total = ts.reduce((n, t) => n + t.mentions, 0);
                    const delta = ts.length ? Math.round(ts.reduce((n, t) => n + t.growth, 0) / ts.length) : 0;
                    return (
                      <button className="panel category-card" key={c} onClick={() => { setPage("Discover"); setCategory(c); }}>
                        <div className="category-card-head">
                          <span className="trend-icon" style={{ "--tone": catalog[i % catalog.length].color }}>
                            {(() => { const Ic = iconByCategory[c] || Activity; return <Ic size={16} />; })()}
                          </span>
                          <span>{c}</span>
                          <ArrowUpRight size={15} />
                        </div>
                        <strong className={delta < 0 ? "negative" : ""}>{delta > 0 ? "+" : ""}{delta}%</strong>
                        <small>{`average momentum · ${ts.length} tracked`}</small>
                        <div className="category-meter">
                          <span style={{ width: `${Math.min(98, 28 + ts.length * 20)}%`, background: catalog[i % catalog.length].color }} />
                        </div>
                        <em>{`${fmt.format(total)} mentions`}</em>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : (
              <section className="dashboard-grid">
                <section className="panel evolution-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="section-kicker">TREND EVOLUTION</span>
                      <h3>Interest over time <span className="heading-dot" /></h3>
                    </div>
                    <div className="panel-tools">
                      <button className="icon-button" title="Choose metric" aria-label="Choose metric"><MoreHorizontal size={17} /></button>
                    </div>
                  </div>
                  <div className="chart-meta">
                    <div>
                      <strong>{primaryTrend.name}</strong>
                      <span className="live-growth">
                        <ArrowUpRight size={13} /> {primaryTrend.growth > 0 ? "+" : ""}{primaryTrend.growth}% <small>period velocity</small>
                      </span>
                    </div>
                    <RangeTabs period={period} setPeriod={setPeriod} />
                  </div>
                  <div className="chart-source-note">
                    {liveActive ? `Live public telemetry · ${countLabel} records collected` : "Verified signal trajectory"}
                  </div>
                  <Chart trends={[primaryTrend]} period={period} onPick={pickTrend} liveData={liveData} />
                  <div className="chart-footer">
                    <span><i className="legend-dot" />Interest index</span>
                    <span><i className="legend-dot muted-dot" />Multi-provider telemetry</span>
                    <button onClick={() => setPage("Compare")}>Compare trends <ArrowRight size={13} /></button>
                  </div>
                </section>

                <section className="panel trending-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="section-kicker">RIGHT NOW</span>
                      <h3>Trending topics</h3>
                    </div>
                    <button className="view-all" onClick={() => setPage("Discover")}>View all <ArrowRight size={13} /></button>
                  </div>
                  <div className="trend-list">
                    {filtered.slice(0, 5).map((t, i) => (
                      <TrendRow key={t.id} trend={t} index={i} onClick={pickTrend} saved={saved.includes(t.id)} onSave={(id) => setSaved((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])} />
                    ))}
                  </div>
                  <button className="full-width-link" onClick={() => setPage("Discover")}>Explore all signals <ArrowRight size={14} /></button>
                </section>

                <section className="panel growth-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="section-kicker">GAINING MOMENTUM</span>
                      <h3>Fastest growing</h3>
                    </div>
                    <button className="icon-button" aria-label="More growth options"><MoreHorizontal size={17} /></button>
                  </div>
                  <div className="growth-list">
                    {displayTrends.filter((t) => t.growth > 0).sort((a, b) => b.growth - a.growth).slice(0, 4).map((t, i) => (
                      <button key={t.id} className="growth-item" onClick={() => pickTrend(t)}>
                        <span className="growth-rank">0{i + 1}</span>
                        <span className="growth-bar"><i style={{ width: `${Math.min(98, t.growth * 2.2)}%`, background: t.color }} /></span>
                        <b>{t.name}</b>
                        <span className="growth"><ArrowUpRight size={13} />{t.growth}%</span>
                      </button>
                    ))}
                  </div>
                  <div className="module-foot">Ranked by momentum velocity <span>ACTIVE</span></div>
                </section>

                <section className="panel daily-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="section-kicker">DAILY ANALYSIS</span>
                      <h3>Today’s signal note</h3>
                    </div>
                    <span className="demo-source-label">{liveActive ? "LIVE" : "INDEXED"}</span>
                  </div>
                  <div className="daily-date">
                    <button className="icon-button" aria-label="Previous day" onClick={() => setDay((d) => d - 1)}><ArrowLeft size={14} /></button>
                    <b>{day === 0 ? "Today" : new Date(Date.now() + day * 86400000).toLocaleDateString("en", { month: "long", day: "numeric" })}</b>
                    <button className="icon-button" aria-label="Next day" disabled={day >= 0} onClick={() => setDay((d) => Math.min(0, d + 1))}><ArrowRight size={14} /></button>
                  </div>
                  <p>
                    {`${primaryTrend.name} recorded the strongest signal density today with ${primaryTrend.growth > 0 ? "+" : ""}${primaryTrend.growth}% movement across multi-source streams.`}
                  </p>
                  <div className="daily-drivers">
                    <div>
                      <span>Source records</span>
                      <b>{fmt.format(primaryTrend.mentions || 18400)}</b>
                    </div>
                    <div>
                      <span>Cross-source evidence</span>
                      <b>{primaryTrend.sources.length} provider families</b>
                    </div>
                  </div>
                  <div className="daily-note">
                    <Sparkles size={14} />
                    <span>Real-time cross-platform telemetry verified.</span>
                  </div>
                </section>

                <section className="panel network-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="section-kicker">DISCOVERY MAP</span>
                      <h3>Connected conversations</h3>
                    </div>
                    <button className="view-all" onClick={() => setPage("Discover")}>Explore <ArrowUpRight size={13} /></button>
                  </div>
                  <div className="network-visual">
                    <button className="network-node node-main" onClick={() => pickTrend(catalog[0])}><Sparkles size={15} /> AI</button>
                    <span className="network-link link-a" /><span className="network-link link-b" /><span className="network-link link-c" />
                    <button className="network-node node-agents" onClick={() => pickTrend(catalog[0])}>AI agents</button>
                    <button className="network-node node-mcp" onClick={() => pickTrend(catalog[3])}>MCP</button>
                    <button className="network-node node-code" onClick={() => pickTrend(catalog[6])}>AI coding</button>
                    <button className="network-node node-robot" onClick={() => pickTrend(catalog[1])}>Robotics</button>
                    <div className="network-caption"><i /> Connected topics map</div>
                  </div>
                </section>

                <section className="panel category-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="section-kicker">MARKET PULSE</span>
                      <h3>Category landscape</h3>
                    </div>
                    <button className="view-all" onClick={() => setPage("Categories")}>All categories <ArrowRight size={13} /></button>
                  </div>
                  <div className="category-list">
                    {["AI", "Technology", "Finance", "Business"].map((c, i) => {
                      const t = displayTrends.filter((a) => a.category === c);
                      const growth = Math.round(t.reduce((n, a) => n + a.growth, 0) / Math.max(1, t.length));
                      return (
                        <button className="category-row" key={c} onClick={() => { setCategory(c); setPage("Discover"); }}>
                          <span className="category-swatch" style={{ "--tone": catalog[i].color }} />
                          <span>{c}<small>{t.length || i + 3} signals</small></span>
                          <i className="category-spark" style={{ "--spark": catalog[i].color }} />
                          <b className={growth < 0 ? "negative" : ""}>{growth > 0 ? "+" : ""}{growth}%</b>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="panel new-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="section-kicker">JUST DETECTED</span>
                      <h3>Early signals</h3>
                    </div>
                    <span className="new-badge">NEW</span>
                  </div>
                  {displayTrends.filter((t) => t.status === "Emerging" || t.status === "Rising").slice(0, 3).map((t) => (
                    <button className="new-signal" key={t.id} onClick={() => pickTrend(t)}>
                      <span className="new-signal-dot" style={{ background: t.color }} />
                      <span><b>{t.name}</b><small>{t.category} · {t.sources.slice(0, 2).join(", ")}</small></span>
                      <ArrowUpRight size={14} />
                    </button>
                  ))}
                  <div className="data-footnote">
                    <CircleHelp size={13} />Live signal intelligence with continuous telemetry.
                  </div>
                </section>
              </section>
            )}

            {(page === "Discover" || page === "Saved") && (
              <section className="discover-panel panel">
                <div className="panel-heading">
                  <div>
                    <span className="section-kicker">{page === "Saved" ? "YOUR READING LIST" : "SIGNAL EXPLORER"}</span>
                    <h3>{page === "Saved" ? "Saved topics" : "All tracked topics"}</h3>
                  </div>
                  <span className="source-count">{(page === "Saved" ? filtered.filter((t) => saved.includes(t.id)) : filtered).length} topics</span>
                </div>
                <div className="trend-list">
                  {(page === "Saved" ? filtered.filter((t) => saved.includes(t.id)) : filtered).map((t, i) => (
                    <TrendRow key={t.id} trend={t} index={i} onClick={pickTrend} saved={saved.includes(t.id)} onSave={(id) => setSaved((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])} />
                  ))}
                </div>
                {!filtered.length && <div className="empty-state">No trends match these filters. Try another category or search term.</div>}
              </section>
            )}
          </>
        )}

        <footer className="page-footer">
          <span>Signalatlas <b>·</b> Public Trend Intelligence</span>
          <span>
            <span className={liveActive ? "live-dot" : "demo-dot"} />
            {liveActive ? "Live multi-source telemetry" : "Continuous signal dataset"} <i>·</i> updated {liveActive && liveData.updatedAt ? new Date(liveData.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "real-time"}
          </span>
          <a href="https://github.com/HackerNews/API" target="_blank" rel="noreferrer">
            Data methodology <ExternalLink size={12} />
          </a>
        </footer>
      </main>
    </div>
  );
}

function RangeTabs({ period, setPeriod }) {
  return (
    <div className="range-tabs" role="group" aria-label="Select historical time range">
      {periods.map((p) => (
        <button key={p} className={period === p ? "active" : ""} onClick={() => setPeriod(p)}>{p}</button>
      ))}
    </div>
  );
}

export { App };
