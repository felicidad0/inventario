// src/app/login/page.tsx
'use client';
import styles from './auth.module.css'; // <-- CSS Module

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });

    if (result?.error) {
      setError('Credenciales inválidas. Inténtalo de nuevo.');
    } else {
      // Redirigir a la página principal después del login exitoso
      router.push('/');
    }
  };

  useEffect(() => {
    // ejemplo: intentar eliminar al desmontar un elemento con id="mi-elemento"
    return () => {
      const el = document.getElementById("mi-elemento");
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
      // o simplemente: if (el) el.remove();
    };
  }, []);
return (
  <div className={styles['auth-page']}>
    <div className={styles['auth-card']}>
      <h1 className={styles['auth-title']}>
        Panel de Inventario
      </h1>
      <h2 className={styles['auth-subtitle']}>Inicie sesion</h2>
      <form onSubmit={handleSubmit} className={styles['auth-form']}>
        <div className={styles['form-row']}>
          <label
            htmlFor="username"
            className={styles['form-label']}
          >
            Nombre de Usuario
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        <div className={styles['form-row']}>
          <label
            htmlFor="password"
            className={styles['form-label']}
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
        </div>
        {error && (
          <p className={styles['form-error']}>
            {error}
          </p>
        )}
        <button
          type="submit"
          className={styles['btn-primary']}
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  </div>
);

}
