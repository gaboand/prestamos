import { Router } from 'express';
import viewsRouter from './views.routes.js';
import loanRouter from './loan.routes.js';
import administrationRouter from './administration.routes.js';
import paymentRouter from './payment.routes.js';
import { getLoans } from '../controllers/loan.controller.js';
import { accrueInterest } from '../controllers/administration.controller.js';

const indexRouter = Router();

indexRouter.use('/', viewsRouter);
indexRouter.use('/loan', loanRouter);
indexRouter.use('/administration', administrationRouter);
indexRouter.use('/payments', paymentRouter);
indexRouter.get('/loans', getLoans);
indexRouter.post('/accrue-interest', accrueInterest);

export default indexRouter;
