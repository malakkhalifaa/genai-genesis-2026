import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ScamShield",
  description: "AI Personal Fraud Guardian",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
