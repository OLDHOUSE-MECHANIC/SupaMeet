import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import traceId from './middleware/traceId.js';
import errorHandler from './middleware/errorHandler.js';
import { sendSuccess } from './utils/response.js';
import { swaggerSetup } from './docs/swagger.js';

// Routes
import authRoutes from './modules/auth/auth.routes.js';
import meetingsRoutes from './modules/meetings/meetings.routes.js';
import transcriptRoutes from './modules/transcript/transcript.routes.js';
import analysisRoutes from './modules/analysis/analysis.routes.js';
import actionItemsRoutes from './modules/actionItems/actionItems.routes.js';

const app = express();

// Security + parsing
app.use(helmet());
app.use(cors());
app.use(express.json());

// Trace every request
app.use(traceId);

// Swagger docs
swaggerSetup(app);

// Health check
app.get('/health', (req, res) => {
  sendSuccess(res, { status: 'UP' });
});

// Evaluation endpoint — fill in your real details before submitting
app.get('/api/evaluation', (req, res) => {
  sendSuccess(res, {
    candidateName: 'OM DUBEY',         
    email: 'FILES.OMDUBEY@GMAIL.COM',                 
    repositoryUrl: 'https://github.com/OLDHOUSE-MECHANIC/SupaMeet',   
    deployedUrl: 'YOUR_DEPLOYED_URL',    // TODO: replace
    externalIntegration: 'Resend Email API',
    features: [
      'JWT Authentication',
      'Meeting Management',
      'Real-time Transcript Chunking with Phased Context Logging',
      'AI Analysis with Two-Tier Citations',
      'Action Item Management with Status Tracking',
      'Overdue Detection',
      'Scheduled Email Reminders via Resend',
    ],
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/meetings/:id', transcriptRoutes);
app.use('/api/meetings/:id', analysisRoutes);
app.use('/api/action-items', actionItemsRoutes);

// Global error handler — must be last
app.use(errorHandler);

export default app;
