import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// Register fonts (optional - defaults to Helvetica)
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helvetica/v12/regular.ttf' },
    { src: 'https://fonts.gstatic.com/s/helvetica/v12/bold.ttf', fontWeight: 'bold' },
  ],
});

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#7c3aed',
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 5,
  },
  companyInfo: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 5,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  column: {
    width: '48%',
  },
  label: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 11,
    color: '#111827',
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 4,
    marginBottom: 5,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCell: {
    fontSize: 10,
    color: '#111827',
  },
  col1: { width: '10%' },
  col2: { width: '40%' },
  col3: { width: '15%' },
  col4: { width: '15%' },
  col5: { width: '20%', textAlign: 'right' },
  totals: {
    marginTop: 20,
    borderTop: 2,
    borderTopColor: '#e5e7eb',
    paddingTop: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  totalLabel: {
    width: '70%',
    textAlign: 'right',
    fontSize: 11,
    color: '#6b7280',
    paddingRight: 20,
  },
  totalValue: {
    width: '30%',
    textAlign: 'right',
    fontSize: 11,
    color: '#111827',
  },
  grandTotalLabel: {
    width: '70%',
    textAlign: 'right',
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    paddingRight: 20,
  },
  grandTotalValue: {
    width: '30%',
    textAlign: 'right',
    fontSize: 13,
    fontWeight: 'bold',
    color: '#7c3aed',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 5,
  },
  notes: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 5,
  },
  notesText: {
    fontSize: 9,
    color: '#6b7280',
    lineHeight: 1.4,
  },
});

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  licenseType?: string;
  total: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';

  // Company info
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyCountry: string;
  companyEmail: string;

  // Customer info
  customerName: string;
  customerEmail: string;
  customerAddress?: string;
  customerCity?: string;
  customerCountry?: string;

  // Line items
  lineItems: InvoiceLineItem[];

  // Amounts
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  amountPaid: number;
  amountDue: number;

  // Payment info
  paymentMethod?: string;
  transactionId?: string;

  // Notes
  notes?: string;
  terms?: string;
}

/**
 * Invoice PDF Document Component
 *
 * Generates a professional PDF invoice using @react-pdf/renderer.
 * Includes company branding, line items, totals, and payment information.
 */
export const InvoicePDF = ({ data }: { data: InvoiceData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>AFILO</Text>
        <Text style={styles.companyInfo}>{data.companyName}</Text>
        <Text style={styles.companyInfo}>{data.companyAddress}</Text>
        <Text style={styles.companyInfo}>
          {data.companyCity}, {data.companyCountry}
        </Text>
        <Text style={styles.companyInfo}>{data.companyEmail}</Text>
        <Text style={styles.invoiceTitle}>INVOICE</Text>
      </View>

      {/* Invoice & Customer Info */}
      <View style={styles.row}>
        <View style={styles.column}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.label}>Invoice Number</Text>
              <Text style={styles.value}>#{data.invoiceNumber}</Text>
            </View>
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.label}>Invoice Date</Text>
              <Text style={styles.value}>{data.invoiceDate}</Text>
            </View>
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.label}>Due Date</Text>
              <Text style={styles.value}>{data.dueDate}</Text>
            </View>
            <View>
              <Text style={styles.label}>Status</Text>
              <Text
                style={[
                  styles.value,
                  {
                    color:
                      data.status === 'paid'
                        ? '#10b981'
                        : data.status === 'overdue'
                        ? '#ef4444'
                        : '#f59e0b',
                  },
                ]}
              >
                {data.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.column}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={styles.value}>{data.customerName}</Text>
            <Text style={[styles.value, { fontSize: 9, marginTop: 3 }]}>
              {data.customerEmail}
            </Text>
            {data.customerAddress && (
              <>
                <Text style={[styles.value, { fontSize: 9, marginTop: 3 }]}>
                  {data.customerAddress}
                </Text>
                <Text style={[styles.value, { fontSize: 9 }]}>
                  {data.customerCity}, {data.customerCountry}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Line Items Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.col1]}>#</Text>
          <Text style={[styles.tableHeaderText, styles.col2]}>Description</Text>
          <Text style={[styles.tableHeaderText, styles.col3]}>Qty</Text>
          <Text style={[styles.tableHeaderText, styles.col4]}>Unit Price</Text>
          <Text style={[styles.tableHeaderText, styles.col5]}>Total</Text>
        </View>

        {/* Table Rows */}
        {data.lineItems.map((item, index) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.col1]}>{index + 1}</Text>
            <View style={styles.col2}>
              <Text style={styles.tableCell}>{item.description}</Text>
              {item.licenseType && (
                <Text style={[styles.tableCell, { fontSize: 8, color: '#6b7280', marginTop: 2 }]}>
                  License: {item.licenseType}
                </Text>
              )}
            </View>
            <Text style={[styles.tableCell, styles.col3]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, styles.col4]}>
              ${item.unitPrice.toFixed(2)}
            </Text>
            <Text style={[styles.tableCell, styles.col5]}>
              ${item.total.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>${data.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax ({data.taxRate}%)</Text>
          <Text style={styles.totalValue}>${data.tax.toFixed(2)}</Text>
        </View>
        <View style={[styles.totalRow, { marginTop: 10, paddingTop: 10, borderTop: 1, borderTopColor: '#e5e7eb' }]}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>${data.total.toFixed(2)}</Text>
        </View>
        {data.amountPaid > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Amount Paid</Text>
            <Text style={[styles.totalValue, { color: '#10b981' }]}>
              -${data.amountPaid.toFixed(2)}
            </Text>
          </View>
        )}
        {data.amountDue > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Amount Due</Text>
            <Text style={[styles.totalValue, { color: '#ef4444', fontWeight: 'bold' }]}>
              ${data.amountDue.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      {/* Payment Info */}
      {data.paymentMethod && (
        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={{ marginBottom: 5 }}>
            <Text style={styles.label}>Payment Method</Text>
            <Text style={styles.value}>{data.paymentMethod}</Text>
          </View>
          {data.transactionId && (
            <View>
              <Text style={styles.label}>Transaction ID</Text>
              <Text style={styles.value}>{data.transactionId}</Text>
            </View>
          )}
        </View>
      )}

      {/* Notes */}
      {data.notes && (
        <View style={styles.notes}>
          <Text style={styles.notesTitle}>Notes</Text>
          <Text style={styles.notesText}>{data.notes}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Thank you for your business!
        </Text>
        {data.terms && (
          <Text style={[styles.footerText, { fontSize: 8 }]}>
            {data.terms}
          </Text>
        )}
        <Text style={[styles.footerText, { fontSize: 8, marginTop: 5 }]}>
          Questions? Contact us at {data.companyEmail}
        </Text>
      </View>
    </Page>
  </Document>
);
