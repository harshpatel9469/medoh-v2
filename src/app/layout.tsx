import type { Metadata } from "next";
import { Poppins, Lato } from "next/font/google";
import "./globals.css";
import { GoogleTagManager } from "@next/third-parties/google";
import Script from "next/script";
import CookieBanner from "./_components/overlays/cookie-banner";
import { AuthProvider } from "./_contexts/auth-context";
import Header from "./_components/Header";
import Footer from "./_components/Footer";

export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "Medoh Health",
  },
  description:
    "Your trusted source for medical information on rotator cuff injury & tears",
  metadataBase: new URL("https://www.medohhealth.com/"),
};
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Add the weights you need
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"], // Add the weights you need
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}

            if(localStorage.getItem('consentMode') === null){
                gtag('consent', 'default', {
                    'ad_storage': 'denied',
                    'analytics_storage': 'denied',
                    'ad_user_data': 'denied',
                    'ad_personalization': 'denied'
                });
            } else {
                gtag('consent', 'default', JSON.parse(localStorage.getItem('consentMode')));
            }
          `,
        }}
      />

      <GoogleTagManager gtmId={process.env.NEXT_GTM_ID as string} />
      <AuthProvider>
        <body className={`${poppins.variable} ${lato.variable}`}>
          {children}
          <CookieBanner />
        </body>
      </AuthProvider>
    </html>
  );
}
