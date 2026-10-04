export default function EmptyState({
  title = "No records found.",
  text = "Try adjusting your search or create a new record.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}
