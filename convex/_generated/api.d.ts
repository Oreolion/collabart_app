/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as actions from "../actions.js";
import type * as activityLog from "../activityLog.js";
import type * as collaborations from "../collaborations.js";
import type * as file from "../file.js";
import type * as http from "../http.js";
import type * as likes from "../likes.js";
import type * as lyrics from "../lyrics.js";
import type * as notifications from "../notifications.js";
import type * as projects from "../projects.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  actions: typeof actions;
  activityLog: typeof activityLog;
  collaborations: typeof collaborations;
  file: typeof file;
  http: typeof http;
  likes: typeof likes;
  lyrics: typeof lyrics;
  notifications: typeof notifications;
  projects: typeof projects;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
