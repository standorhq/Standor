import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "login",
        "logout",
        "password_change",
        "mfa_enabled",
        "mfa_disabled",
        "mfa_backup_codes_regenerated",
        "passkey_added",
        "passkey_removed",
        "api_key_created",
        "api_key_revoked",
        "org_created",
        "org_deleted",
        "org_member_invited",
        "org_member_removed",
        "org_left",
        "session_revoked",
        "account_data_exported",
        "governance_updated",
      ],
      required: true,
    },
    ipAddress: {
      type: String,
      default: "Unknown",
    },
    userAgent: {
      type: String,
      default: "Unknown",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
