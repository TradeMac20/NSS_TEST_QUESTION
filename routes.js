
const express = require('express');
const route = express.Router();
const authenticateToken = require('./auth');
const { registerUser, loginUser, getProfile } = require('./controllers');

route.post('/login', loginUser);
route.post('/register', registerUser);
route.get('/profile', authenticateToken, getProfile);

module.exports = route;


