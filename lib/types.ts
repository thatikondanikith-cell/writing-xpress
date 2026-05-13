export type OrderStatus = 'Submitted' | 'In Progress' | 'Completed';

export interface Order {
    orderId: string;
    userName: string;
    primaryPhone: string;
    alternatePhone?: string;
    email: string;
    address?: string;
    collegeName: string;
    yearOfStudying: string;
    branch: string; // Mandatory academic branch field
    uploadedFiles: string[]; // GridFS ObjectId strings (served via /api/files/[id])
    instructions: string;
    priceAmount?: number;
    transactionId?: string;
    orderStatus: OrderStatus;
    createdDate: string; // ISO string
    deliveryFile?: string; // GridFS ObjectId string (served via /api/files/[id])
    physicalDeliveryStatus?: 'Pending' | 'Delivered';
}

export interface SubmissionFormData {
    userName: string;
    primaryPhone: string;
    alternatePhone?: string;
    email: string;
    address?: string;
    collegeName: string;
    yearOfStudying: string;
    branch: string; // Mandatory academic branch field
    instructions: string;
    files: File[];
}
