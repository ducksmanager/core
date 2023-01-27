export type UserForAccountForm = {
  userId?: number;
  oldPassword?: string;
  password?: string;
  password2?: string;
  discordId?: number;
  email: string;
  allowSharing: boolean;
  presentationText: string;
  okForExchanges: boolean;
};
