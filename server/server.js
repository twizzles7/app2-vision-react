const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const journalRoutes = require('./routes/journal');
const coachRoutes = require('./routes/coach');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost/ai-career-coach', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/coach', coachRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));