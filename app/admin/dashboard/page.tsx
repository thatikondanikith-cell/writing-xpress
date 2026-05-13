'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Order } from '@/lib/types';

export default function AdminDashboard() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;
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
        document.cookie = 'adminAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
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
    const filteredOrders = orders.filter((order) => {
    const created = new Date(order.createdDate);
    const now = new Date();
    const matchesSearch =
    order.orderId.toLowerCase().includes(search.toLowerCase()) ||
    order.userName.toLowerCase().includes(search.toLowerCase()) ||
    order.email.toLowerCase().includes(search.toLowerCase()) ||
    order.collegeName.toLowerCase().includes(search.toLowerCase());

if (!matchesSearch) return false;

    if (filter === 'Completed') {
        return order.orderStatus === 'Completed';
    }

    if (filter === 'In Progress') {
        return order.orderStatus === 'In Progress';
    }

    if (filter === 'Today') {
        return created.toDateString() === now.toDateString();
    }

    if (filter === 'This Month') {
        return (
            created.getMonth() === now.getMonth() &&
            created.getFullYear() === now.getFullYear()
        );
    }

    return true;
});
const indexOfLastOrder = currentPage * ordersPerPage;
const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;

const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
);

const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
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
                        
                        <Link
                            href="/admin/analytics"
                            className="btn btn-primary"
                            style={{
                                backgroundColor: '#111827',
                                color: 'white',
                                borderRadius: '8px',
                                padding: '0.5rem 1rem',
                                textDecoration: 'none',
                            }}
                        >
                            Analytics
                        </Link>

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
                            LogOut
                        </button>
                    </nav>
                </div>
            </header>

            <div className="container" style={{ maxWidth: '1200px' }}>
                <div className="card">
                    <div className="card-title-row">
                        <h2 style={{ marginBottom: 0 }}>Orders Dashboard</h2>
                        <div style={{ color: '#6b7280' }}>
                            Total Orders: <strong>{orders.length}</strong>
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    <div className="dashboard-stats-grid">
            <div className="card">
                <h3>Total Orders</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {orders.length}
                </p>
            </div>

            <div className="card">
                <h3>Pending</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#D97706' }}>
                {orders.filter(o => o.orderStatus === 'Submitted').length}
                </p>
            </div>

            <div className="card">
                <h3>In Progress</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563EB' }}>
                {orders.filter(o => o.orderStatus === 'In Progress').length}
                </p>
            </div>

            <div className="card">
                <h3>Completed</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>
                {orders.filter(o => o.orderStatus === 'Completed').length}
                </p>
            </div>
            </div>
            <div className="dashboard-toolbar">
            <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
                padding: '0.5rem 1rem',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
            }}
/>
    <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: '1px solid #D1D5DB',
        }}
    >
        <option value="All">All Orders</option>
        <option value="Today">Today</option>
        <option value="This Month">This Month</option>
        <option value="Completed">Completed</option>
        <option value="In Progress">In Progress</option>
    </select>
</div>
                    {orders.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                            No orders found
                        </p>
                    ) : (
                        <div>
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
                                    {currentOrders.map((order) => (
                                        <tr key={order.orderId}>
                                            <td style={{ fontFamily: 'monospace' }}>
                                                {order.orderId}
                                            </td>

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
                                                    year: 'numeric',
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

                        <div className="pagination-row">
                            <button
                                onClick={() =>
                                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                                }
                                disabled={currentPage === 1}
                                className="btn btn-secondary"
                            >
                                Previous
                            </button>

                            <span style={{ paddingTop: '0.5rem' }}>
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(prev + 1, totalPages)
                                    )
                                }
                                disabled={currentPage === totalPages}
                                className="btn btn-primary"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                    )}
                </div>
            </div>
        </>
    );
}
