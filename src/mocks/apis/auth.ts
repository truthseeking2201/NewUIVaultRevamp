// Mock auth API: returns static access/refresh tokens
export const loginWallet = async (_payload: {
  signature: string;
  timestamp: number;
  address: string;
}) => {
  return {
    access_token: "mock_access_token",
    refresh_token: "mock_refresh_token",
    expires_in: 3600,
  };
};

