import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User, Property, Unit, Contract, Invoice, Installment, Payment,
  MaintenanceRequest, Customer, Interaction, Appointment,
  MarketingListing, MarketingCampaign, Template, Notification,
  Expense, SupportTicket, BrokerageContract, AdLicense
} from '../types';
import * as seedData from './db';

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
}

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
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

      addProperty: (p) => set(s => ({ properties: [...s.properties, p] })),
      updateProperty: (id, data) => set(s => ({ properties: s.properties.map(p => p.id === id ? { ...p, ...data } : p) })),
      deleteProperty: (id) => set(s => ({ properties: s.properties.filter(p => p.id !== id) })),

      addUnit: (u) => set(s => ({ units: [...s.units, u] })),
      updateUnit: (id, data) => set(s => ({ units: s.units.map(u => u.id === id ? { ...u, ...data } : u) })),
      deleteUnit: (id) => set(s => ({ units: s.units.filter(u => u.id !== id) })),

      addContract: (c) => set(s => ({ contracts: [...s.contracts, c] })),
      updateContract: (id, data) => set(s => ({ contracts: s.contracts.map(c => c.id === id ? { ...c, ...data } : c) })),

      addInvoice: (i) => set(s => ({ invoices: [...s.invoices, i] })),
      updateInvoice: (id, data) => set(s => ({ invoices: s.invoices.map(i => i.id === id ? { ...i, ...data } : i) })),

      addInstallment: (i) => set(s => ({ installments: [...s.installments, i] })),
      updateInstallment: (id, data) => set(s => ({ installments: s.installments.map(i => i.id === id ? { ...i, ...data } : i) })),

      addPayment: (p) => set(s => ({ payments: [...s.payments, p] })),
      updatePayment: (id, data) => set(s => ({ payments: s.payments.map(p => p.id === id ? { ...p, ...data } : p) })),

      addMaintenanceRequest: (r) => set(s => ({ maintenanceRequests: [...s.maintenanceRequests, r] })),
      updateMaintenanceRequest: (id, data) => set(s => ({ maintenanceRequests: s.maintenanceRequests.map(r => r.id === id ? { ...r, ...data } : r) })),
      deleteMaintenanceRequest: (id) => set(s => ({ maintenanceRequests: s.maintenanceRequests.filter(r => r.id !== id) })),

      addCustomer: (c) => set(s => ({ customers: [...s.customers, c] })),
      updateCustomer: (id, data) => set(s => ({ customers: s.customers.map(c => c.id === id ? { ...c, ...data } : c) })),
      deleteCustomer: (id) => set(s => ({ customers: s.customers.filter(c => c.id !== id) })),

      addInteraction: (i) => set(s => ({ interactions: [...s.interactions, i] })),

      addAppointment: (a) => set(s => ({ appointments: [...s.appointments, a] })),
      updateAppointment: (id, data) => set(s => ({ appointments: s.appointments.map(a => a.id === id ? { ...a, ...data } : a) })),

      addMarketingListing: (l) => set(s => ({ marketingListings: [...s.marketingListings, l] })),
      updateMarketingListing: (id, data) => set(s => ({ marketingListings: s.marketingListings.map(l => l.id === id ? { ...l, ...data } : l) })),
      deleteMarketingListing: (id) => set(s => ({ marketingListings: s.marketingListings.filter(l => l.id !== id) })),

      addMarketingCampaign: (c) => set(s => ({ marketingCampaigns: [...s.marketingCampaigns, c] })),
      updateMarketingCampaign: (id, data) => set(s => ({ marketingCampaigns: s.marketingCampaigns.map(c => c.id === id ? { ...c, ...data } : c) })),
      deleteMarketingCampaign: (id) => set(s => ({ marketingCampaigns: s.marketingCampaigns.filter(c => c.id !== id) })),

      addTemplate: (t) => set(s => ({ templates: [...s.templates, t] })),
      updateTemplate: (id, data) => set(s => ({ templates: s.templates.map(t => t.id === id ? { ...t, ...data } : t) })),

      markNotificationRead: (id) => set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, isRead: true } : n) })),
      addNotification: (n) => set(s => ({ notifications: [n, ...s.notifications] })),

      addExpense: (e) => set(s => ({ expenses: [...s.expenses, e] })),
      deleteExpense: (id) => set(s => ({ expenses: s.expenses.filter(e => e.id !== id) })),

      addBrokerageContract: (c) => set(s => ({ brokerageContracts: [...s.brokerageContracts, c] })),
      updateBrokerageContract: (id, data) => set(s => ({ brokerageContracts: s.brokerageContracts.map(c => c.id === id ? { ...c, ...data } : c) })),
      deleteBrokerageContract: (id) => set(s => ({ brokerageContracts: s.brokerageContracts.filter(c => c.id !== id) })),

      addAdLicense: (l) => set(s => ({ adLicenses: [...s.adLicenses, l] })),
      updateAdLicense: (id, data) => set(s => ({ adLicenses: s.adLicenses.map(l => l.id === id ? { ...l, ...data } : l) })),
      deleteAdLicense: (id) => set(s => ({ adLicenses: s.adLicenses.filter(l => l.id !== id) })),

      addSupportTicket: (t) => set(s => ({ supportTickets: [...s.supportTickets, t] })),
      updateSupportTicket: (id: string, data: Partial<SupportTicket>) => set(s => ({ supportTickets: s.supportTickets.map(t => t.id === id ? { ...t, ...data } : t) })),
      deleteSupportTicket: (id: string) => set(s => ({ supportTickets: s.supportTickets.filter(t => t.id !== id) })),

      addUser: (u) => set(s => ({ users: [...s.users, u] })),
      updateUser: (id, data) => set(s => ({
        users: s.users.map(u => u.id === id ? { ...u, ...data } : u),
        currentUser: s.currentUser?.id === id ? { ...s.currentUser, ...data } as User : s.currentUser,
      })),

      resetToSeed: () => set({
        properties: seedData.properties, units: seedData.units, contracts: seedData.contracts,
        invoices: seedData.invoices, installments: seedData.installments, payments: seedData.payments,
        maintenanceRequests: seedData.maintenanceRequests, customers: seedData.customers,
        interactions: seedData.interactions, appointments: seedData.appointments,
        marketingListings: seedData.marketingListings, templates: seedData.templates,
        notifications: seedData.notifications, expenses: seedData.expenses,
      }),
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
