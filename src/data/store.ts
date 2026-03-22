import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User, Property, Unit, Contract, Invoice, Installment, Payment,
  MaintenanceRequest, Customer, Interaction, Appointment,
  MarketingListing, MarketingCampaign, Template, Notification,
  Expense, SupportTicket, BrokerageContract, AdLicense
} from '../types';
import * as seedData from './db';
import {
  loadAllFromSupabase,
  syncUpsert,
  syncDelete,
  syncBulkUpsert,
} from './supabaseSync';

export interface AppState {
  currentUser: User | null;
  users: User[];
  properties: Property[];
  units: Unit[];
  contracts: Contract[];
  invoices: Invoice[];
  installments: Installment[];
  payments: Payment[];
  maintenanceRequests: MaintenanceRequest[];
  customers: Customer[];
  interactions: Interaction[];
  appointments: Appointment[];
  marketingListings: MarketingListing[];
  marketingCampaigns: MarketingCampaign[];
  templates: Template[];
  notifications: Notification[];
  expenses: Expense[];
  supportTickets: SupportTicket[];
  brokerageContracts: BrokerageContract[];
  adLicenses: AdLicense[];

  login: (email: string, password: string) => boolean;
  logout: () => void;

  // Properties
  addProperty: (p: Property) => void;
  updateProperty: (id: string, data: Partial<Property>) => void;
  deleteProperty: (id: string) => void;

  // Units
  addUnit: (u: Unit) => void;
  updateUnit: (id: string, data: Partial<Unit>) => void;
  deleteUnit: (id: string) => void;

  // Contracts
  addContract: (c: Contract) => void;
  updateContract: (id: string, data: Partial<Contract>) => void;

  // Invoices
  addInvoice: (i: Invoice) => void;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;

  // Installments
  addInstallment: (i: Installment) => void;
  updateInstallment: (id: string, data: Partial<Installment>) => void;

  // Payments
  addPayment: (p: Payment) => void;
  updatePayment: (id: string, data: Partial<Payment>) => void;

  // Maintenance
  addMaintenanceRequest: (r: MaintenanceRequest) => void;
  updateMaintenanceRequest: (id: string, data: Partial<MaintenanceRequest>) => void;
  deleteMaintenanceRequest: (id: string) => void;

  // Customers
  addCustomer: (c: Customer) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Interactions
  addInteraction: (i: Interaction) => void;

  // Appointments
  addAppointment: (a: Appointment) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;

  // Marketing
  addMarketingListing: (l: MarketingListing) => void;
  updateMarketingListing: (id: string, data: Partial<MarketingListing>) => void;
  deleteMarketingListing: (id: string) => void;

  // Campaigns
  addMarketingCampaign: (c: MarketingCampaign) => void;
  updateMarketingCampaign: (id: string, data: Partial<MarketingCampaign>) => void;
  deleteMarketingCampaign: (id: string) => void;

  // Templates
  addTemplate: (t: Template) => void;
  updateTemplate: (id: string, data: Partial<Template>) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  addNotification: (n: Notification) => void;

  // Expenses
  addExpense: (e: Expense) => void;
  deleteExpense: (id: string) => void;

  // Brokerage Contracts
  addBrokerageContract: (c: BrokerageContract) => void;
  updateBrokerageContract: (id: string, data: Partial<BrokerageContract>) => void;
  deleteBrokerageContract: (id: string) => void;

  // Ad Licenses
  addAdLicense: (l: AdLicense) => void;
  updateAdLicense: (id: string, data: Partial<AdLicense>) => void;
  deleteAdLicense: (id: string) => void;

  // Support Tickets
  addSupportTicket: (t: SupportTicket) => void;
  updateSupportTicket: (id: string, data: Partial<SupportTicket>) => void;
  deleteSupportTicket: (id: string) => void;

  // Users
  addUser: (u: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;

  // Reset DB
  resetToSeed: () => void;

  // Supabase integration
  isDbLoading: boolean;
  initSupabase: () => Promise<void>;
}

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isDbLoading: false,
      users: seedData.users,
      properties: seedData.properties,
      units: seedData.units,
      contracts: seedData.contracts,
      invoices: seedData.invoices,
      installments: seedData.installments,
      payments: seedData.payments,
      maintenanceRequests: seedData.maintenanceRequests,
      customers: seedData.customers,
      interactions: seedData.interactions,
      appointments: seedData.appointments,
      marketingListings: seedData.marketingListings,
      marketingCampaigns: [],
      templates: seedData.templates,
      notifications: seedData.notifications,
      expenses: seedData.expenses,
      supportTickets: [],
      brokerageContracts: [],
      adLicenses: [],

      login: (email, password) => {
        const user = get().users.find(u => u.email === email && u.password === password && u.isActive);
        if (user) { set({ currentUser: user }); return true; }
        return false;
      },
      logout: () => set({ currentUser: null }),

      addProperty: (p) => { set(s => ({ properties: [...s.properties, p] })); syncUpsert('properties', p); },
      updateProperty: (id, data) => { set(s => ({ properties: s.properties.map(p => p.id === id ? { ...p, ...data } : p) })); const updated = get().properties.find(p => p.id === id); if (updated) syncUpsert('properties', updated); },
      deleteProperty: (id) => { set(s => ({ properties: s.properties.filter(p => p.id !== id) })); syncDelete('properties', id); },

      addUnit: (u) => { set(s => ({ units: [...s.units, u] })); syncUpsert('units', u); },
      updateUnit: (id, data) => { set(s => ({ units: s.units.map(u => u.id === id ? { ...u, ...data } : u) })); const updated = get().units.find(u => u.id === id); if (updated) syncUpsert('units', updated); },
      deleteUnit: (id) => { set(s => ({ units: s.units.filter(u => u.id !== id) })); syncDelete('units', id); },

      addContract: (c) => { set(s => ({ contracts: [...s.contracts, c] })); syncUpsert('contracts', c); },
      updateContract: (id, data) => { set(s => ({ contracts: s.contracts.map(c => c.id === id ? { ...c, ...data } : c) })); const updated = get().contracts.find(c => c.id === id); if (updated) syncUpsert('contracts', updated); },

      addInvoice: (i) => { set(s => ({ invoices: [...s.invoices, i] })); syncUpsert('invoices', i); },
      updateInvoice: (id, data) => { set(s => ({ invoices: s.invoices.map(i => i.id === id ? { ...i, ...data } : i) })); const updated = get().invoices.find(i => i.id === id); if (updated) syncUpsert('invoices', updated); },

      addInstallment: (i) => { set(s => ({ installments: [...s.installments, i] })); syncUpsert('installments', i); },
      updateInstallment: (id, data) => { set(s => ({ installments: s.installments.map(i => i.id === id ? { ...i, ...data } : i) })); const updated = get().installments.find(i => i.id === id); if (updated) syncUpsert('installments', updated); },

      addPayment: (p) => { set(s => ({ payments: [...s.payments, p] })); syncUpsert('payments', p); },
      updatePayment: (id, data) => { set(s => ({ payments: s.payments.map(p => p.id === id ? { ...p, ...data } : p) })); const updated = get().payments.find(p => p.id === id); if (updated) syncUpsert('payments', updated); },

      addMaintenanceRequest: (r) => { set(s => ({ maintenanceRequests: [...s.maintenanceRequests, r] })); syncUpsert('maintenance_requests', r); },
      updateMaintenanceRequest: (id, data) => { set(s => ({ maintenanceRequests: s.maintenanceRequests.map(r => r.id === id ? { ...r, ...data } : r) })); const updated = get().maintenanceRequests.find(r => r.id === id); if (updated) syncUpsert('maintenance_requests', updated); },
      deleteMaintenanceRequest: (id) => { set(s => ({ maintenanceRequests: s.maintenanceRequests.filter(r => r.id !== id) })); syncDelete('maintenance_requests', id); },

      addCustomer: (c) => { set(s => ({ customers: [...s.customers, c] })); syncUpsert('customers', c); },
      updateCustomer: (id, data) => { set(s => ({ customers: s.customers.map(c => c.id === id ? { ...c, ...data } : c) })); const updated = get().customers.find(c => c.id === id); if (updated) syncUpsert('customers', updated); },
      deleteCustomer: (id) => { set(s => ({ customers: s.customers.filter(c => c.id !== id) })); syncDelete('customers', id); },

      addInteraction: (i) => { set(s => ({ interactions: [...s.interactions, i] })); syncUpsert('interactions', i); },

      addAppointment: (a) => { set(s => ({ appointments: [...s.appointments, a] })); syncUpsert('appointments', a); },
      updateAppointment: (id, data) => { set(s => ({ appointments: s.appointments.map(a => a.id === id ? { ...a, ...data } : a) })); const updated = get().appointments.find(a => a.id === id); if (updated) syncUpsert('appointments', updated); },

      addMarketingListing: (l) => { set(s => ({ marketingListings: [...s.marketingListings, l] })); syncUpsert('marketing_listings', l); },
      updateMarketingListing: (id, data) => { set(s => ({ marketingListings: s.marketingListings.map(l => l.id === id ? { ...l, ...data } : l) })); const updated = get().marketingListings.find(l => l.id === id); if (updated) syncUpsert('marketing_listings', updated); },
      deleteMarketingListing: (id) => { set(s => ({ marketingListings: s.marketingListings.filter(l => l.id !== id) })); syncDelete('marketing_listings', id); },

      addMarketingCampaign: (c) => { set(s => ({ marketingCampaigns: [...s.marketingCampaigns, c] })); syncUpsert('marketing_campaigns', c); },
      updateMarketingCampaign: (id, data) => { set(s => ({ marketingCampaigns: s.marketingCampaigns.map(c => c.id === id ? { ...c, ...data } : c) })); const updated = get().marketingCampaigns.find(c => c.id === id); if (updated) syncUpsert('marketing_campaigns', updated); },
      deleteMarketingCampaign: (id) => { set(s => ({ marketingCampaigns: s.marketingCampaigns.filter(c => c.id !== id) })); syncDelete('marketing_campaigns', id); },

      addTemplate: (t) => { set(s => ({ templates: [...s.templates, t] })); syncUpsert('templates', t); },
      updateTemplate: (id, data) => { set(s => ({ templates: s.templates.map(t => t.id === id ? { ...t, ...data } : t) })); const updated = get().templates.find(t => t.id === id); if (updated) syncUpsert('templates', updated); },

      markNotificationRead: (id) => { set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, isRead: true } : n) })); const updated = get().notifications.find(n => n.id === id); if (updated) syncUpsert('notifications', updated); },
      addNotification: (n) => { set(s => ({ notifications: [n, ...s.notifications] })); syncUpsert('notifications', n); },

      addExpense: (e) => { set(s => ({ expenses: [...s.expenses, e] })); syncUpsert('expenses', e); },
      deleteExpense: (id) => { set(s => ({ expenses: s.expenses.filter(e => e.id !== id) })); syncDelete('expenses', id); },

      addBrokerageContract: (c) => { set(s => ({ brokerageContracts: [...s.brokerageContracts, c] })); syncUpsert('brokerage_contracts', c); },
      updateBrokerageContract: (id, data) => { set(s => ({ brokerageContracts: s.brokerageContracts.map(c => c.id === id ? { ...c, ...data } : c) })); const updated = get().brokerageContracts.find(c => c.id === id); if (updated) syncUpsert('brokerage_contracts', updated); },
      deleteBrokerageContract: (id) => { set(s => ({ brokerageContracts: s.brokerageContracts.filter(c => c.id !== id) })); syncDelete('brokerage_contracts', id); },

      addAdLicense: (l) => { set(s => ({ adLicenses: [...s.adLicenses, l] })); syncUpsert('ad_licenses', l); },
      updateAdLicense: (id, data) => { set(s => ({ adLicenses: s.adLicenses.map(l => l.id === id ? { ...l, ...data } : l) })); const updated = get().adLicenses.find(l => l.id === id); if (updated) syncUpsert('ad_licenses', updated); },
      deleteAdLicense: (id) => { set(s => ({ adLicenses: s.adLicenses.filter(l => l.id !== id) })); syncDelete('ad_licenses', id); },

      addSupportTicket: (t) => { set(s => ({ supportTickets: [...s.supportTickets, t] })); syncUpsert('support_tickets', t); },
      updateSupportTicket: (id: string, data: any) => { set(s => ({ supportTickets: s.supportTickets.map(t => t.id === id ? { ...t, ...data } : t) })); const updated = get().supportTickets.find(t => t.id === id); if (updated) syncUpsert('support_tickets', updated); },
      deleteSupportTicket: (id: string) => { set(s => ({ supportTickets: s.supportTickets.filter(t => t.id !== id) })); syncDelete('support_tickets', id); },

      addUser: (u) => { set(s => ({ users: [...s.users, u] })); syncUpsert('users', u); },
      updateUser: (id, data) => {
        set(s => ({
          users: s.users.map(u => u.id === id ? { ...u, ...data } : u),
          currentUser: s.currentUser?.id === id ? { ...s.currentUser, ...data } as User : s.currentUser,
        }));
        const updated = get().users.find(u => u.id === id);
        if (updated) syncUpsert('users', updated);
      },

      resetToSeed: () => {
        set({
          properties: seedData.properties, units: seedData.units, contracts: seedData.contracts,
          invoices: seedData.invoices, installments: seedData.installments, payments: seedData.payments,
          maintenanceRequests: seedData.maintenanceRequests, customers: seedData.customers,
          interactions: seedData.interactions, appointments: seedData.appointments,
          marketingListings: seedData.marketingListings, templates: seedData.templates,
          notifications: seedData.notifications, expenses: seedData.expenses,
        });
        // Bulk-sync seed data back to Supabase (non-blocking)
        Promise.all([
          syncBulkUpsert('properties', seedData.properties),
          syncBulkUpsert('units', seedData.units),
          syncBulkUpsert('contracts', seedData.contracts),
          syncBulkUpsert('invoices', seedData.invoices),
          syncBulkUpsert('installments', seedData.installments),
          syncBulkUpsert('payments', seedData.payments),
          syncBulkUpsert('maintenance_requests', seedData.maintenanceRequests),
          syncBulkUpsert('customers', seedData.customers),
          syncBulkUpsert('interactions', seedData.interactions),
          syncBulkUpsert('appointments', seedData.appointments),
          syncBulkUpsert('marketing_listings', seedData.marketingListings),
          syncBulkUpsert('templates', seedData.templates),
          syncBulkUpsert('notifications', seedData.notifications),
          syncBulkUpsert('expenses', seedData.expenses),
        ]);
      },

      // ── Supabase init ────────────────────────────────────────────
      initSupabase: async () => {
        set({ isDbLoading: true });
        const snapshot = await loadAllFromSupabase();
        if (snapshot) {
          // Only override non-empty collections from Supabase
          set({
            users:               snapshot.users.length               ? snapshot.users               : get().users,
            properties:          snapshot.properties.length          ? snapshot.properties          : get().properties,
            units:               snapshot.units.length               ? snapshot.units               : get().units,
            contracts:           snapshot.contracts.length           ? snapshot.contracts           : get().contracts,
            invoices:            snapshot.invoices.length            ? snapshot.invoices            : get().invoices,
            installments:        snapshot.installments.length        ? snapshot.installments        : get().installments,
            payments:            snapshot.payments.length            ? snapshot.payments            : get().payments,
            maintenanceRequests: snapshot.maintenanceRequests.length ? snapshot.maintenanceRequests : get().maintenanceRequests,
            customers:           snapshot.customers.length           ? snapshot.customers           : get().customers,
            interactions:        snapshot.interactions.length        ? snapshot.interactions        : get().interactions,
            appointments:        snapshot.appointments.length        ? snapshot.appointments        : get().appointments,
            marketingListings:   snapshot.marketingListings.length   ? snapshot.marketingListings   : get().marketingListings,
            marketingCampaigns:  snapshot.marketingCampaigns.length  ? snapshot.marketingCampaigns  : get().marketingCampaigns,
            templates:           snapshot.templates.length           ? snapshot.templates           : get().templates,
            notifications:       snapshot.notifications.length       ? snapshot.notifications       : get().notifications,
            expenses:            snapshot.expenses.length            ? snapshot.expenses            : get().expenses,
            supportTickets:      snapshot.supportTickets.length      ? snapshot.supportTickets      : get().supportTickets,
            brokerageContracts:  snapshot.brokerageContracts.length  ? snapshot.brokerageContracts  : get().brokerageContracts,
            adLicenses:          snapshot.adLicenses.length          ? snapshot.adLicenses          : get().adLicenses,
          });
        }
        set({ isDbLoading: false });
      },
    }),
    {
      name: 'ramzabdae-v2-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        properties: state.properties,
        units: state.units,
        contracts: state.contracts,
        invoices: state.invoices,
        installments: state.installments,
        payments: state.payments,
        maintenanceRequests: state.maintenanceRequests,
        customers: state.customers,
        interactions: state.interactions,
        appointments: state.appointments,
        marketingListings: state.marketingListings,
        marketingCampaigns: state.marketingCampaigns,
        templates: state.templates,
        notifications: state.notifications,
        expenses: state.expenses,
        supportTickets: state.supportTickets,
        brokerageContracts: state.brokerageContracts,
        adLicenses: state.adLicenses,
        users: state.users,
      }),
    }
  )
);
