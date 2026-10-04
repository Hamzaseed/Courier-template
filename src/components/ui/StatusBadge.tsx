export default function StatusBadge({ value }: { value: string }) {
  const key = value.toLowerCase().replaceAll("_", "-").replaceAll(" ", "-");
  return (
    <span className={`badge badge-${key}`}>{value.replaceAll("_", " ")}</span>
  );
}
