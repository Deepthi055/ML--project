// const jwt = require("jsonwebtoken");

// module.exports = function (req, res, next) {
//   const token = req.header("x-auth-token");
//   if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(401).json({ msg: "Token is not valid" });
//   }
// };

const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Accept token from either x-auth-token header (used here) or Authorization: Bearer <token>
  let token = req.header("x-auth-token");
  if (!token) {
    const authHeader = req.header('authorization') || req.header('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }
  }
  if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

  try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
