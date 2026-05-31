'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, GitPullRequest, ExternalLink, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

const BACKEND_URL = 'https://ai-code-reviewer-backend-cym0.onrender.com';

function ScoreRing({ score, size = 120 }) {
  const [progress, setProgress] = useState(0);
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const color = score >= 8 ? '#22c55e' : score >= 6 ? '#f59e0b' : '#ef4444';
  useEffect(() => { setTimeout(() => setProgress((score / 10) * circumference), 300); }, [score]);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', filter: `drop-shadow(0 0 12px ${color}66)` }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1e1e2e" strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${progress} ${circumference}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: size * 0.11, color: '#4b4b6b' }}>/10</span>
      </div>
    </div>
  );
}

function ReviewSection({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return <div key={i} style={{ fontSize: 16, fontWeight: 700, color: '#f0f0ff', marginTop: 20, marginBottom: 8, borderBottom: '1px solid #2a2a3a', paddingBottom: 8 }}>{line.replace('## ', '')}</div>;
        }
        if (line.includes('🔴 CRITICAL') || line.includes('CRITICAL:')) {
          return <div key={i} style={{ background: '#2d0a0a', border: '1px solid #ef444433', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#ef4444', marginBottom: 4 }}>{line}</div>;
        }
        if (line.includes('🟡 WARNING') || line.includes('WARNING:')) {
          return <div key={i} style={{ background: '#2d1f0a', border: '1px solid #f59e0b33', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#f59e0b', marginBottom: 4 }}>{line}</div>;
        }
        if (line.includes('🟢 INFO') || line.includes('INFO:')) {
          return <div key={i} style={{ background: '#0d1f14', border: '1px solid #22c55e33', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#22c55e', marginBottom: 4 }}>{line}</div>;
        }
        if (line.trim() === '' || line.trim() === '---') return <div key={i} style={{ height: 8 }} />;
        return <div key={i} style={{ fontSize: 13, color: '#8b8b9e', lineHeight: 1.7 }}>{line}</div>;
      })}
    </div>
  );
}

export default function ReviewDetail({ params }) {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/reviews/${params.id}`)
      .then(r => r.json())
      .then(data => { setReview(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#07070f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b4b6b', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
        <div>Loading review...</div>
      </div>
    </div>
  );

  if (!review) return (
    <div style={{ minHeight: '100vh', background: '#07070f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b4b6b', fontFamily: 'system-ui' }}>
      Review not found
    </div>
  );

  const scoreColor = review.score >= 8 ? '#22c55e' : review.score >= 6 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: '#fff' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1a1a2e', padding: '18px 48px', display: 'flex', alignItems: 'center', gap: 14, backdropFilter: 'blur(20px)', background: 'rgba(7,7,15,0.8)', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="/reviews" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b6b8b', textDecoration: 'none', fontSize: 13 }}>
          <ArrowLeft size={14} /> All Reviews
        </Link>
        <div style={{ width: 1, height: 20, background: '#2a2a3a' }} />
        <div style={{ fontSize: 14, color: '#6b6b8b' }}>{review.repo} #{review.pr_number}</div>
      </div>

      <div style={{ padding: '40px 48px', maxWidth: 900, margin: '0 auto' }}>
        {/* Hero section */}
        <div style={{ background: 'linear-gradient(135deg, #13131f, #16161f)', border: '1px solid #2a2a3a', borderRadius: 24, padding: 36, marginBottom: 24, display: 'flex', gap: 32, alignItems: 'center' }}>
          <ScoreRing score={review.score} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <GitPullRequest size={14} color="#a78bfa" />
              <span style={{ fontSize: 12, color: '#a78bfa' }}>{review.repo} #{review.pr_number}</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f0f0ff', marginBottom: 12, lineHeight: 1.3 }}>{review.pr_title}</h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {review.full_review?.includes('CRITICAL') && <span style={{ fontSize: 12, background: '#2d0a0a', border: '1px solid #ef444433', borderRadius: 999, padding: '4px 12px', color: '#ef4444' }}>🔴 Critical Issues</span>}
              {review.full_review?.includes('WARNING') && <span style={{ fontSize: 12, background: '#2d1f0a', border: '1px solid #f59e0b33', borderRadius: 999, padding: '4px 12px', color: '#f59e0b' }}>🟡 Warnings</span>}
              {review.full_review?.includes('No security issues detected') && <span style={{ fontSize: 12, background: '#0a1a2d', border: '1px solid #06b6d433', borderRadius: 999, padding: '4px 12px', color: '#06b6d4' }}>🛡️ Security Clean</span>}
              <span style={{ fontSize: 12, background: '#1a1a2e', border: '1px solid #2a2a3a', borderRadius: 999, padding: '4px 12px', color: '#6b6b8b' }}>{review.files_reviewed} file{review.files_reviewed > 1 ? 's' : ''} reviewed</span>
            </div>
            {review.pr_url && (
              <a href={review.pr_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#7c3aed', textDecoration: 'none', background: '#1e1030', border: '1px solid #7c3aed44', borderRadius: 999, padding: '6px 14px' }}>
                <ExternalLink size={12} /> View on GitHub
              </a>
            )}
          </div>
        </div>

        {/* Full Review */}
        <div style={{ background: '#13131f', border: '1px solid #2a2a3a', borderRadius: 20, padding: 32 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0ff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            🤖 Full AI Review
          </div>
          <ReviewSection content={review.full_review} />
        </div>
      </div>
    </div>
  );
}