const router  = require('express').Router();
const ctrl    = require('../controllers/vacations');

router.get('/',               ctrl.getAll);
router.get('/:id',            ctrl.getOne);
router.post('/',              ctrl.create);
router.put('/:id',            ctrl.update);
router.patch('/:id/status',   ctrl.updateStatus);
router.delete('/:id',         ctrl.remove);

module.exports = router;
