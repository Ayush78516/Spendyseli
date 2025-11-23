import ClientLayout from "@/components/ClientLayout";

export const metadata = {
  title: "SpendYseli",
  description: "One stop finance platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
