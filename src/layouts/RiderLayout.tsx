import PortalShell from "@/components/common/PortalShell";
export default function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell portal="rider">{children}</PortalShell>;
}
