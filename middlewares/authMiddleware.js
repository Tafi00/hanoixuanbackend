// middlewares/authMiddleware.js
const admin = require("firebase-admin");

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const accessToken = authHeader?.split(" ")?.[1];
  if (!accessToken) {
    return res.status(401).json({ error: "Access token not provided" });
  }
  admin
    .auth()
    .verifyIdToken(accessToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      next();
    })
    .catch((error) => {
      console.log(error);
      return res.status(401).json({ error: "Invalid access token" });
    });
};

module.exports = { verifyToken };
