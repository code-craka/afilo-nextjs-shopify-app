/**
 * Cart Recovery Service
 *
 * Phase 2 Feature: Enhanced E-commerce Features
 *
 * Handles:
 * - Tracking cart abandonment
 * - Creating recovery sessions
 * - Automated email scheduling
 * - Recovery analytics
 */

import 'server-only';

import { prisma } from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';
import { subHours, addHours } from 'date-fns';

export interface CartItem {
  productId: string;
  variantId?: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  licenseType?: string;
}

export interface CartSession {
  sessionId: string;
  userId: string;
  items: CartItem[];
  totalValue: number;
  userEmail?: string;
  userName?: string;
}

export class CartRecoveryService {
  /**
   * Create or update a cart recovery session
   */
  static async trackCartSession(cartSession: CartSession): Promise<void> {
    try {
      // Get user info from Clerk
      let userEmail = cartSession.userEmail;
      let userName = cartSession.userName;

      if (!userEmail || !userName) {
        try {
          const clerk = await clerkClient();
          const clerkUser = await clerk.users.getUser(cartSession.userId);
          userEmail = clerkUser.emailAddresses[0]?.emailAddress || userEmail;
          userName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || userName;
        } catch (error) {
          console.warn(`Could not fetch Clerk user ${cartSession.userId}:`, error);
        }
      }

      // Create or update cart recovery session
      await prisma.cart_recovery_sessions.upsert({
        where: {
          cart_session_id_clerk_user_id: {
            cart_session_id: cartSession.sessionId,
            clerk_user_id: cartSession.userId,
          },
        },
        update: {
          total_items: cartSession.items.length,
          total_value: cartSession.totalValue,
          cart_data: JSON.parse(JSON.stringify({
            items: cartSession.items,
            updated_at: new Date().toISOString(),
          })),
          last_activity: new Date(),
          user_email: userEmail || 'unknown@example.com',
          user_name: userName || 'Unknown User',
        },
        create: {
          cart_session_id: cartSession.sessionId,
          clerk_user_id: cartSession.userId,
          user_email: userEmail || 'unknown@example.com',
          user_name: userName || 'Unknown User',
          total_items: cartSession.items.length,
          total_value: cartSession.totalValue,
          cart_data: JSON.parse(JSON.stringify({
            items: cartSession.items,
            created_at: new Date().toISOString(),
          })),
          status: 'active',
        },
      });

      console.log(`Cart session tracked: ${cartSession.sessionId} for user ${cartSession.userId}`);
    } catch (error) {
      console.error('Error tracking cart session:', error);
    }
  }

  /**
   * Mark cart as recovered when user completes purchase
   */
  static async markCartRecovered(
    sessionId: string,
    userId: string,
    recoveryRevenue: number = 0
  ): Promise<void> {
    try {
      await prisma.cart_recovery_sessions.updateMany({
        where: {
          cart_session_id: sessionId,
          clerk_user_id: userId,
          status: { in: ['active', 'abandoned'] },
        },
        data: {
          status: 'recovered',
          recovered_at: new Date(),
          recovery_revenue: recoveryRevenue,
        },
      });

      // Update analytics for today
      await this.updateDailyAnalytics();

      console.log(`Cart recovered: ${sessionId} for user ${userId} with revenue $${recoveryRevenue}`);
    } catch (error) {
      console.error('Error marking cart as recovered:', error);
    }
  }

  /**
   * Process abandoned carts and mark them for recovery
   */
  static async processAbandonedCarts(): Promise<number> {
    try {
      // Mark carts as abandoned if no activity for 24+ hours
      const abandonmentThreshold = subHours(new Date(), 24);

      const result = await prisma.cart_recovery_sessions.updateMany({
        where: {
          status: 'active',
          last_activity: {
            lte: abandonmentThreshold,
          },
          abandoned_at: null,
        },
        data: {
          status: 'abandoned',
          abandoned_at: new Date(),
        },
      });

      if (result.count > 0) {
        console.log(`Marked ${result.count} carts as abandoned`);
        await this.updateDailyAnalytics();
      }

      return result.count;
    } catch (error) {
      console.error('Error processing abandoned carts:', error);
      return 0;
    }
  }

  /**
   * Get carts ready for recovery emails
   */
  static async getCartsReadyForRecovery(): Promise<any[]> {
    try {
      // Get active campaigns
      const campaigns = await prisma.cart_recovery_campaigns.findMany({
        where: { is_active: true },
        orderBy: { trigger_delay_hours: 'asc' },
      });

      if (campaigns.length === 0) {
        return [];
      }

      const cartsReadyForRecovery = [];

      for (const campaign of campaigns) {
        // Calculate when emails should be sent based on trigger delay
        const triggerTime = subHours(new Date(), campaign.trigger_delay_hours);

        // Find abandoned carts that haven't received this campaign yet
        const readyCarts = await prisma.cart_recovery_sessions.findMany({
          where: {
            status: 'abandoned',
            abandoned_at: {
              lte: triggerTime,
            },
            email_logs: {
              none: {
                campaign_id: campaign.id,
              },
            },
          },
          include: {
            email_logs: true,
          },
          take: 50, // Limit to prevent overwhelming email service
        });

        for (const cart of readyCarts) {
          cartsReadyForRecovery.push({
            cartSession: cart,
            campaign: campaign,
          });
        }
      }

      return cartsReadyForRecovery;
    } catch (error) {
      console.error('Error getting carts ready for recovery:', error);
      return [];
    }
  }

  /**
   * Send automated recovery emails
   */
  static async sendAutomatedRecoveryEmails(): Promise<number> {
    try {
      const cartsReadyForRecovery = await this.getCartsReadyForRecovery();
      let emailsSent = 0;

      for (const { cartSession, campaign } of cartsReadyForRecovery) {
        try {
          // Build email content
          const cartData = cartSession.cart_data as any;
          const items = cartData?.items || [];
          const cartTotal = parseFloat(cartSession.total_value.toString());
          const discountedTotal = cartTotal * (1 - parseFloat(campaign.discount_percent.toString()) / 100);

          // Build cart items HTML
          const cartItemsHtml = items.map((item: any) => `
            <div style="display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #eee;">
              ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 15px;">` : ''}
              <div style="flex: 1;">
                <h4 style="margin: 0; color: #333;">${item.title}</h4>
                <p style="margin: 5px 0; color: #666;">Quantity: ${item.quantity}</p>
                <p style="margin: 0; font-weight: bold; color: #4F46E5;">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          `).join('');

          // Replace template variables
          let emailContent = campaign.email_template
            .replace(/\{\{user_name\}\}/g, cartSession.user_name || 'Valued Customer')
            .replace(/\{\{cart_items\}\}/g, cartItemsHtml)
            .replace(/\{\{cart_total\}\}/g, cartTotal.toFixed(2))
            .replace(/\{\{discounted_total\}\}/g, discountedTotal.toFixed(2))
            .replace(/\{\{discount_code\}\}/g, campaign.discount_code || '')
            .replace(/\{\{checkout_url\}\}/g, `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?recovery=${cartSession.id}`);

          // Create email log
          await prisma.cart_recovery_email_logs.create({
            data: {
              recovery_session_id: cartSession.id,
              campaign_id: campaign.id,
              recipient_email: cartSession.user_email,
              subject_line: campaign.subject_line,
              email_content: emailContent,
              discount_code: campaign.discount_code,
              cart_value_at_send: cartSession.total_value,
              delivery_status: 'sent',
            },
          });

          // Update cart session
          await prisma.cart_recovery_sessions.update({
            where: { id: cartSession.id },
            data: {
              recovery_emails_sent: cartSession.recovery_emails_sent + 1,
              last_email_sent_at: new Date(),
            },
          });

          // Update campaign stats
          await prisma.cart_recovery_campaigns.update({
            where: { id: campaign.id },
            data: {
              total_sent: campaign.total_sent + 1,
            },
          });

          // Send email using Resend (existing email service)
          if (process.env.RESEND_API_KEY) {
            try {
              const { Resend } = await import('resend');
              const resend = new Resend(process.env.RESEND_API_KEY);

              await resend.emails.send({
                from: 'Cart Recovery <noreply@afilo.io>',
                to: cartSession.user_email,
                subject: campaign.subject_line,
                html: emailContent,
              });

              console.log(`✅ Cart recovery email sent to ${cartSession.user_email} for cart ${cartSession.id}`);
            } catch (emailError) {
              console.error(`❌ Failed to send email to ${cartSession.user_email}:`, emailError);
            }
          } else {
            console.log(`📧 Would send recovery email to ${cartSession.user_email} for cart ${cartSession.id}`);
          }

          emailsSent++;
        } catch (error) {
          console.error(`Error sending recovery email for cart ${cartSession.id}:`, error);
        }
      }

      if (emailsSent > 0) {
        await this.updateDailyAnalytics();
      }

      return emailsSent;
    } catch (error) {
      console.error('Error sending automated recovery emails:', error);
      return 0;
    }
  }

  /**
   * Update daily analytics
   */
  static async updateDailyAnalytics(): Promise<void> {
    try {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

      // Get today's statistics
      const stats = await prisma.cart_recovery_sessions.groupBy({
        by: ['status'],
        where: {
          OR: [
            {
              abandoned_at: {
                gte: startOfToday,
                lt: endOfToday,
              },
            },
            {
              recovered_at: {
                gte: startOfToday,
                lt: endOfToday,
              },
            },
          ],
        },
        _count: true,
        _sum: {
          total_value: true,
          recovery_revenue: true,
        },
      });

      const emailStats = await prisma.cart_recovery_email_logs.aggregate({
        where: {
          sent_at: {
            gte: startOfToday,
            lt: endOfToday,
          },
        },
        _count: {
          id: true,
          opened_at: true,
          clicked_at: true,
        },
      });

      const cartsAbandoned = stats.find(s => s.status === 'abandoned')?._count || 0;
      const cartsRecovered = stats.find(s => s.status === 'recovered')?._count || 0;
      const potentialRevenue = parseFloat(stats.find(s => s.status === 'abandoned')?._sum.total_value?.toString() || '0');
      const recoveredRevenue = parseFloat(stats.find(s => s.status === 'recovered')?._sum.recovery_revenue?.toString() || '0');

      // Update or create daily analytics record
      await prisma.cart_recovery_analytics.upsert({
        where: { date: startOfToday },
        update: {
          carts_abandoned: cartsAbandoned,
          carts_recovered: cartsRecovered,
          emails_sent: emailStats._count.id || 0,
          emails_opened: emailStats._count.opened_at || 0,
          emails_clicked: emailStats._count.clicked_at || 0,
          potential_revenue: potentialRevenue,
          recovered_revenue: recoveredRevenue,
          recovery_rate: cartsAbandoned > 0 ? (cartsRecovered / cartsAbandoned) * 100 : 0,
          open_rate: emailStats._count.id > 0 ? ((emailStats._count.opened_at || 0) / emailStats._count.id) * 100 : 0,
          click_rate: (emailStats._count.opened_at || 0) > 0 ? ((emailStats._count.clicked_at || 0) / (emailStats._count.opened_at || 1)) * 100 : 0,
          conversion_rate: emailStats._count.id > 0 ? (cartsRecovered / emailStats._count.id) * 100 : 0,
        },
        create: {
          date: startOfToday,
          carts_abandoned: cartsAbandoned,
          carts_recovered: cartsRecovered,
          emails_sent: emailStats._count.id || 0,
          emails_opened: emailStats._count.opened_at || 0,
          emails_clicked: emailStats._count.clicked_at || 0,
          potential_revenue: potentialRevenue,
          recovered_revenue: recoveredRevenue,
          recovery_rate: cartsAbandoned > 0 ? (cartsRecovered / cartsAbandoned) * 100 : 0,
          open_rate: emailStats._count.id > 0 ? ((emailStats._count.opened_at || 0) / emailStats._count.id) * 100 : 0,
          click_rate: (emailStats._count.opened_at || 0) > 0 ? ((emailStats._count.clicked_at || 0) / (emailStats._count.opened_at || 1)) * 100 : 0,
          conversion_rate: emailStats._count.id > 0 ? (cartsRecovered / emailStats._count.id) * 100 : 0,
        },
      });

      console.log('Daily analytics updated successfully');
    } catch (error) {
      console.error('Error updating daily analytics:', error);
    }
  }

  /**
   * Cleanup old cart sessions and expired data
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      // Mark sessions as expired if abandoned for more than 30 days
      const expirationThreshold = subHours(new Date(), 30 * 24);

      const result = await prisma.cart_recovery_sessions.updateMany({
        where: {
          status: 'abandoned',
          abandoned_at: {
            lte: expirationThreshold,
          },
        },
        data: {
          status: 'expired',
        },
      });

      console.log(`Marked ${result.count} cart sessions as expired`);
      return result.count;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  }
}