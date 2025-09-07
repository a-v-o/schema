import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Schema",
  description:
    "A web app created to aid general contractors in creating timelines, cost estimates and maniaging the lifecycle as well as other needs of a project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <NextTopLoader />
        <main className="w-full min-h-screen flex justify-center items-center">
          {children}
        </main>
      </body>
    </html>
  );
}
