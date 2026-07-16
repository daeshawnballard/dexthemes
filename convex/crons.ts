import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "clean expired OAuth state",
  { minutes: 5 },
  internal.oauthStates.cleanupExpiredOauthStates,
  { limit: 500 },
);

crons.interval(
  "finalize closed popularity periods",
  { hours: 1 },
  internal.unlocks.finalizePopularityWinners,
  {},
);

crons.interval(
  "clean expired plugin and rate-limit state",
  { minutes: 15 },
  internal.rateLimit.cleanupExpiredRateLimits,
  { limit: 500 },
);

crons.interval(
  "clean expired plugin sessions",
  { minutes: 15 },
  internal.pluginUsers.cleanupExpiredPluginSessions,
  { limit: 500 },
);

export default crons;
