import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  title: "Q-link Chat | Quantum ID Messenger",
  description: "Sci-fi inspired global chat where you connect via a single quantum ID.",
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
          <meta name="theme-color" content="#0f172a" />
          <link rel="icon" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAALzUlEQVR4nFWXe3Bc5XnGj7TaPed837mf3bMX7U33lWTJsmzL1sW62MaOAUu2hGVbvgMJNmAs37Et49g4YNeAuRrjQAlQ0hCHQBuakEI6KSGQyTTQEqak7aQzJSQzaSk0k04vf3R+nXNkU7oz7+zunJnzPO/zvd/7Pq+ixuPMRgI1rqImVLSroeloNTVoioIwPGRLH8bQFozV0xhj+zDX7MdccwArjNG92MNbMCuLMQwHQ1GQNTGEpiMSCURCQ4TvjM/GLF4cZfbHLPhnwAlt9jsEdrPI8MXjhzGX3YzVuhQ704br1uHJIr5ewLPKmEETomUAObQVOboPfckGXD+HryhYqogiJKBfIaFHJOKzBBJXMo8eahpavAY9VoPsXYsxeRxz7rXYRh63yialBARKnkxNB3VeHw2pPkqihTlGwLDvsCIpWNlcpmdwlM7JO6jrHaecEFg18UiNEMNIqIgrKij/T/ZQ8lg1uuljjB/GGNqKqXr4VS6ZRIm83kFdcoRFSw+xcfeT7LzxKEem1vD6/Wv45Wun+dnXD/DNA0s4Ppzn8pYGfvfiFF++ax/e6oMkrQxOTMXRDEz1Cl5cnSUQ/tHVELwK4dViTN2N0TyApagkRYmsXEyqeJhS3wWWjN3Fjtvv5sCGL3BirJZ71kqe31PLjy9N8PEvLgF/z9vfmuH4YJp/+eFT/GT/3XTULSO15Qy1fh1urAZN1T47CiXKXtWiYhNmEnPTaYziPBxFkrKayantlOafZ/8P4dyPfs/0/rOMFJIsySoszGksyBuM1Gts76jmQIfC208fJfy8et9qvnNmI2+fO8MKJaCtsR9n82mk6SNqatCvkFAiKVQVPRZDTtyJ0TKAregkjSayspWSO0Lb1u+y8sK7PPrkZRbki5TNOCnbiVQLCyuMtGPQW3bZVK7m/T89yoevjPHpD9by24fa2NGUp6CoOM39mBNHkLF4RCDEVqJzD69M7zjm0DYspQZP1pM12iiKebTN20u2ZS9Llk0wcc0q8rIa05CRfLYmyOqCOinIazo5w6TH0zg/2cF//epp3ruvh4eXJ+n3chRkkbSSwB7ehtk3gVQUdE1HCTPXvQzG5Aym6uLqWQLRQEHrYk5xBwNL7iebuo6d229lbEkPMlGNkTDJGR4Vy6c/5TOetxivFQyZCkeur/DxB5d5++t3cP6GeaysLKdBK1CxWkjrAY7mYE4eR3oZRE0MRQ+zH5nC6FqFpSTw9AJlcyGt9QdZNvQk1zQ8S+eWV/jKH/+Ea+YPIGIWBStLl59nsjHPo6s0/vq4wrunA35+cRk/f26Sp/ct580L0zy/7wy9/jjtXhst7hw8kcRWVKyuVRjDmwixFV1ayLX7MWQKS/WplU10lTZTaX2QqaFHOFT3G1567b9553ewpPOL+LE0HUErS3MVTnYl+Ocns/A/fwn8iL+62M940eXSiYf49L132Lb8dkbmnqBoNpPUA1zhY6sutkhhTBxCFyaK3rwAuWwbhlJNUtZSb7fRVLuT4flPcWP30/x6Br518T+4+9VPOHzb48xNL6RZzTNWSvPa8R746BT8/jF+81w3XyorrOxcx/tv/BNvvPVrvjDyLDf0P0xG1uOJFK7u48sslhLHXLoF0dKDIoY2IFt7sas0ArOAV1NkfttpZg79gEZ1K2eb3uJ44SMWth9iZtt5jm+e5pGZaT7922/yj392Fy9sL/DgsMINSYW50mR6/b18+6UP+f7fwP6JT+m0dhCIIiWzgZJRR1aWyFarOO2DiIF1KHL1bcigDrvGxtQ9nHiZvu4neP3VD9kz/RQXTvw57558n6Mrpnni9lF++tI9fPjWH/LCsZtY4VucGMvyF88f4asPPMjGkU1Mj52kd+oDnn0Z7t32AY6ygNZUO13uQhZnFtGXbSQdN5DpOuSqW1DE6G6ElcSIm5i6ixUP6Kjby8rRy6z/8nscexfGjv2UW7bfxZqNN9NdWcBAfAk9YopV8wZ4aNNyPv27V4H/5N9+9QYzO45iy++xfP5HNFjbqBVNdPv9XN88xub5q6k4ecyEjTBs5Jq9KHL0DnQho2Ziaja+TFM05pA1RkgXdtI2+DiltmnmtJzAn3qTqgVHqVO28/DgL/jlXpiqup/r2gd44vAKPvl2Jx88M8i5XScpuX3EFZtGOZfVDSOsqayiyWzDU1PYmovUTeTo7lkCQhiIRBxXtykYeTIij6kaiFgMtaoGUy+S9CoEK56l7hFoPvYJvev/lfHKO/TFT9BcNUlBLGL7YpdnNyucHfW4e2MHty1vY3JeD/25YRrMNmplGV8EnyNwO4pYvRvdccjHjCQLdJaO7ZDWHgnTxdYElLGw9hYhLbL1A9+BjzHzj3znyPbj25o/ZuOBNVme/QcG/ASHyHNzYzvfPj/DomMX5tQbji1pocRdRsipkjTKensRSTWR4BGunUcT1tyGCAmYshqXqBKqgYrvUWy52jYNeHRLw8GSAkbBJKCaiqpdCsIuW3K3knBXYIo+hGpiaJOn4LOhsJeeZyMgHFCkanRSsZtKyiCN8zLiOTJeQ14ZFOLQBUVmMUUBQMTSMQOr6mk1GT9Ne3cl1PH5WgHk8N73Cast9IZ2Ee9e5iSkY3ndkWFpYqdGbryelFyl4jtUae+qCepFqkkupkoLmPotVAIHM4IhnNG9k+gFiyDkVvWohctjVqi5auY6gqOSPFd565yCuXv8bXHjvHj//kj+hv7iKI1bF++TgvPX2JJr+HWtHG5YvnuHDqTn77Dz9j98adbLt+A88/dA8vfvU+dk6s47vPPc4tG9biJ9J4MokjUU5hKNcbSzYhKD4omZltxWIgy9IIxk3kNrbz84gvMbW5kcUeeS4+f58iuDZz7ygwz+3bx/FOP0JqcS9no4JGzJ7jr0B6euXiWB88e4cypw5w6vJvzD5zm9ddf5tD+XSiKErXhq63YEDZyYj9CmihqaDyHNqLPXYahxLD0JIGT5YZbdjM9s4fTj93DzIVH6e3pJvCydM1dxN57HuDIucfZsWuaqS/dyrqb9rD+lr1kvDRHHrvE1l1722HvqD+jobGX3sZMcPzZDYNhYIoiyl13LkEMbZoeRWq2gumnk5BGMhIWjB9hqgKkbpIIsrp8lSAVknAJ52UZG1OP7JfLFDjJBPYFTS9arp5yZQ8nuJu0WCfwcuaCAlXDxrRTNDY240o3GvaEZyHWHEV4mMkGKGjqTUIXeNRjDW7FCFWQaU/Wx4j5OIo2bqCUtyuTtFop2B1nRSFqvJycr5M32KGplhZLbQUaGz8qk9SIZM4+je2jVAAlMko13BGN4YYelXDYl6xRHr1aElOxiZUVOJRyQckcITWdKhQ5JNZGQDWaOBrNlI1qijVjZSsrqiG9GU7KPO66TkNEfjN2eUojN3dB/XSM8WXmURcuIAenX15yxZPBEtInpoFE0PY9MpjELXFRIBluZja0k8LUugl6MjyOkVym4/7fkJuus301lYS2t6kLIzh5zRQFqUovEb9g8rnP1h5oVWjE0n0E0XvSb2fwTUiMCsLderq2bt22dTJSInQIxiai6know2oaM+nPTfGQOch+rvvZX7zQebWTlJvLyZrNEVKpUQRR09hyyS25mOG4C2LIvDo3D+X/WcEot0gjNAqV1chTB9z4ijW8A6Sep5ivJFGp59KaiWt6VGa3GuotwYo6V3k9TlkZBMpUUdK1OPJ2qjXh/bOVB2M4c3RlYsyj8Bnt6MQPDz+zxYTLRFabIkMM47bODEHv3cbyfVnSHdPUWt2UltVIlNVIBMvkdbqyyFwpxkArk4zn8KosbEWbvW6h75s8ilg8GlW7Ho9HRRfuhFfBQ+xoLwgZhbII1cBQXcxQOs3HUQSu24I9/EWciRN4S2/HnzNGMrOIlFkhKRpJigZ8sxE304U1Zxnm0hsxx+9EDm1GuOnZag+VvboNfS5md8Ort+AzEhKp2hiqh6EnIzXCRcUxiritK3AGb8K57gDO2mPYY4exxw5irb0T89o7MAc3Y7QOIqUXzRYRj81m/XnQK5lf33cr/FxMNRVzSuppcAAAAAElFTkSuQmCC" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="alternate" type="text/plain" href="/llms.txt" title="LLMs.txt AI Reference" />
          <link rel="help" href="/about" title="About Q-Link & Features" />
          <link rel="sitemap" type="application/xml" href="/sitemap.xml" title="Sitemap" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Q-link Chat" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-[100dvh] w-full overflow-hidden`}
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          height: '100dvh',
          overflow: 'hidden',
        }}
      >
        <div className="relative h-[100dvh] w-full overflow-hidden flex flex-col">
          {/* Ambient background orbs - repositioned to avoid UI interference */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0" style={{ backgroundColor: 'var(--bg-primary)' }} />
            <div className="orb orb--cyan float-slow -left-32 top-1/2 h-72 w-72" />
            <div className="orb orb--violet pulse-soft right-[-120px] bottom-1/2 h-80 w-80" />
            <div className="orb orb--pink float-slow bottom-[-120px] left-1/2 h-64 w-64" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(148,163,253,0.08),transparent_70%),radial-gradient(circle_at_center,_rgba(45,212,191,0.06),transparent_70%)]" />
          </div>

          {/* Subtle grid overlay */}
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(to_right,rgba(15,23,42,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.8)_1px,transparent_1px)],[background-size:80px_80px]" />

          <ThemeProvider>
            {children}
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
