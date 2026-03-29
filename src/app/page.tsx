'use client';

import { useStore } from '@/lib/store';
import { CreditCard, Users, Clock, CheckCircle2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const { invoices, clients } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalEarnings = invoices
    .filter((i) => i.status === 'Paid')
    .reduce((sum, i) => sum + i.amount, 0);

  const pendingAmount = invoices
    .filter((i) => i.status === 'Pending')
    .reduce((sum, i) => sum + i.amount, 0);

  const stats = [
    { title: 'Total Paid', value: `₹${totalEarnings.toLocaleString()}`, icon: <CheckCircle2 size={24} />, color: 'var(--success)' },
    { title: 'Pending', value: `₹${pendingAmount.toLocaleString()}`, icon: <Clock size={24} />, color: 'var(--error)' },
    { title: 'Total Clients', value: clients.length, icon: <Users size={24} />, color: 'var(--primary)' },
    { title: 'Invoices Issued', value: invoices.length, icon: <CreditCard size={24} />, color: '#fff' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '48px' }}>
        <div>
          <h1 className="font-bold" style={{ fontSize: '2.5rem', letterSpacing: '-0.03em' }}>Dashboard</h1>
          <p className="text-muted">Welcome back. Here's your studio's overview.</p>
        </div>
        <Link href="/invoices/new" className="btn-primary" style={{ padding: '16px 32px', fontSize: '1rem', borderRadius: '18px' }}>
          <Plus size={22} strokeWidth={2.5} /> Create Invoice
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="responsive-grid" style={{ marginBottom: '48px' }}>
        {stats.map((stat, i) => (
          <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: i === 0 ? 'rgba(52, 199, 89, 0.1)' : 'var(--glass)' }}>
            <div style={{ padding: '10px', background: `${stat.color}15`, borderRadius: '12px', color: stat.color, width: 'fit-content' }}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground-muted)', marginBottom: '4px' }}>{stat.title}</p>
              <h3 className="font-bold" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        {/* Recent Invoices */}
        <div className="card">
          <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
            <h3 className="font-bold" style={{ fontSize: '1.25rem' }}>Recent Invoices</h3>
            <Link href="/invoices" className="text-sm font-bold" style={{ color: 'var(--primary)' }}>See All</Link>
          </div>
          {invoices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
               <p className="text-muted">No business activity yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {invoices.slice(0, 5).map((inv) => (
                <Link href={`/invoices/${inv.id}`} key={inv.id} className="flex justify-between items-center" style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                  <div>
                    <h4 className="font-bold">{inv.id}</h4>
                    <p className="text-sm text-muted">{clients.find(c => c.id === inv.clientId)?.name || 'Guest'}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="font-bold">₹{inv.amount.toLocaleString()}</p>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: inv.status === 'Paid' ? 'var(--success)' : 'var(--error)',
                      boxShadow: `0 0 10px ${inv.status === 'Paid' ? 'var(--success)' : 'var(--error)'}`
                    }}></div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions / Info */}
        <div className="flex flex-col gap-8">
          <div className="card" style={{ background: 'linear-gradient(135deg, #007aff, #00c6ff)', color: 'white', border: 'none' }}>
            <h3 className="font-bold" style={{ marginBottom: '12px' }}>Design Tip</h3>
            <p className="text-sm" style={{ opacity: 0.9, lineHeight: '1.6' }}>Sharing invoices via WhatsApp increases payment speed by an average of 42%.</p>
          </div>
          <div className="card">
            <h3 className="font-bold" style={{ marginBottom: '16px' }}>Status Tags</h3>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-bold" style={{ padding: '6px 14px', borderRadius: '10px', background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>Monthly</span>
              <span className="text-sm font-bold" style={{ padding: '6px 14px', borderRadius: '10px', background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>Annual</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
