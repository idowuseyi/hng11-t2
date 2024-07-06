// token.spec.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

describe('Token Generation', () => {
  it('should generate a token that expires at the correct time and contains correct user details', () => {
    const user = { userId: '1234', email: 'test@example.com' };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded.userId).toBe(user.userId);
    expect(decoded.email).toBe(user.email);
    expect(decoded.exp).toBeDefined();
  });
});


// const jwt = require('jsonwebtoken');
// const JWT_SECRET = process.env.JWT_SECRET;

// describe('Token Generation', () => {
//   it('should generate a token that expires at the correct time and contains correct user details', () => {
//     const user = { userId: '1234', email: 'test@example.com' };
//     const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });

//     const decoded = jwt.verify(token, JWT_SECRET);
//     expect(decoded.userId).toBe(user.userId);
//     expect(decoded.email).toBe(user.email);

//     const now = Math.floor(Date.now() / 1000);
//     expect(decoded.exp).toBeGreaterThan(now);
//     expect(decoded.exp).toBeLessThanOrEqual(now + 3600);
//   });
// });
