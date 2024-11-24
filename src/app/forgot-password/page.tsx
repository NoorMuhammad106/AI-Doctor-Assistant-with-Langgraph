import Layout from '../layout';
import styles from './forgot-password.module.css'; // Import a CSS module if needed

export default function ForgotPassword() {
    return (
        <Layout>
            <div className={styles.forgotPasswordPage}>
                <h1>Forgot Password</h1>
                <p>Please enter your email address to reset your password.</p>
                <form className={styles.forgotPasswordForm}>
                    <input
                        type="email"
                        placeholder="Email"
                        required
                        className={styles.inputField}
                    />
                    <button type="submit" className={styles.resetButton}>Reset Password</button>
                </form>
            </div>
        </Layout>
    );
}
