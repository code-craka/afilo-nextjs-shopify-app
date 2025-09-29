import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const sql = neon(process.env.DATABASE_URL);

// Database utility types
export interface UserProfile {
  id: string;
  clerk_user_id: string;
  email: string;
  company_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  clerk_user_id: string;
  email: string;
  shopify_order_id: string;
  shopify_customer_id?: string;
  plan_id: string;
  plan_name: string;
  amount: number;
  currency: string;
  status: 'active' | 'cancelled' | 'expired' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Download {
  id: string;
  clerk_user_id: string;
  subscription_id: string;
  product_id: string;
  product_title: string;
  download_url: string;
  license_key: string;
  download_count: number;
  max_downloads: number;
  expires_at?: string;
  created_at: string;
  last_downloaded_at?: string;
}

export interface PaymentEvent {
  id: string;
  clerk_user_id?: string;
  event_type: string;
  shopify_order_id?: string;
  amount?: number;
  status?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// Database query utilities
export class DatabaseService {

  // User Profile operations
  static async createUserProfile(userData: {
    clerk_user_id: string;
    email: string;
    company_name?: string;
  }): Promise<UserProfile> {
    const [user] = await sql`
      INSERT INTO user_profiles (clerk_user_id, email, company_name)
      VALUES (${userData.clerk_user_id}, ${userData.email}, ${userData.company_name || null})
      RETURNING *
    `;
    return user as UserProfile;
  }

  static async getUserProfile(clerk_user_id: string): Promise<UserProfile | null> {
    const [user] = await sql`
      SELECT * FROM user_profiles WHERE clerk_user_id = ${clerk_user_id}
    `;
    return user as UserProfile || null;
  }

  static async updateUserProfile(clerk_user_id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    // Build SET clause manually
    const setClauses = [];

    if (updates.email !== undefined) {
      setClauses.push(`email = '${updates.email}'`);
    }
    if (updates.company_name !== undefined) {
      setClauses.push(`company_name = '${updates.company_name}'`);
    }

    if (setClauses.length === 0) {
      throw new Error('No valid fields to update');
    }

    const setClause = setClauses.join(', ');

    const [user] = await sql`
      UPDATE user_profiles
      SET ${sql.unsafe(setClause)}, updated_at = NOW()
      WHERE clerk_user_id = ${clerk_user_id}
      RETURNING *
    `;
    return user as UserProfile;
  }

  // Subscription operations
  static async createSubscription(subscriptionData: {
    clerk_user_id: string;
    email: string;
    shopify_order_id: string;
    shopify_customer_id?: string;
    plan_id: string;
    plan_name: string;
    amount: number;
    currency: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
  }): Promise<Subscription> {
    const [subscription] = await sql`
      INSERT INTO subscriptions (
        clerk_user_id, email, shopify_order_id, shopify_customer_id,
        plan_id, plan_name, amount, currency, status,
        current_period_start, current_period_end
      )
      VALUES (
        ${subscriptionData.clerk_user_id}, ${subscriptionData.email},
        ${subscriptionData.shopify_order_id}, ${subscriptionData.shopify_customer_id || null},
        ${subscriptionData.plan_id}, ${subscriptionData.plan_name},
        ${subscriptionData.amount}, ${subscriptionData.currency}, ${subscriptionData.status},
        ${subscriptionData.current_period_start}, ${subscriptionData.current_period_end}
      )
      RETURNING *
    `;
    return subscription as Subscription;
  }

  static async getUserSubscriptions(clerk_user_id: string): Promise<Subscription[]> {
    const subscriptions = await sql`
      SELECT * FROM subscriptions
      WHERE clerk_user_id = ${clerk_user_id}
      ORDER BY created_at DESC
    `;
    return subscriptions as Subscription[];
  }

  static async getActiveSubscriptions(clerk_user_id: string): Promise<Subscription[]> {
    const subscriptions = await sql`
      SELECT * FROM subscriptions
      WHERE clerk_user_id = ${clerk_user_id} AND status = 'active'
      ORDER BY created_at DESC
    `;
    return subscriptions as Subscription[];
  }

  static async updateSubscriptionStatus(shopify_order_id: string, status: string): Promise<Subscription> {
    const [subscription] = await sql`
      UPDATE subscriptions
      SET status = ${status}, updated_at = NOW()
      WHERE shopify_order_id = ${shopify_order_id}
      RETURNING *
    `;
    return subscription as Subscription;
  }

  // Download operations
  static async createDownload(downloadData: {
    clerk_user_id: string;
    subscription_id: string;
    product_id: string;
    product_title: string;
    download_url: string;
    license_key: string;
    max_downloads?: number;
    expires_at?: string;
  }): Promise<Download> {
    const [download] = await sql`
      INSERT INTO downloads (
        clerk_user_id, subscription_id, product_id, product_title,
        download_url, license_key, max_downloads, expires_at
      )
      VALUES (
        ${downloadData.clerk_user_id}, ${downloadData.subscription_id},
        ${downloadData.product_id}, ${downloadData.product_title},
        ${downloadData.download_url}, ${downloadData.license_key},
        ${downloadData.max_downloads || 10}, ${downloadData.expires_at || null}
      )
      RETURNING *
    `;
    return download as Download;
  }

  static async getUserDownloads(clerk_user_id: string): Promise<Download[]> {
    const downloads = await sql`
      SELECT * FROM downloads
      WHERE clerk_user_id = ${clerk_user_id}
      ORDER BY created_at DESC
    `;
    return downloads as Download[];
  }

  static async getDownloadByLicense(license_key: string): Promise<Download | null> {
    const [download] = await sql`
      SELECT * FROM downloads WHERE license_key = ${license_key}
    `;
    return download as Download || null;
  }

  static async incrementDownloadCount(license_key: string): Promise<Download> {
    const [download] = await sql`
      UPDATE downloads
      SET download_count = download_count + 1, last_downloaded_at = NOW()
      WHERE license_key = ${license_key}
      RETURNING *
    `;
    return download as Download;
  }

  // Payment Event operations
  static async logPaymentEvent(eventData: {
    clerk_user_id?: string;
    event_type: string;
    shopify_order_id?: string;
    amount?: number;
    status?: string;
    metadata?: Record<string, unknown>;
  }): Promise<PaymentEvent> {
    const [event] = await sql`
      INSERT INTO payment_events (
        clerk_user_id, event_type, shopify_order_id, amount, status, metadata
      )
      VALUES (
        ${eventData.clerk_user_id || null}, ${eventData.event_type},
        ${eventData.shopify_order_id || null}, ${eventData.amount || null},
        ${eventData.status || null}, ${JSON.stringify(eventData.metadata || {})}
      )
      RETURNING *
    `;
    return event as PaymentEvent;
  }

  static async getPaymentEvents(clerk_user_id: string): Promise<PaymentEvent[]> {
    const events = await sql`
      SELECT * FROM payment_events
      WHERE clerk_user_id = ${clerk_user_id}
      ORDER BY created_at DESC
    `;
    return events as PaymentEvent[];
  }
}