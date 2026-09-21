type CartSummaryProps = {
  total: number;
};

export default function CartSummary({ total }: CartSummaryProps): JSX.Element {
  return <div>Total: {total}</div>;
}
