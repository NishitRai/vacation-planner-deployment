const db = require('../db');

const getByVacation = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM notes WHERE vacation_id=$1 ORDER BY note_date DESC, created_at DESC',
      [req.params.vacationId]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  const { title, content, note_date } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO notes (vacation_id,title,content,note_date) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.params.vacationId, title, content, note_date]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  const { title, content, note_date } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE notes SET title=$1,content=$2,note_date=$3 WHERE id=$4 RETURNING *',
      [title, content, note_date, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Note not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rowCount } = await db.query('DELETE FROM notes WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Note not found' });
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { getByVacation, create, update, remove };
