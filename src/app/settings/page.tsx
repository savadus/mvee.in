'use client';

import { useState, useEffect } from 'react';
import { Save, UserCircle, Briefcase, CreditCard, Bell } from 'lucide-react';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState({
    studioName: 'Your Design Studio',
    email: 'hello@yourstudio.com',
    phone: '+91 98765 43210',
    upiId: 'design@okaxis',
    currency: 'INR (₹)',
    autoReminders: false,
  });

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('billing-settings');
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  if (!mounted) return null;

  const handleSave = () => {
    localStorage.setItem('billing-settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Settings</h1>
          <p className="text-muted">Configure your studio profile and payment defaults.</p>
        </div>
        <button className="btn-primary" onClick={handleSave}>
          <Save size={20} /> Save Changes
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {/* Profile */}
        <div className="card">
          <div className="flex items-center gap-2" style={{ marginBottom: '24px' }}>
            <Briefcase size={20} className="text-primary" />
            <h3 className="font-semibold">Studio Profile</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label className="text-sm text-muted mb-1 block">Studio Name</label>
              <input 
                value={settings.studioName}
                onChange={e => setSettings({ ...settings, studioName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Support Email</label>
              <input 
                value={settings.email}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Phone Number</label>
              <input 
                value={settings.phone}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Payments */}
        <div className="card">
          <div className="flex items-center gap-2" style={{ marginBottom: '24px' }}>
            <CreditCard size={20} className="text-primary" />
            <h3 className="font-semibold">Payment Settings</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label className="text-sm text-muted mb-1 block">Default UPI ID</label>
              <input 
                placeholder="vpa@upi"
                value={settings.upiId}
                onChange={e => setSettings({ ...settings, upiId: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Currency</label>
              <select 
                value={settings.currency}
                onChange={e => setSettings({ ...settings, currency: e.target.value })}
              >
                <option>INR (₹)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Automations */}
        <div className="card">
          <div className="flex items-center gap-2" style={{ marginBottom: '24px' }}>
            <Bell size={20} className="text-primary" />
            <h3 className="font-semibold">Automations</h3>
          </div>
          <div className="flex items-center justify-between" style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div>
              <p className="font-semibold">Auto-WhatsApp Reminders</p>
              <p className="text-sm text-muted">Automatically send reminders via WhatsApp on due date.</p>
            </div>
            <input 
              type="checkbox" 
              style={{ width: '40px' }}
              checked={settings.autoReminders}
              onChange={e => setSettings({ ...settings, autoReminders: e.target.checked })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
