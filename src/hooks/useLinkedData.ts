import { useMemo } from 'react';
import { useStore } from '../data/store';

export function useLinkedData() {
  const { properties, units, contracts } = useStore();

  // Map titleDeedNumber → propertyId
  const deedToPropertyId = useMemo(() => {
    const map = new Map<string, string>();
    properties.forEach(p => { if (p.titleDeedNumber) map.set(p.titleDeedNumber, p.id); });
    return map;
  }, [properties]);

  // Enrich units with resolved propertyId
  const enrichedUnits = useMemo(() =>
    units.map(u => ({
      ...u,
      propertyId: u.propertyId || deedToPropertyId.get(u.titleDeedNumber) || '',
    })),
    [units, deedToPropertyId]
  );

  // Map contractNumber → contract
  const contractByNumber = useMemo(() => {
    const map = new Map<string, typeof contracts[0]>();
    contracts.forEach(c => { if (c.contractNumber) map.set(c.contractNumber, c); });
    return map;
  }, [contracts]);

  // Enrich contracts: resolve unitId/propertyId from units
  const enrichedContracts = useMemo(() =>
    contracts.map(c => {
      if (c.unitId && c.propertyId) return c;
      // Try to find unit by contractNumber in unit data
      const unit = enrichedUnits.find(
        u => u.mainContractNumber === c.contractNumber || u.contractStatus === 'active'
      );
      return {
        ...c,
        propertyId: c.propertyId || unit?.propertyId || '',
        unitId: c.unitId || unit?.id || '',
      };
    }),
    [contracts, enrichedUnits]
  );

  // Stats per property
  const propertyStats = useMemo(() => {
    const map = new Map<string, { units: number; rented: number; available: number; revenue: number }>();
    properties.forEach(p => map.set(p.id, { units: 0, rented: 0, available: 0, revenue: 0 }));
    enrichedUnits.forEach(u => {
      const stat = map.get(u.propertyId);
      if (stat) {
        stat.units++;
        if (u.unitStatus === 'rented') stat.rented++;
        if (u.unitStatus === 'available') stat.available++;
      }
    });
    return map;
  }, [properties, enrichedUnits]);

  return { enrichedUnits, enrichedContracts, propertyStats, deedToPropertyId, contractByNumber };
}

// Smart alerts based on real data
export function useSmartAlerts() {
  const { contracts, invoices, installments, maintenanceRequests } = useStore();
  const today = new Date();

  const alerts = useMemo(() => {
    const list: {
      id: string; type: 'warning' | 'danger' | 'info'; title: string;
      detail: string; category: 'contract' | 'invoice' | 'maintenance';
    }[] = [];

    // Contracts expiring in 90 days
    contracts.forEach(c => {
      if (!c.contractEndDate || c.status !== 'active') return;
      const end = new Date(c.contractEndDate);
      const days = Math.ceil((end.getTime() - today.getTime()) / 86400000);
      if (days <= 90 && days > 0) {
        list.push({
          id: `exp-${c.id}`,
          type: days <= 30 ? 'danger' : 'warning',
          title: `عقد ينتهي خلال ${days} يوم`,
          detail: `${c.contractNumber} | ${c.tenantName} | ${c.propertyName}`,
          category: 'contract',
        });
      } else if (days <= 0) {
        list.push({
          id: `expired-${c.id}`,
          type: 'danger',
          title: 'عقد منتهي الصلاحية',
          detail: `${c.contractNumber} | ${c.tenantName} | انتهى: ${c.contractEndDate}`,
          category: 'contract',
        });
      }
    });

    // Overdue invoices
    invoices.filter(i => i.invoiceStatus === 'overdue').forEach(i => {
      list.push({
        id: `inv-${i.id}`,
        type: 'danger',
        title: 'فاتورة متأخرة السداد',
        detail: `${i.invoiceNumber} | متبقي: ${i.remainingAmount.toLocaleString()} ر | آخر مهلة: ${i.invoiceGraceDate}`,
        category: 'invoice',
      });
    });

    // Pending invoices near grace date
    invoices.filter(i => i.invoiceStatus === 'pending' && i.invoiceGraceDate).forEach(i => {
      const grace = new Date(i.invoiceGraceDate!);
      const days = Math.ceil((grace.getTime() - today.getTime()) / 86400000);
      if (days >= 0 && days <= 14) {
        list.push({
          id: `grace-${i.id}`,
          type: 'warning',
          title: `فاتورة تقترب من المهلة (${days} يوم)`,
          detail: `${i.invoiceNumber} | ${i.remainingAmount.toLocaleString()} ر | آخر مهلة: ${i.invoiceGraceDate}`,
          category: 'invoice',
        });
      }
    });

    // Overdue installments
    const overdueInst = installments.filter(i => i.installmentStatus === 'overdue').length;
    if (overdueInst > 0) {
      list.push({
        id: 'inst-overdue',
        type: 'warning',
        title: `${overdueInst} قسط متأخر`,
        detail: 'أقساط لم يتم سدادها في الموعد المحدد',
        category: 'invoice',
      });
    }

    // Urgent maintenance
    maintenanceRequests.filter(m => (m.priority === 'urgent' || m.priority === 'high') && m.status !== 'completed').forEach(m => {
      list.push({
        id: `maint-${m.id}`,
        type: m.priority === 'urgent' ? 'danger' : 'warning',
        title: `بلاغ صيانة ${m.priority === 'urgent' ? 'عاجل' : 'بأولوية عالية'}`,
        detail: `${m.title}`,
        category: 'maintenance',
      });
    });

    // Sort: danger first
    return list.sort((a) => (a.type === 'danger' ? -1 : 1));
  }, [contracts, invoices, installments, maintenanceRequests]);

  return alerts;
}
