const router = require('express').Router();
const ctrl   = require('../controllers/packing');

router.get('/:vacationId/packing',       ctrl.getByVacation);
router.post('/:vacationId/packing',      ctrl.create);
router.patch('/:id/toggle',              ctrl.togglePacked);
router.put('/:id',                       ctrl.update);
router.delete('/:id',                    ctrl.remove);

module.exports = router;
