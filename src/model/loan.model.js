import mongoose from 'mongoose';
import { ClientModel } from './client.model.js';

const LoanSchema = new mongoose.Schema({
    codigo: { type: String, required: true, unique: true },
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
    interesesDevengados: { type: Number, default: 0 },
    estado: { type: String, enum: ['vigente', 'cancelado', 'non_accrual', 'castigado', 'refinanciado', 'renovado'], required: true, default: 'vigente' },
    destino: { type: String, enum: ['primario', 'refinanciamiento', 'renovacion'], required: true, default: 'primario' },
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'client', required: true }, 
});

export const LoanModel = mongoose.model('Loan', LoanSchema);
