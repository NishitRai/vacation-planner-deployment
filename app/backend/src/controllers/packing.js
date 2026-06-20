const db = require('../db');

const getByVacation = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM packing_items WHERE vacation_id=$1 ORDER BY category, name',
      [req.params.vacationId]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  const { name, category, quantity } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO packing_items (vacation_id,name,category,quantity) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.params.vacationId, name, category, quantity || 1]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

const togglePacked = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'UPDATE packing_items SET packed = NOT packed WHERE id=$1 RETURNING *',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Item not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  const { name, category, quantity, packed } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE packing_items SET name=$1,category=$2,quantity=$3,packed=$4 WHERE id=$5 RETURNING *',
      [name, category, quantity, packed, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Item not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const { rowCount } = await db.query('DELETE FROM packing_items WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Item not found' });
    res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = { getByVacation, create, togglePacked, update, remove };
