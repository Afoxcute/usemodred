import express from 'express';
import handleRegistration from '../controllers/registerController';

const router = express.Router();

router.post('/', handleRegistration);

export default router; 