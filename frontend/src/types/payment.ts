export type PaymentMethod = 'mobile_money' | 'card'

export type PaymentStatus = 'success' | 'failed' | 'pending'

export type Payment = {
  status: PaymentStatus
  method: PaymentMethod
  transactionId?: string
}
