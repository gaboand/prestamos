import { Router } from 'express';
import { simulateLoan, createLoan, getLoanById, getLoans, getLoanByCode } from '../controllers/loan.controller.js';

const loanRouter = Router();

loanRouter.post('/simulate', simulateLoan);
loanRouter.post('/create', createLoan);
loanRouter.get('/code/:codigo', getLoanByCode);
loanRouter.get('/:id', getLoanById);
loanRouter.get('/', getLoans);

export default loanRouter;
