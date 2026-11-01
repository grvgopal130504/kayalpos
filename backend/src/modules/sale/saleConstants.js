// Flat GST rate applied to every sale / held-bill line for now — matches the
// frontend's lineSaleMockData.TAX_RATE (0.05) until Product's taxCode
// resolves to a real per-product rate via the Tax Code master. Lives in its
// own file so both sale.service.js and heldBill.service.js can share the
// one value without importing each other.
export const TAX_RATE = 0.05;
