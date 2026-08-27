'use strict';

const sendService = require('../services/sendService');

/**
 * POST /api/emails/send
 */
async function sendEmail(req, res, next) {
  try {
    const { to, cc, bcc, subject, body } = req.body;
    const result = await sendService.sendNewEmail(req.user._id.toString(), {
      to, cc, bcc, subject, body,
    });
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Email sent successfully.',
    });
  } catch (err) { next(err); }
}

/**
 * POST /api/emails/:id/reply
 */
async function replyEmail(req, res, next) {
  try {
    const { to, body } = req.body;
    const result = await sendService.replyToEmail(
      req.user._id.toString(),
      req.params.id,
      { to, body }
    );
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Reply sent successfully.',
    });
  } catch (err) { next(err); }
}

module.exports = { sendEmail, replyEmail };
