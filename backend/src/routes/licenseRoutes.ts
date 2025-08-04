import express from 'express';
import handleLicenseMinting from '../controllers/licenseController';

const router = express.Router();

router.post('/', handleLicenseMinting);

export default router; 