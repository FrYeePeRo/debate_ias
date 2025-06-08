import express from 'express';
import {
  getDebateHistory,
  addExpertResponse,
  clearHistory,
  exportToPDF
} from '../controllers/debateController.js';

const router = express.Router();

router.get('/history', getDebateHistory);
router.post('/response/:type', addExpertResponse);
router.delete('/clear', clearHistory);
router.get('/export/pdf', exportToPDF);

export default router;