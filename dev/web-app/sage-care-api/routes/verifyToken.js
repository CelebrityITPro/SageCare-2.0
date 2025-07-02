const jwt = require("jsonwebtoken");

let request;

const verifyToken = (req, res, next) => {
  const token = req.headers?.token?.split(" ")[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
      req.user = decoded;
      next();
    });
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const verifyAuth = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!!req.user.id) {
      next();
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }
  });
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }
  });
};

module.exports = { verifyToken, verifyAuth, verifyAdmin };
