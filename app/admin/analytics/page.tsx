'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Order } from '@/lib/types';

export default function AdminAnalyticsPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const totalRevenue = orders.reduce(
        (sum, order) => sum + (Number(order.priceAmount) || 0),
        0
    );

    const completedRevenue = orders
        .filter((o) => o.orderStatus === 'Completed')
        .reduce((sum, order) => sum + (Number(order.priceAmount) || 0), 0);

    const pendingRevenue = orders
        .filter((o) => o.orderStatus !== 'Completed')
        .reduce((sum, order) => sum + (Number(order.priceAmount) || 0), 0);

    const thisMonthRevenue = orders
        .filter((order) => {
            const created = new Date(order.createdDate);
            const now = new Date();

            return (
                created.getMonth() === now.getMonth() &&
                created.getFullYear() === now.getFullYear()
            );
        })
        .reduce((sum, order) => sum + (Number(order.priceAmount) || 0), 0);

    return (
        <div className="container">
            <div
                className="page-title-row"
                style={{
                    marginBottom: '2rem',
                }}
            >
                <h1>Admin Analytics</h1>

                <Link href="/admin/dashboard" className="btn btn-secondary">
                    Back to Dashboard
                </Link>
            </div>

            {loading ? (
                <p>Loading analytics...</p>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1rem',
                    }}
                >
                    <div className="card">
                        <h3>Total Revenue</h3>
                        <p
                            style={{
                                fontSize: '2rem',
                                fontWeight: 'bold',
                            }}
                        >
                            ₹{totalRevenue}
                        </p>
                    </div>

                    <div className="card">
                        <h3>Completed Revenue</h3>
                        <p
                            style={{
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                color: '#059669',
                            }}
                        >
                            ₹{completedRevenue}
                        </p>
                    </div>

                    <div className="card">
                        <h3>Pending Revenue</h3>
                        <p
                            style={{
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                color: '#D97706',
                            }}
                        >
                            ₹{pendingRevenue}
                        </p>
                    </div>

                    <div className="card">
                        <h3>This Month</h3>
                        <p
                            style={{
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                color: '#2563EB',
                            }}
                        >
                            ₹{thisMonthRevenue}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

