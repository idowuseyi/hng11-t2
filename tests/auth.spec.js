// auth.spec.js

const express = require('express');
require('dotenv').config();
const request = require('supertest');
const app = require('../src/utils/authTest');
const prisma = require('../prisma/prismaClient');
const { createServer } = require('http');
// app.use(express.json());


let server;

beforeAll(async () => {
  await prisma.user.deleteMany(); // Clear the user table before tests
  server = createServer(app);
  await new Promise(resolve => server.listen(4000, resolve));
});

afterAll(async () => {
  await prisma.$disconnect();
  server.close();
});

const newUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'password',
  phone: '123-456-7890'
};

describe('Auth Endpoints', () => {
  it('should fail if there’s a duplicate email or userId', async () => {
    await request(app)
      .post('/auth/register')
      .send(newUser);

    const res = await request(app)
      .post('/auth/register')
      .send(newUser);

    expect(res.status).toBe(422);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email', message: 'Email already in use' })
      ])
    );
  });
});



// const request = require('supertest');
// const app = require('../src/index');
// const { prisma } = require('../prisma/prismaClient');

// describe('Auth Endpoints', () => {
//   const newUser = {
//     firstName: 'John',
//     lastName: 'Doe',
//     email: 'john.doe@example.com',
//     password: 'password',
//     phone: '123-456-7890'
//   };

//   beforeAll(async () => {
//     await prisma.user.deleteMany(); // Clear the user table before tests
//   });

//   afterAll(async () => {
//     await prisma.$disconnect();
//   });

//   it('should fail if there’s a duplicate email or userId', async () => {
//     await request(app)
//       .post('/auth/register')
//       .send(newUser);

//     const res = await request(app)
//       .post('/auth/register')
//       .send(newUser);

//     expect(res.status).toBe(422);
//     expect(res.body.errors).toEqual(
//       expect.arrayContaining([
//         expect.objectContaining({ field: 'email', message: 'Email already in use' })
//       ])
//     );
//   });
// });


// const express = require('express');
// const { PrismaClient } = require('@prisma/client');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const request = require('supertest');
// const { userSchema } = require('../src/validations/validationSchemas');
// const app = express();

// const prisma = new PrismaClient();
// const JWT_SECRET = process.env.JWT_SECRET;

// app.use(express.json());

// app.post('/auth/register', async (req, res) => {
//   const { error, value } = userSchema.validate(req.body);
//   if (error) return res.status(422).json({
//     errors: error.details.map(err => ({ field: err.context.key, message: err.message }))
//   });

//   const hashedPassword = await bcrypt.hash(value.password, 10);

//   const newUser = await prisma.user.create({
//     data: {
//       ...value,
//       password: hashedPassword,
//     },
//   });

//   const organizationName = `${value.firstName}'s Organization`;
//   await prisma.organization.create({
//     data: {
//       name: organizationName,
//       users: {
//         connect: { userId: newUser.userId },
//       },
//     },
//   });

//   const token = jwt.sign({ userId: newUser.userId }, JWT_SECRET, { expiresIn: '1h' });

//   res.status(201).json({
//     status: 'success',
//     message: 'Registration successful',
//     data: {
//       accessToken: token,
//       user: {
//         userId: newUser.userId,
//         firstName: newUser.firstName,
//         lastName: newUser.lastName,
//         email: newUser.email,
//         phone: newUser.phone,
//       },
//     },
//   });
// });

// describe('Auth Endpoints', () => {
//   beforeEach(async () => {
//     await prisma.user.deleteMany();
//     await prisma.organization.deleteMany();
//   });

//   afterAll(async () => {
//     await prisma.$disconnect();
//   });

//   it('should register user successfully with default organisation', async () => {
//     const res = await request(app)
//       .post('/auth/register')
//       .send({
//         firstName: 'John',
//         lastName: 'Doe',
//         email: 'john@example.com',
//         password: 'password',
//         phone: '123-456-7890'
//       })
//       .expect(201);

//     expect(res.body.status).toBe('success');
//     expect(res.body.data.user.firstName).toBe('John');
//     expect(res.body.data.user.email).toBe('john@example.com');

//     const org = await prisma.organization.findFirst({
//       where: { name: "John's Organization" },
//       include: { users: true }
//     });

//     expect(org).not.toBeNull();
//     expect(org.users[0].email).toBe('john@example.com');
//   });

//   it('should fail if required fields are missing', async () => {
//     const res = await request(app)
//       .post('/auth/register')
//       .send({
//         lastName: 'Doe',
//         email: 'john@example.com',
//         password: 'password',
//         phone: '123-456-7890'
//       })
//       .expect(422);

//     expect(res.body.errors[0].field).toBe('firstName');
//   });

//   it('should fail if there’s a duplicate email or userId', async () => {
//     await request(app)
//       .post('/auth/register')
//       .send({
//         firstName: 'John',
//         lastName: 'Doe',
//         email: 'john@example.com',
//         password: 'password',
//         phone: '123-456-7890'
//       })
//       .expect(201);

//     const res = await request(app)
//       .post('/auth/register')
//       .send({
//         firstName: 'Jane',
//         lastName: 'Doe',
//         email: 'john@example.com',
//         password: 'password',
//         phone: '123-456-7890'
//       })
//       .expect(422);

//     expect(res.body.errors[0].field).toBe('email');
//   });
// });


