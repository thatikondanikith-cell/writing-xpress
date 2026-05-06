'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Order } from '@/lib/types';

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState('');
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setOrder(null);
        setSearched(false);

        if (!orderId.trim()) {
            setError('Please enter an Order ID');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`/api/orders/${orderId.trim()}`);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Order not found. Please check your Order ID and try again.');
                }
                throw new Error('Failed to fetch order details');
            }

            const orderData = await response.json();
            setOrder(orderData);
            setSearched(true);

        } catch (err: any) {
            setError(err.message || 'An error occurred');
            setSearched(true);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'Submitted':
                return 'status-badge status-submitted';
            case 'In Progress':
                return 'status-badge status-in-progress';
            case 'Completed':
                return 'status-badge status-completed';
            default:
                return 'status-badge';
        }
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
                    <nav>
                        <Link href="/">Home</Link>
                        <Link href="/submit">Submit Order</Link>
                    </nav>
                </div>
            </header>

            <div className="container">
                <div className="card">
                    <h2>Track Your Order</h2>
                    <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                        Enter your Order ID to check the status of your order.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>
                                Order ID <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder="e.g., WX-20260209-0001"
                                style={{ fontFamily: 'monospace' }}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? 'Searching...' : 'Track Order'}
                        </button>
                    </form>

                    {error && <div className="error-message mt-3">{error}</div>}

                    {order && (
                        <div className="mt-3">
                            <div className="success-message">
                                Order found!
                            </div>

                            <div className="review-section">
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Order Status</h3>
                                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                    <div className={getStatusBadgeClass(order.orderStatus)} style={{
                                        fontSize: '1.25rem',
                                        padding: '0.75rem 2rem',
                                        display: 'inline-block'
                                    }}>
                                        {order.orderStatus}
                                    </div>
                                </div>
                            </div>

                            {order.orderStatus === 'Submitted' && (
                                <div className="review-section" style={{ backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <div style={{ fontSize: '1.5rem' }}>📋</div>
                                        <div>
                                            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: '#0369a1' }}>Order Received</h3>
                                            <p style={{ margin: 0, color: '#0c4a6e' }}>
                                                Your order has been received and will be shortly assigned to a writer.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {order.deliveryFile && (
                                <div className="review-section" style={{ backgroundColor: '#ecfdf5', borderColor: '#10b981' }}>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#065f46' }}>Download Delivered File</h3>
                                    <p style={{ marginBottom: '1rem', color: '#064e3b' }}>
                                        Your order has been completed and the file is ready for download.
                                    </p>
                                    <a
                                        href={order.deliveryFile}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-success btn-block"
                                    >
                                        Download File
                                    </a>
                                </div>
                            )}

                            {order.orderStatus === 'Completed' && (
                                <div className="review-section" style={{
                                    backgroundColor: order.physicalDeliveryStatus === 'Delivered' ? '#ecfdf5' : '#eff6ff',
                                    borderColor: order.physicalDeliveryStatus === 'Delivered' ? '#10b981' : '#3b82f6'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                        <div style={{ fontSize: '1.5rem' }}>🚚</div>
                                        <div>
                                            <h3 style={{
                                                fontSize: '1.125rem',
                                                marginBottom: '0.5rem',
                                                color: order.physicalDeliveryStatus === 'Delivered' ? '#065f46' : '#1e40af'
                                            }}>
                                                {order.physicalDeliveryStatus === 'Delivered' ? 'Physical Delivery Completed' : 'Physical Delivery Pending'}
                                            </h3>
                                            <p style={{
                                                margin: 0,
                                                color: order.physicalDeliveryStatus === 'Delivered' ? '#064e3b' : '#1e3a8a'
                                            }}>
                                                {order.physicalDeliveryStatus === 'Delivered'
                                                    ? 'Your physical copy has been successfully delivered.'
                                                    : 'Your physical copy will be delivered shortly to your registered address.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="review-section">
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Order Details</h3>

                                <div className="review-item">
                                    <div className="review-label">Order ID:</div>
                                    <div className="review-value" style={{ fontFamily: 'monospace' }}>
                                        {order.orderId}
                                    </div>
                                </div>

                                <div className="review-item">
                                    <div className="review-label">Branch:</div>
                                    <div className="review-value">{order.branch}</div>
                                </div>

                                <div className="review-item">
                                    <div className="review-label">Submitted On:</div>
                                    <div className="review-value">
                                        {new Date(order.createdDate).toLocaleString('en-IN', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {searched && !order && !error && (
                        <div className="error-message mt-3">
                            No order found with the provided Order ID.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
