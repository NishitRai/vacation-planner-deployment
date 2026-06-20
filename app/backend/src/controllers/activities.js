const db = require('../db');

// GET /api/vacations/:vacationId/activities
const getByVacation = async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT * FROM activities
      WHERE vacation_id = $1
      ORDER BY scheduled_date ASC NULLS LAST, scheduled_time ASC NULLS LAST, priority DESC
    `, [req.params.vacationId]);
    res.json(rows);
  } catch (err) { next(err); }
};

// GET /api/activities/:id
const getOne = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM activities WHERE id=$1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Activity not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// POST /api/vacations/:vacationId/activities
const create = async (req, res, next) => {
  const {
    title, category, description, location, address, website, phone,
    scheduled_date, scheduled_time, duration_mins, cost_estimate, currency,
    status, priority, notes
  } = req.body;
  try {
    const { rows } = await db.query(`
      INSERT INTO activities
        (vacation_id, title, category, description, location, address, website, phone,
         scheduled_date, scheduled_time, duration_mins, cost_estimate, currency, status, priority, notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *
    `, [
      req.params.vacationId, title, category || 'activity', description, location,
      address, website, phone, scheduled_date, scheduled_time, duration_mins,
      cost_estimate, currency || 'USD', status || 'planned', priority || 3, notes
    ]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

// PUT /api/activities/:id
const update = async (req, res, next) => {
  const {
    title, category, description, location, address, website, phone,
    scheduled_date, scheduled_time, duration_mins, cost_estimate, currency,
    status, priority, notes
  } = req.body;
  try {
    const { rows } = await db.query(`
      UPDATE activities
      SET title=$1, category=$2, description=$3, location=$4, address=$5,
          website=$6, phone=$7, scheduled_date=$8, scheduled_time=$9,
          duration_mins=$10, cost_estimate=$11, currency=$12,
          status=$13, priority=$14, notes=$15
      WHERE id=$16 RETURNING *
    `, [
      title, category, description, location, address, website, phone,
      scheduled_date, scheduled_time, duration_mins, cost_estimate, currency,
      status, priority, notes, req.params.id
    ]);
    if (!rows.length) return res.status(404).json({ error: 'Activity not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// PATCH /api/activities/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'UPDATE activities SET status=$1 WHERE id=$2 RETURNING *',
      [req.body.status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Activity not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// DELETE /api/activities/:id
const remove = async (req, res, next) => {
  try {
    const { rowCount } = await db.query('DELETE FROM activities WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Activity not found' });
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { getByVacation, getOne, create, update, updateStatus, remove };
