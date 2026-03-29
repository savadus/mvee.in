import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  tags: string[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Overdue' | 'Partial';
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  notes?: string;
  upiId?: string;
  discount?: number;
}

interface BillingState {
  clients: Client[];
  invoices: Invoice[];
  theme: 'light' | 'dark';
  logoUrl: string;
  settings: {
    studioName: string;
    email: string;
    phone: string;
    upiId: string;
    currency: string;
    autoReminders: boolean;
  };
  setLogoUrl: (url: string) => void;
  setSettings: (settings: Partial<BillingState['settings']>) => void;
  fetchData: () => Promise<void>;
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  toggleTheme: () => void;
}

const DEFAULT_SETTINGS = {
  studioName: 'Your Design Studio',
  email: 'hello@yourstudio.com',
  phone: '+91 98765 43210',
  upiId: 'design@okaxis',
  currency: 'INR (₹)',
  autoReminders: false,
};

export const useStore = create<BillingState>()(
  persist(
    (set, get) => ({
      clients: [],
      invoices: [],
      theme: 'dark',
      logoUrl: '',
      settings: DEFAULT_SETTINGS,

      setLogoUrl: (url) => set({ logoUrl: url }),
      setSettings: (newSettings) => set((state) => ({ 
        settings: { ...state.settings, ...newSettings } 
      })),

      fetchData: async () => {
        const { data: clients } = await supabase.from('clients').select('*');
        const { data: invoices } = await supabase.from('invoices').select('*');
        if (clients) set({ clients });
        if (invoices) set({ invoices: invoices as Invoice[] });
      },

      addClient: async (client) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newClient = { ...client, id };
        set((state) => ({ clients: [...state.clients, newClient] }));
        await supabase.from('clients').insert([newClient]);
      },

      updateClient: async (id, updatedClient) => {
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, ...updatedClient } : c
          ),
        }));
        await supabase.from('clients').update(updatedClient).eq('id', id);
      },

      deleteClient: async (id) => {
        set((state) => ({ clients: state.clients.filter((c) => c.id !== id) }));
        await supabase.from('clients').delete().eq('id', id);
      },

      addInvoice: async (invoice) => {
        const id = `INV-${Date.now().toString().slice(-6)}`;
        const newInvoice = { ...invoice, id };
        set((state) => ({ invoices: [...state.invoices, newInvoice] }));
        await supabase.from('invoices').insert([newInvoice]);
      },

      updateInvoice: async (id, updatedInvoice) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...updatedInvoice } : inv
          ),
        }));
        await supabase.from('invoices').update(updatedInvoice).eq('id', id);
      },

      deleteInvoice: async (id) => {
        set((state) => ({ invoices: state.invoices.filter((inv) => inv.id !== id) }));
        await supabase.from('invoices').delete().eq('id', id);
      },

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'billing-storage',
    }
  )
);
