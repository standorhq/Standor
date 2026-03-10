import mongoose from "mongoose";

const passkeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    credentialID: {
      type: String,
      required: true,
      unique: true,
    },
    credentialPublicKey: {
      type: Buffer,
      required: true,
    },
    counter: {
      type: Number,
      required: true,
    },
    transports: {
      type: [String],
      default: [],
    },
    deviceType: {
      type: String,
      default: "singleDevice",
    },
    backedUp: {
      type: Boolean,
      default: false,
    },
    lastUsed: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Passkey = mongoose.model("Passkey", passkeySchema);
export default Passkey;
