const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, authorize('ADMIN', 'OWNER', 'AGENT'), async (req, res) => {
  try {
    const ownerFilter = req.user.role === 'OWNER' ? { ownerId: req.user.id } : {};

    const [
      totalProperties,
      availableProperties,
      rentedProperties,
      totalContracts,
      activeContracts,
      pendingMaintenance,
      inProgressMaintenance,
      recentProperties,
      recentMaintenance,
      pendingPayments,
      totalRevenue,
      listingsCount
    ] = await Promise.all([
      prisma.property.count({ where: ownerFilter }),
      prisma.property.count({ where: { ...ownerFilter, status: 'AVAILABLE' } }),
      prisma.property.count({ where: { ...ownerFilter, status: 'RENTED' } }),
      prisma.contract.count({ where: req.user.role === 'OWNER' ? { property: ownerFilter } : {} }),
      prisma.contract.count({ where: { status: 'ACTIVE', ...(req.user.role === 'OWNER' ? { property: ownerFilter } : {}) } }),
      prisma.maintenanceRequest.count({ where: { status: 'PENDING', ...(req.user.role === 'OWNER' ? { property: ownerFilter } : {}) } }),
      prisma.maintenanceRequest.count({ where: { status: 'IN_PROGRESS', ...(req.user.role === 'OWNER' ? { property: ownerFilter } : {}) } }),
      prisma.property.findMany({ where: ownerFilter, orderBy: { createdAt: 'desc' }, take: 5, include: { owner: { select: { name: true } } } }),
      prisma.maintenanceRequest.findMany({ where: req.user.role === 'OWNER' ? { property: ownerFilter } : {}, orderBy: { createdAt: 'desc' }, take: 5, include: { property: { select: { title: true } } } }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.aggregate({ where: { status: 'PAID', ...(req.user.role === 'OWNER' ? { contract: { property: ownerFilter } } : {}) }, _sum: { amount: true } }),
      prisma.listing.count({ where: { isActive: true } })
    ]);

    res.json({
      stats: {
        totalProperties,
        availableProperties,
        rentedProperties,
        totalContracts,
        activeContracts,
        pendingMaintenance,
        inProgressMaintenance,
        pendingPayments,
        totalRevenue: totalRevenue._sum.amount || 0,
        listingsCount
      },
      recentProperties,
      recentMaintenance
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
