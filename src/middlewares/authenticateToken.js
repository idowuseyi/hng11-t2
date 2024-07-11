const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log(token);

  if (token == null) return res.sendStatus(401); // No token, unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    // console.log(process.env.JWT_SECRET)
    if (err) return res.sendStatus(403); // Invalid or expired token, forbidden
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
