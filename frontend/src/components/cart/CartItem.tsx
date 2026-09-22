type CartItemProps = {
  name: string;
  quantity: number;
};

export default function CartItem({ name, quantity }: CartItemProps): JSX.Element {
  return (
    <li>
      {name} x {quantity}
    </li>
  );
}
