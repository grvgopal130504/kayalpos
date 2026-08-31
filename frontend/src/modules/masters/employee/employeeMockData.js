/**
 * TEMPORARY mock data for the Employee master. There's no Employee backend
 * module yet, so this static snapshot stands in for `useGetEmployeesQuery()`.
 * Replace with real API data once that module exists — do not add more mock
 * data here in the meantime.
 */

export const EMPLOYEE_TYPE_OPTIONS = ['Cashier', 'Sales Employee'];
export const LOCATION_OPTIONS = [
  'Main Outlet', 'Coimbatore Branch', 'Erode Branch', 'Madurai Branch',
  'RS Puram Outlet', 'Erode Main Outlet', 'Online Store (E-Com)',
];

export const EMPLOYEES = [
  { code: 'EMP001', name: 'Karthik Kumar', type: 'Cashier', location: 'Main Outlet', phone: '98422 33445', email: 'karthik.kumar@gmail.com', loginUser: 'karthik', status: 'Active', joiningDate: '01-Jan-2022' },
  { code: 'EMP002', name: 'Priya Shree', type: 'Cashier', location: 'Main Outlet', phone: '97511 22334', email: 'priya.shree@gmail.com', loginUser: 'priya', status: 'Active', joiningDate: '15-Mar-2022' },
  { code: 'EMP003', name: 'Suresh Babu', type: 'Sales Employee', location: 'Coimbatore Branch', phone: '94422 56789', email: 'suresh.babu@gmail.com', loginUser: 'suresh', status: 'Active', joiningDate: '10-Feb-2022' },
  { code: 'EMP004', name: 'Anitha Devi', type: 'Sales Employee', location: 'Erode Branch', phone: '99401 33445', email: 'anitha.devi@gmail.com', loginUser: 'anitha', status: 'Active', joiningDate: '05-Apr-2022' },
  { code: 'EMP005', name: 'Mohan Raj', type: 'Sales Employee', location: 'Madurai Branch', phone: '98403 56780', email: 'mohan.raj@gmail.com', loginUser: 'mohan', status: 'Active', joiningDate: '12-May-2022' },
  { code: 'EMP006', name: 'Sathish Kumar', type: 'Cashier', location: 'RS Puram Outlet', phone: '90031 11223', email: 'sathish.kumar@gmail.com', loginUser: 'sathish', status: 'Active', joiningDate: '18-Jun-2022' },
  { code: 'EMP007', name: 'Kavitha S', type: 'Cashier', location: 'Erode Main Outlet', phone: '91500 77889', email: 'kavitha.s@gmail.com', loginUser: 'kavitha', status: 'Active', joiningDate: '22-Jul-2022' },
  { code: 'EMP008', name: 'Arun Kumar', type: 'Sales Employee', location: 'Online Store (E-Com)', phone: '97900 44556', email: 'arun.kumar@gmail.com', loginUser: 'arun', status: 'Inactive', joiningDate: '01-Aug-2022' },
];

export const employeeTotalRecords = EMPLOYEES.length;
export const employeeTotalPages = 1;

export const STATS = {
  totalEmployees: 8,
  activeEmployees: 7,
  inactiveEmployees: 1,
  cashiers: 4,
  salesEmployees: 4,
};
