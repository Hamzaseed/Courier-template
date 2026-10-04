import PortalShell from "@/components/common/PortalShell";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell portal="admin">{children}</PortalShell>;
}
