type PaymentMethodSelectorProps = {
  selected: string;
};

export default function PaymentMethodSelector({ selected }: PaymentMethodSelectorProps): JSX.Element {
  return <div>Selected payment: {selected}</div>;
}
