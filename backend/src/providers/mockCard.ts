export const mockCard = {
  async process(): Promise<{ success: boolean; paymentId: string }> {
    return {
      success: true,
      paymentId: "mock-card-payment",
    };
  },
};
