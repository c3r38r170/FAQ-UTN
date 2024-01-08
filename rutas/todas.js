import express from 'express';
const router = express.Router();

// import {router as apiRouter} from './api/v1/router.js';
import {router as frontendRouter} from './frontend.js';

// router.use('/api', apiRouter);
router.use('/', frontendRouter);

export {router};