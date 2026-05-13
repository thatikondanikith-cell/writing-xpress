'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Order, OrderStatus } from '@/lib/types';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const [orderId, setOrderId] = useState<string | null>(null);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [newStatus, setNewStatus] = useState<OrderStatus>('Submitted');
    const [deliveryFile, setDeliveryFile] = useState<File | null>(null);

    useEffect(() => {
        // Await params and get orderId
        params.then(({ id }) => setOrderId(id));
    }, [params]);

    useEffect(() => {
        if (!orderId) return;

        // Check authentication
        const isAuth = localStorage.getItem('adminAuth');
        if (!isAuth) {
            window.location.href = '/admin/login';
            return;
        }

        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        if (!orderId) return;

        try {
            const response = await fetch(`/api/orders/${orderId}`);

            if (!response.ok) {
                throw new Error('Order not found');
            }

            const data = await response.json();
            setOrder(data);
            setNewStatus(data.orderStatus);

        } catch (err: any) {
            setError(err.message || 'Failed to fetch order');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        setError('');
        setSuccessMessage('');
        setUpdating(true);

        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderStatus: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            const updatedOrder = await response.json();
            setOrder(updatedOrder);
            setSuccessMessage('Order status updated successfully');

        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setUpdating(false);
        }
    };

    const handleUploadDelivery = async () => {
        if (!deliveryFile) {
            setError('Please select a file to upload');
            return;
        }

        setError('');
        setSuccessMessage('');
        setUpdating(true);

        try {
            const formData = new FormData();
            formData.append('deliveryFile', deliveryFile);
            formData.append('orderStatus', 'Completed');

            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload delivery file');
            }

            const updatedOrder = await response.json();
            setOrder(updatedOrder);
            setNewStatus('Completed');
            setDeliveryFile(null);
            setSuccessMessage('Delivery file uploaded and order marked as completed');

        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error && !order) {
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
                    </div>
                </header>
                <div className="container">
                    <div className="error-message">{error}</div>
                    <Link href="/admin/dashboard" className="btn btn-secondary">
                        Back to Dashboard
                    </Link>
                </div>
            </>
        );
    }

    if (!order) return null;

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

    // Check if a stored file value is a valid GridFS ObjectId
    const isGridFSId = (value: string) => /^[a-f\d]{24}$/i.test(value);

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
                        <Link href="/admin/dashboard">Dashboard</Link>
                    </nav>
                </div>
            </header>

            <div className="container" style={{ maxWidth: '900px' }}>
                <div className="mb-2">
                    <Link href="/admin/dashboard" className="btn btn-secondary">
                        ← Back to Dashboard
                    </Link>
                </div>

                <div className="card">
                    <div className="card-title-row">
                        <h2 style={{ marginBottom: 0 }}>Order Details</h2>
                        <span className={getStatusBadgeClass(order.orderStatus)} style={{ fontSize: '1rem' }}>
                            {order.orderStatus}
                        </span>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {successMessage && <div className="success-message">{successMessage}</div>}

                    {/* Order Information */}
                    <div className="review-section">
                        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Order Information</h3>
                        <div className="review-item">
                            <div className="review-label">Order ID:</div>
                            <div className="review-value" style={{ fontFamily: 'monospace' }}>{order.orderId}</div>
                        </div>
                        <div className="review-item">
                            <div className="review-label">Created Date:</div>
                            <div className="review-value">
                                {new Date(order.createdDate).toLocaleString('en-IN')}
                            </div>
                        </div>
                        <div className="review-item">
                            <div className="review-label">Price:</div>
                            <div className="review-value">₹{order.priceAmount}</div>
                        </div>
                        <div className="review-item">
                            <div className="review-label">Transaction ID:</div>
                            <div className="review-value" style={{ fontFamily: 'monospace' }}>{order.transactionId}</div>
                        </div>
                    </div>

                    {/* User Information */}
                    <div className="review-section">
                        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>User Information</h3>
                        <div className="review-item">
                            <div className="review-label">Name:</div>
                            <div className="review-value">{order.userName}</div>
                        </div>
                        <div className="review-item">
                            <div className="review-label">Primary Phone:</div>
                            <div className="review-value">{order.primaryPhone}</div>
                        </div>
                        {order.alternatePhone && (
                            <div className="review-item">
                                <div className="review-label">Alternate Phone:</div>
                                <div className="review-value">{order.alternatePhone}</div>
                            </div>
                        )}
                        <div className="review-item">
                            <div className="review-label">Email:</div>
                            <div className="review-value">{order.email}</div>
                        </div>
                        {order.address && (
                            <div className="review-item">
                                <div className="review-label">Address:</div>
                                <div className="review-value">{order.address}</div>
                            </div>
                        )}
                        <div className="review-item">
                            <div className="review-label">College:</div>
                            <div className="review-value">{order.collegeName}</div>
                        </div>
                        <div className="review-item">
                            <div className="review-label">Year of Studying:</div>
                            <div className="review-value">{order.yearOfStudying}</div>
                        </div>
                        <div className="review-item">
                            <div className="review-label">Branch:</div>
                            <div className="review-value">{order.branch}</div>
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="review-section">
                        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Requirements</h3>
                        <div className="review-item">
                            <div className="review-label">Uploaded Files:</div>
                            <div className="review-value">
                                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                    {order.uploadedFiles.map((fileId, index) => (
                                        <li key={index}>
                                            {isGridFSId(fileId) ? (
                                                <a href={`/api/files/${fileId}`} target="_blank" rel="noopener noreferrer">
                                                    File {index + 1}
                                                </a>
                                            ) : (
                                                <span style={{ color: '#9ca3af' }}>File {index + 1} (legacy — unavailable)</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="review-item">
                            <div className="review-label">Instructions:</div>
                            <div className="review-value" style={{ whiteSpace: 'pre-wrap' }}>
                                {order.instructions}
                            </div>
                        </div>
                    </div>

                    {/* Update Status */}
                    <div className="review-section">
                        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Update Order Status</h3>
                        <div className="form-group">
                            <label>Order Status</label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                            >
                                <option value="Submitted">Submitted</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <button
                            onClick={handleUpdateStatus}
                            className="btn btn-primary"
                            disabled={updating || newStatus === order.orderStatus}
                        >
                            {updating ? 'Updating...' : 'Update Status'}
                        </button>
                    </div>

                    {/* Physical Delivery Status */}
                    {order.orderStatus === 'Completed' && (
                        <div className="review-section">
                            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Physical Delivery</h3>
                            <div className="responsive-actions" style={{ alignItems: 'center', gap: '1rem' }}>
                                <div>
                                    Current Status: <strong>{order.physicalDeliveryStatus || 'Pending'}</strong>
                                </div>
                                <button
                                    onClick={async () => {
                                        if (!orderId) return;
                                        setUpdating(true);
                                        try {
                                            const newPhysicalStatus = order.physicalDeliveryStatus === 'Delivered' ? 'Pending' : 'Delivered';
                                            const response = await fetch(`/api/orders/${orderId}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ physicalDeliveryStatus: newPhysicalStatus }),
                                            });
                                            if (!response.ok) throw new Error('Failed to update physical status');
                                            const updated = await response.json();
                                            setOrder(updated);
                                            setSuccessMessage(`Physical delivery status updated to ${newPhysicalStatus}`);
                                        } catch (err: any) {
                                            setError(err.message);
                                        } finally {
                                            setUpdating(false);
                                        }
                                    }}
                                    className={`btn ${order.physicalDeliveryStatus === 'Delivered' ? 'btn-secondary' : 'btn-success'}`}
                                    disabled={updating}
                                >
                                    {order.physicalDeliveryStatus === 'Delivered' ? 'Mark as Pending' : 'Mark as Delivered'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Upload Delivery File */}
                    <div className="review-section">
                        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Delivery File</h3>

                        {order.deliveryFile && (
                            <div className="mb-2">
                                <p style={{ marginBottom: '0.5rem' }}>Current delivery file:</p>
                                <a
                                    href={`/api/files/${order.deliveryFile}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary"
                                    style={{ display: 'inline-block' }}
                                >
                                    Download Current File
                                </a>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Upload Delivery File (will mark order as Completed)</label>
                            <input
                                type="file"
                                onChange={(e) => setDeliveryFile(e.target.files?.[0] || null)}
                            />
                        </div>
                        <button
                            onClick={handleUploadDelivery}
                            className="btn btn-success"
                            disabled={updating || !deliveryFile}
                        >
                            {updating ? 'Uploading...' : 'Upload & Mark as Completed'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
