'use client';

import { useStore, InvoiceItem, Invoice } from '@/lib/store';
import { Plus, Trash2, Calendar, FileText, UserPlus, Save, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewInvoice() {
  const router = useRouter();
  const { clients, addInvoice, addClient, settings } = useStore();
  const [mounted, setMounted] = useState(false);
  const [clientId, setClientId] = useState('');
  const [isQuickAdd, setIsQuickAdd] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [date, setDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [discount, setDiscount] = useState(0);
  const [upiId, setUpiId] = useState('');
  const [items, setItems] = useState<Omit<InvoiceItem, 'id'>[]>([
    { description: '', quantity: 1, price: 0 }
  ]);

  useEffect(() => {
    setMounted(true);
    setUpiId(settings.upiId || 'yourname@upi');
    
    // Set today's date
    const today = new Date();
    setDate(today.toISOString().split('T')[0]);
    
    // Set default due date to 1 week from now
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    setDueDate(nextWeek.toISOString().split('T')[0]);
  }, []);

  // Sync the newly added client (Zustand will update clients list)
  useEffect(() => {
    if (!isQuickAdd && mounted && clients.length > 0) {
      // Find the last added client (hack for MVP)
      const lastClient = clients[clients.length - 1];
      if (lastClient) setClientId(lastClient.id);
    }
  }, [clients, isQuickAdd, mounted]);

  if (!mounted) return null;

  const handleQuickAddClient = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newClientName.trim()) return;
    
    addClient({
      name: newClientName,
      email: '',
      phone: '',
      address: '',
      tags: ['New']
    });
    
    setIsQuickAdd(false);
    setNewClientName('');
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof Omit<InvoiceItem, 'id'>, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - discount;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      alert('Please select a client');
      return;
    }
    
    const invoiceItems: InvoiceItem[] = items.map(item => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
    }));

    addInvoice({
      clientId,
      amount: calculateTotal(),
      status: 'Pending',
      date,
      dueDate,
      discount,
      items: invoiceItems,
      upiId,
    });
    
    router.push('/invoices');
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="flex items-center gap-4" style={{ marginBottom: '24px' }}>
        <Link href="/invoices" className="btn-outline" style={{ padding: '8px' }}>
          <ArrowLeft size={18} />
        </Link>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Create New Invoice</h1>
      </div>

      <form onSubmit={handleSave}>
        <div className="card flex flex-col gap-8">
          {/* Header Info */}
          <div className="grid-3">
            <div>
              <label className="text-sm text-muted mb-1 block">Select Client</label>
              <div className="flex gap-2">
                <select 
                  required 
                  value={clientId} 
                  onChange={e => setClientId(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">Choose a client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button type="button" onClick={() => setIsQuickAdd(true)} className="btn-outline" style={{ padding: '8px' }} title="Add New Client">
                  <UserPlus size={18} />
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Invoice Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--foreground-muted)' }} />
                <input 
                  type="date" 
                  required 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Due Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--foreground-muted)' }} />
                <input 
                  type="date" 
                  required 
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="responsive-grid" style={{ gap: '24px' }}>
            <div>
              <label className="text-sm text-muted mb-1 block">UPI ID for Payment</label>
              <input 
                placeholder="design@okaxis" 
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

          {/* Items Section */}
          <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
              <h3 className="font-semibold">Services / Items</h3>
              <button type="button" onClick={addItem} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <Plus size={14} /> Add Item
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {items.map((item, index) => (
                <div key={index} className="item-row animate-fade-in" style={{ position: 'relative' }}>
                  <div style={{ flex: 3 }}>
                    <label className="text-sm text-muted mb-1 block md-hidden">Description</label>
                    <input 
                      placeholder="e.g. Logo Design" 
                      required 
                      value={item.description}
                      onChange={e => updateItem(index, 'description', e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="text-sm text-muted mb-1 block md-hidden">Qty</label>
                    <input 
                      type="number" 
                      placeholder="Qty" 
                      required 
                      value={item.quantity}
                      onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div style={{ flex: 1.5 }}>
                    <label className="text-sm text-muted mb-1 block md-hidden">Price</label>
                    <input 
                      type="number" 
                      placeholder="Price" 
                      required 
                      value={item.price}
                      onChange={e => updateItem(index, 'price', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <button 
                    type="button" 
                    className="btn-outline" 
                    style={{ 
                      padding: '10px', 
                      color: 'var(--error)',
                      alignSelf: 'flex-end'
                    }}
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

          {/* Total & Summary */}
          <div style={{ alignSelf: 'flex-end', width: '300px' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
              <span className="text-muted">Subtotal</span>
              <span className="font-semibold">₹{calculateSubtotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
              <span className="text-muted">Discount (₹)</span>
              <input 
                type="number" 
                value={discount} 
                onChange={e => setDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                style={{ width: '100px', textAlign: 'right', padding: '6px 10px' }}
              />
            </div>
            <div className="flex justify-between items-center" style={{ fontSize: '1.4rem' }}>
              <span className="font-bold">Total</span>
              <span className="font-bold" style={{ color: 'var(--primary)' }}>₹{calculateTotal().toLocaleString()}</span>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ height: '48px', justifyContent: 'center' }}>
            <Save size={20} /> Generate & Save Invoice
          </button>
        </div>
      </form>

      {/* Quick Add Client Modal */}
      {isQuickAdd && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 2000
        }} onClick={() => setIsQuickAdd(false)}>
          <div className="card animate-fade-in" style={{ width: '400px', maxWidth: '95vw', padding: '32px' }} onClick={e => e.stopPropagation()}>
            <h3 className="font-bold" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Add Client</h3>
            <p className="text-sm text-muted" style={{ marginBottom: '24px' }}>Just enter the client's name to quickly create their profile.</p>
            
            <form onSubmit={handleQuickAddClient} className="flex flex-col gap-6">
              <div>
                <label className="text-sm font-semibold mb-2 block">Client Name</label>
                <input 
                  autoFocus
                  required
                  placeholder="e.g. John Doe / Apple Inc."
                  value={newClientName}
                  onChange={e => setNewClientName(e.target.value)}
                />
              </div>
              
              <div className="flex gap-3">
                <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setIsQuickAdd(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Add Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
