'use client';
import { useState, useEffect, useRef } from 'react';
import { GitPullRequest, Star, CheckCircle, Zap, Code2, TrendingUp, Shield, Activity } from 'lucide-react';

const BACKEND_URL = 'https://ai-code-reviewer-backend-cym0.onrender.com';

function AnimatedNumber({ value, duration = 1500 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(parseFloat(start.toFixed(1)));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
}

function ScoreRing({ score, size = 90 }) {
  const [progress, setProgress] = useState(0);
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const color = score >= 8 ? '#22c55e' : score >= 6 ? '#f59e0b' : '#ef4444';

  useEffect(() => {
    setTimeout(() => setProgress((score / 10) * circumference), 300);
  }, [score]);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', filter: `drop-shadow(0 0 8px ${color}66)` }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1e1e2e" strokeWidth="7" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="7"
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

function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5, a: Math.random() * 0.4 + 0.1,
    }));
    let animId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124,58,237,${p.a})`;
        ctx.fill();
      });
      particles.forEach((p, i) => particles.slice(i + 1).forEach(q => {
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 120) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(124,58,237,${0.15 * (1 - d / 120)})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }));
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />;
}

function ReviewCard({ review, index }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), index * 150); }, []);
  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #13131f 0%, #16161f 100%)',
      border: '1px solid #2a2a3a', borderRadius: 20, padding: 28,
      display: 'flex', gap: 24, alignItems: 'center',
      transform: visible ? 'translateY(0)' : 'translateY(30px)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
      cursor: 'pointer', position: 'relative', overflow: 'hidden'
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(124,58,237,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a3a'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
      onClick={() => review.pr_url && window.open(review.pr_url, '_blank')}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, #7c3aed44, transparent)' }} />
      <ScoreRing score={review.score} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#1e1030', border: '1px solid #7c3aed44', borderRadius: 999, padding: '3px 10px' }}>
            <GitPullRequest size={11} color="#a78bfa" />
            <span style={{ fontSize: 11, color: '#a78bfa' }}>{review.repo} #{review.pr_number}</span>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#4b4b6b' }}>{timeAgo(review.created_at)}</span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: '#f0f0ff' }}>{review.pr_title}</div>
        <div style={{ fontSize: 13, color: '#6b6b8b', lineHeight: 1.6 }}>{review.summary}</div>
        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, background: '#1a1a2e', border: '1px solid #2a2a3a', borderRadius: 999, padding: '4px 12px', color: '#6b6b8b' }}>
            {review.files_reviewed} file{review.files_reviewed > 1 ? 's' : ''} reviewed
          </span>
          <span style={{ fontSize: 11, background: '#0d1f14', border: '1px solid #22c55e33', borderRadius: 999, padding: '4px 12px', color: '#22c55e' }}>
            ✓ Completed
          </span>
          <span style={{ fontSize: 11, background: '#1e1030', border: '1px solid #7c3aed44', borderRadius: 999, padding: '4px 12px', color: '#a78bfa' }}>
            🤖 AI Reviewed
          </span>
        </div>
      </div>
    </div>
  );
}

function MiniChart({ scores }) {
  if (!scores || scores.length < 2) return null;
  const max = 10, w = 200, h = 60;
  const points = scores.map((s, i) => `${(i / (scores.length - 1)) * w},${h - (s / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <polyline points={points} fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {scores.map((s, i) => (
        <circle key={i} cx={(i / (scores.length - 1)) * w} cy={h - (s / max) * h} r="3" fill="#7c3aed" />
      ))}
    </svg>
  );
}

export default function Dashboard() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, avgScore: 0 });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch(`${BACKEND_URL}/reviews`)
      .then(r => r.json())
      .then(data => {
        setReviews(data.reviews || []);
        setStats({ total: data.total || 0, avgScore: parseFloat(data.avgScore) || 0 });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statCards = [
    { icon: <GitPullRequest size={22} color="#a78bfa" />, label: 'Total Reviews', value: stats.total, unit: '', color: '#7c3aed', bg: 'linear-gradient(135deg, #13101f, #1a1030)' },
    { icon: <Star size={22} color="#f59e0b" />, label: 'Avg Score', value: stats.avgScore, unit: '/10', color: '#f59e0b', bg: 'linear-gradient(135deg, #131008, #1f1810)' },
    { icon: <CheckCircle size={22} color="#22c55e" />, label: 'Completed', value: stats.total, unit: '', color: '#22c55e', bg: 'linear-gradient(135deg, #081308, #0d1f14)' },
    { icon: <Shield size={22} color="#06b6d4" />, label: 'Repos Watched', value: new Set(reviews.map(r => r.repo)).size, unit: '', color: '#06b6d4', bg: 'linear-gradient(135deg, #080f13, #0d1a1f)' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', position: 'relative' }}>
      <Particles />
      <div style={{ position: 'fixed', top: -200, left: -200, width: 600, height: 600, background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: -200, right: -200, width: 600, height: 600, background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ borderBottom: '1px solid #1a1a2e', padding: '18px 48px', display: 'flex', alignItems: 'center', gap: 14, backdropFilter: 'blur(20px)', background: 'rgba(7,7,15,0.8)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
            <Zap size={20} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Code Reviewer</div>
            <div style={{ fontSize: 11, color: '#4b4b6b' }}>Powered by Gemini AI</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, background: '#0d1f14', border: '1px solid #22c55e33', borderRadius: 999, padding: '6px 14px' }}>
            <div style={{ width: 7, height: 7, background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 6px #22c55e' }} />
            <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 500 }}>Bot Active</span>
          </div>
        </div>

        <div style={{ padding: '48px', maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ marginBottom: 48, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
            <div style={{ fontSize: 13, color: '#7c3aed', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Dashboard</div>
            <h1 style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.1, marginBottom: 12, background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Every PR.<br />Reviewed by AI.
            </h1>
            <p style={{ fontSize: 16, color: '#4b4b6b', maxWidth: 480 }}>Automatically reviews code quality, catches bugs, and posts feedback the moment a pull request is opened.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48 }}>
            {statCards.map((stat, i) => (
              <div key={i} style={{ background: stat.bg, border: '1px solid #2a2a3a', borderRadius: 20, padding: 24, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: `all 0.5s ease ${i * 0.1}s` }}>
                <div style={{ marginBottom: 16, width: 44, height: 44, background: '#ffffff08', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stat.icon}</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: stat.color, lineHeight: 1 }}>
                  {mounted ? <AnimatedNumber value={stat.value} /> : 0}{stat.unit}
                </div>
                <div style={{ fontSize: 13, color: '#4b4b6b', marginTop: 6 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {reviews.length > 1 && (
            <div style={{ background: 'linear-gradient(135deg, #13131f, #16161f)', border: '1px solid #2a2a3a', borderRadius: 20, padding: 28, marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, color: '#4b4b6b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}><TrendingUp size={13} /> Score Trend</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#f0f0ff' }}>{stats.avgScore} <span style={{ fontSize: 14, color: '#4b4b6b', fontWeight: 400 }}>avg score</span></div>
                <div style={{ fontSize: 13, color: '#22c55e', marginTop: 4 }}>↑ Improving over time</div>
              </div>
              <MiniChart scores={reviews.map(r => r.score).reverse()} />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f0f0ff' }}>Recent Reviews</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#4b4b6b' }}>
              <Activity size={13} />{stats.total} total
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#4b4b6b' }}>Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#4b4b6b' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#6b6b8b' }}>No reviews yet</div>
              <div style={{ fontSize: 14 }}>Open a PR on a watched repo to get your first review!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {reviews.map((review, i) => <ReviewCard key={review._id} review={review} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}