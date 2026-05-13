'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Order } from '@/lib/types';

export default function UserDashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('userAuth');
        if (!stored) {
            router.push('/user/login');
            return;
        }

        try {
            const parsed = JSON.parse(stored);
            if (!parsed?.email) {
                localStorage.removeItem('userAuth');
                router.push('/user/login');
                return;
            }
            setUser(parsed);
            fetchOrders(parsed.email);
        } catch {
            localStorage.removeItem('userAuth');
            router.push('/user/login');
        }
    }, [router]);

    const fetchOrders = async (email: string) => {
        try {
            const res = await fetch(`/api/user/orders?email=${encodeURIComponent(email)}`);
            if (!res.ok) throw new Error('Failed to fetch orders');
            const data = await res.json();
            setOrders(data);
        } catch (err: any) {
            setError(err.message || 'Could not load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userAuth');
        document.cookie = 'userAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        router.replace('/user/login');
        router.refresh();
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'Submitted': return 'status-badge status-submitted';
            case 'In Progress': return 'status-badge status-in-progress';
            case 'Completed': return 'status-badge status-completed';
            default: return 'status-badge';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Submitted': return '📋';
            case 'In Progress': return '⚙️';
            case 'Completed': return '✅';
            default: return '📄';
        }
    };

    return (
        <>
            <header className="header">
                <div className="header-content">
                    <Link href="/">
                        <Image src="/logo.jpg" alt="Writing Xpress" width={500} height={500} className="header-logo" priority />
                    </Link>
                    <nav>
                        <Link href="/track">Track Order</Link>
                        <Link href="/submit">Submit New Order</Link>
                        {user && (
                            <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                                👤 {user.name}
                            </span>
                        )}
                        <button
                            onClick={handleLogout}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
                        >
                            Logout
                        </button>
                    </nav>
                </div>
            </header>

            <div className="container" style={{ maxWidth: '1000px' }}>
                {/* Welcome Banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                    borderRadius: '12px',
                    padding: '2rem',
                    marginBottom: '2rem',
                    color: 'white',
                }}>
                    <h2 style={{ color: 'white', marginBottom: '0.25rem', fontSize: '1.5rem' }}>
                        Welcome back, {user?.name?.split(' ')[0]}! 👋
                    </h2>
                    <p style={{ opacity: 0.85, margin: 0, fontSize: '0.95rem' }}>
                        {user?.email} · {orders.length} order{orders.length !== 1 ? 's' : ''} total
                    </p>
                </div>

                {/* Stats Row */}
                <div className="dashboard-stats-grid">
                    {[
                        { label: 'Total Orders', value: orders.length, color: '#1F2937' },
                        { label: 'In Progress', value: orders.filter(o => o.orderStatus === 'In Progress').length, color: '#92400E' },
                        { label: 'Completed', value: orders.filter(o => o.orderStatus === 'Completed').length, color: '#065F46' },
                    ].map((stat) => (
                        <div key={stat.label} className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>
                                {stat.value}
                            </div>
                            <div style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order History */}
                <div className="card">
                    <div className="card-title-row">
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Order History</h3>
                        <Link href="/submit" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
                            + New Order
                        </Link>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    {loading ? (
                        <div className="spinner"></div>
                    ) : orders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6B7280' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 500 }}>No orders yet</p>
                            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Make sure you use this email address ({user?.email}) when submitting orders.
                            </p>
                            <Link href="/submit" className="btn btn-primary">Submit Your First Order</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {orders.map((order) => (
                                <div
                                    key={order.orderId}
                                    style={{
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        padding: '1.25rem',
                                        transition: 'box-shadow 0.2s',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)')}
                                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                                <span style={{ fontSize: '1.1rem' }}>{getStatusIcon(order.orderStatus)}</span>
                                                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', color: '#1F2937' }}>
                                                    {order.orderId}
                                                </span>
                                            </div>
                                            <div style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                                                {new Date(order.createdDate).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'long', year: 'numeric',
                                                })}
                                            </div>
                                        </div>
                                        <span className={getStatusBadgeClass(order.orderStatus)}>
                                            {order.orderStatus}
                                        </span>
                                    </div>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                                        gap: '0.5rem',
                                        marginTop: '1rem',
                                        paddingTop: '1rem',
                                        borderTop: '1px solid #F3F4F6',
                                        fontSize: '0.875rem',
                                        color: '#4B5563',
                                    }}>
                                        <div><span style={{ fontWeight: 600 }}>College:</span> {order.collegeName}</div>
                                        <div><span style={{ fontWeight: 600 }}>Branch:</span> {order.branch}</div>
                                        <div><span style={{ fontWeight: 600 }}>Year:</span> {order.yearOfStudying}</div>
                                        {order.priceAmount && (
                                            <div><span style={{ fontWeight: 600 }}>Amount:</span> ₹{order.priceAmount}</div>
                                        )}
                                    </div>

                                    {order.instructions && (
                                        <div style={{
                                            marginTop: '0.75rem',
                                            fontSize: '0.875rem',
                                            color: '#6B7280',
                                            background: '#F9FAFB',
                                            borderRadius: '6px',
                                            padding: '0.6rem 0.75rem',
                                            whiteSpace: 'pre-wrap',
                                            overflow: 'hidden',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                        }}>
                                            {order.instructions}
                                        </div>
                                    )}

                                    {order.orderStatus === 'Completed' && order.deliveryFile && (
                                        <div style={{ marginTop: '0.75rem' }}>
                                            <a
                                                href={`/api/files/${order.deliveryFile}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-success"
                                                style={{ padding: '0.4rem 1rem', fontSize: '0.875rem', display: 'inline-block' }}
                                            >
                                                ⬇ Download Completed Work
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
