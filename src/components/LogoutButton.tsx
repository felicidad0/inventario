// src/components/LogoutButton.tsx
'use client';

import { signOut } from 'next-auth/react';
export default function LogoutButton({ className = "" }) {
  return (
    <button
      onClick={() => signOut()}
      className={className}
    >
      Cerrar sesión
    </button>
  );
}