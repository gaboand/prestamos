import Loan from '../dao/loan.model.js';
import Payment from '../dao/payment.model.js';

export const makePayment = async (req, res) => {
    const { loanId, amount, cuota, canal } = req.body;

    try {
        const loan = await Loan.findById(loanId);
        if (!loan) {
            return res.status(404).render('error', { message: 'Préstamo no encontrado' });
        }

        const selectedCuota = loan.planDePagos.find(installment => installment.cuota === parseInt(cuota));
        if (!selectedCuota) {
            return res.status(400).render('error', { message: 'Cuota no válida' });
        }

        const paymentAmount = parseFloat(amount);
        if (paymentAmount < selectedCuota.deudaActualizada) {
            return res.status(400).render('error', { message: 'El monto del pago no puede ser menor a la deuda actualizada' });
        }

        const today = new Date();

        const payment = new Payment({
            monto: paymentAmount,
            prestamoAsociado: loan._id,
            fecha: today,
            canal: canal,
            cuota: selectedCuota.cuota
        });

        await payment.save();

        loan.pagos.push({ monto: paymentAmount, fecha: today, cuota: selectedCuota.cuota, canal: canal });

        selectedCuota.pagado = true;
        selectedCuota.deudaActualizada = 0;
        selectedCuota.diasMora = 0;

        loan.planDePagos.forEach(installment => {
            if (!installment.pagado) {
                const dueDate = new Date(installment.fechaVencimiento);
                installment.diasMora = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
            }
        });

        await loan.save();

        res.render('cobranza/paymentResult', { message: 'Pago registrado correctamente', loan, payment, today: today.toLocaleDateString('es-ES') });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Error al registrar el pago' });
    }
};

export const searchLoan = async (req, res) => {
    const { loanId } = req.query;

    try {
        const loan = await Loan.findById(loanId);
        if (!loan) {
            return res.status(404).json({ message: 'Préstamo no encontrado' });
        }

        res.json({ loan });
    } catch (error) {
        console.error('Error al buscar el préstamo:', error);
        res.status(500).json({ message: 'Error al buscar el préstamo' });
    }
};
