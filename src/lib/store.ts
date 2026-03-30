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
        try {
          const { data: clients } = await supabase.from('clients').select('*');
          const { data: rawInvoices } = await supabase.from('invoices').select('*');

          if (clients) set({ clients });
          
          if (rawInvoices) {
            // Map snake_case from DB to camelCase for app
            const invoices = rawInvoices.map((inv: any) => ({
              id: inv.id,
              clientId: inv.client_id,
              amount: inv.amount,
              status: inv.status,
              date: inv.date,
              dueDate: inv.due_date,
              items: inv.items,
              notes: inv.notes,
              upiId: inv.upi_id,
              discount: inv.discount
            }));
            set({ invoices });
          }
        } catch (e) {
          console.error('Fetch error:', e);
        }
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
        
        // Optimistic update
        set((state) => ({ invoices: [...state.invoices, newInvoice] }));
        
        // Map camelCase to snake_case for DB
        const dbInvoice = {
          id: newInvoice.id,
          client_id: newInvoice.clientId,
          amount: newInvoice.amount,
          status: newInvoice.status,
          date: newInvoice.date,
          due_date: newInvoice.dueDate,
          items: newInvoice.items,
          notes: newInvoice.notes,
          upi_id: newInvoice.upiId,
          discount: newInvoice.discount
        };

        const { error } = await supabase.from('invoices').insert([dbInvoice]);
        if (error) {
          console.error('❌ Supabase Insert Error:', error.message);
          alert('Error saving to cloud! Check console for details.');
        }
      },

      updateInvoice: async (id, updatedInvoice) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...updatedInvoice } : inv
          ),
        }));
        
        // Map update payload to snake_case if necessary
        const dbUpdate: any = { ...updatedInvoice };
        if (updatedInvoice.clientId) {
          dbUpdate.client_id = updatedInvoice.clientId;
          delete dbUpdate.clientId;
        }
        if (updatedInvoice.dueDate) {
          dbUpdate.due_date = updatedInvoice.dueDate;
          delete dbUpdate.dueDate;
        }
        if (updatedInvoice.upiId) {
          dbUpdate.upi_id = updatedInvoice.upiId;
          delete dbUpdate.upiId;
        }

        await supabase.from('invoices').update(dbUpdate).eq('id', id);
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
