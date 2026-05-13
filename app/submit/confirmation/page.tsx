'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Order } from '@/lib/types';

export default function ConfirmationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Try to get Order ID from URL params first, then sessionStorage
        let orderIdToFetch = searchParams.get('orderId');

        if (!orderIdToFetch) {
            orderIdToFetch = sessionStorage.getItem('newOrderId');
        }

        if (!orderIdToFetch) {
            setError('No order ID found. Please submit a new order.');
            setLoading(false);
            return;
        }

        // Fetch the order from the database
        fetchOrder(orderIdToFetch);

        // Update URL to include orderId without reload
        if (!searchParams.get('orderId')) {
            const newUrl = `/submit/confirmation?orderId=${orderIdToFetch}`;
            window.history.replaceState({}, '', newUrl);
        }

        // Clear sessionStorage after successfully getting the order ID
        sessionStorage.removeItem('newOrderId');
    }, [searchParams]);

    const fetchOrder = async (orderId: string) => {
        try {
            const response = await fetch(`/api/orders/${orderId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch order details');
            }

            const orderData = await response.json();
            setOrder(orderData);
            setLoading(false);
        } catch (err: any) {
            setError(err.message || 'An error occurred while fetching your order');
            setLoading(false);
        }
    };

    if (loading) {
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
                        <nav>
                            <Link href="/">Home</Link>
                            <Link href="/track">Track Order</Link>
                        </nav>
                    </div>
                </header>
                <div className="container">
                    <div className="spinner"></div>
                </div>
            </>
        );
    }

    if (error || !order) {
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
                        <nav>
                            <Link href="/">Home</Link>
                            <Link href="/submit">Submit Order</Link>
                        </nav>
                    </div>
                </header>
                <div className="container">
                    <div className="card text-center">
                        <div className="error-message">{error || 'Order not found'}</div>
                        <div className="responsive-actions mt-3">
                            <Link href="/submit" className="btn btn-primary" style={{ marginRight: '1rem' }}>
                                Submit New Order
                            </Link>
                            <Link href="/" className="btn btn-secondary">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

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
                    <nav>
                        <Link href="/">Home</Link>
                        <Link href="/track">Track Order</Link>
                    </nav>
                </div>
            </header>

            <div className="container">
                {/* Progress Steps */}
                <div className="progress-steps">
                    <div className="progress-step completed">
                        <div className="progress-step-number">1</div>
                        <div className="progress-step-label">Details</div>
                    </div>
                    <div className="progress-step completed">
                        <div className="progress-step-number">2</div>
                        <div className="progress-step-label">Review</div>
                    </div>
                    <div className="progress-step completed">
                        <div className="progress-step-number">3</div>
                        <div className="progress-step-label">Payment</div>
                    </div>
                    <div className="progress-step completed">
                        <div className="progress-step-number">4</div>
                        <div className="progress-step-label">Confirmation</div>
                    </div>
                </div>

                <div className="card text-center">
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: '#d1fae5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                            fontSize: '3rem'
                        }}>
                            ✓
                        </div>
                    </div>

                    <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>Order Successfully Submitted!</h2>

                    <div className="success-message" style={{ textAlign: 'left' }}>
                        Order accepted and will shortly be assigned to a writer
                    </div>

                    <div className="review-section">
                        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Your Order ID</h3>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#DC2626',
                            letterSpacing: '0.05em',
                            fontFamily: 'monospace'
                        }}>
                            {order.orderId}
                        </div>
                        <p style={{ marginTop: '1rem', color: '#6b7280' }}>
                            Please save this Order ID. You will need it to track your order status.
                        </p>
                    </div>

                    <div className="review-section" style={{ textAlign: 'left' }}>
                        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Order Summary</h3>
                        <div className="review-item">
                            <div className="review-label">Name:</div>
                            <div className="review-value">{order.userName}</div>
                        </div>
                        <div className="review-item">
                            <div className="review-label">Email:</div>
                            <div className="review-value">{order.email}</div>
                        </div>
                        <div className="review-item">
                            <div className="review-label">College:</div>
                            <div className="review-value">{order.collegeName}</div>
                        </div>
                        <div className="review-item">
                            <div className="review-label">Branch:</div>
                            <div className="review-value">{order.branch}</div>
                        </div>
                        <div className="review-item">
                            <div className="review-label">Files Submitted:</div>
                            <div className="review-value">{order.uploadedFiles.length} file(s)</div>
                        </div>
                        <div className="review-item">
                            <div className="review-label">Amount Paid:</div>
                            <div className="review-value">₹{order.priceAmount}</div>
                        </div>
                        <div className="review-item">
                            <div className="review-label">Status:</div>
                            <div className="review-value">
                                <span className="status-badge status-submitted">{order.orderStatus}</span>
                            </div>
                        </div>
                    </div>

                    <div className="responsive-actions mt-3">
                        <Link href="/track" className="btn btn-primary" style={{ marginRight: '1rem' }}>
                            Track Your Order
                        </Link>
                        <Link href="/" className="btn btn-secondary">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
