require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');

const vacationRoutes = require('./routes/vacations');
const activityRoutes = require('./routes/activities');
const packingRoutes  = require('./routes/packing');
const noteRoutes     = require('./routes/notes');
const errorHandler   = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ───────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use('/api/vacations',              vacationRoutes);
app.use('/api/vacations',              activityRoutes);   // nested: /api/vacations/:id/activities
app.use('/api/vacations',              packingRoutes);    // nested: /api/vacations/:id/packing
app.use('/api/vacations',              noteRoutes);       // nested: /api/vacations/:id/notes
app.use('/api/activities',             activityRoutes);   // flat:   /api/activities/:id
app.use('/api/packing',                packingRoutes);
app.use('/api/notes',                  noteRoutes);

// ── 404 catch-all ────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Error handler ────────────────────────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌴  Vacation Planner API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});

module.exports = app;
