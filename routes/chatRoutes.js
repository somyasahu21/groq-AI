const express = require('express');
const router = express.Router();
const { handleGroqChat } = require('../controllers/chatController');

router.post('/', handleGroqChat);

module.exports = router;
