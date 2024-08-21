import {LoanModel} from '../model/loan.model.js';
import {PaymentModel} from '../model/payment.model.js';

export const makePayment = async (req, res) => {
    const { codigo, amount, cuota, canal } = req.body;

    try {
        const loan = await LoanModel.findOne({ codigo });
        if (!loan) {
            return res.status(404).json({ message: 'Préstamo no encontrado' });
        }

        const selectedCuota = loan.planDePagos.find(installment => installment.cuota === parseInt(cuota));
        if (!selectedCuota) {
            return res.status(400).json({ message: 'Cuota no válida' });
        }

        const paymentAmount = parseFloat(amount);
        if (paymentAmount < selectedCuota.cuotaConFee) {  // Suponiendo que cuotaConFee es el monto total de la cuota
            return res.status(400).json({ message: 'El monto del pago no puede ser menor al total de la cuota' });
        }

        const today = new Date();

        const payment = new PaymentModel({
            monto: paymentAmount,
            loan: loan._id,
            fecha: today,
            canal: canal,
            cuota: selectedCuota.cuota,
            estado: 'pagado'
        });

        await payment.save();

        loan.pagos.push({ monto: paymentAmount, fecha: today, cuota: selectedCuota.cuota, canal: canal });

        selectedCuota.pagado = true;
        selectedCuota.deudaActualizada = 0;  // Si hay un campo para la deuda restante
        selectedCuota.diasMora = 0;

        loan.planDePagos.forEach(installment => {
            if (!installment.pagado) {
                const dueDate = new Date(installment.fechaVencimiento);
                installment.diasMora = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
            }
        });

        await loan.save();

        res.json({ message: 'Pago registrado correctamente', loan, payment, today: today.toLocaleDateString('es-ES') });
    } catch (error) {
        console.error('Error en makePayment:', error);
        res.status(500).json({ message: 'Error al registrar el pago', error: error.message });
    }
};

export const searchLoan = async (req, res) => {
    const { codigo } = req.query;

    try {
        const loan = await LoanModel.findOne({ codigo });
        if (!loan) {
            return res.status(404).json({ message: 'Préstamo no encontrado' });
        }

        res.json({ loan });
    } catch (error) {
        console.error('Error al buscar el préstamo:', error);
        res.status(500).json({ message: 'Error al buscar el préstamo' });
    }
};

