import { Router } from 'express';
import { getSettings, updateSettings } from './settings.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getSettings);
router.put('/', updateSettings);

export default router;
