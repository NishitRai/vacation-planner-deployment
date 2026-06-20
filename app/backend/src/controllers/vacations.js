const db = require('../db');

// GET /api/vacations
const getAll = async (_req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT v.*,
        COUNT(DISTINCT a.id)::int           AS activity_count,
        COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'completed')::int AS completed_count
      FROM vacations v
      LEFT JOIN activities a ON a.vacation_id = v.id
      GROUP BY v.id
      ORDER BY v.start_date ASC
    `);
    res.json(rows);
  } catch (err) { next(err); }
};

// GET /api/vacations/:id
const getOne = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM vacations WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Vacation not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// POST /api/vacations
const create = async (req, res, next) => {
  const { title, destination, description, start_date, end_date, cover_image, status } = req.body;
  try {
    const { rows } = await db.query(`
      INSERT INTO vacations (title, destination, description, start_date, end_date, cover_image, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
    `, [title, destination, description, start_date, end_date, cover_image, status || 'planning']);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

// PUT /api/vacations/:id
const update = async (req, res, next) => {
  const { title, destination, description, start_date, end_date, cover_image, status } = req.body;
  try {
    const { rows } = await db.query(`
      UPDATE vacations
      SET title=$1, destination=$2, description=$3, start_date=$4,
          end_date=$5, cover_image=$6, status=$7
      WHERE id=$8 RETURNING *
    `, [title, destination, description, start_date, end_date, cover_image, status, req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Vacation not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// PATCH /api/vacations/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'UPDATE vacations SET status=$1 WHERE id=$2 RETURNING *',
      [req.body.status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Vacation not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// DELETE /api/vacations/:id
const remove = async (req, res, next) => {
  try {
    const { rowCount } = await db.query('DELETE FROM vacations WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Vacation not found' });
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, updateStatus, remove };
