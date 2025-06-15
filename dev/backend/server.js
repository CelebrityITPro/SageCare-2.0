require('dotenv').config();
console.log('TWILIO_SID:', process.env.TWILIO_SID);
console.log('TWILIO_AUTH:', process.env.TWILIO_AUTH ? '***SET***' : '***MISSING***');
const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const bodyParser= require('body-parser');
const authRoutes= require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('🔗 MongoDB connected'))
.catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
