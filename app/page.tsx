'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type UserAuth = {
  name: string;
  email: string;
};

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserAuth | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('userAuth');
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (parsed?.email) {
        setUser(parsed);
      } else {
        localStorage.removeItem('userAuth');
      }
    } catch {
      localStorage.removeItem('userAuth');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userAuth');
    setUser(null);
    router.replace('/');
    router.refresh();
  };

  return (
    <>
      <header className="header">
        <div className="header-content">
          <Link href="/">
            <Image
              src="/logo.jpg"
              alt="Writing Xpress"
              width={500}
              height={500}
              className="header-logo"
              priority
            />
          </Link>
          <button
            className="menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
         <nav className={menuOpen ? 'mobile-nav open' : 'mobile-nav'}>
            <Link href="/track">Track Order</Link>
            {user ? (
              <>
                <Link href="/user/dashboard">Dashboard</Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/user/login">Login</Link>
                <Link href="/user/signup">Signup</Link>
              </>
            )}
            <Link href="/admin/login">Admin</Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1>
            Fast Academic Writing Support in <span className="highlight">24-48 Hours</span>
          </h1>
          <p>
            Professional writing assistance for students. Get high-quality academic support delivered quickly with expert writers dedicated to your success.
          </p>
        <div className="hero-cta">
  {!user ? (
    <>
      <Link href="/user/login" className="btn btn-primary">
        Login
      </Link>

      <Link href="/user/signup" className="btn btn-secondary">
        Signup
      </Link>
    </>
  ) : (
    <>
      <Link href="/submit" className="btn btn-primary">
        Submit New Order
      </Link>

      <Link href="/user/dashboard" className="btn btn-secondary">
        Dashboard
      </Link>
    </>
  )}
</div>
        </div>
      </section>

      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>How It Works</h2>
          <p style={{ color: '#6B7280' }}>Simple steps to get your academic writing support</p>
        </div>

        <div className="how-it-works">
          <div className="how-card">
            <div className="how-card-number">1</div>
            <h3>Submit Your Requirements</h3>
            <p>Fill in your details and upload necessary files with clear instructions for your project</p>
          </div>

          <div className="how-card">
            <div className="how-card-number">2</div>
            <h3>Review & Payment</h3>
            <p>Check your details, view the price, and make secure payment via UPI or bank transfer</p>
          </div>

          <div className="how-card">
            <div className="how-card-number">3</div>
            <h3>Track Progress</h3>
            <p>Use your unique Order ID to track order status in real-time</p>
          </div>

          <div className="how-card">
            <div className="how-card-number">4</div>
            <h3>Receive Delivery</h3>
            <p>Get your completed work delivered within 24-48 hours with quality assurance</p>
          </div>
        </div>

        <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#F9FAFB', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Why Choose Writing Xpress?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
              <strong>Fast Turnaround</strong>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', marginTop: '0.25rem' }}>24-48 hour delivery</p>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
              <strong>Quality Assured</strong>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', marginTop: '0.25rem' }}>Expert writers</p>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
              <strong>Secure Payment</strong>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', marginTop: '0.25rem' }}>Safe transactions</p>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✉️</div>
              <strong>24/7 Support</strong>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', marginTop: '0.25rem' }}>Always available</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
