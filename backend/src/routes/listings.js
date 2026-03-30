const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const { type, city, minPrice, maxPrice, search, featured, page = 1, limit = 12 } = req.query;
    const where = { isActive: true };
    if (type) where.type = type;
    if (featured) where.featured = featured === 'true';
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];
    if (city || minPrice || maxPrice) {
      where.property = {};
      if (city) where.property.city = { contains: city, mode: 'insensitive' };
      if (minPrice || maxPrice) where.property.price = { gte: minPrice ? parseFloat(minPrice) : undefined, lte: maxPrice ? parseFloat(maxPrice) : undefined };
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: { property: { include: { owner: { select: { id: true, name: true, phone: true } } } } },
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.listing.count({ where })
    ]);

    res.json({ listings, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: { property: { include: { owner: { select: { id: true, name: true, phone: true, email: true } } } } }
    });
    if (!listing) return res.status(404).json({ error: 'الإعلان غير موجود' });
    await prisma.listing.update({ where: { id: req.params.id }, data: { views: { increment: 1 } } });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'OWNER', 'AGENT'), async (req, res) => {
  try {
    const listing = await prisma.listing.create({ data: req.body });
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'OWNER', 'AGENT'), async (req, res) => {
  try {
    const listing = await prisma.listing.update({ where: { id: req.params.id }, data: req.body });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN', 'OWNER', 'AGENT'), async (req, res) => {
  try {
    await prisma.listing.delete({ where: { id: req.params.id } });
    res.json({ message: 'تم حذف الإعلان' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
