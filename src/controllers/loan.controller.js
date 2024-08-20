import Loan from '../model/loan.model.js';

export const simulateLoan = (req, res) => {
    const { capital, tasaAnual, cuotas, iva, feeMensual, costoOtorgamiento, sellado, fechaPrimerVencimiento } = req.body;

    const capitalFloat = parseFloat(capital);
    const tasaAnualFloat = parseFloat(tasaAnual);
    const cuotasInt = parseInt(cuotas);
    const ivaFloat = parseFloat(iva);
    const feeMensualFloat = parseFloat(feeMensual) || 0;
    const costoOtorgamientoFloat = parseFloat(costoOtorgamiento) || 0;
    const selladoFloat = parseFloat(sellado) || 0;

    const selladoAmount = capitalFloat * (selladoFloat / 100);
    const capitalDescontado = capitalFloat - costoOtorgamientoFloat - selladoAmount;
    const tasaMensual = tasaAnualFloat / 12 / 100;
    const cuotaSinFee = capitalDescontado * tasaMensual / (1 - Math.pow(1 + tasaMensual, -cuotasInt));
    const cuotaConFee = cuotaSinFee + feeMensualFloat;

    const planDePagos = [];
    let capitalPendiente = capitalDescontado;
    const fechaPrimerVencimientoDate = new Date(fechaPrimerVencimiento);

    for (let i = 0; i < cuotasInt; i++) {
        const interes = capitalPendiente * tasaMensual;
        const interesConIva = interes * (ivaFloat / 100);
        const amortizacion = cuotaSinFee - interes;
        const fechaVencimiento = new Date(fechaPrimerVencimientoDate);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);

        planDePagos.push({
            cuota: i + 1,
            capitalPendiente: capitalPendiente.toFixed(2),
            interes: interes.toFixed(2),
            interesConIva: interesConIva.toFixed(2),
            amortizacion: amortizacion.toFixed(2),
            feeMensual: feeMensualFloat.toFixed(2),
            cuotaConFee: cuotaConFee.toFixed(2),
            fechaVencimiento: fechaVencimiento.toISOString() 
        });

        capitalPendiente -= amortizacion;
    }

    const totalInteres = planDePagos.reduce((acc, curr) => acc + parseFloat(curr.interes), 0);
    const totalInteresConIva = planDePagos.reduce((acc, curr) => acc + parseFloat(curr.interesConIva), 0);
    const totalAmortizacion = planDePagos.reduce((acc, curr) => acc + parseFloat(curr.amortizacion), 0);
    const totalFeeMensual = planDePagos.reduce((acc, curr) => acc + parseFloat(curr.feeMensual), 0);
    const totalCuotaConFee = planDePagos.reduce((acc, curr) => acc + parseFloat(curr.cuotaConFee), 0);

    res.json({
        capital: capitalFloat.toFixed(2),
        tasaAnual: tasaAnualFloat,
        cuotas: cuotasInt,
        iva: ivaFloat,
        feeMensual: feeMensualFloat.toFixed(2),
        costoOtorgamiento: costoOtorgamientoFloat.toFixed(2),
        sellado: selladoFloat,
        selladoAmount: selladoAmount.toFixed(2),
        fechaPrimerVencimiento,
        planDePagos,
        totalInteres: totalInteres.toFixed(2),
        totalInteresConIva: totalInteresConIva.toFixed(2),
        totalAmortizacion: totalAmortizacion.toFixed(2),
        totalFeeMensual: totalFeeMensual.toFixed(2),
        totalCuotaConFee: totalCuotaConFee.toFixed(2)
    });
};

async function generateLoanCode() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (`0${today.getMonth() + 1}`).slice(-2); // Mes con dos dígitos
    const day = (`0${today.getDate()}`).slice(-2); // Día con dos dígitos

    const datePart = `${year}${month}${day}`;

    // Buscar el último préstamo creado en la base de datos que tenga el mismo datePart en su código
    const lastLoan = await Loan.findOne({ codigo: new RegExp(`^${datePart}`) })
                                .sort({ codigo: -1 });

    let nextSequence = '00001'; // Default para el primer préstamo del día

    if (lastLoan) {
        // Extraer la parte numérica del código
        const lastSequence = parseInt(lastLoan.codigo.slice(-5), 10);
        nextSequence = (`00000${lastSequence + 1}`).slice(-5);
    }

    return `${datePart}${nextSequence}`;
}

export const createLoan = async (req, res) => {
    const { capital, tasaAnual, cuotas, iva, feeMensual, costoOtorgamiento, sellado, fechaPrimerVencimiento, estado } = req.body;

    try {
        const feeMensualNum = parseFloat(feeMensual) || 0;
        const costoOtorgamientoNum = parseFloat(costoOtorgamiento) || 0;
        const selladoNum = parseFloat(sellado) || 0;

        const selladoAmount = (capital * (selladoNum / 100)).toFixed(2);
        const capitalOtorgado = (capital - costoOtorgamientoNum).toFixed(2);

        const planDePagos = [];
        let capitalPendiente = capitalOtorgado;

        const tasaMensual = tasaAnual / 12 / 100;
        const cuotaSinIva = (capitalOtorgado * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -cuotas));

        for (let i = 1; i <= cuotas; i++) {
            const interes = (capitalPendiente * tasaMensual).toFixed(2);
            const interesConIva = (interes * (iva / 100)).toFixed(2);
            const amortizacion = (cuotaSinIva - interes).toFixed(2);
            const cuotaConFee = (parseFloat(cuotaSinIva) + parseFloat(interesConIva) + parseFloat(feeMensualNum)).toFixed(2);

            capitalPendiente -= amortizacion;

            planDePagos.push({
                cuota: i,
                capitalPendiente: capitalPendiente.toFixed(2),
                interes,
                interesConIva,
                amortizacion,
                feeMensual: feeMensualNum.toFixed(2),
                cuotaConFee,
                fechaVencimiento: new Date(new Date(fechaPrimerVencimiento).setMonth(new Date(fechaPrimerVencimiento).getMonth() + (i - 1))).toISOString().split('T')[0]
            });
        }

        const codigo = await generateLoanCode();

        const loan = new Loan({
            capital: capitalOtorgado,
            tasaAnual,
            cuotas,
            iva,
            feeMensual: feeMensualNum,
            costoOtorgamiento: costoOtorgamientoNum,
            sellado: selladoNum,
            selladoAmount,
            fechaAlta: new Date().toISOString().split('T')[0],
            fechaVencimientoPrimerCuota: fechaPrimerVencimiento,
            codigo, // Guardar el código generado
            estado: estado || 'vigente', // Guardar el estado (por defecto "vigente")
            planDePagos
        });

        await loan.save();

        res.json({ message: 'Préstamo confirmado correctamente', loan });
    } catch (error) {
        console.error('Error al crear el préstamo:', error);
        res.status(500).json({ error: 'Error al confirmar el préstamo.' });
    }
};

export const getLoanById = async (req, res) => {
    const { id } = req.params;

    try {
        const loan = await Loan.findById(id);
        if (!loan) {
            return res.status(404).render('error', { message: 'Préstamo no encontrado' });
        }

        res.render('loanDetail', { loan, title: 'Detalles del Préstamo' });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Error al buscar el préstamo' });
    }
};

export const getLoanByCode = async (req, res) => {
    const { codigo } = req.params;

    try {
        const loan = await Loan.findOne({ codigo });
        if (!loan) {
            return res.status(404).render('error', { message: 'Préstamo no encontrado' });
        }

        res.render('loanDetail', { loan, title: 'Detalles del Préstamo' });
    } catch (error) {
        console.error('Error al buscar el préstamo:', error);
        res.status(500).render('error', { message: 'Error al buscar el préstamo' });
    }
};


export const getLoans = async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        const loans = await Loan.find({
            fechaAlta: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        });

        const loansWithDetails = loans.map(loan => {
            const daysInMora = calculateDaysInMora(loan.planDePagos);
            const totalDebt = calculateTotalDebt(loan.planDePagos);
            return {
                ...loan.toObject(),
                daysInMora,
                totalDebt: totalDebt.toFixed(2)
            };
        });

        res.json(loansWithDetails);
    } catch (error) {
        console.error('Error al obtener los préstamos:', error);
        res.status(500).json({ error: 'Error al obtener los préstamos.' });
    }
};

const calculateDaysInMora = (planDePagos) => {
    const today = new Date();
    let maxDaysInMora = 0;

    planDePagos.forEach(pago => {
        const fechaVencimiento = new Date(pago.fechaVencimiento);
        if (!pago.pagado && fechaVencimiento < today) {
            const daysInMora = Math.floor((today - fechaVencimiento) / (1000 * 60 * 60 * 24));
            if (daysInMora > maxDaysInMora) {
                maxDaysInMora = daysInMora;
            }
        }
    });

    return maxDaysInMora;
};

const calculateTotalDebt = (planDePagos) => {
    return planDePagos.reduce((total, pago) => {
        if (!pago.pagado) {
            total += parseFloat(pago.cuotaConFee);
        }
        return total;
    }, 0);
};


// export const findLoan = async (req, res) => {
//     const { loanId } = req.query;

//     console.log("Loan ID recibido:", loanId);

//     if (!mongoose.Types.ObjectId.isValid(loanId)) {
//         console.log("ID de préstamo no válido");
//         return res.status(400).render('error', { message: 'ID de préstamo no válido' });
//     }

//     try {
//         const loan = await Loan.findById(loanId);
//         if (!loan) {
//             console.log("Préstamo no encontrado");
//             return res.status(404).render('error', { message: 'Préstamo no encontrado' });
//         }
//         console.log("Préstamo encontrado:", loan);
//         res.render('loanDetail', { loan, title: 'Detalles del Préstamo' });
//     } catch (error) {
//         console.error("Error al buscar el préstamo:", error);
//         res.status(500).render('error', { message: 'Error al buscar el préstamo' });
//     }
// };