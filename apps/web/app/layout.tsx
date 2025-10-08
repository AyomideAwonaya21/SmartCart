export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Inter, system-ui, sans-serif", margin: 0 }}>
        <header style={{ padding: 16, borderBottom: "1px solid #eee" }}>
          <strong>SmartCart</strong>
        </header>
        <main style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>{children}</main>
      </body>
    </html>
  );
}
