const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  try {
    const { type, status, city, minPrice, maxPrice, search, page = 1, limit = 12 } = req.query;
    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (minPrice || maxPrice) where.price = { gte: minPrice ? parseFloat(minPrice) : undefined, lte: maxPrice ? parseFloat(maxPrice) : undefined };
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { address: { contains: search, mode: 'insensitive' } }];

    if (req.user.role === 'OWNER') where.ownerId = req.user.id;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: { owner: { select: { id: true, name: true, phone: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.property.count({ where })
    ]);

    res.json({ properties, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, phone: true, email: true } },
        contracts: { include: { tenant: { select: { id: true, name: true, email: true, phone: true } } } },
        maintenanceRequests: { orderBy: { createdAt: 'desc' }, take: 5 },
        listings: true
      }
    });
    if (!property) return res.status(404).json({ error: 'العقار غير موجود' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'OWNER', 'AGENT'), async (req, res) => {
  try {
    const property = await prisma.property.create({
      data: { ...req.body, ownerId: req.user.role === 'OWNER' ? req.user.id : req.body.ownerId || req.user.id },
      include: { owner: { select: { id: true, name: true } } }
    });
    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'OWNER', 'AGENT'), async (req, res) => {
  try {
    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN', 'OWNER'), async (req, res) => {
  try {
    await prisma.property.delete({ where: { id: req.params.id } });
    res.json({ message: 'تم حذف العقار بنجاح' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
