const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (req.user.role === 'TENANT') where.tenantId = req.user.id;
    if (req.user.role === 'OWNER') where.property = { ownerId: req.user.id };

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          property: { select: { id: true, title: true, address: true, city: true } },
          tenant: { select: { id: true, name: true, email: true, phone: true } },
          payments: { orderBy: { dueDate: 'asc' } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.contract.count({ where })
    ]);

    res.json({ contracts, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: req.params.id },
      include: {
        property: true,
        tenant: { select: { id: true, name: true, email: true, phone: true } },
        payments: { orderBy: { dueDate: 'asc' } }
      }
    });
    if (!contract) return res.status(404).json({ error: 'العقد غير موجود' });
    res.json(contract);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'OWNER', 'AGENT'), async (req, res) => {
  try {
    const contract = await prisma.contract.create({
      data: req.body,
      include: {
        property: { select: { id: true, title: true } },
        tenant: { select: { id: true, name: true } }
      }
    });
    await prisma.property.update({ where: { id: req.body.propertyId }, data: { status: req.body.type === 'SALE' ? 'SOLD' : 'RENTED' } });
    res.status(201).json(contract);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'OWNER', 'AGENT'), async (req, res) => {
  try {
    const contract = await prisma.contract.update({ where: { id: req.params.id }, data: req.body });
    res.json(contract);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
