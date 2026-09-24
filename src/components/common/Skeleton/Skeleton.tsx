import React from 'react';
import type { SkeletonProps } from './Skeleton.types';
import styles from './Skeleton.module.css';

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  columns = 5,
  className = '',
  style,
  ...rest
}) => {
  if (variant === 'table-row') {
    return (
      <div className={`${styles.tableRow} ${className}`} style={style} {...rest}>
        {Array.from({ length: columns }).map((_, index) => (
          <div
            key={index}
            className={styles.tableCell}
            style={{
              flex: index === 0 ? 0.7 : index === 1 ? 1.5 : 1,
            }}
          />
        ))}
      </div>
    );
  }

  const customStyle: React.CSSProperties = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
    ...style,
  };

  const variantClass = styles[variant] || styles.text;

  return (
    <div
      className={`${styles.skeleton} ${variantClass} ${className}`}
      style={customStyle}
      aria-hidden="true"
      {...rest}
    />
  );
};

export default Skeleton;
