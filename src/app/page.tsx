 // src/app/page.tsx

"use client"; // This marks the component as a Client Component

import './globals.css';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    const redirectToLLM = () => {
        const isLoggedIn = false; // Replace this with your actual authentication check logic

        if (isLoggedIn) {
            router.push('/llm'); // Redirect to LLM page
        } else {
            router.push('/signup'); // Redirect to signup page
        }
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>AI Doctor: Your Personal Healthcare Companion</h1>
                    <p>
                        Get personalized medical advice, symptom analysis, and health recommendations powered by cutting-edge AI.
                    </p>
                    <button onClick={redirectToLLM} className="cta-button">
                        Get Started
                    </button>
                </div>
               
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2>Why Choose AI Doctor?</h2>
                <div className="features-grid">
                    <div className="feature">
                        <h3>24/7 Availability</h3>
                        <p>Experience uninterrupted access to expert medical advice anytime, anywhere.</p>
                    </div>
                    <div className="feature">
                        <h3>Personalized Healthcare</h3>
                        <p>Receive tailored recommendations based on your symptoms, health data, and preferences.</p>
                    </div>
                   
                </div>
            </section>

          

            {/* CTA Section */}
            <section className="cta-section">
                <h2>Ready to Improve Your Health?</h2>
                <p>Sign up today and take control of your health with AI Doctor!</p>
                <a href="/signup" className="cta-button">
                    Sign Up Now
                </a>
            </section>
        </div>
    );
}