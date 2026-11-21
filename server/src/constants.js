export const STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];

export const SOURCES = [
  'Website',
  'Referral',
  'LinkedIn',
  'Cold Call',
  'Email Campaign',
  'Trade Show',
  'Other',
];

// Columns the leads table may be sorted by (whitelist: never interpolate user input into SQL).
export const SORTABLE_COLUMNS = ['name', 'company', 'status', 'source', 'created_at'];
