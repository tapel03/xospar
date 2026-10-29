import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const APP_NAME = 'Edgeline';
export const APP_VERSION = Constants.expoConfig?.version || '1.0.0';
export const APP_BUILD = String(Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1');

// Replace every value in this block with your real details before release.
export const CONTACT = {
  company: 'Edgeline (Pty) Ltd',
  support: 'support@edgeline.app',
  owner: 'founder@edgeline.app',
  website: 'https://edgeline.app',
  help: 'https://edgeline.app/help',
  hours: 'We reply within 1 to 2 business days.',
};

// Replace with your real store listings.
export const STORE_URL = Platform.select({
  ios: 'https://apps.apple.com/app/id0000000000',
  android: 'market://details?id=com.edgeline.app',
  default: 'https://edgeline.app',
});
export const SUBSCRIPTIONS_URL = Platform.select({
  ios: 'https://apps.apple.com/account/subscriptions',
  android: 'https://play.google.com/store/account/subscriptions',
  default: 'https://edgeline.app/account',
});

export const SHARE_MESSAGE = `I use ${APP_NAME} to review my trades against my own rules. Try it: ${CONTACT.website}`;

// Match the phone versions to the minimums of your Expo SDK.
export const REQUIREMENTS = [
  ['Phone', 'A recent version of iOS or Android.'],
  ['Web', 'A current version of Chrome, Safari, Edge or Firefox with WebGL turned on for the events map.'],
  ['Internet', 'Needed for live prices, news, the events map and the AI mentor.'],
  ['Permissions (optional)', 'Camera and photos, only when you attach a chart screenshot or a file.'],
];

export const LANGUAGES = [
  'English', 'Afrikaans', 'isiZulu', 'isiXhosa', 'Sesotho',
  'Español', 'Français', 'Português', 'Deutsch', 'Italiano',
  'العربية', '中文', '日本語', 'हिन्दी',
];

export const TIME_ZONES = [
  'SAST (UTC+2)', 'GMT (UTC+0)', 'CET (UTC+1)', 'EET (UTC+2)', 'EAT (UTC+3)', 'IST (UTC+5:30)',
  'SGT (UTC+8)', 'JST (UTC+9)', 'AEST (UTC+10)', 'EST (UTC−5)', 'PST (UTC−8)',
];

// Placeholder plans and prices. Replace with your real offer.
export const PLANS = [
  { key: 'Free', price: '$0', per: '', rank: 0, features: ['Manual trade journal', '1 trading account', 'Basic analytics', 'A few AI mentor questions a day'] },
  { key: 'Pro', price: '$19', per: ' / month', rank: 1, features: ['Everything in Free', 'Up to 3 trading accounts', 'Full AI mentor and pre-trade checks', 'Alerts, calendar and news'] },
  { key: 'Premium', price: '$39', per: ' / month', rank: 2, features: ['Everything in Pro', 'Unlimited trading accounts', 'Correlation matrix and full events map', 'Priority support'] },
];