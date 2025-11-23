'use server';

import { checkUser } from "@/lib/checkUser";
import HeaderClient from "./Header.client";

export default async function Header() {
  // Server-side user check
  await checkUser();
  
  // Pass any needed data to client component
  return <HeaderClient />;
}