'use strict';

const { Router } = require('express');
const activityController = require('../controllers/activity.controller');
const { authenticate } = require('../middleware/authenticate');

const router = Router();

// GET /api/activity
router.get('/', authenticate, activityController.getActivity);

module.exports = router;
