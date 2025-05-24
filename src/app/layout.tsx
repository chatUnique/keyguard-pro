import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KeyGuard Pro - AI密钥守护者',
  description: '专业、安全、高效的AI API Key检测与验证平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
} 