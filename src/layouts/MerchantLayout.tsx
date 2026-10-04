import PortalShell from "@/components/common/PortalShell";
export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell portal="merchant">{children}</PortalShell>;
}
