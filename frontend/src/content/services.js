/**
 * services.js — the seven service lines. Copy is taken verbatim from the
 * supplied website content. `formLabel` is what the contact form sends to
 * the backend (no ampersands, so it is stored cleanly in the sheet).
 */
export const SERVICES = [
  {
    slug: 'administrative-executive-assistance',
    n: '01',
    title: 'Administrative & Executive Assistance',
    short: 'Admin & Executive',
    formLabel: 'Administrative and Executive Assistance',
    blurb: 'We manage your everyday business tasks so you can focus on important decisions and business growth.',
    items: [
      'Email management', 'Calendar and appointment scheduling', 'Data entry and documentation',
      'Online research', 'Travel arrangements', 'Meeting coordination',
      'Document preparation', 'General administrative support',
    ],
  },
  {
    slug: 'customer-support',
    n: '02',
    title: 'Customer Support',
    short: 'Customer Support',
    formLabel: 'Customer Support',
    blurb: 'Deliver a better customer experience with professional support for your customers and clients.',
    items: [
      'Email customer support', 'Live chat assistance', 'Customer inquiries',
      'Order and booking assistance', 'Customer follow-ups', 'Complaint handling',
      'CRM management', 'Customer database management',
    ],
  },
  {
    slug: 'digital-marketing',
    n: '03',
    title: 'Digital Marketing',
    short: 'Digital Marketing',
    formLabel: 'Digital Marketing',
    blurb: 'Build your online presence and reach more potential customers with consistent digital marketing support.',
    items: [
      'Social media management', 'Social media scheduling', 'Content planning',
      'SEO assistance', 'Lead generation', 'Email marketing',
      'Competitor research', 'Marketing campaign coordination',
    ],
  },
  {
    slug: 'creative-design-services',
    n: '04',
    title: 'Creative & Design Services',
    short: 'Creative & Design',
    formLabel: 'Creative and Design Services',
    blurb: 'Make your brand stand out with creative content and professional visual support.',
    items: [
      'Social media graphics', 'Canva designs', 'Presentation design',
      'Video editing', 'Reels and short-form content', 'Marketing materials',
      'Basic brand assets', 'Promotional creatives',
    ],
  },
  {
    slug: 'website-ecommerce-management',
    n: '05',
    title: 'Website & E-commerce Management',
    short: 'Website & E-commerce',
    formLabel: 'Website and E-commerce Management',
    blurb: 'Keep your online business organized and running smoothly.',
    items: [
      'Website content updates', 'Product listing management', 'Product descriptions',
      'Order processing', 'Inventory updates', 'Shopify and WooCommerce assistance',
      'Website maintenance coordination', 'Online store administration',
    ],
  },
  {
    slug: 'business-operations-management',
    n: '06',
    title: 'Business Operations & Management',
    short: 'Business Operations',
    formLabel: 'Business Operations and Management',
    blurb: 'Get organized with ongoing operational support and project coordination.',
    items: [
      'Project management assistance', 'Task coordination', 'CRM updates',
      'Workflow management', 'Reporting and documentation', 'Database management',
      'Lead tracking', 'Business process assistance',
    ],
  },
  {
    slug: 'bookkeeping-accounting-support',
    n: '07',
    title: 'Bookkeeping & Accounting Support',
    short: 'Bookkeeping & Accounting',
    formLabel: 'Bookkeeping and Accounting Support',
    blurb: 'Keep your financial records organized and your business finances up to date with professional bookkeeping and accounting assistance.',
    items: [
      'Bookkeeping and transaction recording', 'Expense tracking and categorization',
      'Accounts payable and receivable assistance', 'Invoice creation and management',
      'Bank and account reconciliation', 'Financial data entry', 'Monthly financial reports',
      'Payroll administration assistance', 'Financial record organization', 'Accounting software assistance',
    ],
    note: 'Bookkeeping and accounting support covers record-keeping and administrative assistance. It does not include regulated services such as tax filing or auditing. Client financial records are handled under confidentiality agreements and access controls agreed before work starts.',
  },
];

export const serviceBySlug = (slug) => SERVICES.find((s) => s.slug === slug);

// Service labels the contact form can send; mirrored in the backend validator.
export const FORM_SERVICES = [...SERVICES.map((s) => s.formLabel), 'General enquiry'];
