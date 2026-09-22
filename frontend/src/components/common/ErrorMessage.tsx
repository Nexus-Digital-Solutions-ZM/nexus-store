type ErrorMessageProps = {
  message: string;
};

export default function ErrorMessage({ message }: ErrorMessageProps): JSX.Element {
  return <div role="alert">{message}</div>;
}
