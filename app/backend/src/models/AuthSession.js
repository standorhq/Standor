import mongoose from "mongoose";

const authSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userAgent: {
      type: String,
      default: "Unknown Device",
    },
    ip: {
      type: String,
      default: "Unknown IP",
    },
    lastUsed: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const AuthSession = mongoose.model("AuthSession", authSessionSchema);
export default AuthSession;
