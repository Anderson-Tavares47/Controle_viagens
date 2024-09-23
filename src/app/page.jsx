'use client';

import { redirect } from 'next/navigation';

export default function Home() {
  // Redireciona para /home/dashboard
  redirect('/home/dashboard');
  return null;
}
