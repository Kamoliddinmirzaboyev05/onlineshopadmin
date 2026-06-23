export interface Restaurant {
  id: number;
  name: string;
  description_uz?: string | null;
  description_ru?: string | null;
  logo_url?: string | null;
  cover_url?: string | null;
  is_active: boolean;
  is_open: boolean;
  rating: number;
  delivery_fee: number;
  min_order: number;
  avg_delivery_minutes: number;
}

export interface Category {
  id: number;
  name_uz: string;
  name_ru: string;
  sort_order: number;
}

export interface Product {
  id: number;
  restaurant_id: number;
  category_id: number;
  name_uz: string;
  name_ru: string;
  description_uz?: string | null;
  description_ru?: string | null;
  image_url?: string | null;
  price: number;
  is_available: boolean;
  sort_order: number;
}

export type OrderStatus =
  | "pending" | "confirmed" | "preparing" | "ready"
  | "delivering" | "delivered" | "cancelled";

export interface OrderItem {
  id: number;
  name_uz: string;
  name_ru: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  number: string;
  restaurant_id: number;
  status: OrderStatus;
  payment_method: string;
  payment_status: string;
  items_total: number;
  delivery_fee: number;
  total: number;
  address_line: string;
  phone?: string | null;
  comment?: string | null;
  created_at: string;
  items: OrderItem[];
}

export interface Courier {
  id: number;
  name: string;
  phone?: string | null;
  telegram_id?: number | null;
  is_active: boolean;
  is_busy: boolean;
}

export interface DeliveryZone {
  id: number;
  name: string;
  fee: number;
  min_order: number;
  is_active: boolean;
  polygon?: string | null;
}

export interface DashboardStats {
  orders_today: number;
  revenue_today: number;
  orders_total: number;
  revenue_total: number;
  active_restaurants: number;
  pending_orders: number;
  users_total: number;
}

export interface AdminUser {
  id: number;
  username: string;
  role: string;
  is_active: boolean;
}
