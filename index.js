const express = require('express');
const { PrismaClient } = require('@prisma/client');
// import { PrismaClient } from './prisma/generated/client'
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { userSchema, orgSchema } = require('./src/validations/validationSchemas');
const authenticateToken = require('./src/middlewares/authenticateToken');
const app = express();
app.use(cors());
require("dotenv").config();


const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET; // special secret code

app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/auth/register', async (req, res) => {
  try {
    const { error, value } = userSchema.validate(req.body);
    if (error) return res.status(422).json({
      errors: error.details.map(err => ({ field: err.context.key, message: err.message }))
    });

    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(422).json({
        errors: [{ field: 'email', message: 'Email already in use' }],
      });
    }

    const hashedPassword = await bcrypt.hash(value.password, 10);

    const newUser = await prisma.user.create({
      data: {
        ...value,
        password: hashedPassword,
      },
    });

    const organizationName = `${value.firstName}'s Organization`;
    await prisma.organization.create({
      data: {
        name: organizationName,
        users: {
          connect: { userId: newUser.userId },
        },
      },
    });

    const token = jwt.sign({ userId: newUser.userId }, JWT_SECRET, { expiresIn: '1h' });
    // console.log(token);

    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      data: {
        accessToken: token,
        user: {
          userId: newUser.userId,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          phone: newUser.phone,
        },
      },
    });
  } catch (e) {
    res.status(500).json({ status: 'Bad request', message: 'Registration unsuccessful', statusCode: 400 });
  } finally {
    await prisma.$disconnect();
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ status: 'Bad request', message: 'Authentication failed', statusCode: 401 });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ status: 'Bad request', message: 'Authentication failed', statusCode: 401 });

    const token = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: '1h' });
    // console.log(token);

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        accessToken: token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (e) {
    res.status(500).json({ status: 'Bad request', message: 'Authentication failed', statusCode: 401 });
  } finally {
    await prisma.$disconnect();
  }
});

app.get('/api/users/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  // console.log(id);

  try {
    const user = await prisma.user.findUnique({
      where: { userId: id },
    });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.json({
      status: 'success',
      message: 'User record retrieved successfully',
      data: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  } finally {
    await prisma.$disconnect();
  }
});

app.get('/api/organisations', authenticateToken, async (req, res) => {
  try {
    const organizations = await prisma.organization.findMany({
      where: {
        users: {
          some: { userId: req.user.userId },
        },
      },
    });

    res.json({
      status: 'success',
      message: 'Organizations retrieved successfully',
      data: {
        organizations,
      },
    });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  } finally {
    await prisma.$disconnect();
  }
});

app.get('/api/organisations/:orgId', authenticateToken, async (req, res) => {
  const { orgId } = req.params;

  try {
    const organization = await prisma.organization.findUnique({
      where: { orgId },
    });

    if (!organization) {
      return res.status(404).json({ status: 'error', message: 'Organization not found' });
    }

    res.json({
      status: 'success',
      message: 'Organization retrieved successfully',
      data: {
        orgId: organization.orgId,
        name: organization.name,
        description: organization.description,
      },
    });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  } finally {
    await prisma.$disconnect();
  }
});

app.post('/api/organisations', authenticateToken, async (req, res) => {
  const { error, value } = orgSchema.validate(req.body);
  if (error) return res.status(422).json({
    errors: error.details.map(err => ({ field: err.context.key, message: err.message }))
  });

  try {
    const newOrganization = await prisma.organization.create({
      data: {
        ...value,
        users: {
          connect: { userId: req.user.userId },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Organization created successfully',
      data: {
        orgId: newOrganization.orgId,
        name: newOrganization.name,
        description: newOrganization.description,
      },
    });
  } catch (e) {
    res.status(500).json({ status: 'Bad Request', message: 'Client error', statusCode: 400 });
  } finally {
    await prisma.$disconnect();
  }
});

app.post('/api/organisations/:orgId/users', authenticateToken, async (req, res) => {
  const { userId } = req.body;
  const { orgId } = req.params;

  try {
    await prisma.organization.update({
      where: { orgId },
      data: {
        users: {
          connect: { userId },
        },
      },
    });

    res.json({
      status: 'success',
      message: 'User added to organization successfully',
    });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  } finally {
    await prisma.$disconnect();
  }
});

app.listen(PORT, () => {
  console.log(`server started and running on http://localhost:${PORT}`)
})
