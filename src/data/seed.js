export const catalog = [
  { id: "agents", name: "AI agents", category: "AI", score: 91, growth: 38, mentions: 18400, sentiment: 76, confidence: 88, status: "Viral", sources: ["Hacker News", "GitHub", "News"], color: "#8569e8", regions: ["North America", "Europe", "Asia"], summary: "Software that plans and completes multi-step tasks with limited human intervention.", why: "Developer tools and agent protocols are receiving sustained discussion across the sampled developer and news feeds.", related: ["MCP", "AI coding", "Agentic workflows"] },
  { id: "robotics", name: "Humanoid robots", category: "Technology", score: 84, growth: 27, mentions: 12900, sentiment: 71, confidence: 82, status: "Rising", sources: ["News", "Hacker News", "Wikipedia"], color: "#53b8bb", regions: ["Asia", "North America"], summary: "Human-shaped robots designed to work in spaces built for people.", why: "Recent coverage and technical discussion point to renewed attention around industrial deployment.", related: ["Robotics", "Physical AI", "Automation"] },
  { id: "matcha", name: "Ceremonial matcha", category: "Culture", score: 78, growth: 21, mentions: 8900, sentiment: 83, confidence: 79, status: "Emerging", sources: ["News", "Wikipedia"], color: "#8cae74", regions: ["Asia", "North America"], summary: "Interest in premium, traditionally prepared Japanese green tea.", why: "Food and wellness coverage is connecting craft preparation with everyday routines.", related: ["Wellness", "Japanese tea", "Functional drinks"] },
  { id: "mcp", name: "Model Context Protocol", category: "AI", score: 74, growth: 32, mentions: 7100, sentiment: 69, confidence: 85, status: "Rising", sources: ["GitHub", "Hacker News", "News"], color: "#e69b65", regions: ["North America", "Europe"], summary: "An open protocol that connects AI applications with external tools and data.", why: "More repositories and discussion are referencing shared ways to connect models with tools.", related: ["AI agents", "Tool use", "AI coding"] },
  { id: "sabrina", name: "Sabrina Carpenter", category: "Entertainment", score: 69, growth: 14, mentions: 6200, sentiment: 81, confidence: 75, status: "Stable", sources: ["News", "Wikipedia"], color: "#dd79a6", regions: ["North America", "Europe"], summary: "Public interest around the singer, recent releases, performances and culture coverage.", why: "Music coverage and new-release conversation are sustaining attention.", related: ["Pop music", "Live tours", "Music charts"] },
  { id: "bitcoin", name: "Bitcoin", category: "Finance", score: 66, growth: 8, mentions: 10500, sentiment: 53, confidence: 83, status: "Stable", sources: ["News", "Hacker News", "Wikipedia"], color: "#dbad52", regions: ["North America", "Asia", "Europe"], summary: "Interest in the Bitcoin network and its market, technology and policy developments.", why: "Coverage remains linked to market movements and policy discussion.", related: ["Crypto", "Ethereum", "Digital assets"] },
  { id: "ai-coding", name: "AI coding tools", category: "AI", score: 62, growth: 17, mentions: 5700, sentiment: 67, confidence: 77, status: "Rising", sources: ["GitHub", "Hacker News", "News"], color: "#6f9de0", regions: ["North America", "Europe"], summary: "AI assistants that help developers write, review and maintain code.", why: "Product updates and developer discussions continue to surface practical coding workflows.", related: ["AI agents", "Copilots", "Open source"] },
  { id: "quiet-luxury", name: "Quiet luxury", category: "Fashion", score: 47, growth: -12, mentions: 3100, sentiment: 62, confidence: 72, status: "Declining", sources: ["News", "Wikipedia"], color: "#b48973", regions: ["Europe", "North America"], summary: "A fashion aesthetic centered on understated design and discreet branding.", why: "In the sample, recent attention is lower than its prior period; causes are uncertain.", related: ["Minimalism", "Fashion", "Timeless style"] },
  { id: "spatial", name: "Spatial computing", category: "Technology", score: 52, growth: -6, mentions: 2800, sentiment: 64, confidence: 69, status: "Stable", sources: ["News", "Hacker News"], color: "#8c98ca", regions: ["North America", "Asia"], summary: "Computing experiences that blend digital interfaces with physical spaces.", why: "Discussion remains present but has softened in the recent sample.", related: ["AR", "Virtual reality", "Wearables"] },
  { id: "longevity", name: "Longevity science", category: "Health", score: 58, growth: 11, mentions: 3900, sentiment: 74, confidence: 70, status: "Emerging", sources: ["News", "Wikipedia"], color: "#60a993", regions: ["North America", "Europe"], summary: "Research and products focused on healthy aging and lifespan extension.", why: "Science reporting is drawing attention to new research, though broad adoption remains unclear.", related: ["Biotech", "Healthspan", "Preventive health"] },
  { id: "indie-games", name: "Indie games", category: "Gaming", score: 43, growth: 5, mentions: 2400, sentiment: 86, confidence: 65, status: "Stable", sources: ["Hacker News", "News"], color: "#d47d65", regions: ["Europe", "North America", "Asia"], summary: "Independent video games and the creative studios behind them.", why: "Ongoing community recommendations and release coverage sustain a steady signal.", related: ["Game development", "Steam", "Retro games"] },
  { id: "vertical-saas", name: "Vertical AI SaaS", category: "Business", score: 81, growth: 29, mentions: 14200, sentiment: 78, confidence: 84, status: "Rising", sources: ["News", "Hacker News", "GitHub"], color: "#e8985e", regions: ["North America", "Europe"], summary: "Specialized, industry-specific software suites powered by proprietary AI workflows.", why: "Enterprise migration toward niche domain-tuned automation is accelerating commercial adoption.", related: ["B2B SaaS", "Agentic workflows", "Automation"] },
  { id: "solo-founders", name: "Solo AI Startups", category: "Startups", score: 77, growth: 34, mentions: 11800, sentiment: 82, confidence: 81, status: "Rising", sources: ["Hacker News", "GitHub", "News"], color: "#e27396", regions: ["North America", "Europe", "Asia"], summary: "Single-person engineering studios building and scaling multi-million revenue businesses.", why: "AI developer tooling has collapsed execution costs for technical builders.", related: ["Bootstrapping", "Indie Hackers", "Micro-SaaS"] },
  { id: "depin", name: "DePIN Networks", category: "Crypto", score: 73, growth: 22, mentions: 9600, sentiment: 71, confidence: 79, status: "Emerging", sources: ["Hacker News", "News", "Wikipedia"], color: "#48bfe3", regions: ["Asia", "North America", "Europe"], summary: "Decentralized Physical Infrastructure Networks coordinating real-world compute and hardware.", why: "Token-incentivized wireless, storage, and GPU networks are seeing steady node growth.", related: ["Decentralized Compute", "Helium", "GPU clusters"] },
  { id: "fusion", name: "Nuclear Fusion", category: "Science", score: 79, growth: 26, mentions: 13400, sentiment: 85, confidence: 86, status: "Rising", sources: ["News", "Wikipedia", "Hacker News"], color: "#56cfe1", regions: ["North America", "Europe", "Asia"], summary: "Next-generation net-positive energy reactors reproducing stellar fusion reactions.", why: "Breakthrough confinement magnet designs and private capital infusions are driving optimism.", related: ["Clean Energy", "Plasma Physics", "Tokamak"] },
  { id: "smart-rings", name: "Smart Rings", category: "Consumer Products", score: 75, growth: 31, mentions: 12100, sentiment: 79, confidence: 83, status: "Rising", sources: ["News", "Wikipedia", "GitHub"], color: "#9d4edd", regions: ["North America", "Asia", "Europe"], summary: "Compact wearable biometric sensors monitoring sleep, recovery, and metabolic health.", why: "Recent market entrants and discreet form factors are expanding adoption beyond smartwatches.", related: ["Wearables", "Biometrics", "Health Tech"] },
];

export const categories = ["All categories", "AI", "Technology", "Finance", "Business", "Fashion", "Gaming", "Entertainment", "Health", "Startups", "Crypto", "Science", "Culture", "Consumer Products"];
export const periods = ["24H", "7D", "30D", "90D", "6M", "1Y", "ALL"];

const hash = (n) => { let x = (n * 9301 + 49297) % 233280; return x / 233280; };
export function demoSeries(id, days = 365) {
  const trend = catalog.find((t) => t.id === id) || catalog[0];
  const seed = catalog.indexOf(trend) + 2;
  return Array.from({ length: days }, (_, i) => {
    const t = i / Math.max(1, days - 1);
    const wave = Math.sin(i * 0.19 + seed) * 5 + Math.sin(i * 0.047 + seed * 2) * 8;
    const ramp = trend.growth < 0 ? -t * 17 : t * (trend.growth * 0.35);
    const spike = (hash(seed * 500 + i) - 0.5) * 10;
    return { date: new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().slice(0, 10), score: Math.max(8, Math.min(100, Math.round(trend.score * 0.6 + ramp + wave + spike))), mentions: Math.max(80, Math.round(trend.mentions * (0.42 + t * 0.45 + wave / 90))), sentiment: Math.max(20, Math.min(95, Math.round(trend.sentiment + wave / 2))), sources: trend.sources.length };
  });
}

export function getTrendSeries(trend, liveItem, period = "30D") {
  const countByRange = { "24H": 1, "7D": 7, "30D": 30, "90D": 90, "6M": 182, "1Y": 365, ALL: 365 };
  const targetScore = liveItem?.score ?? trend.score;
  const targetMentions = liveItem?.signals ? liveItem.signals * 450 : trend.mentions;
  const targetGrowth = liveItem?.growth ?? trend.growth;
  const targetSentiment = liveItem?.sentiment ?? trend.sentiment;
  const seed = (catalog.findIndex((t) => t.id === trend.id || t.name.toLowerCase() === trend.name.toLowerCase()) + 2) || 3;

  if (period === "24H") {
    return Array.from({ length: 24 }, (_, hour) => {
      const hNorm = hour / 23;
      const microWave = Math.sin(hour * 0.45 + seed) * 2.2 + Math.cos(hour * 0.28) * 1.5;
      const score = Math.max(5, Math.min(100, Math.round(targetScore - (1 - hNorm) * (targetGrowth * 0.08) + microWave)));
      return {
        date: new Date(Date.now() - (23 - hour) * 3600000).toISOString(),
        score: hour === 23 ? targetScore : score,
        mentions: Math.max(1, Math.round(targetMentions / 24 + microWave * 4)),
        sentiment: targetSentiment,
        sources: (liveItem?.sources || trend.sources || ["News"]).length
      };
    });
  }

  const days = 365;
  const series = Array.from({ length: days }, (_, i) => {
    const t = i / Math.max(1, days - 1);
    const wave = Math.sin(i * 0.18 + seed) * 4.5 + Math.sin(i * 0.045 + seed * 2) * 6;
    const ramp = (t - 1) * (targetGrowth * 0.45);
    const spike = (hash(seed * 500 + i) - 0.5) * 7;
    const scoreVal = Math.max(8, Math.min(100, Math.round(targetScore + ramp + wave * (1 - t * 0.35) + spike * (1 - t * 0.5))));
    const mentionVal = Math.max(30, Math.round(targetMentions * (0.38 + t * 0.62 + wave / 110)));
    const sentVal = Math.max(25, Math.min(95, Math.round(targetSentiment + wave * 0.3)));

    return {
      date: new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().slice(0, 10),
      score: i === days - 1 ? targetScore : scoreVal,
      mentions: i === days - 1 ? targetMentions : mentionVal,
      sentiment: i === days - 1 ? targetSentiment : sentVal,
      sources: (liveItem?.sources || trend.sources || ["News"]).length
    };
  });

  return series.slice(-countByRange[period]);
}

