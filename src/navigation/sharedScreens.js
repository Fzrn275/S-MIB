import React from 'react';
import { SettingsScreen } from '../screens/shared/SettingsScreen';
import { ProfileSettingsScreen } from '../screens/shared/ProfileSettingsScreen';
import { LanguageScreen } from '../screens/shared/LanguageScreen';
import { NotifPrefsScreen } from '../screens/shared/NotifPrefsScreen';
import { InfoScreen } from '../screens/shared/InfoScreen';

const INFO_STUBS = [
  { name: 'PrivacySecurity', title: 'Privacy & Security', icon: '🔒', body: 'Manage two-factor authentication, active sessions and account security here.' },
  { name: 'Terms', title: 'Terms & Conditions', icon: '📄', body: 'The terms governing your use of S-MIB.' },
  { name: 'PrivacyPolicy', title: 'Privacy Policy', icon: '🛡️', body: 'How S-MIB collects, uses and protects your data.' },
  { name: 'HelpCentre', title: 'Help Centre', icon: '❓', body: 'Browse FAQs and step-by-step guides for using S-MIB.' },
  { name: 'ContactSupport', title: 'Contact Support', icon: '✉️', body: 'Reach the S-MIB team for help with your account or a project.' },
];

/**
 * Cross-role shared screens, registered into every role stack so Settings and
 * its sub-pages resolve from any flow. Returns an array of Stack.Screen elements
 * to spread into a Navigator's children.
 */
export function getSharedScreens(Stack) {
  return [
    <Stack.Screen key="Settings" name="Settings" component={SettingsScreen} />,
    <Stack.Screen key="ProfileSettings" name="ProfileSettings" component={ProfileSettingsScreen} />,
    <Stack.Screen key="Language" name="Language" component={LanguageScreen} />,
    <Stack.Screen key="NotifPrefs" name="NotifPrefs" component={NotifPrefsScreen} />,
    ...INFO_STUBS.map((s) => (
      <Stack.Screen key={s.name} name={s.name} component={InfoScreen} initialParams={{ title: s.title, icon: s.icon, body: s.body }} />
    )),
  ];
}
