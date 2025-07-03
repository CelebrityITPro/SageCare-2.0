const jwt = require("jsonwebtoken");

let request;

const verifyToken = (req, res, next) => {
  console.log("verifyToken - Headers:", req.headers);
  console.log("verifyToken - Token header:", req.headers?.token);
  
  const token = req.headers?.token?.split(" ")[1];
  console.log("verifyToken - Extracted token:", token ? "exists" : "missing");

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        console.error("verifyToken - JWT verification failed:", err);
        return res.status(403).json({ message: "Invalid token" });
      }
      console.log("verifyToken - JWT decoded successfully:", decoded);
      req.user = decoded;
      next();
    });
  } else {
    console.log("verifyToken - No token provided");
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
