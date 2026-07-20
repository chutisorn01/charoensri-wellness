const express = require('express');
const router = express.Router();
const { getContents, getContent, createContent, updateContent, deleteContent } = require('../controllers/content.controller');
const { protect } = require('../middlewares/auth.middleware');

router.route('/')
  .get(getContents)
  .post(protect, createContent);

router.route('/:id')
  .get(getContent)
  .put(protect, updateContent)
  .delete(protect, deleteContent);

module.exports = router;
