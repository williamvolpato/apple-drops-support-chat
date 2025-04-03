import './globals.css';

export const metadata = {
  title: 'Apple Drops - Support',
  description: 'Chat interface for customer support',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'sans-serif', background: '#f5f5f5', margin: 0 }}>
        {children}
      </body>
    </html>
  );
} 
