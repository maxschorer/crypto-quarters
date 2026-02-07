import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Crypto Quarters',
  description: 'Collect all 50 state quarters as NFTs',
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
