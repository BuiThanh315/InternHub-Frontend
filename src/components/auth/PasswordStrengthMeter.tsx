import React from 'react';
import { Check, X } from 'lucide-react';
import styles from './PasswordStrengthMeter.module.css';

export interface PasswordStrengthMeterProps {
  password: string;
}

interface Rule {
  id: string;
  label: string;
  test: (p: string) => boolean;
}

const PASSWORD_RULES: Rule[] = [
  { id: 'length', label: 'Tối thiểu 8 ký tự', test: (p) => p.length >= 8 },
  { id: 'case', label: 'Có chữ hoa & chữ thường', test: (p) => /[A-Z]/.test(p) && /[a-z]/.test(p) },
  { id: 'number', label: 'Có ít nhất 1 chữ số', test: (p) => /\d/.test(p) },
  { id: 'special', label: 'Có ký tự đặc biệt (@$!%*?&#)', test: (p) => /[@$!%*?&#]/.test(p) },
];

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  if (!password) {
    return null;
  }

  const passedRules = PASSWORD_RULES.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }));

  const passedCount = passedRules.filter((r) => r.passed).length;

  let level: 'weak' | 'medium' | 'good' | 'strong' = 'weak';
  let levelText = 'Rất yếu';

  if (passedCount === 4) {
    level = 'strong';
    levelText = 'Mạnh & An toàn';
  } else if (passedCount === 3) {
    level = 'good';
    levelText = 'Khá tốt';
  } else if (passedCount === 2) {
    level = 'medium';
    levelText = 'Trung bình';
  }

  return (
    <div className={styles.container}>
      <div className={styles.meterTrack}>
        <div className={`${styles.meterBar} ${passedCount >= 1 ? styles[level] : ''}`} />
        <div className={`${styles.meterBar} ${passedCount >= 2 ? styles[level] : ''}`} />
        <div className={`${styles.meterBar} ${passedCount >= 3 ? styles[level] : ''}`} />
        <div className={`${styles.meterBar} ${passedCount >= 4 ? styles[level] : ''}`} />
      </div>

      <div className={styles.labelRow}>
        <span className={styles.labelTitle}>Độ bảo mật:</span>
        <span className={`${styles.strengthLabel} ${styles[level]}`}>{levelText}</span>
      </div>

      <ul className={styles.rulesList}>
        {passedRules.map((rule) => (
          <li
            key={rule.id}
            className={`${styles.ruleItem} ${rule.passed ? styles.passed : ''}`}
          >
            {rule.passed ? (
              <Check size={12} className={styles.ruleIcon} />
            ) : (
              <X size={12} className={styles.ruleIcon} />
            )}
            <span>{rule.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrengthMeter;
