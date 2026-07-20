const express = require('express');
const router = express.Router();
const { getDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctor.controller');
const { protect } = require('../middlewares/auth.middleware');

router.route('/')
  .get(getDoctors)
  .post(protect, createDoctor);

router.route('/:id')
  .get(getDoctor)
  .put(protect, updateDoctor)
  .delete(protect, deleteDoctor);

module.exports = router;
