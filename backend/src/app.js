import express from 'express';
import cors from 'cors';
import { env, corsOrigins } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import healthRoutes from './modules/health/health.routes.js';
import outletRoutes from './modules/outlet/outlet.routes.js';
import brandRoutes from './modules/brand/brand.routes.js';
import productRoutes from './modules/product/product.routes.js';
import customerRoutes from './modules/customer/customer.routes.js';

export const app = express();

// Allow any origin listed in CORS_ORIGIN (comma-separated — see
// config/env.js). Using a dynamic origin callback instead of a static
// string/array lets us:
//  - support multiple allowed origins (local dev + the deployed Azure
//    Static Web App, plus any preview URLs) from one env var
//  - allow requests with no Origin header (server-to-server calls, curl,
//    health checks) which browsers don't send an Origin for anyway
//  - support "*" (allow all) via CORS_ORIGIN=* without breaking credentials
const corsOptions = {
  origin(origin, callback) {
    if (!origin || corsOrigins.includes('*') || corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    const err = new Error(`Origin ${origin} is not allowed by CORS`);
    err.statusCode = 403;
    callback(err);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Unauthenticated on purpose — see modules/health. Combines a DB round-trip
// with the fact that reaching this handler already proves the backend is up,
// so the frontend's HealthStatusTag can tell "backend down" apart from
// "backend up, database down" from a single response.
app.use('/api/health', healthRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/outlets', outletRoutes);
app.use('/api/masters/brand', brandRoutes);
app.use('/api/masters/product', productRoutes);
app.use('/api/customers', customerRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
