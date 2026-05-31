'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Award, AlertTriangle, Shield } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const BACKEND_URL = 'https://ai-code-reviewer-backend-cym0.onrender.com';

export default function StatsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/reviews`)
      .then(r => r.json())
      .then(data => { setReviews(data.reviews || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#07070f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b4b6b', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div><div>Loading stats...</div></div>
    </div>
  );

  const avgScore = reviews.length ? (reviews.reduce((a, b) => a + b.score, 0) / reviews.length).toFixed(1) : 0;
  const criticalCount = reviews.filter(r => r.full_review?.includes('CRITICAL')).length;
  const securityCleanCount = reviews.filter(r => r.full_review?.includes('No security issues detected')).length;
  const securityIssueCount = reviews.length - securityCleanCount;

  const scoreData = [...reviews].reverse().map((r, i) => ({
    name: `PR #${r.pr_number}`,
    score: r.score,
    date: new Date(r.created_at).toLocaleDateString()
  }));

  const scoreDistribution = [
    { name: '9-10', value: reviews.filter(r => r.score >= 9).length, color: '#22c55e' },
    { name: '7-8', value: reviews.filter(r => r.score >= 7 && r.score < 9).length, color: '#f59e0b' },
    { name: '5-6', value: reviews.filter(r => r.score >= 5 && r.score < 7).length, color: '#ef4444' },
    { name: '0-4', value: reviews.filter(r => r.score < 5).length, color: '#7f1d1d' },
  ].filter(d => d.value > 0);

  const repoData = Object.entries(reviews.reduce((acc, r) => {
    acc[r.repo] = (acc[r.repo] || 0) + 1;
    return acc;
  }, {})).map(([repo, count]) => ({ repo: repo.split('/')[1], count }));

  const statCards = [
    { icon: '📊', label: 'Total Reviews', value: reviews.length, color: '#7c3aed' },
    { icon: '⭐', label: 'Avg Score', value: `${avgScore}/10`, color: '#f59e0b' },
    { icon: '🔴', label: 'Critical Issues', value: criticalCount, color: '#ef4444' },
    { icon: '🛡️', label: 'Security Clean', value: securityCleanCount, color: '#06b6d4' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: '#fff' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1a1a2e', padding: '18px 48px', display: 'flex', alignItems: 'center', gap: 14, backdropFilter: 'blur(20px)', background: 'rgba(7,7,15,0.8)', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b6b8b', textDecoration: 'none', fontSize: 13 }}>
          <ArrowLeft size={14} /> Back
        </Link>
        <div style={{ width: 1, height: 20, background: '#2a2a3a' }} />
        <div style={{ fontSize: 16, fontWeight: 700, background: 'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Statistics</div>
      </div>

      <div style={{ padding: '40px 48px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 13, color: '#7c3aed', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Analytics</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, background: 'linear-gradient(135deg, #ffffff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>Code Quality Insights</h1>
          <p style={{ fontSize: 15, color: '#4b4b6b' }}>Track your code quality trends over time</p>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {statCards.map((s, i) => (
            <div key={i} style={{ background: '#13131f', border: '1px solid #2a2a3a', borderRadius: 20, padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#4b4b6b', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Score over time chart */}
        {scoreData.length > 1 && (
          <div style={{ background: '#13131f', border: '1px solid #2a2a3a', borderRadius: 20, padding: 28, marginBottom: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={16} color="#7c3aed" /> Score Over Time
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                <XAxis dataKey="name" stroke="#4b4b6b" fontSize={11} />
                <YAxis domain={[0, 10]} stroke="#4b4b6b" fontSize={11} />
                <Tooltip contentStyle={{ background: '#13131f', border: '1px solid #2a2a3a', borderRadius: 8, color: '#fff' }} />
                <Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Score distribution */}
          {scoreDistribution.length > 0 && (
            <div style={{ background: '#13131f', border: '1px solid #2a2a3a', borderRadius: 20, padding: 28 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={16} color="#f59e0b" /> Score Distribution
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={scoreDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {scoreDistribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#13131f', border: '1px solid #2a2a3a', borderRadius: 8, color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Reviews per repo */}
          {repoData.length > 0 && (
            <div style={{ background: '#13131f', border: '1px solid #2a2a3a', borderRadius: 20, padding: 28 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={16} color="#06b6d4" /> Reviews per Repo
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={repoData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
                  <XAxis dataKey="repo" stroke="#4b4b6b" fontSize={11} />
                  <YAxis stroke="#4b4b6b" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#13131f', border: '1px solid #2a2a3a', borderRadius: 8, color: '#fff' }} />
                  <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Security summary */}
        <div style={{ background: 'linear-gradient(135deg, #080f13, #0d1a1f)', border: '1px solid #06b6d433', borderRadius: 20, padding: 28 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={16} color="#06b6d4" /> Security Overview
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#0d1f14', border: '1px solid #22c55e33', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#22c55e' }}>{securityCleanCount}</div>
              <div style={{ fontSize: 13, color: '#4b4b6b', marginTop: 4 }}>🛡️ Security Clean PRs</div>
            </div>
            <div style={{ background: '#2d0a1a', border: '1px solid #ec489933', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#ec4899' }}>{securityIssueCount}</div>
              <div style={{ fontSize: 13, color: '#4b4b6b', marginTop: 4 }}>⚠️ Security Issues Found</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}