const router = require('express').Router();
const ctrl   = require('../controllers/notes');

router.get('/:vacationId/notes',    ctrl.getByVacation);
router.post('/:vacationId/notes',   ctrl.create);
router.put('/:id',                  ctrl.update);
router.delete('/:id',               ctrl.remove);

module.exports = router;
