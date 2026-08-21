export const metadata = {
  title: 'Suqly',
  description: 'Suqly MVP',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'sans-serif', maxWidth: 700, margin: '0 auto', padding: 20 }}>
        {children}
      </body>
    </html>
  );
}
