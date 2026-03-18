import { useEffect, useMemo, useState } from 'react';

import type { JobApplication } from '../types';

const STORAGE_KEY = 'ghosted.local-tracker.applications';

function sortApplications(applications: JobApplication[]) {
  return [...applications].sort((left, right) => {
    const leftTime = new Date(left.applied_date).getTime();
    const rightTime = new Date(right.applied_date).getTime();
    return rightTime - leftTime;
  });
}

function loadStoredApplications() {
  if (typeof window === 'undefined') {
    return [] as JobApplication[];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [] as JobApplication[];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [] as JobApplication[];
    }

    return sortApplications(
      parsed.filter((item): item is JobApplication => {
        return (
          item &&
          typeof item === 'object' &&
          typeof item.id === 'number' &&
          typeof item.company_name === 'string' &&
          typeof item.position_title === 'string' &&
          typeof item.status === 'string' &&
          typeof item.applied_date === 'string'
        );
      }),
    );
  } catch {
    return [] as JobApplication[];
  }
}

export function useLocalApplications() {
  const [applications, setApplications] = useState<JobApplication[]>(() => loadStoredApplications());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  }, [applications]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      active: applications.filter((application) =>
        ['applied', 'screening', 'interview'].includes(application.status),
      ).length,
      offers: applications.filter((application) => application.status === 'offer').length,
      companies: new Set(applications.map((application) => application.company_name)).size,
      recent: applications.slice(0, 5),
    };
  }, [applications]);

  const addApplication = (application: Omit<JobApplication, 'id' | 'applied_date' | 'created_at'>) => {
    const timestamp = Date.now();
    const nextApplication: JobApplication = {
      ...application,
      id: timestamp,
      applied_date: new Date(timestamp).toISOString(),
      created_at: new Date(timestamp).toISOString(),
    };

    setApplications((current) => sortApplications([nextApplication, ...current]));
    return nextApplication;
  };

  const removeApplication = (id: number) => {
    setApplications((current) => current.filter((application) => application.id !== id));
  };

  return {
    applications,
    stats,
    addApplication,
    removeApplication,
  };
}
