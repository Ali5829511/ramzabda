const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, priority, category, page = 1, limit = 10 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (req.user.role === 'TENANT') where.requestedBy = req.user.id;
    if (req.user.role === 'OWNER') where.property = { ownerId: req.user.id };

    const [requests, total] = await Promise.all([
      prisma.maintenanceRequest.findMany({
        where,
        include: {
          property: { select: { id: true, title: true, address: true } },
          requester: { select: { id: true, name: true, phone: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.maintenanceRequest.count({ where })
    ]);

    res.json({ requests, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const request = await prisma.maintenanceRequest.findUnique({
      where: { id: req.params.id },
      include: {
        property: true,
        requester: { select: { id: true, name: true, phone: true, email: true } }
      }
    });
    if (!request) return res.status(404).json({ error: 'طلب الصيانة غير موجود' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const request = await prisma.maintenanceRequest.create({
      data: { ...req.body, requestedBy: req.user.id },
      include: {
        property: { select: { id: true, title: true } },
        requester: { select: { id: true, name: true } }
      }
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.status === 'COMPLETED') data.completedAt = new Date();
    const request = await prisma.maintenanceRequest.update({ where: { id: req.params.id }, data });
    if (data.status === 'IN_PROGRESS' || data.status === 'COMPLETED') {
      const propertyStatus = data.status === 'IN_PROGRESS' ? 'UNDER_MAINTENANCE' : 'AVAILABLE';
      await prisma.property.update({ where: { id: request.propertyId }, data: { status: propertyStatus } });
    }
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await prisma.maintenanceRequest.delete({ where: { id: req.params.id } });
    res.json({ message: 'تم حذف طلب الصيانة' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
