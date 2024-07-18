import mongoose from 'mongoose';

const LoanSchema = new mongoose.Schema({
    capital: { type: Number, required: true },
    tasaAnual: { type: Number, required: true },
    cuotas: { type: Number, required: true },
    iva: { type: Number, required: true },
    feeMensual: { type: Number, default: 0 },
    costoOtorgamiento: { type: Number, default: 0 },
    sellado: { type: Number, default: 0 },
    selladoAmount: { type: Number, default: 0 },
    fechaAlta: { type: Date, default: Date.now },
    fechaVencimientoPrimerCuota: { type: Date, required: true },
    planDePagos: [{
        cuota: { type: Number, required: true },
        capitalPendiente: { type: Number, required: true },
        interes: { type: Number, required: true },
        interesConIva: { type: Number, required: true },
        amortizacion: { type: Number, required: true },
        feeMensual: { type: Number, required: true },
        cuotaConFee: { type: Number, required: true },
        fechaVencimiento: { type: Date, required: true }
    }],
    pagos: [{
        monto: { type: Number, required: true },
        fecha: { type: Date, default: Date.now }
    }],
    interesesDevengados: { type: Number, default: 0 }
});

const Loan = mongoose.model('Loan', LoanSchema);

export default Loan;
