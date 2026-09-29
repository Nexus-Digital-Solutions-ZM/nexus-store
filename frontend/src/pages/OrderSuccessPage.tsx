import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import type { Order } from '../types/order'
import type { Payment } from '../types/payment'

type OrderSuccessState = {
  order: Order
  payment: Payment
}

const NETWORK_LABELS: Record<string, string> = {
  mtn: 'MTN',
  airtel: 'Airtel',
  zamtel: 'Zamtel',
}

export default function OrderSuccessPage() {
  const location = useLocation()
  const state = location.state as OrderSuccessState | undefined
  const order = state?.order
  const payment = state?.payment

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  const formatPaymentMethod = (method?: Payment['method']) => {
    if (!method) return 'N/A'
    return method === 'mobile_money' ? 'Mobile Money' : 'Visa / Card'
  }

  const formatPaymentStatus = (status?: Payment['status']) => {
    if (!status) return 'N/A'
    const statusMap = {
      success: 'Completed',
      pending: 'Pending',
      failed: 'Failed',
    }
    return statusMap[status] || status
  }

  const getMobileMoneyNetworkLabel = (network?: Payment['mobileMoneyNetwork']) => {
    if (!network) return null
    return NETWORK_LABELS[network] || network
  }

  return (
    <main className="page-container">
      <div className="order-result">
        <div className="order-result-icon">✓</div>

        <p className="eyebrow">ORDER COMPLETE</p>

        <h1>Order Successful!</h1>

        <p>
          Your order has been received successfully.
        </p>

        {order && (
          <div className="order-details">
            <div className="order-detail-row">
              <span>Order ID</span>
              <strong>{order.id}</strong>
            </div>
            <div className="order-detail-row">
              <span>Date</span>
              <strong>{formatDate(order.createdAt)}</strong>
            </div>
            <div className="order-detail-row">
              <span>Payment Method</span>
              <strong>{formatPaymentMethod(payment?.method)}</strong>
            </div>
            {payment?.method === 'mobile_money' && payment?.mobileMoneyNetwork && (
              <div className="order-detail-row">
                <span>Network</span>
                <strong>{getMobileMoneyNetworkLabel(payment.mobileMoneyNetwork)}</strong>
              </div>
            )}
            <div className="order-detail-row">
              <span>Payment Status</span>
              <strong className={`payment-status-${payment?.status}`}>
                {formatPaymentStatus(payment?.status)}
              </strong>
            </div>
            {payment?.transactionId && (
              <div className="order-detail-row">
                <span>Transaction ID</span>
                <strong>{payment.transactionId}</strong>
              </div>
            )}
            <div className="order-detail-row total">
              <span>Total</span>
              <strong>K{order.total.toFixed(2)}</strong>
            </div>
          </div>
        )}

        <Link to="/products" className="primary-button">
          Continue Shopping
        </Link>
      </div>
    </main>
  )
}