'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, Github, Bell, Shield, Zap, Check, Copy } from 'lucide-react';
import Link from 'next/link';

const BACKEND_URL = 'https://ai-code-reviewer-backend-cym0.onrender.com';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(`${BACKEND_URL}/webhook`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#07070f', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: '#fff' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1a1a2e', padding: '18px 48px', display: 'flex', alignItems: 'center', gap: 14, backdropFilter: 'blur(20px)', background: 'rgba(7,7,15,0.8)', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b6b8b', textDecoration: 'none', fontSize: 13 }}>
          <ArrowLeft size={14} /> Back
        </Link>
        <div style={{ width: 1, height: 20, background: '#2a2a3a' }} />
        <div style={{ fontSize: 16, fontWeight: 700, background: 'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Settings</div>
      </div>

      <div style={{ padding: '40px 48px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 13, color: '#7c3aed', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Configuration</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, background: 'linear-gradient(135deg, #ffffff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Settings</h1>
        </div>

        {/* Profile */}
        {user && (
          <div style={{ background: '#13131f', border: '1px solid #2a2a3a', borderRadius: 20, padding: 28, marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Github size={16} color="#a78bfa" /> GitHub Account
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {user.avatar && <img src={user.avatar} alt={user.username} style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid #7c3aed' }} />}
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#f0f0ff' }}>@{user.username}</div>
                <div style={{ fontSize: 13, color: '#4b4b6b', marginTop: 4 }}>Connected via GitHub OAuth</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: '#0d1f14', border: '1px solid #22c55e33', borderRadius: 999, padding: '6px 14px' }}>
                <div style={{ width: 6, height: 6, background: '#22c55e', borderRadius: '50%' }} />
                <span style={{ fontSize: 12, color: '#22c55e' }}>Connected</span>
              </div>
            </div>
          </div>
        )}

        {/* Webhook URL */}
        <div style={{ background: '#13131f', border: '1px solid #2a2a3a', borderRadius: 20, padding: 28, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={16} color="#7c3aed" /> Webhook URL
          </div>
          <div style={{ fontSize: 13, color: '#4b4b6b', marginBottom: 16 }}>Add this URL to your GitHub App or repo webhook settings to start receiving reviews.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0d0d1a', border: '1px solid #2a2a3a', borderRadius: 12, padding: '12px 16px' }}>
            <code style={{ flex: 1, fontSize: 13, color: '#a78bfa' }}>{BACKEND_URL}/webhook</code>
            <button onClick={copyWebhookUrl} style={{ background: copied ? '#0d1f14' : '#1e1030', border: `1px solid ${copied ? '#22c55e33' : '#7c3aed44'}`, borderRadius: 8, padding: '6px 12px', color: copied ? '#22c55e' : '#a78bfa', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
        </div>

        {/* How to connect a repo */}
        <div style={{ background: '#13131f', border: '1px solid #2a2a3a', borderRadius: 20, padding: 28, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Github size={16} color="#a78bfa" /> How to Connect a Repo
          </div>
          {[
            { step: '1', text: 'Go to your GitHub repo → Settings → Webhooks' },
            { step: '2', text: 'Click "Add webhook"' },
            { step: '3', text: 'Paste the webhook URL above' },
            { step: '4', text: 'Set Content type to "application/json"' },
            { step: '5', text: 'Select "Pull requests" under events' },
            { step: '6', text: 'Click "Add webhook" — done!' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
              <div style={{ width: 26, height: 26, background: '#1e1030', border: '1px solid #7c3aed44', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#a78bfa', flexShrink: 0 }}>{item.step}</div>
              <div style={{ fontSize: 14, color: '#8b8b9e', paddingTop: 3 }}>{item.text}</div>
            </div>
          ))}
        </div>

        {/* Review settings */}
        <div style={{ background: '#13131f', border: '1px solid #2a2a3a', borderRadius: 20, padding: 28 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={16} color="#06b6d4" /> Review Features
          </div>
          {[
            { label: 'Code Quality Score', desc: 'Rate every PR from 1-10', enabled: true, color: '#22c55e' },
            { label: 'Severity Classification', desc: 'Tag issues as Critical, Warning, or Info', enabled: true, color: '#22c55e' },
            { label: 'Security Analysis', desc: 'Detect vulnerabilities and security issues', enabled: true, color: '#22c55e' },
            { label: 'Auto PR Comments', desc: 'Post review as a comment on the PR', enabled: true, color: '#22c55e' },
            { label: 'Email Notifications', desc: 'Get notified when critical issues are found', enabled: false, color: '#4b4b6b' },
          ].map((feature, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < 4 ? '1px solid #1a1a2e' : 'none' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0ff', marginBottom: 3 }}>{feature.label}</div>
                <div style={{ fontSize: 12, color: '#4b4b6b' }}>{feature.desc}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: feature.color }}>
                {feature.enabled ? <><Check size={14} /> Active</> : 'Coming soon'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}