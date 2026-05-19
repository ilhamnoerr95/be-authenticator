export interface SetupTwoFactorResult {
  userId: string;
  qrCodeDataUrl: string;
  manualEntryKey: string;
  backupCodes: string[];
}

export interface TwoFactorActionResult {
  success: boolean;
  message: string;
}

export interface ValidateOtpResult {
  valid: boolean;
}
