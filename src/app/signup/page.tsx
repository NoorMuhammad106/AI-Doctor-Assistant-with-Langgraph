"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './signup.module.css';

interface UserData {
    username: string;
    email: string;
    password: string;
}

interface SignupResponse {
    message: string;
    token?: string; // Assuming the token will be part of the response
    detail?: string;
}

export default function Signup() {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const validatePassword = (password: string) => {
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        return hasLetter && hasNumber;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (!validatePassword(password)) {
            setMessage('Password must contain both letters and numbers.');
            setLoading(false);
            return;
        }

        const userData: UserData = {
            username,
            email,
            password,
        };

        try {
            const response = await fetch('http://127.0.0.1:8001/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data: SignupResponse = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setUsername('');
                setEmail('');
                setPassword('');

                // Store the token in local storage
                if (data.token) {
                    localStorage.setItem('authToken', data.token); // Save token in local storage
                }

                // Redirect to the LLM page after a short delay
                setTimeout(() => {
                    router.push('/llm'); // Redirect to LLM page
                }, 2000);
            } else {
                setMessage(data.detail || 'Signup failed, please try again.');
            }
        } catch (error) {
            console.error('Error during signup:', error);
            setMessage('Network error, please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.signupPage}>
            <div className={styles.formContainer}>
                <h1>Sign Up</h1>
                <p className={styles.description}>Create your account to get started!</p>
                <form className={styles.signupForm} onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className={styles.inputField}
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        className={styles.inputField}
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className={styles.inputField}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <div className={styles.checkboxContainer}>
                        <input
                            type="checkbox"
                            id="terms"
                            className={styles.checkbox}
                            required
                        />
                        <label htmlFor="terms" className={styles.checkboxLabel}>
                            I accept the Terms and Conditions
                        </label>
                    </div>
                    <button type="submit" className={styles.signupButton} disabled={loading}>
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
                {message && <p className={styles.message}>{message}</p>}
                <div className={styles.alternative}>
                    <p>
                        Already have an account?{' '}
                        <Link href="/login" className={styles.link}>
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
