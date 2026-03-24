import type { Metadata } from "next";
import { Geist, Quicksand } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://barcamp.bangsaen.org"),
  title: {
    default: "Barcamp Bangsaen",
    template: "%s | Barcamp Bangsaen",
  },
  description:
    "An unconference by the sea where ideas flow freely. Join us for talks, and networking at Bangsaen beach.",
  keywords: [
    "Barcamp",
    "Bangsaen",
    "Barcamp Bangsaen",
    "Unconference",
    "Technology",
    "Networking",
    "Burapha University",
    "Developer",
    "Event",
  ],
  authors: [{ name: "Barcamp Bangsaen Team" }],
  creator: "Barcamp Bangsaen",
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "https://barcamp.bangsaen.org",
    title: "Barcamp Bangsaen",
    description:
      "An unconference by the sea where ideas flow freely. Join us for talks, and networking at Bangsaen beach.",
    siteName: "Barcamp Bangsaen",
    images: [
      {
        url: "/og-image.png", // Make sure to add this image to /public
        width: 1200,
        height: 630,
        alt: "Barcamp Bangsaen",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Barcamp Bangsaen",
    description:
      "An unconference by the sea where ideas flow freely. Join us for talks, and networking at Bangsaen beach.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.className} ${quicksand.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
