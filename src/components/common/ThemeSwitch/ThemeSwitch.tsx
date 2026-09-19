import type { ComponentType } from 'react';
import { useTheme, type ThemePreference } from '@hooks/useTheme';
import styles from './ThemeSwitch.module.css';

const SunIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
    <circle cx="12" cy="12" r="4.2" />
    <g strokeLinecap="round">
      <path d="M12 2.6v2.4M12 19v2.4M21.4 12H19M5 12H2.6" />
      <path d="M18.6 5.4l-1.7 1.7M7.1 16.9l-1.7 1.7M18.6 18.6l-1.7-1.7M7.1 7.1L5.4 5.4" />
    </g>
  </svg>
);

const SystemIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
    <rect x="2.8" y="4.2" width="18.4" height="12.6" rx="1.6" />
    <path d="M9 20.2h6M12 16.8v3.4" strokeLinecap="round" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
    <path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1Z" />
  </svg>
);

const options: { value: ThemePreference; label: string; Icon: ComponentType }[] = [
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'system', label: 'System', Icon: SystemIcon },
  { value: 'dark', label: 'Dark', Icon: MoonIcon },
];

const ThemeSwitch = () => {
  const { preference, setPreference } = useTheme();

  return (
    <div className={styles.switch} role="radiogroup" aria-label="Colour theme">
      {options.map(({ value, label, Icon }) => {
        const isActive = preference === value;

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${label} theme`}
            title={`${label} theme`}
            className={`${styles.option} ${isActive ? styles.active : ''}`}
            onClick={() => setPreference(value)}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
};

export default ThemeSwitch;
