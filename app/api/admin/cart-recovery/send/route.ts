/**
 * Cart Recovery Manual Send API
 *
 * POST /api/admin/cart-recovery/send - Manually send recovery email
 *
 * Phase 2 Feature: Enhanced E-commerce Features
 *
 * Manually triggers a cart recovery email for a specific cart session
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const userProfile = await prisma.user_profiles.findUnique({
      where: { clerk_user_id: userId },
      select: { role: true }
    });

    if (!userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'owner')) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { cartId } = await request.json();

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'Cart ID is required' },
        { status: 400 }
      );
    }

    // Get cart session
    const cartSession = await prisma.cart_recovery_sessions.findUnique({
      where: { id: cartId },
    });

    if (!cartSession) {
      return NextResponse.json(
        { success: false, error: 'Cart session not found' },
        { status: 404 }
      );
    }

    if (cartSession.status !== 'abandoned') {
      return NextResponse.json(
        { success: false, error: 'Can only send emails for abandoned carts' },
        { status: 400 }
      );
    }

    // Get the first active campaign (for manual sends, we'll use the first one)
    const campaign = await prisma.cart_recovery_campaigns.findFirst({
      where: { is_active: true },
      orderBy: { trigger_delay_hours: 'asc' },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'No active campaigns found' },
        { status: 400 }
      );
    }

    // Get user info from Clerk
    let userName = cartSession.user_name || 'Valued Customer';
    let userEmail = cartSession.user_email;

    try {
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(cartSession.clerk_user_id);
      userName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || userName;
      userEmail = clerkUser.emailAddresses[0]?.emailAddress || userEmail;
    } catch (clerkError) {
      console.warn(`Clerk user not found for ${cartSession.clerk_user_id}:`, clerkError);
    }

    // Create email template with actual data
    const cartData = cartSession.cart_data as any;
    const items = cartData?.items || [];
    const cartTotal = parseFloat(cartSession.total_value.toString());
    const discountedTotal = cartTotal * (1 - parseFloat(campaign.discount_percent.toString()) / 100);

    // Build cart items HTML
    const cartItemsHtml = items.map((item: any) => `
      <div style="display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #eee;">
        ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 15px;">` : ''}
        <div style="flex: 1;">
          <h4 style="margin: 0; color: #333;">${item.title}</h4>
          <p style="margin: 5px 0; color: #666;">Quantity: ${item.quantity}</p>
          <p style="margin: 0; font-weight: bold; color: #4F46E5;">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
        </div>
      </div>
    `).join('');

    // Replace template variables
    let emailContent = campaign.email_template
      .replace(/\{\{user_name\}\}/g, userName)
      .replace(/\{\{cart_items\}\}/g, cartItemsHtml)
      .replace(/\{\{cart_total\}\}/g, cartTotal.toFixed(2))
      .replace(/\{\{discounted_total\}\}/g, discountedTotal.toFixed(2))
      .replace(/\{\{discount_code\}\}/g, campaign.discount_code || '')
      .replace(/\{\{checkout_url\}\}/g, `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?recovery=${cartSession.id}`);

    // For now, we'll simulate sending the email by creating a log entry
    // In production, you would integrate with an email service like SendGrid, Mailgun, etc.
    await prisma.cart_recovery_email_logs.create({
      data: {
        recovery_session_id: cartSession.id,
        campaign_id: campaign.id,
        recipient_email: userEmail,
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
          to: userEmail,
          subject: campaign.subject_line,
          html: emailContent,
        });

        console.log('✅ Cart recovery email sent to:', userEmail);
      } catch (emailError) {
        console.error('❌ Failed to send email:', emailError);
      }
    } else {
      console.log('📧 Cart recovery email would be sent to:', userEmail);
      console.log('Subject:', campaign.subject_line);
      console.log('Content preview:', emailContent.substring(0, 200) + '...');
    }

    return NextResponse.json({
      success: true,
      message: 'Recovery email sent successfully',
      data: {
        recipient: userEmail,
        subject: campaign.subject_line,
        campaignName: campaign.name,
        cartValue: cartTotal,
        discountPercent: parseFloat(campaign.discount_percent.toString()),
      },
    });

  } catch (error) {
    console.error('Error sending recovery email:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}