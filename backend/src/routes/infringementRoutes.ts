import express from 'express';
import { 
  handleInfringementStatus, 
  handleInfringementStatusByContract 
} from '../controllers/infringementController';

const router = express.Router();

router.get('/:id', handleInfringementStatus);
router.get('/contract/:contractAddress/:tokenId', handleInfringementStatusByContract);

export default router; 