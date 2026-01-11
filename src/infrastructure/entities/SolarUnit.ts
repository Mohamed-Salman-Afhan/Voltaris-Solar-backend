import mongoose from "mongoose";
import { SolarUnitStatus } from "../../domain/constants";

export interface ISolarUnit extends mongoose.Document {
  userId?: mongoose.Types.ObjectId;
  serialNumber: string;
  installationDate: Date;
  capacity: number;
  status: SolarUnitStatus;
  location?: {
    latitude: number;
    longitude: number;
  };
  city?: string;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
}

const solarUnitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
  },
  installationDate: {
    type: Date,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(SolarUnitStatus),
  },
  location: {
    latitude: Number,
    longitude: Number,
  },
  city: { type: String },
  country: { type: String },
}, { timestamps: true });

export const SolarUnit = mongoose.model<ISolarUnit>("SolarUnit", solarUnitSchema);