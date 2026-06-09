import { Router } from 'express';
import authRoutes from '../modules/auth/auth.route';
import uploadRoutes from '../modules/upload/upload.route';
import adminRoutes from '../modules/admin/admin.route';
import supportRoutes from '../modules/support/support.route';
import subscriptionRoutes from '../modules/subscription/subscription.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/upload',
    route: uploadRoutes,
  },
  {
    path: '/admin',
    route: adminRoutes,
  },
  {
    path: '/support',
    route: supportRoutes,
  },
  {
    path: '/subscriptions',
    route: subscriptionRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
