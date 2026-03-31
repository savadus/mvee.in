'use client';

import { useStore, Invoice } from '@/lib/store';
import { Plus, Search, FileText, Trash2, Edit2, ExternalLink, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function InvoicesPage() {
  const { invoices, clients, deleteInvoice, updateInvoice } = useStore();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const filteredInvoices = invoices.filter(inv => {
    const clientName = clients.find(c => c.id === inv.clientId)?.name.toLowerCase() || '';
    return inv.id.toLowerCase().includes(searchTerm.toLowerCase()) || clientName.includes(searchTerm.toLowerCase());
  });

  const toggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
    updateInvoice(id, { status: nextStatus as any });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Invoices</h1>
          <p className="text-muted">Track and manage your client billing.</p>
        </div>
        <Link 
          href="/invoices/new" 
          className="btn-primary" 
          style={{ 
            padding: '12px',
            minWidth: '45px',
            height: '45px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Plus size={22} strokeWidth={3} />
          <span className="hide-mobile" style={{ marginLeft: '4px', fontWeight: 'bold', paddingRight: '4px' }}>Create New Invoice</span>
        </Link>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--foreground-muted)' }} />
            <input 
              placeholder="Search invoice or client..." 
              style={{ paddingLeft: '48px', background: 'rgba(255,255,255,0.05)', border: 'none' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoice</th>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client</th>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.8rem', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '60px', textAlign: 'center' }} className="text-muted">No invoices found.</td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="table-row" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <Link href={`/invoices/${inv.id}`} className="font-bold" style={{ color: 'var(--primary)' }}>{inv.id}</Link>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <p className="font-semibold">{clients.find(c => c.id === inv.clientId)?.name || 'Unknown Client'}</p>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <p className="text-sm text-muted">{inv.date}</p>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <p className="font-bold">₹{inv.amount.toLocaleString()}</p>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <button 
                        onClick={() => toggleStatus(inv.id, inv.status)}
                        className="text-sm font-bold" 
                        style={{ 
                          padding: '6px 12px', 
                          borderRadius: '8px', 
                          background: inv.status === 'Paid' ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 59, 48, 0.15)',
                          color: inv.status === 'Paid' ? 'var(--success)' : 'var(--error)',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {inv.status}
                      </button>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div className="flex gap-2 justify-end">
                        <Link href={`/invoices/${inv.id}`} className="btn-outline" style={{ padding: '6px' }} title="Preview">
                          <ExternalLink size={16} />
                        </Link>
                        <button className="btn-outline" style={{ padding: '6px', color: 'var(--error)' }} onClick={() => deleteInvoice(inv.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
