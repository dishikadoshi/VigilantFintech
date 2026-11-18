/**
 * Country dial codes for the phone field on the contact form.
 * [ISO-3166 alpha-2, name, dial code digits]. The first few are pinned to
 * the top of the picker; everything else is alphabetical.
 */
const PINNED = ['US', 'CA', 'GB', 'IN', 'AU'];

const RAW = [
  ['AE', 'United Arab Emirates', '971'], ['AF', 'Afghanistan', '93'], ['AL', 'Albania', '355'],
  ['AM', 'Armenia', '374'], ['AR', 'Argentina', '54'], ['AT', 'Austria', '43'],
  ['AU', 'Australia', '61'], ['AZ', 'Azerbaijan', '994'], ['BA', 'Bosnia & Herzegovina', '387'],
  ['BD', 'Bangladesh', '880'], ['BE', 'Belgium', '32'], ['BG', 'Bulgaria', '359'],
  ['BH', 'Bahrain', '973'], ['BN', 'Brunei', '673'], ['BO', 'Bolivia', '591'],
  ['BR', 'Brazil', '55'], ['BT', 'Bhutan', '975'], ['BW', 'Botswana', '267'],
  ['BY', 'Belarus', '375'], ['CA', 'Canada', '1'], ['CH', 'Switzerland', '41'],
  ['CL', 'Chile', '56'], ['CN', 'China', '86'], ['CO', 'Colombia', '57'],
  ['CR', 'Costa Rica', '506'], ['CY', 'Cyprus', '357'], ['CZ', 'Czechia', '420'],
  ['DE', 'Germany', '49'], ['DK', 'Denmark', '45'], ['DZ', 'Algeria', '213'],
  ['EC', 'Ecuador', '593'], ['EE', 'Estonia', '372'], ['EG', 'Egypt', '20'],
  ['ES', 'Spain', '34'], ['ET', 'Ethiopia', '251'], ['FI', 'Finland', '358'],
  ['FJ', 'Fiji', '679'], ['FR', 'France', '33'], ['GB', 'United Kingdom', '44'],
  ['GE', 'Georgia', '995'], ['GH', 'Ghana', '233'], ['GR', 'Greece', '30'],
  ['GT', 'Guatemala', '502'], ['HK', 'Hong Kong', '852'], ['HR', 'Croatia', '385'],
  ['HU', 'Hungary', '36'], ['ID', 'Indonesia', '62'], ['IE', 'Ireland', '353'],
  ['IL', 'Israel', '972'], ['IN', 'India', '91'], ['IQ', 'Iraq', '964'],
  ['IR', 'Iran', '98'], ['IS', 'Iceland', '354'], ['IT', 'Italy', '39'],
  ['JM', 'Jamaica', '1'], ['JO', 'Jordan', '962'], ['JP', 'Japan', '81'],
  ['KE', 'Kenya', '254'], ['KG', 'Kyrgyzstan', '996'], ['KH', 'Cambodia', '855'],
  ['KR', 'South Korea', '82'], ['KW', 'Kuwait', '965'], ['KZ', 'Kazakhstan', '7'],
  ['LA', 'Laos', '856'], ['LB', 'Lebanon', '961'], ['LK', 'Sri Lanka', '94'],
  ['LT', 'Lithuania', '370'], ['LU', 'Luxembourg', '352'], ['LV', 'Latvia', '371'],
  ['MA', 'Morocco', '212'], ['MD', 'Moldova', '373'], ['ME', 'Montenegro', '382'],
  ['MK', 'North Macedonia', '389'], ['MM', 'Myanmar', '95'], ['MN', 'Mongolia', '976'],
  ['MO', 'Macao', '853'], ['MT', 'Malta', '356'], ['MU', 'Mauritius', '230'],
  ['MV', 'Maldives', '960'], ['MX', 'Mexico', '52'], ['MY', 'Malaysia', '60'],
  ['NG', 'Nigeria', '234'], ['NL', 'Netherlands', '31'], ['NO', 'Norway', '47'],
  ['NP', 'Nepal', '977'], ['NZ', 'New Zealand', '64'], ['OM', 'Oman', '968'],
  ['PA', 'Panama', '507'], ['PE', 'Peru', '51'], ['PH', 'Philippines', '63'],
  ['PK', 'Pakistan', '92'], ['PL', 'Poland', '48'], ['PR', 'Puerto Rico', '1'],
  ['PT', 'Portugal', '351'], ['PY', 'Paraguay', '595'], ['QA', 'Qatar', '974'],
  ['RO', 'Romania', '40'], ['RS', 'Serbia', '381'], ['RU', 'Russia', '7'],
  ['SA', 'Saudi Arabia', '966'], ['SE', 'Sweden', '46'], ['SG', 'Singapore', '65'],
  ['SI', 'Slovenia', '386'], ['SK', 'Slovakia', '421'], ['TH', 'Thailand', '66'],
  ['TN', 'Tunisia', '216'], ['TR', 'Türkiye', '90'], ['TW', 'Taiwan', '886'],
  ['TZ', 'Tanzania', '255'], ['UA', 'Ukraine', '380'], ['UG', 'Uganda', '256'],
  ['US', 'United States', '1'], ['UY', 'Uruguay', '598'], ['UZ', 'Uzbekistan', '998'],
  ['VE', 'Venezuela', '58'], ['VN', 'Vietnam', '84'], ['ZA', 'South Africa', '27'],
  ['ZM', 'Zambia', '260'], ['ZW', 'Zimbabwe', '263']
];

const all = RAW.map(([iso, name, dial]) => ({ iso, name, dial }));
const byIso = Object.fromEntries(all.map((c) => [c.iso, c]));

export const COUNTRIES = [
  ...PINNED.map((i) => byIso[i]),
  ...all.filter((c) => !PINNED.includes(c.iso)).sort((a, b) => a.name.localeCompare(b.name))
];

export const DEFAULT_COUNTRY = 'IN';
export const getCountry = (iso) => byIso[iso] || byIso[DEFAULT_COUNTRY];

/** Longest dial-code match for a pasted "+91 98765…" style number. */
export function matchDial(digits, currentIso) {
  for (let n = 4; n >= 1; n -= 1) {
    const code = digits.slice(0, n);
    const hits = all.filter((c) => c.dial === code);
    if (hits.length) {
      const cur = hits.find((c) => c.iso === currentIso);
      return { country: cur || hits[0], rest: digits.slice(n) };
    }
  }
  return null;
}
