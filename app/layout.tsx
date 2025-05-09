import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from 'react-toastify'
import Navbar from "@/components/Navbar";
import Provider from "@/components/providers/Provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IRIS – Intelligent Response and Interactive System",
  description: "IRIS is your articulate, reliable AI assistant powered by advanced intelligence and crafted for exceptional, insightful user interaction. Created by Amardeep Lakshkar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-dvh overflow-hidden`}
      >
        <Provider>
          <Navbar />
          {children}
        <ToastContainer />
        </Provider>
      </body>
    </html>
  );
}
