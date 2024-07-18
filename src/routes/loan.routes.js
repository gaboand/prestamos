import { Router } from 'express';
import { simulateLoan, createLoan, getLoanById } from '../controllers/loan.controller.js';

const loanRouter = Router();

loanRouter.post('/simulate', simulateLoan);
loanRouter.post('/create', createLoan);
loanRouter.get('/:id', getLoanById);

export default loanRouter;
