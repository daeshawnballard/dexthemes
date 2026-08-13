/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as flags from "../flags.js";
import type * as http from "../http.js";
import type * as http_auth_routes from "../http_auth_routes.js";
import type * as http_color_me_lucky_routes from "../http_color_me_lucky_routes.js";
import type * as http_helpers from "../http_helpers.js";
import type * as http_luna_rate_limit_routes from "../http_luna_rate_limit_routes.js";
import type * as http_plugin_routes from "../http_plugin_routes.js";
import type * as http_theme_routes from "../http_theme_routes.js";
import type * as http_unlock_routes from "../http_unlock_routes.js";
import type * as indexNow from "../indexNow.js";
import type * as interaction_unlocking from "../interaction_unlocking.js";
import type * as likes from "../likes.js";
import type * as moderation from "../moderation.js";
import type * as oauthStates from "../oauthStates.js";
import type * as pluginAuth from "../pluginAuth.js";
import type * as pluginUsers from "../pluginUsers.js";
import type * as protectedThemes from "../protectedThemes.js";
import type * as rateLimit from "../rateLimit.js";
import type * as supporter_matching from "../supporter_matching.js";
import type * as supporters from "../supporters.js";
import type * as themes from "../themes.js";
import type * as unlocks from "../unlocks.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  crons: typeof crons;
  flags: typeof flags;
  http: typeof http;
  http_auth_routes: typeof http_auth_routes;
  http_color_me_lucky_routes: typeof http_color_me_lucky_routes;
  http_helpers: typeof http_helpers;
  http_luna_rate_limit_routes: typeof http_luna_rate_limit_routes;
  http_plugin_routes: typeof http_plugin_routes;
  http_theme_routes: typeof http_theme_routes;
  http_unlock_routes: typeof http_unlock_routes;
  indexNow: typeof indexNow;
  interaction_unlocking: typeof interaction_unlocking;
  likes: typeof likes;
  moderation: typeof moderation;
  oauthStates: typeof oauthStates;
  pluginAuth: typeof pluginAuth;
  pluginUsers: typeof pluginUsers;
  protectedThemes: typeof protectedThemes;
  rateLimit: typeof rateLimit;
  supporter_matching: typeof supporter_matching;
  supporters: typeof supporters;
  themes: typeof themes;
  unlocks: typeof unlocks;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
