import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Sofi School | Programa familiar guiado",
  description:
    "Programa educativo en casa para etapa 3-6 años con aprendizaje integral, vida práctica, naturaleza, tecnología y portafolio de seguimiento.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "Sofi School",
    description:
      "Una experiencia educativa familiar para documentar, acompañar y despertar el potencial humano.",
    images: ["/images/hero-learning-table.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
