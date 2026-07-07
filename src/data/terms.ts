// Terms of Use content. Bump TERMS_VERSION when the terms change materially —
// the app will then require the parent to review and re-accept.

export const TERMS_VERSION = 1;
export const TERMS_LAST_UPDATED = 'July 7, 2026';

export const TERMS_INTRO =
  'Please read these Terms of Use before using Vaccinator. They explain what ' +
  'the app is — and is not — and how to use it responsibly to help care for ' +
  'your child.';

export interface TermsSection {
  heading: string;
  body: string[];
}

export const TERMS_SECTIONS: TermsSection[] = [
  {
    heading: '1. Informational purposes only — not medical advice',
    body: [
      'Vaccinator is a personal tool to help you record and organize your ' +
        "child's immunizations. It does not provide medical advice, diagnosis, " +
        'or treatment, and it is not a substitute for the professional judgment ' +
        "of your child's healthcare provider.",
      "Always seek the advice of your child's physician or another qualified " +
        'health provider with any questions about vaccines, timing, or your ' +
        "child's health. Never disregard or delay professional medical advice " +
        'because of something you read in this app.',
      'Recommended dates shown in the app are general estimates based on the ' +
        'CDC childhood immunization schedule and the birth date you enter. Your ' +
        "child's provider may recommend a different schedule based on health " +
        'conditions, catch-up needs, travel, or clinical judgment.',
    ],
  },
  {
    heading: '2. No doctor–patient relationship',
    body: [
      'Using Vaccinator does not create any doctor–patient or other ' +
        'healthcare-provider relationship between you and the app or its makers.',
    ],
  },
  {
    heading: '3. Accuracy of information',
    body: [
      'We aim to reflect the CDC immunization schedule accurately, but ' +
        'immunization guidance changes over time and the app may not always be ' +
        'current, complete, or error-free.',
      'The official immunization records held by your healthcare provider or ' +
        'health department are the authoritative source for your child’s ' +
        'vaccination status — not this app.',
    ],
  },
  {
    heading: '4. Your responsibilities',
    body: [
      'You are responsible for entering information accurately and keeping it ' +
        'up to date. Every status the app shows — done, due, overdue, or ' +
        'upcoming — depends entirely on the information you enter.',
      'Do not rely on this app as your only record. Confirm your child’s ' +
        'immunization status with your healthcare provider and keep your ' +
        'official records.',
    ],
  },
  {
    heading: '5. Reminders are not guaranteed',
    body: [
      'Optional reminders are provided on a best-effort basis and may be ' +
        'delayed or not delivered at all due to device settings, notification ' +
        'permissions, or platform limitations. Do not rely on reminders as your ' +
        'only way of tracking when a vaccine is due.',
    ],
  },
  {
    heading: '6. Your data and backups',
    body: [
      'Vaccinator stores your information only on your device. It is not ' +
        'automatically backed up to any server. If you delete the app, clear ' +
        'its data, or lose or replace your device, your records may be ' +
        'permanently lost.',
      'You are responsible for creating and safeguarding your own backups ' +
        '(Settings → Backup & restore). Keep exported backup files secure — ' +
        'they contain personal health information.',
    ],
  },
  {
    heading: '7. Privacy',
    body: [
      'Your data stays on your device. The app does not create an account and ' +
        'does not transmit your child’s health information to us or any third ' +
        'party. Links to CDC.gov open in your device’s browser.',
    ],
  },
  {
    heading: '8. Not for emergencies',
    body: [
      'Vaccinator is not designed for medical emergencies. If you believe your ' +
        'child is having a medical emergency or a serious reaction to a vaccine, ' +
        'contact your doctor or your local emergency services immediately.',
    ],
  },
  {
    heading: '9. No warranties',
    body: [
      'The app is provided “as is” and “as available,” without warranties of ' +
        'any kind, whether express or implied, including any warranty of ' +
        'accuracy, reliability, fitness for a particular purpose, or that the ' +
        'app will be uninterrupted or error-free.',
    ],
  },
  {
    heading: '10. Limitation of liability',
    body: [
      'To the fullest extent permitted by law, the makers of this app are not ' +
        'liable for any damages arising from your use of, or inability to use, ' +
        'the app — including missed, delayed, or mistimed vaccinations, lost ' +
        'data, or any reliance on information in the app. You use the app at ' +
        'your own risk.',
    ],
  },
  {
    heading: '11. Eligibility',
    body: [
      'You must be at least 18 years old and the parent or legal guardian of ' +
        'the child — or otherwise authorized — to use this app to track a ' +
        'child’s immunizations.',
    ],
  },
  {
    heading: '12. Changes to these terms',
    body: [
      'We may update these Terms from time to time. If we make material ' +
        'changes, you may be asked to review and accept the updated Terms before ' +
        'continuing to use the app.',
    ],
  },
  {
    heading: '13. Acknowledgment',
    body: [
      'By accepting, you confirm that you have read and understood these Terms, ' +
        'that you understand Vaccinator is an informational tool and not medical ' +
        'advice, and that you agree to use it responsibly.',
    ],
  },
];
