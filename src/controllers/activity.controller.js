'use strict';

const activityService = require('../services/activityService');

/**
 * GET /api/activity
 */
async function getActivity(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await activityService.getUserActivity(
      req.user._id.toString(),
      page,
      limit
    );
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { getActivity };
