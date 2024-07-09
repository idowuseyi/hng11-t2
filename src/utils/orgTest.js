// server.js
const express = require('express');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const prisma = require('../../prisma/prismaClient');
const app = express();

app.use(express.json());

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Route to get organization data
app.get('/api/organizations/:orgId', authenticateToken, async (req, res) => {
  const { orgId } = req.params;
  const { user } = req;

  try {
    const organization = await prisma.organization.findUnique({
      where: { orgId },
      include: { users: true }
    });

    if (!organization) {
      return res.sendStatus(404);
    }

    const userBelongsToOrg = organization.users.some(
      orgUser => orgUser.userId === user.userId
    );

    if (!userBelongsToOrg) {
      return res.sendStatus(403);
    }

    res.status(200).json({ data: organization });
  } catch (error) {
    res.sendStatus(500);
  }
});

module.exports = app;
