const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, contractId, page = 1, limit = 10 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (contractId) where.contractId = contractId;
    if (req.user.role === 'TENANT') where.userId = req.user.id;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          contract: { include: { property: { select: { title: true } } } },
          user: { select: { id: true, name: true } }
        },
        orderBy: { dueDate: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.payment.count({ where })
    ]);

    res.json({ payments, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'OWNER', 'AGENT'), async (req, res) => {
  try {
    const payment = await prisma.payment.create({ data: req.body });
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.status === 'PAID') data.paidAt = new Date();
    const payment = await prisma.payment.update({ where: { id: req.params.id }, data });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
