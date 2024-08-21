import mongoose from "mongoose";

const clientCollection = "client";

const ClientSchema = new mongoose.Schema({
  dni: { type: Number, required: true },
  first_name: { type: String, required: true, max: 100 },
  last_name: { type: String, required: true, max: 100 },
  email: { type: String, max: 50 },
  phone1: { type: String, required: true },
  phone2: { type: String },
  sex: { type: String, max: 15 },
  address: { type: String, max: 30 },
  number: { type: String },
  city: { type: String, max: 20 },
  province: { type: String, max: 25 },
  country: { type: String, max: 30 },
  postcode: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export const ClientModel = mongoose.model(clientCollection, ClientSchema);
