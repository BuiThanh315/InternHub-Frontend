import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { SelectProps } from './Select.types';
import styles from './Select.module.css';

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className = '', id, ...rest }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const selectClasses = [
      styles.select,
      error ? styles.errorSelect : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={styles.container}>
        {label && (
          <label htmlFor={selectId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.selectWrapper}>
          <select ref={ref} id={selectId} className={selectClasses} {...rest}>
            {options.map((option) => (
              <option key={String(option.value)} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <span className={styles.arrowIcon}>
            <ChevronDown size={16} />
          </span>
        </div>
        {error ? (
          <span className={styles.errorMessage}>{error}</span>
        ) : helperText ? (
          <span className={styles.helperText}>{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
