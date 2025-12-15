import "./globals.css";
import SessionProviderWrapper from "./providers/SessionProviderWrapper";

export const metadata = {
  title: "CRM App",
  description: "Simple CRM with Next.js + NextAuth",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}