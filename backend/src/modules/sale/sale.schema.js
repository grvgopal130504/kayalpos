import { z } from 'zod';

// One cart line as sent by the Line Sale screen. `productId` is what the
// server actually trusts — code/name/uom/price/taxRate are echoed back only
// so a mismatch (stale client cache) can be surfaced clearly, never trusted
// for money math (see sale.service.js's createSale, which re-reads the
// Product row fresh inside the transaction).
export const saleLineSchema = z.object({
  productId: z.string().trim().min(1, 'Product is required'),
  qty: z.coerce.number().int('Quantity must be a whole number').positive('Quantity must be at least 1'),
});

export const createSaleSchema = z.object({
  customerId: z.string().trim().min(1).optional().nullable(),
  customerName: z.string().trim().min(1).default('Walk-in Customer'),
  cashierName: z.string().trim().min(1, 'Cashier name is required'),
  lines: z.array(saleLineSchema).min(1, 'Add at least one item before payment'),
  discountType: z.enum(['amount', 'percent']).default('amount'),
  discountValue: z.coerce.number().nonnegative('Discount cannot be negative').default(0),
  paymentMethod: z.enum(['cash', 'upi', 'card', 'wallet', 'credit'], {
    errorMap: () => ({ message: 'Select a payment method' }),
  }),
  receivedAmount: z.coerce.number().nonnegative('Received amount cannot be negative').default(0),
});
