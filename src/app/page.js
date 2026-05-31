'use client';
import { useState, useEffect, useRef } from 'react';
import { GitPullRequest, Star, CheckCircle, Zap, TrendingUp, Shield, Activity, LogOut } from 'lucide-react';

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
  useEffect(() => { setTimeout(() => setProgress((score / 10) * circumference), 300); }, [score]);
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
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124,58,237,${p.a})`; ctx.fill();
      });
      particles.forEach((p, i) => particles.slice(i + 1).forEach(q => {
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 120) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(124,58,237,${0.15 * (1 - d / 120)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }));
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />;
}

function SeverityBadges({ fullReview }) {
  if (!fullReview) return null;
  const hasCritical = fullReview.includes('🔴 CRITICAL') || fullReview.includes('CRITICAL:');
  const hasWarning = fullReview.includes('🟡 WARNING') || fullReview.includes('WARNING:');
  const securityClean = fullReview.includes('No security issues detected');
  const hasSecurityIssue = fullReview.includes('Security Analysis') && !securityClean;
  return (
    <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {hasCritical && <span style={{ fontSize: 11, background: '#2d0a0a', border: '1px solid #ef444433', borderRadius: 999, padding: '3px 10px', color: '#ef4444' }}>🔴 Critical Issues</span>}
      {hasWarning && <span style={{ fontSize: 11, background: '#2d1f0a', border: '1px solid #f59e0b33', borderRadius: 999, padding: '3px 10px', color: '#f59e0b' }}>🟡 Warnings</span>}
      {securityClean && <span style={{ fontSize: 11, background: '#0a1a2d', border: '1px solid #06b6d433', borderRadius: 999, padding: '3px 10px', color: '#06b6d4' }}>🛡️ Security Clean</span>}
      {hasSecurityIssue && <span style={{ fontSize: 11, background: '#2d0a1a', border: '1px solid #ec489933', borderRadius: 999, padding: '3px 10px', color: '#ec4899' }}>⚠️ Security Issue</span>}
    </div>
  );
}

function ReviewCard({ review, index }) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), index * 150); }, []);
  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };
  return (
    <div style={{ background: 'linear-gradient(135deg, #13131f 0%, #16161f 100%)', border: '1px solid #2a2a3a', borderRadius: 20, padding: 28, transform: visible ? 'translateY(0)' : 'translateY(30px)', opacity: visible ? 1 : 0, transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(124,58,237,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a3a'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, #7c3aed44, transparent)' }} />
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
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
          <SeverityBadges fullReview={review.full_review} />
          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, background: '#1a1a2e', border: '1px solid #2a2a3a', borderRadius: 999, padding: '4px 12px', color: '#6b6b8b' }}>{review.files_reviewed} file{review.files_reviewed > 1 ? 's' : ''} reviewed</span>
            <span style={{ fontSize: 11, background: '#0d1f14', border: '1px solid #22c55e33', borderRadius: 999, padding: '4px 12px', color: '#22c55e' }}>✓ Completed</span>
            <span style={{ fontSize: 11, background: '#1e1030', border: '1px solid #7c3aed44', borderRadius: 999, padding: '4px 12px', color: '#a78bfa' }}>🤖 AI Reviewed</span>
            {review.pr_url && <a href={review.pr_url} target="_blank" rel="noreferrer" style={{ fontSize: 11, background: '#1a1a2e', border: '1px solid #2a2a3a', borderRadius: 999, padding: '4px 12px', color: '#6b6b8b', textDecoration: 'none', marginLeft: 'auto' }}>View PR →</a>}
          </div>
          {review.full_review && (
            <div style={{ marginTop: 12 }}>
              <button onClick={() => setExpanded(!expanded)} style={{ fontSize: 12, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {expanded ? '▲ Hide full review' : '▼ Show full review'}
              </button>
              {expanded && (
                <div style={{ marginTop: 12, background: '#0d0d1a', border: '1px solid #2a2a3a', borderRadius: 12, padding: 16, fontSize: 12, color: '#8b8b9e', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {review.full_review.replace(/## /g, '\n## ').replace(/\*\*/g, '')}
                </div>
              )}
            </div>
          )}
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
      {scores.map((s, i) => <circle key={i} cx={(i / (scores.length - 1)) * w} cy={h - (s / max) * h} r="3" fill="#7c3aed" />)}
    </svg>
  );
}

function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#07070f', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Particles />
      <div style={{ position: 'fixed', top: -200, left: -200, width: 600, height: 600, background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 600, padding: '0 24px' }}>
        <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 40px rgba(124,58,237,0.4)' }}>
          <Zap size={32} color="white" />
        </div>
        <div style={{ fontSize: 13, color: '#7c3aed', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>AI Code Reviewer</div>
        <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1, marginBottom: 20, background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Every PR.<br />Reviewed by AI.
        </h1>
        <p style={{ fontSize: 18, color: '#4b4b6b', marginBottom: 40, lineHeight: 1.6 }}>
          Automatically reviews code quality, detects security vulnerabilities, and posts feedback the moment a pull request is opened.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 48, flexWrap: 'wrap' }}>
          {['🔴 Critical Issues', '🟡 Warnings', '🛡️ Security Scan', '📊 Quality Score'].map((f, i) => (
            <span key={i} style={{ fontSize: 12, background: '#13131f', border: '1px solid #2a2a3a', borderRadius: 999, padding: '6px 14px', color: '#6b6b8b' }}>{f}</span>
          ))}
        </div>
        <a href={`${BACKEND_URL}/auth/github`} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white', textDecoration: 'none', padding: '14px 32px', borderRadius: 999, fontSize: 16, fontWeight: 600, boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
          Continue with GitHub
        </a>
        <div style={{ marginTop: 20, fontSize: 13, color: '#3b3b5b' }}>Free forever · No credit card required</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, avgScore: 0 });
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const loginParam = params.get('login');
    const userParam = params.get('user');
    if (loginParam === 'success' && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        window.history.replaceState({}, '', '/');
      } catch (e) {}
    } else {
      const savedUser = localStorage.getItem('user');
      if (savedUser) setUser(JSON.parse(savedUser));
    }

    fetch(`${BACKEND_URL}/reviews`)
      .then(r => r.json())
      .then(data => {
        setReviews(data.reviews || []);
        setStats({ total: data.total || 0, avgScore: parseFloat(data.avgScore) || 0 });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) return <LandingPage />;

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
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header with nav */}
        <div style={{ borderBottom: '1px solid #1a1a2e', padding: '18px 48px', display: 'flex', alignItems: 'center', gap: 14, backdropFilter: 'blur(20px)', background: 'rgba(7,7,15,0.8)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
            <Zap size={20} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, background: 'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Code Reviewer</div>
            <div style={{ fontSize: 11, color: '#4b4b6b' }}>Powered by Gemini AI</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {[
                { href: '/', label: 'Dashboard' },
                { href: '/reviews', label: 'Reviews' },
                { href: '/stats', label: 'Stats' },
                { href: '/settings', label: 'Settings' },
              ].map(link => (
                <a key={link.href} href={link.href} style={{ fontSize: 13, color: '#6b6b8b', textDecoration: 'none', padding: '6px 12px', borderRadius: 8 }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#f0f0ff'; e.currentTarget.style.background = '#1a1a2e'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#6b6b8b'; e.currentTarget.style.background = 'none'; }}>
                  {link.label}
                </a>
              ))}
            </nav>
            <div style={{ width: 1, height: 20, background: '#2a2a3a' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0d1f14', border: '1px solid #22c55e33', borderRadius: 999, padding: '6px 14px' }}>
              <div style={{ width: 7, height: 7, background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 6px #22c55e' }} />
              <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 500 }}>Bot Active</span>
            </div>
            {user.avatar && <img src={user.avatar} alt={user.username} style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #7c3aed' }} />}
            <span style={{ fontSize: 13, color: '#8b8b9e' }}>@{user.username}</span>
            <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #2a2a3a', borderRadius: 999, padding: '6px 12px', color: '#6b6b8b', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>

        <div style={{ padding: '48px', maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ marginBottom: 48, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
            <div style={{ fontSize: 13, color: '#7c3aed', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Dashboard</div>
            <h1 style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.1, marginBottom: 12, background: 'linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Welcome back,<br />{user.username}! 👋
            </h1>
            <p style={{ fontSize: 16, color: '#4b4b6b', maxWidth: 480 }}>Your AI-powered code review dashboard. Every PR reviewed automatically.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48 }}>
            {statCards.map((stat, i) => (
              <div key={i} style={{ background: stat.bg, border: '1px solid #2a2a3a', borderRadius: 20, padding: 24, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: `all 0.5s ease ${i * 0.1}s` }}>
                <div style={{ marginBottom: 16, width: 44, height: 44, background: '#ffffff08', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stat.icon}</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{mounted ? <AnimatedNumber value={stat.value} /> : 0}{stat.unit}</div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#4b4b6b' }}><Activity size={13} />{stats.total} total</div>
              <a href="/reviews" style={{ fontSize: 13, color: '#7c3aed', textDecoration: 'none', background: '#1e1030', border: '1px solid #7c3aed44', borderRadius: 999, padding: '6px 14px' }}>View all →</a>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#4b4b6b' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
              <div>Loading reviews...</div>
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#4b4b6b' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#6b6b8b' }}>No reviews yet</div>
              <div style={{ fontSize: 14 }}>Open a PR on a watched repo to get your first review!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {reviews.slice(0, 5).map((review, i) => <ReviewCard key={review._id} review={review} index={i} />)}
              {reviews.length > 5 && (
                <a href="/reviews" style={{ textAlign: 'center', padding: '16px', color: '#7c3aed', textDecoration: 'none', background: '#1e1030', border: '1px solid #7c3aed44', borderRadius: 16, fontSize: 14 }}>
                  View all {stats.total} reviews →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}