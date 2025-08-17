import { neon } from "@neondatabase/serverless"

// Ensure DATABASE_URL is set in your environment variables
const databaseUrl = typeof window === "undefined" ? process.env.DATABASE_URL : null

if (typeof window === "undefined" && !databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set.")
}

export const sql = databaseUrl ? neon(databaseUrl) : null

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string | null
  image_url: string | null
  status: string
  inventory_quantity: number
  sku: string | null
  weight: number | null
  sizes: string[] // JSON array of available sizes
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  created_at: string
  updated_at: string
  total_orders?: number
  total_spent?: number
}

export interface Order {
  id: string
  customer_id: string | null
  order_number: string
  status: string
  subtotal: number
  tax_amount: number
  shipping_amount: number
  total_amount: number
  currency: string
  payment_status: string
  payment_method: string | null
  shipping_address: any
  billing_address: any
  notes: string | null
  created_at: string
  updated_at: string
  customer_email?: string
  customer_name?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_variant_id: string | null
  quantity: number
  unit_price: number
  total_price: number
  product_name: string
  variant_name: string | null
  size: string | null
  created_at: string
}

export async function getAllProducts(): Promise<Product[]> {
  const result = await sql`
    SELECT *, 
           COALESCE(sizes, '[]'::jsonb) as sizes,
           COALESCE(is_active, true) as is_active
    FROM products 
    ORDER BY created_at DESC
  `
  return result as Product[]
}

export async function getProductById(id: string): Promise<Product | null> {
  const result = await sql`
    SELECT *, 
           COALESCE(sizes, '[]'::jsonb) as sizes,
           COALESCE(is_active, true) as is_active
    FROM products 
    WHERE id = ${id}
  `
  return (result[0] as Product) || null
}

export async function getAllCustomers(): Promise<Customer[]> {
  const result = await sql`
    SELECT 
      c.*,
      COUNT(o.id) as total_orders,
      COALESCE(SUM(o.total_amount), 0) as total_spent
    FROM customers c
    LEFT JOIN orders o ON c.id = o.customer_id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `
  return result as Customer[]
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const result = await sql`
    SELECT 
      c.*,
      COUNT(o.id) as total_orders,
      COALESCE(SUM(o.total_amount), 0) as total_spent
    FROM customers c
    LEFT JOIN orders o ON c.id = o.customer_id
    WHERE c.id = ${id}
    GROUP BY c.id
  `
  return (result[0] as Customer) || null
}

export async function getAllOrders(): Promise<Order[]> {
  const result = await sql`
    SELECT 
      o.*,
      c.email as customer_email,
      CONCAT(c.first_name, ' ', c.last_name) as customer_name
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    ORDER BY o.created_at DESC
  `
  return result as Order[]
}

export async function getOrderById(id: string): Promise<Order | null> {
  const result = await sql`
    SELECT 
      o.*,
      c.email as customer_email,
      CONCAT(c.first_name, ' ', c.last_name) as customer_name
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    WHERE o.id = ${id}
  `
  return (result[0] as Order) || null
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const result = await sql`
    SELECT 
      oi.*,
      p.name as product_name,
      pv.name as variant_name
    FROM order_items oi
    LEFT JOIN products p ON oi.product_id = p.id
    LEFT JOIN product_variants pv ON oi.product_variant_id = pv.id
    WHERE oi.order_id = ${orderId}
    ORDER BY oi.created_at
  `
  return result as OrderItem[]
}
