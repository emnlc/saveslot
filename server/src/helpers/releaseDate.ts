interface ReleaseDate {
  date: number;
  human: string;
  status?: { name: string };
  date_format?: number;
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

  const isSpecificDate = (rd: ReleaseDate) => {
    if (rd.date_format !== undefined) {
      return rd.date_format === 0 || rd.date_format === 1;
    }

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return monthNames.some((month) => rd.human?.includes(month));
  };

  if (firstReleaseDate && firstReleaseDate < now) {
    const officialDate = new Date(firstReleaseDate * 1000).toISOString();

    if (releaseDates && releaseDates.length > 0) {
      const ONE_YEAR = 365 * 24 * 60 * 60;

      const specificDatesNearFirst = releaseDates.filter(
        (rd) =>
          rd.date &&
          rd.date > 0 &&
          isSpecificDate(rd) &&
          Math.abs(rd.date - firstReleaseDate) < ONE_YEAR
      );

      if (specificDatesNearFirst.length > 0) {
        const closest = specificDatesNearFirst.sort(
          (a, b) =>
            Math.abs(a.date - firstReleaseDate) -
            Math.abs(b.date - firstReleaseDate)
        )[0];
        return {
          official_release_date: officialDate,
          release_date_human: closest.human || null,
          release_date_status: closest.status?.name || null,
        };
      }

      const anySpecificDates = releaseDates.filter(
        (rd) => rd.date && rd.date > 0 && isSpecificDate(rd)
      );

      if (anySpecificDates.length > 0) {
        const earliest = anySpecificDates.sort((a, b) => a.date - b.date)[0];
        return {
          official_release_date: officialDate,
          release_date_human: earliest.human || null,
          release_date_status: earliest.status?.name || null,
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
      release_date_human: new Date(firstReleaseDate * 1000).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      ),
      release_date_status: null,
    };
  }

  if (releaseDates && releaseDates.length > 0) {
    const fullReleasesWithSpecificDate = releaseDates.filter(
      (rd) =>
        rd.date &&
        rd.date > 0 &&
        rd.status?.name?.toLowerCase() === "full release" &&
        isSpecificDate(rd)
    );

    if (fullReleasesWithSpecificDate.length > 0) {
      const earliestRelease = fullReleasesWithSpecificDate.sort(
        (a, b) => a.date - b.date
      )[0];
      return {
        official_release_date: new Date(
          earliestRelease.date * 1000
        ).toISOString(),
        release_date_human: earliestRelease.human || null,
        release_date_status: earliestRelease.status?.name || null,
      };
    }

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

    const specificDates = releaseDates.filter(
      (rd) => rd.date && rd.date > 0 && isSpecificDate(rd)
    );

    if (specificDates.length > 0) {
      const earliest = specificDates.sort((a, b) => a.date - b.date)[0];
      return {
        official_release_date: new Date(earliest.date * 1000).toISOString(),
        release_date_human: earliest.human || null,
        release_date_status: earliest.status?.name || null,
      };
    }

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

  if (firstReleaseDate) {
    return {
      official_release_date: new Date(firstReleaseDate * 1000).toISOString(),
      release_date_human: new Date(firstReleaseDate * 1000).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      ),
      release_date_status: null,
    };
  }

  return {
    official_release_date: null,
    release_date_human: null,
    release_date_status: null,
  };
}
