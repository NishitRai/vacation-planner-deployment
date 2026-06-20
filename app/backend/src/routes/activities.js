const router = require('express').Router();
const ctrl   = require('../controllers/activities');

// Nested under vacation
router.get('/:vacationId/activities',          ctrl.getByVacation);
router.post('/:vacationId/activities',         ctrl.create);

// Flat activity routes (router is mounted twice in index.js)
router.get('/:id',                             ctrl.getOne);
router.put('/:id',                             ctrl.update);
router.patch('/:id/status',                    ctrl.updateStatus);
router.delete('/:id',                          ctrl.remove);

module.exports = router;
