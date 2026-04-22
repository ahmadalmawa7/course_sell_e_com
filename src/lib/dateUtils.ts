import React from 'react';

/**
 * Format a date to relative time format (e.g., "2 min ago", "1 hour ago")
 * Auto-updates dynamically
 */
export function getTimeAgo(date: string | Date): string {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - targetDate.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
}

/**
 * Component hook to update relative time at intervals
 */
export function useRelativeTime(date: string | Date | undefined) {
  const [timeAgo, setTimeAgo] = React.useState('');

  React.useEffect(() => {
    if (!date) return;

    const updateTime = () => {
      setTimeAgo(getTimeAgo(date));
    };

    updateTime();

    // Update every minute
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [date]);

  return timeAgo;
}