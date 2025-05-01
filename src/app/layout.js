export const metadata = {
  title: "Shop",
  description: "CS391 Project 2",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
