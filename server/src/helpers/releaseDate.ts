interface ReleaseDate {
  date: number;
  human: string;
  status?: { name: string };
}

export function getOfficialReleaseDate(
  releaseDates: ReleaseDate[] | undefined,
  firstReleaseDate: number | undefined
): {
  official_release_date: string | null;
  release_date_human: string | null;
  release_date_status: string | null;
} {
  const now = Math.floor(Date.now() / 1000);

  // Game already released
  if (firstReleaseDate && firstReleaseDate < now) {
    const officialDate = new Date(firstReleaseDate * 1000).toISOString();

    if (releaseDates && releaseDates.length > 0) {
      const fullReleases = releaseDates.filter(
        (rd) =>
          rd.date &&
          rd.date > 0 &&
          rd.status?.name?.toLowerCase() === "full release"
      );

      const ONE_YEAR = 365 * 24 * 60 * 60;
      const closeFullRelease = fullReleases.find(
        (rd) => Math.abs(rd.date - firstReleaseDate) < ONE_YEAR
      );

      if (closeFullRelease) {
        return {
          official_release_date: officialDate,
          release_date_human: closeFullRelease.human || null,
          release_date_status: closeFullRelease.status?.name || null,
        };
      }

      const validDates = releaseDates.filter((rd) => rd.date && rd.date > 0);
      if (validDates.length > 0) {
        const earliestRelease = validDates.sort((a, b) => a.date - b.date)[0];
        return {
          official_release_date: officialDate,
          release_date_human: earliestRelease.human || null,
          release_date_status: earliestRelease.status?.name || null,
        };
      }
    }

    return {
      official_release_date: officialDate,
      release_date_human: null,
      release_date_status: null,
    };
  }

  // Upcoming game
  if (releaseDates && releaseDates.length > 0) {
    const fullReleases = releaseDates.filter(
      (rd) =>
        rd.date &&
        rd.date > 0 &&
        rd.status?.name?.toLowerCase() === "full release"
    );

    if (fullReleases.length > 0) {
      const earliestRelease = fullReleases.sort((a, b) => a.date - b.date)[0];
      return {
        official_release_date: new Date(
          earliestRelease.date * 1000
        ).toISOString(),
        release_date_human: earliestRelease.human || null,
        release_date_status: earliestRelease.status?.name || null,
      };
    }

    // earliest valid date
    const validDates = releaseDates.filter((rd) => rd.date && rd.date > 0);
    if (validDates.length > 0) {
      const earliest = validDates.sort((a, b) => a.date - b.date)[0];
      return {
        official_release_date: new Date(earliest.date * 1000).toISOString(),
        release_date_human: earliest.human || null,
        release_date_status: earliest.status?.name || null,
      };
    }
  }

  // no release_dates, use first_release_date
  if (firstReleaseDate) {
    return {
      official_release_date: new Date(firstReleaseDate * 1000).toISOString(),
      release_date_human: null,
      release_date_status: null,
    };
  }

  return {
    official_release_date: null,
    release_date_human: null,
    release_date_status: null,
  };
}
