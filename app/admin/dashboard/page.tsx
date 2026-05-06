'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Order } from '@/lib/types';

export default function AdminDashboard() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check authentication
        const isAuth = localStorage.getItem('adminAuth');
        if (!isAuth) {
            router.push('/admin/login');
            return;
        }

        fetchOrders();
    }, [router]);

    const fetchOrders = async () => {
        try {
            const response = await fetch('/api/orders');

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            // Sort by created date (newest first)
            const sortedOrders = data.sort((a: Order, b: Order) =>
                new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
            );
            setOrders(sortedOrders);

        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminAuth');
        router.push('/admin/login');
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

    if (loading) {
        return (
            <div className="container">
                <div className="spinner"></div>
            </div>
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
                            width={150}
                            height={150}
                            className="header-logo"
                            priority
                        />
                    </Link>
                    <nav>
                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-black)',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '500'
                            }}
                        >
                            Logout
                        </button>
                    </nav>
                </div>
            </header>

            <div className="container" style={{ maxWidth: '1200px' }}>
                <div className="card">
                    <div className="flex justify-between" style={{ alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ marginBottom: 0 }}>Orders Dashboard</h2>
                        <div style={{ color: '#6b7280' }}>
                            Total Orders: <strong>{orders.length}</strong>
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    {orders.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                            No orders found
                        </p>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>User Name</th>
                                        <th>College Name</th>
                                        <th>Order Status</th>
                                        <th>Created Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.orderId}>
                                            <td style={{ fontFamily: 'monospace' }}>{order.orderId}</td>
                                            <td>{order.userName}</td>
                                            <td>{order.collegeName}</td>
                                            <td>
                                                <span className={getStatusBadgeClass(order.orderStatus)}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                            <td>
                                                {new Date(order.createdDate).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td>
                                                <Link href={`/admin/order/${order.orderId}`}>
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
