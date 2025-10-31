import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { renderToStream } from '@react-pdf/renderer';
import React from 'react';
import { InvoicePDF, InvoiceData } from '@/lib/invoices/pdf-generator';

/**
 * POST /api/billing/invoices/generate
 *
 * Generates a PDF invoice from invoice data.
 * Returns the PDF as a downloadable blob.
 *
 * Request Body:
 * - invoiceData: InvoiceData object
 *
 * Response:
 * - PDF file (application/pdf)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { invoiceData } = await request.json();

    if (!invoiceData) {
      return NextResponse.json(
        { error: 'Invoice data is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = [
      'invoiceNumber',
      'invoiceDate',
      'dueDate',
      'customerName',
      'customerEmail',
      'lineItems',
      'total',
    ];

    for (const field of requiredFields) {
      if (!invoiceData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Set company defaults if not provided
    const fullInvoiceData: InvoiceData = {
      ...invoiceData,
      companyName: invoiceData.companyName || 'Afilo Enterprise Marketplace',
      companyAddress: invoiceData.companyAddress || '123 Business St',
      companyCity: invoiceData.companyCity || 'San Francisco, CA 94102',
      companyCountry: invoiceData.companyCountry || 'United States',
      companyEmail: invoiceData.companyEmail || 'billing@afilo.io',
    };

    // Generate PDF using renderToStream (returns a Node.js stream)
    const pdfStream = await renderToStream(<InvoicePDF data={fullInvoiceData} />);

    // Convert ReadableStream to Buffer
    const chunks: Buffer[] = [];

    // Read from the stream
    pdfStream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    // Wait for stream to finish
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      pdfStream.on('end', () => resolve(Buffer.concat(chunks)));
      pdfStream.on('error', reject);
    });

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${fullInvoiceData.invoiceNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error generating invoice PDF:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
