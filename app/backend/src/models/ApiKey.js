import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
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
    keyPrefix: {
      type: String,
      required: true,
    },
    hashedKey: {
      type: String,
      required: true,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Ensure a user can only have one key with a specific name
apiKeySchema.index({ userId: 1, name: 1 }, { unique: true });

const ApiKey = mongoose.model("ApiKey", apiKeySchema);
export default ApiKey;
