import React from 'react';
import { Navigation } from 'lucide-react';
import styles from './AttendanceRadarScan.module.css';

interface AttendanceRadarScanProps {
  scanning: boolean;
  statusMessage?: string;
}

export const AttendanceRadarScan: React.FC<AttendanceRadarScanProps> = ({
  scanning,
  statusMessage = 'Đang quét tín hiệu vệ tinh GPS...',
}) => {
  return (
    <div className={styles.radarContainer}>
      <div className={styles.radarCircleWrapper}>
        <div className={styles.radarRing1} />
        <div className={styles.radarRing2} />
        {scanning && <div className={styles.radarSweep} />}
        <div className={styles.centerDotPulse} />
        <div className={styles.radarCenterDot}>
          <Navigation size={8} style={{ color: '#ffffff', transform: 'rotate(45deg)' }} />
        </div>
      </div>
      <p className={styles.radarStatusText}>{statusMessage}</p>
    </div>
  );
};
