var cors = require("cors");
const express = require('express');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const userRoutes = require('./routes/userRouter');

const app = express();
const port = 3300;

mongoose.connect('mongodb://localhost:27017/hanoixuan', { useNewUrlParser: true, useUnifiedTopology: true });

const serviceAccount = require('./hanoixuan-446a9-firebase-adminsdk-dv9hc-9a8b65d39e.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
app.use(cors());
app.use(express.json());

app.use('/user', userRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
