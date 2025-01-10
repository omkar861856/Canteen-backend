// models/Payment.js
import { Schema, model } from 'mongoose';

const refundSchema = new Schema({
  id: { type: String, required: true }, // Unique ID for the refund
  amount: { type: Number, required: true }, // Amount refunded in paise
  created_at: { type: Number, required: true }, // Timestamp of refund creation
  status: { type: String, required: true }, // Refund status (e.g., 'processed')
  notes: { type: [String], default: [] }, // Optional notes
}, { _id: false }); // Prevents Mongoose from adding an _id field to each refund sub-document

const paymentSchema = new Schema({
  id: { type: String, required: true },
  entity: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, required: true },
  order_id: { type: String, required: true },
  invoice_id: { type: String, default: null },
  international: { type: Boolean, required: true },
  method: { type: String, required: true },
  amount_refunded: { type: Number, default: 0 }, // Total refunded amount
  refund_status: { type: String, default: null }, // 'partial', 'full', or null
  captured: { type: Boolean, required: true },
  description: { type: String, required: true },
  card_id: { type: String, default: null },
  bank: { type: String, default: null },
  wallet: { type: String, default: null },
  vpa: { type: String, default: null },
  email: { type: String, required: true },
  contact: { type: String, required: true },
  notes: { type: Object, required: true },
  fee: { type: Number, required: true },
  tax: { type: Number, required: true },
  error_code: { type: String, default: null },
  error_description: { type: String, default: null },
  error_source: { type: String, default: null },
  error_step: { type: String, default: null },
  error_reason: { type: String, default: null },
  acquirer_data: {
    bank_transaction_id: { type: String, required: true },
  },
  created_at: { type: Number, required: true },
  kitchenId: { type: String, required: true },
  refunds: { type: [refundSchema], default: [] }, // Array of refund sub-documents
}, { collection: "Payments" });

export default model('Payment', paymentSchema);