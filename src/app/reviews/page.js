'use client';
import { useState, useEffect } from 'react';
import { GitPullRequest, Search, Filter, ArrowLeft, Shield, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const BACKEND_URL = 'https://ai-code-reviewer-backend-cym0.onrender.com';

function ScoreRing({ score, size = 70 }) {
  const [progress, setProgress] = useState(0);
  const radius = size / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const color = score >= 8 ? '#22c55e' : score >= 6 ? '#f59e0b' : '#ef4444';
  useEffect(() => { setTimeout(() => setProgress((score / 10) * circumference), 300); }, [score]);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', filter: `drop-shadow(0 0 6px ${color}66)` }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1e1e2e" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${progress} ${circumference}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.24, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: size * 0.13, color: '#4b4b6b' }}>/10</span>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/reviews`)
      .then(r => r.json())
      .then(data => {
        setReviews(data.reviews || []);
        setFiltered(data.reviews || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = reviews;
    if (search) result = result.filter(r => r.pr_title.toLowerCase().includes(search.toLowerCase()) || r.repo.toLowerCase().includes(search.toLowerCase()));
    if (filter === 'critical') result = result.filter(r => r.full_review?.includes('CRITICAL'));
    if (filter === 'security') result = result.filter(r => r.full_review?.includes('Security Analysis') && !r.full_review?.includes('No security issues detected'));
    if (filter === 'high') result = result.filter(r => r.score >= 8);
    if (filter === 'low') result = result.filter(r => r.score < 6);
    setFiltered(result);
  }, [search, filter, reviews]);

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: '#fff' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1a1a2e', padding: '18px 48px', display: 'flex', alignItems: 'center', gap: 14, backdropFilter: 'blur(20px)', background: 'rgba(7,7,15,0.8)', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b6b8b', textDecoration: 'none', fontSize: 13 }}>
          <ArrowLeft size={14} /> Back
        </Link>
        <div style={{ width: 1, height: 20, background: '#2a2a3a' }} />
        <div style={{ fontSize: 16, fontWeight: 700, background: 'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>All Reviews</div>
      </div>

      <div style={{ padding: '40px 48px', maxWidth: 1000, margin: '0 auto' }}>
        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#4b4b6b' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reviews..."
              style={{ width: '100%', background: '#13131f', border: '1px solid #2a2a3a', borderRadius: 12, padding: '10px 14px 10px 36px', color: '#fff', fontSize: 14, outline: 'none' }}
            />
          </div>
          {['all', 'critical', 'security', 'high', 'low'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '10px 16px', borderRadius: 12, border: '1px solid', borderColor: filter === f ? '#7c3aed' : '#2a2a3a', background: filter === f ? '#1e1030' : '#13131f', color: filter === f ? '#a78bfa' : '#6b6b8b', fontSize: 13, cursor: 'pointer', textTransform: 'capitalize' }}>
              {f === 'all' ? 'All' : f === 'critical' ? '🔴 Critical' : f === 'security' ? '🛡️ Security' : f === 'high' ? '⭐ High Score' : '⚠️ Low Score'}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div style={{ fontSize: 13, color: '#4b4b6b', marginBottom: 20 }}>{filtered.length} review{filtered.length !== 1 ? 's' : ''} found</div>

        {/* Reviews list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#4b4b6b' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#4b4b6b' }}>No reviews match your search</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((review, i) => (
              <Link key={review._id} href={`/reviews/${review._id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#13131f', border: '1px solid #2a2a3a', borderRadius: 16, padding: '20px 24px', display: 'flex', gap: 20, alignItems: 'center', transition: 'all 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(124,58,237,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a3a'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <ScoreRing score={review.score} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: '#a78bfa', background: '#1e1030', border: '1px solid #7c3aed33', borderRadius: 999, padding: '2px 8px' }}>{review.repo} #{review.pr_number}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 12, color: '#4b4b6b' }}>{timeAgo(review.created_at)}</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#f0f0ff', marginBottom: 6 }}>{review.pr_title}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {review.full_review?.includes('CRITICAL') && <span style={{ fontSize: 11, background: '#2d0a0a', border: '1px solid #ef444433', borderRadius: 999, padding: '2px 8px', color: '#ef4444' }}>🔴 Critical</span>}
                      {review.full_review?.includes('WARNING') && <span style={{ fontSize: 11, background: '#2d1f0a', border: '1px solid #f59e0b33', borderRadius: 999, padding: '2px 8px', color: '#f59e0b' }}>🟡 Warning</span>}
                      {review.full_review?.includes('No security issues detected') && <span style={{ fontSize: 11, background: '#0a1a2d', border: '1px solid #06b6d433', borderRadius: 999, padding: '2px 8px', color: '#06b6d4' }}>🛡️ Clean</span>}
                      <span style={{ fontSize: 11, background: '#1a1a2e', border: '1px solid #2a2a3a', borderRadius: 999, padding: '2px 8px', color: '#6b6b8b' }}>{review.files_reviewed} file{review.files_reviewed > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div style={{ color: '#4b4b6b', fontSize: 18 }}>→</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}