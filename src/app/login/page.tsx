"use client"; // Marking the component as a Client Component

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Use useRouter for navigation
import styles from './login.module.css'; // Import the CSS module

export default function Login() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        const loginData = { username, password };

        try {
            const response = await fetch('http://127.0.0.1:8001/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData),
            });

            if (response.ok) {
                const data = await response.json(); // Get the response data
                if (data.token) {
                    localStorage.setItem('authToken', data.token); // Store the token in local storage
                }
                router.push('/llm'); // Redirect to the LLM page
            } else {
                // Handle login error...
                setError('Login failed. Please try again.');
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again later.');
        }
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.formContainer}>
                <h1 className={styles.title}>Login</h1>
                {error && <p className={styles.error}>{error}</p>}
                <form className={styles.loginForm} onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={styles.inputField}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.inputField}
                    />
                    <button type="submit" className={styles.loginButton}>Login</button>
                </form>
            </div>
        </div>
    );
}
