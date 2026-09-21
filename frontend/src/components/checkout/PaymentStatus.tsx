type PaymentStatusProps = {
  status: "idle" | "pending" | "success" | "failed";
};

export default function PaymentStatus({ status }: PaymentStatusProps): JSX.Element {
  return <div>Status: {status}</div>;
}
