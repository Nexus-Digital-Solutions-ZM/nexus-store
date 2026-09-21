type OrderSummaryProps = {
  total: number;
};

export default function OrderSummary({ total }: OrderSummaryProps): JSX.Element {
  return <div>Order total: {total}</div>;
}
