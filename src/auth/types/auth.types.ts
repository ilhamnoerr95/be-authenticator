export interface RegisteredUserResult {
  userId: string;
  email: string;
  username: string;
  clientAppId: string;
  isTwoFactorEnabled: boolean;
  createdAt: Date;
}

export interface UserWithAppInfo extends RegisteredUserResult {
  externalUserId: string | null;
}
