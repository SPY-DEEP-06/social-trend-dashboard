/**
 * Transparent current-sample score (0–100). Growth, persistence, and novelty
 * require stored comparable snapshots; they deliberately stay out of this score.
 */
export function scoreCurrentSignals({ signalCount, sourceCount, cohortMaxSignals }) {
  if (!signalCount || !cohortMaxSignals) return 0;
  const volume = Math.log1p(signalCount) / Math.log1p(cohortMaxSignals);
  const diversity = Math.min(1, sourceCount / 4);
  return Math.round(100 * (0.65 * volume + 0.35 * diversity));
}

/**
 * Full score for persisted time series. Each component is independently
 * normalized before weighting so raw high-volume providers cannot dominate.
 */
export function scorePersistedTrend({ searchGrowth, mentionGrowth, engagementGrowth, sourceDiversity, acceleration, novelty, persistence }) {
  const parts = {
    searchGrowth: [searchGrowth, 0.2], mentionGrowth: [mentionGrowth, 0.2],
    engagementGrowth: [engagementGrowth, 0.15], sourceDiversity: [sourceDiversity, 0.15],
    acceleration: [acceleration, 0.15], novelty: [novelty, 0.075], persistence: [persistence, 0.075],
  };
  const bounded = (value) => Math.max(0, Math.min(1, Number(value) || 0));
  return Object.fromEntries([...Object.entries(parts).map(([key, [value, weight]]) => [key, { normalized: bounded(value), weight }]), ["score", Math.round(Object.values(parts).reduce((sum, [value, weight]) => sum + bounded(value) * weight, 0) * 100)]]);
}
