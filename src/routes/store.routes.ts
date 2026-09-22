import { Router } from 'express';
import { getHomeScreenData, getStoreSettings, updateStoreSettings } from '../controllers/store.controller.js';

const router = Router();

router.get('/home', getHomeScreenData);
router.get('/settings', getStoreSettings);
router.put('/settings', updateStoreSettings);

export default router;