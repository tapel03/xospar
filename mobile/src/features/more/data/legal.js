// DRAFT TEXT. These are starting templates, not legal advice.
// Have a lawyer review and adapt them to your company before you publish the app.

export const LEGAL = {
  privacy: {
    title: 'Privacy policy',
    updated: '27 October 2026',
    sections: [
      { h: 'What we collect', p: 'Profile details you enter (name, email, phone, country, time zone). Journal data: trades, notes, screenshots, strategies and alerts. Broker account details you add (login number and server, and a password only if you choose to save it). Messages and attachments you send to the AI mentor. Basic technical data such as app version and device type, used to fix problems.' },
      { h: 'How we use it', p: 'To run the app, show your journal and analytics, and personalise the mentor. Mentor messages are sent to our AI provider to produce an answer. We also use technical data to keep the service secure and working.' },
      { h: 'Sharing', p: 'We do not sell your personal data. We share data only with service providers that help us run Edgeline (for example hosting, AI processing, market data and news), and when the law requires it.' },
      { h: 'Third-party services', p: 'Map tiles load directly from OpenFreeMap and OpenStreetMap servers, which can see your IP address and the area you view. News is gathered by our servers from public sources.' },
      { h: 'Broker passwords', p: 'Saving a broker password is optional. Use your investor (read-only) password whenever your broker offers one. You can clear saved passwords at any time in Settings, Connections, Manage accounts.' },
      { h: 'Keeping and deleting your data', p: 'You can delete your account in Settings, Privacy & security. Some records may be kept for a limited time where the law requires it.' },
      { h: 'Your rights', p: 'Depending on where you live (for example under POPIA or the GDPR) you may ask to see, correct, export or delete your data. You can export your journal as PDF or CSV from the Journal page. For anything else, contact us.' },
      { h: 'Contact', p: 'Questions about privacy? Email us using the details in Settings, Help & support.' },
    ],
  },
  terms: {
    title: 'Terms of use',
    updated: '27 October 2026',
    sections: [
      { h: 'Using Edgeline', p: 'You must be at least 18 years old to use Edgeline. By using the app you agree to these terms and to the House rules.' },
      { h: 'Not financial advice', p: 'Edgeline provides analysis, scenarios and journaling tools for education. Nothing in the app is financial, investment or trading advice, and nothing is a recommendation to buy or sell. Trading carries a high risk of loss. You make your own decisions.' },
      { h: 'Your account', p: 'Keep your sign-in details safe. You are responsible for activity on your account and for the accuracy of what you enter.' },
      { h: 'Subscriptions', p: 'Paid plans renew until you cancel. You can manage or cancel a subscription in your App Store or Google Play account. Refunds follow the store’s rules.' },
      { h: 'Your content', p: 'You own the trades, notes and files you add. You allow us to store and process them to provide the service to you.' },
      { h: 'Third-party data', p: 'Prices, news, maps and other data come from third parties and may be delayed, incomplete or wrong. Do not rely on them for time-critical decisions.' },
      { h: 'Availability', p: 'We work to keep Edgeline running but cannot promise it will always be available or error-free.' },
      { h: 'Liability', p: 'To the extent the law allows, Edgeline and its owners are not liable for trading losses or for any indirect loss that comes from using the app.' },
      { h: 'Changes and ending', p: 'We may update these terms or the app. You can stop using Edgeline and delete your account at any time. We may suspend accounts that break these terms.' },
      { h: 'Governing law', p: '[Add the country and courts that apply to your company.]' },
    ],
  },
  cookies: {
    title: 'Cookies policy',
    updated: '27 October 2026',
    sections: [
      { h: 'Phone apps', p: 'The iOS and Android apps do not use browser cookies. They store your settings and data on your device and on our servers.' },
      { h: 'Web version', p: 'The web version uses your browser’s storage to remember things like your theme and display choices. These are needed for the app to work as you expect.' },
      { h: 'Third parties', p: 'The map loads tiles from OpenFreeMap and OpenStreetMap. Those services may set their own technical data. We do not use advertising or tracking cookies.' },
      { h: 'Your choices', p: 'You can clear or block storage in your browser settings. Doing so may reset your preferences or sign you out.' },
    ],
  },
  rules: {
    title: 'House rules',
    updated: '27 October 2026',
    sections: [
      { h: 'Be respectful', p: 'Treat support staff and other people with respect. Abuse, harassment and threats are not allowed.' },
      { h: 'Protect your account', p: 'Do not share your sign-in or your broker passwords with anyone. Do not use another person’s account or broker details.' },
      { h: 'Use the mentor honestly', p: 'Do not try to bypass usage limits, extract the mentor’s instructions, or use it to produce harmful or unlawful content.' },
      { h: 'No misuse of the service', p: 'Do not scrape, copy or resell Edgeline data, probe the service for weaknesses, or disrupt it for other people.' },
      { h: 'Share only what is yours', p: 'Only upload files and screenshots you have the right to use.' },
      { h: 'Report problems', p: 'If you find a bug or a security issue, tell us through Settings, Help & support so we can fix it.' },
      { h: 'What happens if rules are broken', p: 'We may warn you, limit features or close your account, depending on how serious the problem is.' },
    ],
  },
  licenses: {
    title: 'Open-source licenses',
    updated: '',
    intro: 'Edgeline is built with open-source software and open data. Thank you to everyone who makes and maintains them. Check each project for the full license text.',
    sections: [],
  },
};

export const LICENSES = [
  { name: 'React and React Native', license: 'MIT', url: 'https://reactnative.dev' },
  { name: 'Expo', license: 'MIT', url: 'https://expo.dev' },
  { name: 'React Navigation', license: 'MIT', url: 'https://reactnavigation.org' },
  { name: 'react-native-svg', license: 'MIT', url: 'https://github.com/software-mansion/react-native-svg' },
  { name: 'react-native-webview', license: 'MIT', url: 'https://github.com/react-native-webview/react-native-webview' },
  { name: 'Feather icons', license: 'MIT', url: 'https://feathericons.com' },
  { name: 'MapLibre GL JS', license: 'BSD-3-Clause', url: 'https://maplibre.org' },
  { name: 'MapLibre React Native', license: 'MIT', url: 'https://github.com/maplibre/maplibre-react-native' },
  { name: 'OpenFreeMap', note: 'Free map tiles and the Liberty style.', license: 'See openfreemap.org', url: 'https://openfreemap.org' },
  { name: 'OpenStreetMap data', note: '© OpenStreetMap contributors', license: 'ODbL', url: 'https://www.openstreetmap.org/copyright' },
  { name: 'OpenMapTiles', note: 'Map data schema used by the tiles.', license: 'See openmaptiles.org', url: 'https://openmaptiles.org' },
  { name: 'GDELT Project', note: 'Public news data used for market news.', license: 'See gdeltproject.org', url: 'https://www.gdeltproject.org' },
];