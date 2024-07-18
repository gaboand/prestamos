import { Router } from "express";
import { accrueInterest, cancelInstallment, calculateTotalCancellation, dailyInterest } from '../controllers/administration.controller.js';

const administrationRouter = Router();

administrationRouter.post('/accrue-interest', accrueInterest);
administrationRouter.post('/cancel-installment', cancelInstallment);
administrationRouter.get('/calculate-total-cancellation/:loanId', calculateTotalCancellation);
administrationRouter.get('/daily-interest', dailyInterest);

export default administrationRouter;
