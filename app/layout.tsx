import './globals.css';

export const metadata = {
  title: 'Apple Drops - Support',
  description: 'Chat interface for customer support',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-gray-100 m-0">
        {children}
      </body>
    </html>
  );
}
