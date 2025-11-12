// const express = require('express');
import express from 'express';
const router = express.Router();
// const { isAuthenticated } = require('../middlewares/auth.middleware');
import { isAuthenticated } from '../middlewares/auth.middleware.js';
// const aiController = require('../controllers/ai.controller');
import { handleChatRequest } from '../controllers/ai.controller.js';
router.post('/chat', isAuthenticated, handleChatRequest);
// router.post('/startSession', aiController.handleChatRequest);


export default router;