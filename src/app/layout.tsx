import type { Metadata } from "next";
import "@/styles/globals.css";
import Providers from "@/components/common/Providers";
export const metadata: Metadata = {
  title: "CourierFlow Portal",
  description: "Connected courier operations portal",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
