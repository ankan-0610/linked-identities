import { Router } from 'express';
import contactController from './controller';

const router = Router();

router.post('/identify', contactController.identify);

export default router;