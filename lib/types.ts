export type Role = "CUSTOMER" | "TECHNICIAN" | "ADMIN";
export type ActiveStatus = "ACTIVE" | "BLOCKED";
export type BookingStatus = "REQUESTED" | "ACCEPTED" | "DECLINED" | "PAID" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
export type PaymentProvider = "STRIPE" | "SSLCOMMERZ";
export type DayOfWeek = "SATURDAY" | "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: ApiMeta;
  details?: unknown;
}

export interface TechnicianProfile {
  id: string;
  userId: string;
  bio: string | null;
  skills: string[];
  experienceYears: number;
  pricePerHour: string | number;
  location: string | null;
  timezone: string;
  rating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
  user?: PublicUser;
  services?: Service[];
  availability?: Availability[];
  reviews?: Review[];
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  role: Role;
  activeStatus: ActiveStatus;
  createdAt: string;
  updatedAt: string;
  technicianProfile?: TechnicianProfile | null;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { services: number };
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: string | number;
  location: string | null;
  isActive: boolean;
  categoryId: string;
  technicianId: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
  technician: TechnicianProfile & { user: Pick<PublicUser, "id" | "name" | "email" | "phone" | "location"> };
}

export interface Availability {
  id: string;
  technicianId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  technicianId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: { id: string; name: string };
}

export interface Booking {
  id: string;
  customerId: string;
  technicianId: string;
  serviceId: string;
  scheduledAt: string;
  address: string;
  note: string | null;
  status: BookingStatus;
  totalAmount: string | number;
  createdAt: string;
  updatedAt: string;
  customer: Pick<PublicUser, "id" | "name" | "email" | "phone" | "location">;
  technician: TechnicianProfile & { user: Pick<PublicUser, "id" | "name" | "email" | "phone" | "location"> };
  service: Service;
  payment: Payment | null;
  review: Review | null;
}

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  transactionId: string;
  provider: PaymentProvider;
  method: string | null;
  amount: string | number;
  currency: string;
  status: PaymentStatus;
  checkoutUrl: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  booking?: Booking;
  user?: Pick<PublicUser, "id" | "name" | "email">;
}

export interface PaymentSession {
  payment: Payment;
  checkoutUrl: string;
  sessionId?: string;
}
