type InputProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
};

export default function Input({ label, value, onChange, placeholder, type = "text" }: InputProps): JSX.Element {
  return (
    <label style={{ display: "grid", gap: "0.35rem" }}>
      {label ? <span>{label}</span> : null}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        style={{ padding: "0.7rem 0.8rem", borderRadius: "0.5rem", border: "1px solid #d1d5db" }}
      />
    </label>
  );
}
