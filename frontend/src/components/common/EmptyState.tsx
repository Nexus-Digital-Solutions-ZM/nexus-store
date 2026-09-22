type EmptyStateProps = {
  message: string;
};

export default function EmptyState({ message }: EmptyStateProps): JSX.Element {
  return <div>{message}</div>;
}
