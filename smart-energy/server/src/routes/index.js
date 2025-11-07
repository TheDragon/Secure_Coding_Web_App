import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import householdsRoutes from './households.routes.js';
import metersRoutes from './meters.routes.js';
import readingsRoutes from './readings.routes.js';
import goalsRoutes from './goals.routes.js';
import alertsRoutes from './alerts.routes.js';
import { verifyMailTransport } from '../utils/mail.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));
router.get('/health/mail', async (_req, res) => {
  const ok = await verifyMailTransport();
  res.json({ smtp: ok ? 'ok' : 'fail' });
});
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/households', householdsRoutes);
router.use('/meters', metersRoutes);
router.use('/readings', readingsRoutes);
router.use('/goals', goalsRoutes);
router.use('/alerts', alertsRoutes);

export default router;
