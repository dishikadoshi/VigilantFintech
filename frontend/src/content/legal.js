/**
 * legal.js — starting-point legal copy. It is written generically for a
 * remote business-support agency; have it reviewed by a qualified
 * professional for your jurisdiction before relying on it.
 */
import { SITE } from '../config/site';

const N = SITE.name;
const contact = SITE.email ? `by email at ${SITE.email}` : 'through the contact form on this website';

export const UPDATED = 'November 2026';

export const PRIVACY = [
  { h: 'Who we are', p: [`${N} ("we", "us") is a remote business support agency providing virtual assistance, administrative support, customer support, digital marketing, creative services, website and e-commerce management, business operations support, and bookkeeping and accounting assistance. This policy explains how we handle personal information collected through this website.`] },
  { h: 'Information we collect', p: ['We collect information you choose to give us, and a small amount of technical information needed to run the site.'], ul: [
    'Inquiry details: your name, business name, email address, phone or WhatsApp number, country, the services you are interested in, your estimated workload and the message you write.',
    'Feedback you choose to submit, such as a name, company, rating and review.',
    'Technical data such as browser type and approximate region, used to keep the site secure and working.',
  ] },
  { h: 'How we use your information', ul: [
    'To respond to your inquiry and discuss a support arrangement.',
    'To prepare proposals and manage the working relationship once you become a client.',
    'To keep our website secure, prevent abuse and improve how it works.',
    'To meet legal and contractual obligations.',
  ] },
  { h: 'Client data and financial records', p: ['When we work with you, we may handle business information that is confidential, including customer data and financial records. We establish appropriate confidentiality agreements and access controls before starting work, limit access to the people who need it, and handle information only to deliver the agreed services.'] },
  { h: 'Who we share it with', p: ['We do not sell personal information. We share it only with trusted service providers that help us run the website and our business — for example hosting, email delivery, and data storage providers — under appropriate safeguards, or where we are legally required to.'] },
  { h: 'International transfers', p: ['We work with clients in many countries, so information may be processed in countries other than your own. Where this happens we take reasonable steps to protect it.'] },
  { h: 'How long we keep it', p: ['We keep inquiry information for as long as needed to respond to you and for our legitimate business and legal purposes, then delete or anonymize it.'] },
  { h: 'Your rights', p: [`Depending on where you live, you may have the right to access, correct, delete or restrict the use of your personal information, or to object to certain processing. To exercise these rights, contact us ${contact}.`] },
  { h: 'Cookies', p: ['Our Cookie Policy explains the limited storage this website uses.'] },
  { h: 'Security', p: ['We use reasonable technical and organizational measures to protect information. No online service can be guaranteed to be completely secure.'] },
  { h: "Children's privacy", p: ['Our services are for businesses and are not directed at children.'] },
  { h: 'Changes to this policy', p: ['We may update this policy from time to time. The date at the top shows when it was last changed.'] },
  { h: 'Contact', p: [`Questions about this policy? Contact us ${contact}.`] },
];

export const TERMS = [
  { h: 'Using this website', p: [`By using this website you agree to these terms. If you do not agree, please do not use it. The website is provided for general information about the services offered by ${N}.`] },
  { h: 'Our services', p: ['The scope, fees, working hours, deliverables and communication process for any engagement are set out in a separate written agreement or proposal. Information on this website, including plan descriptions, is a general guide and not a binding offer.'] },
  { h: 'Regulated services', p: ['Our bookkeeping and accounting support is administrative and record-keeping assistance. Unless explicitly agreed in writing and permitted by the relevant qualifications and authorizations, we do not provide regulated services such as tax filing, tax advice, auditing, legal advice or investment advice.'] },
  { h: 'Client responsibilities', ul: [
    'Provide accurate information and timely access to the tools and documents needed for the work.',
    'Make sure you have the right to share any data, accounts or materials you give us.',
    'Review work delivered and tell us promptly if changes are needed.',
  ] },
  { h: 'Confidentiality', p: ['We treat client information as confidential and can enter into confidentiality agreements and agree access controls before work begins.'] },
  { h: 'Intellectual property', p: [`Content on this website, including text, design and graphics, belongs to ${N} or its licensors and may not be copied or reused without permission. Ownership of work product created for a client is set out in the agreement between us.`] },
  { h: 'No guarantees', p: ['We work to deliver accurate, consistent and professional work, but we do not guarantee specific business outcomes, revenue, savings or growth.'] },
  { h: 'Limitation of liability', p: ['To the fullest extent permitted by law, we are not liable for indirect or consequential losses arising from use of this website. Liability for services is governed by the written agreement between us.'] },
  { h: 'Ending an engagement', p: ['Either party may end an engagement as set out in the written agreement. Fees for work already completed remain payable.'] },
  { h: 'Governing law', p: [`These terms are governed by the laws of the jurisdiction in which ${N} is registered, unless a written agreement says otherwise.`] },
  { h: 'Changes', p: ['We may update these terms from time to time. Continued use of the website means you accept the updated terms.'] },
  { h: 'Contact', p: [`Questions about these terms? Contact us ${contact}.`] },
];

export const COOKIES = [
  { h: 'What are cookies?', p: ['Cookies and similar technologies store small pieces of information in your browser. They are commonly used to make websites work and to understand how they are used.'] },
  { h: 'What this website uses', p: ['This website does not use advertising or tracking cookies. Any browser storage it uses is strictly necessary for the site to function.'] },
  { h: 'Analytics and third-party tools', p: ['If we add analytics, chat, booking or marketing tools in the future, they may set their own cookies. We will update this policy and ask for your consent where the law requires it.'] },
  { h: 'Managing cookies', p: ['You can block or delete cookies in your browser settings. Doing so will not stop the main features of this website from working.'] },
  { h: 'Changes to this policy', p: ['We may update this policy from time to time. The date at the top shows when it was last changed.'] },
  { h: 'Contact', p: [`Questions about cookies? Contact us ${contact}.`] },
];
