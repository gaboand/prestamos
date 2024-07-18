import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    monto: { type: Number, required: true },
    loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    cuota: { type: Number, required: true },
    fecha: { type: Date, default: Date.now },
    canal: { type: String, required: true },
    estado: { type: String, required: true }
});

const Payment = mongoose.model('Payment', PaymentSchema);

export default Payment;
