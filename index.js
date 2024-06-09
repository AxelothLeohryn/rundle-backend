require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
const admin = require('firebase-admin');
const morgan = require("morgan");

app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Middleware to check Firebase ID token
const authenticateToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
      return res.status(401).send('Unauthorized');
    }
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.user = decodedToken;
      next();
    } catch (error) {
      res.status(401).send('Unauthorized');
    }
  };

  app.post('/login', authenticateToken, (req, res) => {
    res.send(`Welcome, ${req.user.name}!`);
  });



//* Serve static assets in production, must be at this location of this file
if (process.env.NODE_ENV === "production") {
    //*Set static folder (VITE --> dist)
    app.use(express.static("client/dist"));
  
    app.get("*", (req, res) =>
      res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"))
    );
  }


app.listen(port, () => {
    console.log(`rundle.io server is running on port ${port}`);
    }
);
