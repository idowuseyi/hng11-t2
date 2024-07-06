// organization.spec.js

const express = require('express');
require('dotenv').config();
const request = require('supertest');
const prisma = require('../prisma/prismaClient');
const { createServer } = require('http');
const jwt = require('jsonwebtoken');
const app = require('../src/utils/orgTest')
app.use(express.json());

let server;

beforeAll(async () => {
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  server = createServer(app);
  await new Promise(resolve => server.listen(4000, resolve));
});

afterAll(async () => {
  await prisma.$disconnect();
  server.close();
});

describe('Organization Data Access', () => {
  it('should prevent users from accessing data of organizations they do not belong to', async () => {
    const user1 = await prisma.user.create({
      data: {
        userId: 'user1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
        phone: '123-456-7890'
      }
    });

    const user2 = await prisma.user.create({
      data: {
        userId: 'user2',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'password',
        phone: '987-654-3210'
      }
    });

    const token1 = jwt.sign({ userId: user1.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const token2 = jwt.sign({ userId: user2.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const organization = await prisma.organization.create({
      data: {
        orgId: 'org1',
        name: 'User1 Organization',
        users: { connect: { userId: user1.userId } }
      }
    });

    // User1 trying to access their own organization
    const res1 = await request(app)
      .get(`/api/organizations/${organization.orgId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res1.status).toBe(200);
    expect(res1.body.data.name).toBe('User1 Organization');

    // User2 trying to access User1's organization
    const res2 = await request(app)
      .get(`/api/organizations/${organization.orgId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res2.status).toBe(403);
  });
});



// const request = require('supertest');
// const app = require('../server');
// const { prisma } = require('../prisma/client');

// describe('Organization Data Access', () => {
//   let token1, token2;

//   beforeAll(async () => {
//     await prisma.user.deleteMany();
//     await prisma.organization.deleteMany();

//     const user1 = await prisma.user.create({
//       data: {
//         userId: 'user1',
//         firstName: 'User1',
//         lastName: 'Test1',
//         email: 'user1@example.com',
//         password: 'password1'
//       }
//     });

//     const user2 = await prisma.user.create({
//       data: {
//         userId: 'user2',
//         firstName: 'User2',
//         lastName: 'Test2',
//         email: 'user2@example.com',
//         password: 'password2'
//       }
//     });

//     token1 = jwt.sign({ userId: user1.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     token2 = jwt.sign({ userId: user2.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

//     await prisma.organization.create({
//       data: {
//         name: 'User1 Organization',
//         users: { connect: { userId: user1.userId } },
//       }
//     });
//   });

//   afterAll(async () => {
//     await prisma.$disconnect();
//   });

//   it('should prevent users from accessing data of organizations they do not belong to', async () => {
//     const res = await request(app)
//       .get('/api/organisations/someOrgIdUserDoesNotBelongTo')
//       .set('Authorization', `Bearer ${token2}`);

//     expect(res.status).toBe(403);
//   });
// });



// const express = require('express');
// const { PrismaClient } = require('@prisma/client');
// const request = require('supertest');
// const jwt = require('jsonwebtoken');
// const app = express();

// const prisma = new PrismaClient();
// const JWT_SECRET = process.env.JWT_SECRET;

// app.use(express.json());

// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
//   if (!token) return res.sendStatus(401);

//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) return res.sendStatus(403);
//     req.user = user;
//     next();
//   });
// };

// app.get('/api/organisations', authenticateToken, async (req, res) => {
//   const organizations = await prisma.organization.findMany({
//     where: {
//       users: {
//         some: { userId: req.user.userId },
//       },
//     },
//   });
//   res.json({ organizations });
// });

// describe('Organization Data Access', () => {
//   it('should prevent users from accessing data of organizations they do not belong to', async () => {
//     const user1 = { userId: 'user1', email: 'user1@example.com' };
//     const user2 = { userId: 'user2', email: 'user2@example.com' };

//     const token1 = jwt.sign(user1, JWT_SECRET, { expiresIn: '1h' });
//     const token2 = jwt.sign(user2, JWT_SECRET, { expiresIn: '1h' });

//     await prisma.organization.create({
//       data: {
//         name: 'User1 Organization',
//         users: { connect: { userId: user1.userId } },
//       },
//     });

//     const res = await request(app)
//       .get('/api/organisations')
//       .set('Authorization', `Bearer ${token2}`)
//       .expect(200);

//     expect(res.body.organizations).toHaveLength(0);
//   });
// });
