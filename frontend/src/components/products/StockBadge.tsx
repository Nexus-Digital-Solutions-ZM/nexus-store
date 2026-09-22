type StockBadgeProps = {
  stock: number;
};

export default function StockBadge({ stock }: StockBadgeProps): JSX.Element {
  return <span>{stock > 0 ? `${stock} in stock` : "Out of stock"}</span>;
}
