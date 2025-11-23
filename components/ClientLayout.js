

import PathDrawing from "@/components/PathDrawing";
import { Inter } from "next/font/google";
import "@/app/globals.css";
// import Header from "@/components/Header.client";
import { ClerkProvider } from "@clerk/nextjs";
import HeaderClient from "./Header.client";
import { Toaster } from "./ui/sonner";



const inter = Inter({ subsets: ["latin"] });

export default function ClientLayout({ children }) { 
  return (
    <ClerkProvider>
      <div className={`${inter.className}`}>
        
            <HeaderClient />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors/>

            <footer className="bg-blue-50 py-12">
              <div className="container mx-auto px-4 text-center text-gray-600">
                
              </div>
            </footer>
      </div>
    </ClerkProvider>
  );
}
