import { z } from 'zod';
import { formatPickerDate, parsePickerDate } from '../../../components/form/FormDatePicker';
import { EMPLOYEE_TYPE_OPTIONS, STATUS_OPTIONS } from './employeeMockData';

export { EMPLOYEE_TYPE_OPTIONS, STATUS_OPTIONS };

// FormSelect needs [{value,label}] — Employee Type stays a plain string
// list (frontend-owned free text, same "list lives in the frontend"
// convention as Supplier.group) so it's mapped here.
export const TYPE_SELECT_OPTIONS = EMPLOYEE_TYPE_OPTIONS.map((v) => ({ value: v, label: v }));

// Client-side validation mirrors the server's createEmployeeSchema (see
// backend/src/modules/employee/employee.schema.js) field-for-field,
// including the phone/login-username format checks, not just "is it
// non-empty" — same convention as every other *FormDialog in this app
// (Supplier/Brand/HSN-SAC/Price List). `outletId` is required here even
// though the database column is nullable — see the backend schema's own
// doc comment for why.
export const createEmployeeSchema = z.object({
  name: z.string().trim().min(1, 'Employee name is required').max(150, 'Name cannot exceed 150 characters'),
  type: z.string().trim().min(1, 'Select an employee type'),
  outletId: z.string().trim().min(1, 'Select a location'),
  phone: z.string().trim().optional(),
  email: z.string().trim().email('Enter a valid email address').optional().or(z.literal('')),
  loginUsername: z.string().trim().optional(),
  joiningDate: z.string().trim().optional(),
  status: z.string().trim().min(1, 'Select a status'),
}).superRefine((data, ctx) => {
  if (data.phone) {
    const digits = data.phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['phone'], message: 'Enter a valid 10-digit phone number' });
    }
  }
  if (data.loginUsername && !/^[a-zA-Z][a-zA-Z0-9_.]{2,29}$/.test(data.loginUsername)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['loginUsername'],
      message: 'Login user must start with a letter and be 3-30 characters (letters, numbers, "_", ".")',
    });
  }
});

export const createEmployeeDefaultValues = {
  name: '',
  type: EMPLOYEE_TYPE_OPTIONS[0],
  outletId: '',
  phone: '',
  email: '',
  loginUsername: '',
  joiningDate: formatPickerDate(new Date()),
  status: 'Active',
};

// EmployeePage passes this dialog its own toViewRow-mapped object (same
// "view row" indirection SupplierPage uses), not the raw API row — so
// `joiningDate` can arrive either as a raw ISO date string (a real API row)
// or already formatted as "DD Mon YYYY" (a view row). Tried as a picker
// string first so an already-formatted value passes through unchanged
// instead of failing `new Date(...)`.
function normalizeJoiningDate(value) {
  if (!value) return '';
  if (parsePickerDate(value)) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : formatPickerDate(parsed);
}

// Maps an Employee row (either the raw API shape — outlet joined in, status
// 'ACTIVE'/'INACTIVE', joiningDate an ISO date string or null — or the
// page's toViewRow-mapped view row) to react-hook-form values, for editing
// an existing row via the dialog.
export function employeeToFormValues(row) {
  if (!row) return createEmployeeDefaultValues;
  return {
    name: row.name || '',
    type: row.type || EMPLOYEE_TYPE_OPTIONS[0],
    outletId: row.outletId || row.outlet?.id || '',
    phone: row.phone || '',
    email: row.email || '',
    loginUsername: row.loginUsername || row.loginUser || '',
    joiningDate: normalizeJoiningDate(row.joiningDate),
    status: String(row.status).toUpperCase() === 'INACTIVE' ? 'Inactive' : 'Active',
  };
}

// Converts the form's values into the real POST/PUT /masters/employee body.
export function employeeFormValuesToPayload(values) {
  const joiningDate = values.joiningDate ? parsePickerDate(values.joiningDate) : null;

  return {
    name: values.name.trim(),
    type: values.type,
    outletId: values.outletId,
    phone: values.phone?.trim() || undefined,
    email: values.email?.trim() || undefined,
    loginUsername: values.loginUsername?.trim() || undefined,
    joiningDate: joiningDate ? joiningDate.toISOString() : null,
    status: values.status === 'Inactive' ? 'INACTIVE' : 'ACTIVE',
  };
}
