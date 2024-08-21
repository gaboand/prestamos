import { Router } from 'express';
import viewsRouter from './views.routes.js';
import loanRouter from './loan.routes.js';
import administrationRouter from './administration.routes.js';
import clientRouter from './client.routes.js';
import paymentRouter from './payment.routes.js';

const indexRouter = Router();

indexRouter.use('/', viewsRouter);
indexRouter.use('/api/loan', loanRouter);
indexRouter.use('/api/administration', administrationRouter);
indexRouter.use('/api/client', clientRouter);
indexRouter.use('/api/payment', paymentRouter);

export default indexRouter;
