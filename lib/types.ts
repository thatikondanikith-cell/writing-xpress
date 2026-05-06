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
    uploadedFiles: string[]; // file paths relative to /public/uploads
    instructions: string;
    priceAmount?: number;
    transactionId?: string;
    orderStatus: OrderStatus;
    createdDate: string; // ISO string
    deliveryFile?: string; // file path relative to /public/uploads
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
