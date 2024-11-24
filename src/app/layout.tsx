"use client";

import './globals.css';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Layout({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check for token when the component mounts
        const token = localStorage.getItem('authToken'); // Example token check
        setIsAuthenticated(!!token); // Convert token presence to boolean
    }, []);

    return (
        <html lang="en">
            <body>
                <nav className="navbar">
                    <ul>
                        <li>
                            <a href="/">Home</a>
                        </li>
                        <li>
                            <a href="/llm" onClick={(e) => {
                                // Redirect to signup if not authenticated
                                if (!isAuthenticated) {
                                    e.preventDefault(); // Prevent default navigation
                                    router.push('/signup'); // Redirect to signup page
                                }
                            }}>
                                LLM
                            </a>
                        </li>
                        {/* Show Login and Signup links only if not authenticated */}
                        {!isAuthenticated && (
                            <>
                                <li>
                                    <a href="/login">Login</a>
                                </li>
                                <li>
                                    <a href="/signup">Sign Up</a>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
                <main>{children}</main>
            </body>
        </html>
    );
}
