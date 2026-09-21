type ButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary";
};

export default function Button({ children, type = "button", variant = "primary" }: ButtonProps): JSX.Element {
  return (
    <button
      type={type}
      style={{
        padding: "0.7rem 1rem",
        borderRadius: "0.5rem",
        border: "1px solid #d1d5db",
        background: variant === "primary" ? "#111827" : "#f3f4f6",
        color: variant === "primary" ? "#ffffff" : "#111827",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
