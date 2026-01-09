import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Requerimientos del Cliente Inmobiliario",
  description: "Formulario para especificar requerimientos de propiedades",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}





