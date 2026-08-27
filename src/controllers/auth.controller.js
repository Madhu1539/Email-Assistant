'use strict';

const { NODE_ENV } = require('../config/env');
const authService = require('../services/authService');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours in ms
  path: '/',
};

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const user = await authService.registerUser({ name, email, password });

    return res.status(201).json({
      success: true,
      data: { user },
      message: 'Account created successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });

    res.cookie('token', token, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      data: { user },
      message: 'Login successful.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 */
async function logout(req, res, next) {
  try {
    res.clearCookie('token', { path: '/' });

    return res.status(200).json({
      success: true,
      data: {},
      message: 'Logged out successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Returns the current authenticated user's profile.
 */
async function me(req, res, next) {
  try {
    // req.user is attached by authenticate middleware
    const user = await authService.getUserById(req.user._id.toString());

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me };
