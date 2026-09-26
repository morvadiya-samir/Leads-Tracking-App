import { Users, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

interface MetricsBannerProps {
  total: number;
  newCount: number;
  qualifiedCount: number;
  contactedCount: number;
  lostCount: number;
}

export function MetricsBanner({
  total,
  newCount,
  qualifiedCount,
  contactedCount,
  lostCount,
}: MetricsBannerProps) {
  return (
    <section className="stats-grid" aria-label="Key Performance Metrics">
      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Total Leads</span>
          <span className="stat-value">{total}</span>
        </div>
        <div className="stat-icon-wrapper" style={{ background: '#f1f5f9', color: '#475569' }}>
          <Users size={20} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">New Leads</span>
          <span className="stat-value">{newCount}</span>
        </div>
        <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
          <Clock size={20} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Qualified</span>
          <span className="stat-value">{qualifiedCount}</span>
        </div>
        <div className="stat-icon-wrapper" style={{ background: '#f0fdf4', color: '#15803d' }}>
          <CheckCircle2 size={20} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-label">Contacted / Lost</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
            <span className="stat-value" style={{ fontSize: '1.4rem' }}>
              {contactedCount}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span className="stat-value" style={{ fontSize: '1.4rem' }}>
              {lostCount}
            </span>
          </div>
        </div>
        <div className="stat-icon-wrapper" style={{ background: '#fefce8', color: '#854d0e' }}>
          <TrendingUp size={20} />
        </div>
      </div>
    </section>
  );
}
