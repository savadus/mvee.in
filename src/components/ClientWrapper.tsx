'use client';

import type { Metadata } from 'next';
import { Inter, Dancing_Script } from 'next/font/google';
import '../app/globals.css';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { LayoutDashboard, Users2, FileText, Settings as SettingsIcon, Sun, Moon, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ['latin'] });
const dancingScript = Dancing_Script({ subsets: ['latin'] });

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, toggleTheme, fetchData, logoUrl } = useStore();
  const [mounted, setMounted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [logoState, setLogoState] = useState<'blue' | 'green'>('green');

  useEffect(() => {
    setMounted(true);
    fetchData(); // Load data from Supabase
    const savedUnlock = localStorage.getItem('admin_unlocked');
    if (savedUnlock === 'true') setIsUnlocked(true);
    document.documentElement.setAttribute('data-theme', theme);

    // Sync logo with background animation (4s total loop, 2s each color)
    const logoInterval = setInterval(() => {
      setLogoState(prev => prev === 'blue' ? 'green' : 'blue');
    }, 2000);

    return () => clearInterval(logoInterval);
  }, [theme]);

  const handleUnlock = (val: string) => {
    setPasscode(val);
    if (val === '6363') { // Updated secure passcode
        localStorage.setItem('admin_unlocked', 'true');
        setIsUnlocked(true);
    }
  };

  if (mounted && !isUnlocked) {
    return (
      <div className="unlock-overlay">
        <img 
          src={logoState === 'green' ? '/mvee green dark.png' : '/m blue.png'} 
          alt="brand-logo"
          className="admin-lock-logo"
        />
        <div className="unlock-card animate-fade-in">
          <h1 style={{ color: 'white', fontWeight: '900', fontSize: '36px', letterSpacing: '-0.02em' }}>
            Unlock Admin
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '8px', fontSize: '18px' }}>
            Enter your secure access pin
          </p>
          
          <input 
            type="password" 
            maxLength={4}
            className="passcode-field"
            placeholder="••••"
            value={passcode}
            onChange={(e) => handleUnlock(e.target.value)}
            autoFocus
          />
          
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '40px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.1em' }}>
            MVEE CUTS SECURE TERMINAL
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={inter.className}>
      <div className="layout-container">
        {/* Sidebar - Apple Inspired */}
        <aside className="sidebar card">
          <div className="flex items-center gap-3" style={{ padding: '8px 16px', marginBottom: '12px' }}>
            <img 
              src={theme === 'dark' ? '/mvee green dark.png' : '/mvee light.png'} 
              alt="logo" 
              style={{ 
                height: '50px', 
                width: 'auto', 
                display: 'block' 
              }} 
            />
          </div>

          <nav className="flex flex-col gap-1" style={{ flex: 1 }}>
            <Link href="/" className="btn-outline"><LayoutDashboard size={18} /> Dashboard</Link>
            <Link href="/clients" className="btn-outline"><Users2 size={18} /> Clients</Link>
            <Link href="/invoices" className="btn-outline"><FileText size={18} /> Invoices</Link>
            <Link href="/settings" className="btn-outline"><SettingsIcon size={18} /> Settings</Link>
          </nav>

          {mounted && (
            <div className="flex flex-col gap-2" style={{ marginTop: 'auto', marginBottom: '8px' }}>
              <button 
                onClick={toggleTheme} 
                className="btn-outline" 
                style={{ justifyContent: 'center' }}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button 
                onClick={() => {
                  localStorage.removeItem('admin_unlocked');
                  setIsUnlocked(false);
                  setPasscode('');
                }} 
                className="btn-outline" 
                style={{ justifyContent: 'center', color: '#ff453a' }}
              >
                Log Out
              </button>
            </div>
          )}
        </aside>

        {/* Mobile Header */}
        <header className="mobile-header card" style={{ display: 'none' }}>
           <img 
             src={theme === 'dark' ? '/mvee green dark.png' : '/mvee light.png'} 
             alt="logo" 
             style={{ height: '34px', width: 'auto' }} 
           />
           <div className="flex gap-6 items-center">
             <button onClick={toggleTheme} className="btn-outline" style={{ padding: '8px', background: 'transparent', border: 'none' }}>
               {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <Link href="/"><LayoutDashboard size={20} /></Link>
             <Link href="/clients"><Users2 size={20} /></Link>
             <Link href="/invoices"><FileText size={20} /></Link>
             <Link href="/settings"><SettingsIcon size={20} /></Link>
             <button 
                onClick={() => {
                  localStorage.removeItem('admin_unlocked');
                  setIsUnlocked(false);
                  setPasscode('');
                }} 
                style={{ padding: '8px', background: 'transparent', border: 'none', color: '#ff453a' }}
              >
                <LogOut size={20} />
              </button>
           </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
