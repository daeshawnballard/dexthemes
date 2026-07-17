export const DAY_MS = 24 * 60 * 60 * 1000;

export const POPULARITY_THRESHOLDS = Object.freeze({
  daily: Object.freeze({ copies: 3, qualifiedAdoptions: 1 }),
  weekly: Object.freeze({ copies: 5, qualifiedAdoptions: 2 }),
  monthly: Object.freeze({ copies: 0, qualifiedAdoptions: 3 }),
});

function assertPeriodType(periodType) {
  if (periodType !== "daily" && periodType !== "weekly" && periodType !== "monthly") {
    throw new Error(`Unknown popularity period: ${periodType}`);
  }
}

export function utcDayStart(timestamp = Date.now()) {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function utcWeekStart(timestamp = Date.now()) {
  const dayStart = utcDayStart(timestamp);
  const weekdayFromMonday = (new Date(dayStart).getUTCDay() + 6) % 7;
  return dayStart - weekdayFromMonday * DAY_MS;
}

export function utcMonthStart(timestamp = Date.now()) {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

export function currentPopularityPeriod(periodType, timestamp = Date.now()) {
  assertPeriodType(periodType);
  if (periodType === "monthly") {
    const start = utcMonthStart(timestamp);
    const date = new Date(start);
    const end = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
    return { periodType, start, end };
  }
  const start = periodType === "daily" ? utcDayStart(timestamp) : utcWeekStart(timestamp);
  return { periodType, start, end: start + (periodType === "daily" ? DAY_MS : 7 * DAY_MS) };
}

export function previousClosedPopularityPeriod(periodType, timestamp = Date.now()) {
  const current = currentPopularityPeriod(periodType, timestamp);
  if (periodType === "monthly") {
    const date = new Date(current.start);
    return {
      periodType,
      start: Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1),
      end: current.start,
    };
  }
  const duration = current.end - current.start;
  return {
    periodType,
    start: current.start - duration,
    end: current.start,
  };
}

function inRange(event, start, end) {
  return Number.isFinite(event?.createdAt) && event.createdAt >= start && event.createdAt < end;
}

function eventKey(event, fallback) {
  return String(event?.copyKey || event?._id || fallback);
}

/**
 * Rank published community themes for a UTC period. Signed-in, non-author
 * adoptions lead the ordering; unique copy events and likes break ties. The
 * event sets are de-duplicated again here so a malformed historical row cannot
 * inflate a period.
 */
export function rankPopularityEntries({
  themes = [],
  copyEvents = [],
  qualifiedAdoptions = [],
  likes = [],
  start,
  end,
  limit = 10,
}) {
  const themeById = new Map(
    themes
      .filter((theme) => theme?.status == null || theme.status === "published")
      .map((theme) => [String(theme.themeId || theme.id), theme]),
  );
  const metrics = new Map();
  const getMetrics = (themeId) => {
    const id = String(themeId || "");
    if (!themeById.has(id)) return null;
    if (!metrics.has(id)) {
      metrics.set(id, {
        themeId: id,
        copyKeys: new Set(),
        qualifiedKeys: new Set(),
        likeKeys: new Set(),
        firstActivityAt: Number.POSITIVE_INFINITY,
      });
    }
    return metrics.get(id);
  };

  copyEvents.forEach((event, index) => {
    if (!inRange(event, start, end)) return;
    const entry = getMetrics(event.themeId);
    if (!entry) return;
    entry.copyKeys.add(eventKey(event, `copy:${event.themeId}:${index}`));
    entry.firstActivityAt = Math.min(entry.firstActivityAt, event.createdAt);
  });
  qualifiedAdoptions.forEach((event, index) => {
    if (!inRange(event, start, end)) return;
    const entry = getMetrics(event.themeId);
    if (!entry) return;
    entry.qualifiedKeys.add(`${event.themeId}:${String(event.userId || event._id || index)}`);
    entry.firstActivityAt = Math.min(entry.firstActivityAt, event.createdAt);
  });
  likes.forEach((event, index) => {
    if (!inRange(event, start, end)) return;
    const entry = getMetrics(event.themeId);
    if (!entry) return;
    entry.likeKeys.add(`${event.themeId}:${String(event.userId || event._id || index)}`);
    entry.firstActivityAt = Math.min(entry.firstActivityAt, event.createdAt);
  });

  return [...metrics.values()]
    .map((entry) => ({
      themeId: entry.themeId,
      copies: entry.copyKeys.size,
      qualifiedAdoptions: entry.qualifiedKeys.size,
      likes: entry.likeKeys.size,
      firstActivityAt: Number.isFinite(entry.firstActivityAt) ? entry.firstActivityAt : null,
    }))
    .filter((entry) => entry.copies > 0 || entry.qualifiedAdoptions > 0 || entry.likes > 0)
    .sort((a, b) =>
      b.qualifiedAdoptions - a.qualifiedAdoptions ||
      b.copies - a.copies ||
      b.likes - a.likes ||
      (a.firstActivityAt ?? Number.MAX_SAFE_INTEGER) - (b.firstActivityAt ?? Number.MAX_SAFE_INTEGER) ||
      a.themeId.localeCompare(b.themeId),
    )
    .slice(0, Math.max(0, limit));
}

export function meetsPopularityThreshold(entry, periodType) {
  assertPeriodType(periodType);
  const threshold = POPULARITY_THRESHOLDS[periodType];
  return Boolean(
    entry &&
    entry.copies >= threshold.copies &&
    entry.qualifiedAdoptions >= threshold.qualifiedAdoptions
  );
}
