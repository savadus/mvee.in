import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  toggleTheme: () => void;
}

export const useStore = create<BillingState>()(
  persist(
    (set) => ({
      clients: [],
      invoices: [],
      theme: 'dark',
      addClient: (client) =>
        set((state) => ({
          clients: [
            ...state.clients,
            { ...client, id: Math.random().toString(36).substr(2, 9) },
          ],
        })),
      updateClient: (id, updatedClient) =>
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, ...updatedClient } : c
          ),
        })),
      deleteClient: (id) =>
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
        })),
      addInvoice: (invoice) =>
        set((state) => ({
          invoices: [
            ...state.invoices,
            { ...invoice, id: `INV-${Date.now().toString().slice(-6)}` },
          ],
        })),
      updateInvoice: (id, updatedInvoice) =>
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id ? { ...inv, ...updatedInvoice } : inv
          ),
        })),
      deleteInvoice: (id) =>
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== id),
        })),
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
