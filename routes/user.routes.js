import express from 'express';
const router = express.Router();
import {getProfile, ask} from '../controllers/user.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

router.get('/profile', isAuthenticated, getProfile);
router.get('/ask', isAuthenticated, ask);

export default router;