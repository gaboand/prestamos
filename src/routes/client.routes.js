import { Router } from 'express';
import { registerClient } from '../controllers/client.controller.js';

const clientRouter = Router();

clientRouter.post('/register', registerClient);

export default clientRouter;
