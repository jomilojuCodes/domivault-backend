const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug log
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'test route works' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'Domivault API is running' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated');
  });
});