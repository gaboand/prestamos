import {LoanModel} from '../model/loan.model.js';

export const cancelInstallment = async (req, res) => {
    const { loanId, installmentNumber } = req.body;

    try {
        const loan = await LoanModel.findById(loanId);
        if (!loan) {
            return res.status(404).json({ error: 'Préstamo no encontrado' });
        }

        if (installmentNumber < 1 || installmentNumber > loan.cuotas) {
            return res.status(400).json({ error: 'Número de cuota inválido' });
        }

        const installmentIndex = installmentNumber - 1;
        loan.planDePagos[installmentIndex].pagado = true;
        await loan.save();

        res.json({ message: 'Cuota cancelada correctamente', loan });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cancelar la cuota' });
    }
};

export const dailyInterest = (capital, tna) => {
    const tasaDiaria = tna / 365 / 100;
    return capital * tasaDiaria;
};

export const accrueInterest = async (req, res) => {
    const { codigo } = req.body;

    try {
        const loan = await LoanModel.findOne({ codigo });
        if (!loan) {
            return res.status(404).render('error', { message: 'Préstamo no encontrado' });
        }

        const today = new Date();
        let totalInteresesDevengados = 0;

        loan.planDePagos.forEach((installment, index) => {
            const dueDate = new Date(installment.fechaVencimiento);
            let interesAcumulado = 0;
            let interesCompensatorio = 0;
            let interesPunitorio = 0;
            let diasMora = 0;
            let deudaActualizada = 0;

            if (today >= dueDate && !installment.pagado) {
                interesAcumulado = parseFloat(installment.interes);
                diasMora = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
                let diasVencidos = Math.min(diasMora, 90);
                let interesDiario = dailyInterest(installment.capitalPendiente, loan.tasaAnual);
                interesCompensatorio = interesDiario * diasVencidos;
                interesPunitorio = interesCompensatorio * 0.5;
                installment.interesCompensatorio = interesCompensatorio.toFixed(2);
                installment.interesPunitorio = interesPunitorio.toFixed(2);
                installment.diasMora = diasMora;
            } else if (today < dueDate && today >= new Date(loan.fechaAlta)) {
                let diasTranscurridos = Math.floor((today - new Date(loan.fechaAlta)) / (1000 * 60 * 60 * 24));
                let interesDiario = dailyInterest(installment.capitalPendiente, loan.tasaAnual);
                interesAcumulado = Math.min(diasTranscurridos * interesDiario, parseFloat(installment.interes));
            }

            if (today < dueDate) {
                interesAcumulado = 0;
                installment.interesCompensatorio = 0;
                installment.interesPunitorio = 0;
                installment.diasMora = 0;
            }

            installment.interesDevengado = interesAcumulado.toFixed(2);
            totalInteresesDevengados += parseFloat(installment.interesDevengado) || 0;
            totalInteresesDevengados += parseFloat(installment.interesCompensatorio) || 0;
            totalInteresesDevengados += parseFloat(installment.interesPunitorio) || 0;

            const ivaSobreInteres = parseFloat(installment.interes) * (loan.iva / 100) || 0;
            installment.ivaSobreInteres = ivaSobreInteres.toFixed(2);

            const cuotaTotalSinIva = (parseFloat(installment.amortizacion) || 0) + (parseFloat(installment.interes) || 0);
            const cuotaTotalConIva = cuotaTotalSinIva + ivaSobreInteres + (parseFloat(installment.feeMensual) || 0);

            deudaActualizada = cuotaTotalConIva + (parseFloat(installment.interesCompensatorio) || 0) + (parseFloat(installment.interesPunitorio) || 0);
            installment.deudaActualizada = deudaActualizada.toFixed(2);

            installment.cuotaTotalSinIva = cuotaTotalSinIva.toFixed(2);
            installment.cuotaTotalConIva = cuotaTotalConIva.toFixed(2);

            loan.planDePagos[index] = installment;
        });

        loan.interesesDevengados = totalInteresesDevengados.toFixed(2);
        await loan.save();

        res.render('accrueInterestResult', { message: 'Intereses devengados correctamente', loan, today: today.toLocaleDateString('es-ES') });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Error al devengar intereses' });
    }
};

export const calculateTotalCancellation = async (req, res) => {
    const { loanId } = req.params;

    try {
        const loan = await LoanModel.findById(loanId);
        if (!loan) {
            return res.status(404).json({ error: 'Préstamo no encontrado' });
        }

        const today = new Date();
        let totalCancellation = 0;
        let pendingCapital = 0;
        let accruedInterest = 0;

        loan.planDePagos.forEach((installment) => {
            if (!installment.pagado) {
                pendingCapital += parseFloat(installment.amortizacion);
                const dueDate = new Date(installment.fechaVencimiento);
                if (dueDate <= today) {
                    const interest = parseFloat(installment.interes);
                    const interestWithIva = interest * (1 + loan.iva / 100);
                    accruedInterest += interestWithIva;
                }
            }
        });

        totalCancellation = (pendingCapital + accruedInterest).toFixed(2);

        res.json({ message: 'Monto de cancelación total calculado correctamente', totalCancellation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al calcular el monto de cancelación total' });
    }
};

