export const mockMobileMoney = {
  async process(): Promise<{ success: boolean; paymentId: string }> {
    return {
      success: true,
      paymentId: "mock-mobile-money-payment",
    };
  },
};
