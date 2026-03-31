'use client';

import { useStore, Client } from '@/lib/store';
import { Plus, Search, Mail, Phone, MapPin, Tag, Trash2, Edit2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient } = useStore();
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    tags: [] as string[],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateClient(editingClient.id, formData);
    } else {
      addClient(formData);
    }
    setShowModal(false);
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', address: '', tags: [] });
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      tags: client.tags,
    });
    setShowModal(true);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Clients</h1>
          <p className="text-muted">Manage your customer relationships and contact details.</p>
        </div>
        <button 
          type="button" 
          className="btn-primary" 
          onClick={() => { setShowModal(true); setEditingClient(null); }}
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
          <span className="hide-mobile" style={{ marginLeft: '4px', fontWeight: 'bold', paddingRight: '4px' }}>Add Client</span>
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--foreground-muted)' }} />
            <input 
              placeholder="Search clients..." 
              style={{ paddingLeft: '48px', background: 'rgba(255,255,255,0.05)', border: 'none' }} 
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client</th>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</th>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Address</th>
                <th style={{ padding: '16px 24px', fontSize: '0.8rem', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tags</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.8rem', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '60px', textAlign: 'center' }} className="text-muted">No clients found.</td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <p className="font-bold">{client.name}</p>
                      <p className="text-sm text-muted">#{client.id}</p>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <p className="text-sm">{client.email}</p>
                      <p className="text-sm text-muted">{client.phone}</p>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <p className="text-sm text-muted">{client.address}</p>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div className="flex flex-wrap gap-1">
                        {client.tags.map((tag, i) => (
                          <span key={i} className="text-sm font-bold" style={{ padding: '2px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.7rem' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div className="flex gap-2 justify-end">
                        <button className="btn-outline" style={{ padding: '6px' }} onClick={() => handleEdit(client)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-outline" style={{ padding: '6px', color: 'var(--error)' }} onClick={() => deleteClient(client.id)}>
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

      {/* Modal / Sidebar Drawer (Simplified for MVP) */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 1000
        }} onClick={() => setShowModal(false)}>
          <div className="card" style={{ width: '400px', maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold" style={{ marginBottom: '24px' }}>{editingClient ? 'Edit Client' : 'Add New Client'}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-muted">Full Name</label>
                <input 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-muted">Email Address (Optional)</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-muted">Phone Number (Optional)</label>
                <input 
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-muted">Address (Optional)</label>
                <textarea 
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="flex gap-2" style={{ marginTop: '12px' }}>
                <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editingClient ? 'Update' : 'Save Client'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
