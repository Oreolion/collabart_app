/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions from "../actions.js";
import type * as activityLog from "../activityLog.js";
import type * as ai from "../ai.js";
import type * as annotations from "../annotations.js";
import type * as c2paMeta from "../c2paMeta.js";
import type * as c2paSigner from "../c2paSigner.js";
import type * as collaborations from "../collaborations.js";
import type * as credits from "../credits.js";
import type * as distributionActions from "../distributionActions.js";
import type * as distributionMeta from "../distributionMeta.js";
import type * as distribution_audiomack from "../distribution/audiomack.js";
import type * as distribution_distrokid from "../distribution/distrokid.js";
import type * as distribution_index from "../distribution/index.js";
import type * as elevenlabs from "../elevenlabs.js";
import type * as elevenlabsActions from "../elevenlabsActions.js";
import type * as elevenlabsMarketplace from "../elevenlabsMarketplace.js";
import type * as elevenlabsSfxActions from "../elevenlabsSfxActions.js";
import type * as file from "../file.js";
import type * as http from "../http.js";
import type * as likes from "../likes.js";
import type * as lyrics from "../lyrics.js";
import type * as marketplaceMeta from "../marketplaceMeta.js";
import type * as messages from "../messages.js";
import type * as migrations from "../migrations.js";
import type * as notifications from "../notifications.js";
import type * as projects from "../projects.js";
import type * as users from "../users.js";
import type * as visuals from "../visuals.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  actions: typeof actions;
  activityLog: typeof activityLog;
  ai: typeof ai;
  annotations: typeof annotations;
  c2paMeta: typeof c2paMeta;
  c2paSigner: typeof c2paSigner;
  collaborations: typeof collaborations;
  credits: typeof credits;
  distributionActions: typeof distributionActions;
  distributionMeta: typeof distributionMeta;
  "distribution/audiomack": typeof distribution_audiomack;
  "distribution/distrokid": typeof distribution_distrokid;
  "distribution/index": typeof distribution_index;
  elevenlabs: typeof elevenlabs;
  elevenlabsActions: typeof elevenlabsActions;
  elevenlabsMarketplace: typeof elevenlabsMarketplace;
  elevenlabsSfxActions: typeof elevenlabsSfxActions;
  file: typeof file;
  http: typeof http;
  likes: typeof likes;
  lyrics: typeof lyrics;
  marketplaceMeta: typeof marketplaceMeta;
  messages: typeof messages;
  migrations: typeof migrations;
  notifications: typeof notifications;
  projects: typeof projects;
  users: typeof users;
  visuals: typeof visuals;
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
