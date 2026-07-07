// Privacy Policy content. Bump PRIVACY_VERSION when it changes materially.

import { PolicySection } from '../components/PolicyDocument';

export const PRIVACY_VERSION = 1;
export const PRIVACY_LAST_UPDATED = 'July 7, 2026';

export const PRIVACY_INTRO =
  'Your privacy matters. This policy explains what information Vaccinator ' +
  'stores and confirms that it stays on your device.';

export const PRIVACY_SECTIONS: PolicySection[] = [
  {
    heading: '1. Information the app stores',
    body: [
      'The app stores only what you enter: each child’s name, date of birth, ' +
        'optional sex and color; the vaccine doses you record (dates, provider, ' +
        'lot number, notes); planned appointment dates; and your app settings. ' +
        'All of this is stored locally on your device.',
    ],
  },
  {
    heading: '2. We do not collect your data',
    body: [
      'The app has no account and no server. Your child’s health information is ' +
        'never sent to the developers or to any third party. We never see it.',
    ],
  },
  {
    heading: '3. No tracking or analytics',
    body: [
      'The app does not use advertising, analytics, tracking, or cookies, and ' +
        'does not build any profile of you or your child.',
    ],
  },
  {
    heading: '4. Where your data lives',
    body: [
      'Your data is saved in the app’s private storage on your device, ' +
        'protected by your device’s own security (such as your passcode or ' +
        'biometrics). The app does not separately encrypt it.',
    ],
  },
  {
    heading: '5. Backups you create',
    body: [
      'If you export a backup (Settings → Backup & restore), the resulting file ' +
        'contains your child’s health information in plain text. Where that file ' +
        'goes and who can see it is under your control — store and share backups ' +
        'carefully.',
    ],
  },
  {
    heading: '6. Notifications',
    body: [
      'If you enable reminders, they are scheduled locally on your device by ' +
        'the operating system. Reminder content is not sent to us or anyone else.',
    ],
  },
  {
    heading: '7. Links to CDC.gov',
    body: [
      'The app links to pages on CDC.gov for reference. Opening a link leaves ' +
        'the app and opens your browser, where the destination site’s own ' +
        'privacy practices apply.',
    ],
  },
  {
    heading: '8. Children’s information',
    body: [
      'This app is intended for a parent or legal guardian to record a child’s ' +
        'immunizations. Information about a child is entered by the adult using ' +
        'the app and remains on that device; we do not collect it.',
    ],
  },
  {
    heading: '9. Keeping or deleting your data',
    body: [
      'You control your data. You can edit or delete records at any time, remove ' +
        'a child, or delete everything (Settings → Delete all data). Uninstalling ' +
        'the app removes its data from your device. Deleting data on your device ' +
        'does not affect backup files you have already exported.',
    ],
  },
  {
    heading: '10. Security',
    body: [
      'No method of storage is completely secure. Because your data stays on ' +
        'your device, you are responsible for securing your device and any ' +
        'backups you create.',
    ],
  },
  {
    heading: '11. Changes to this policy',
    body: [
      'We may update this Privacy Policy. Material changes will be reflected ' +
        'here with a new “last updated” date.',
    ],
  },
  {
    heading: '12. Contact',
    body: [
      'If you have questions about this policy, contact the app maintainer.',
    ],
  },
];
