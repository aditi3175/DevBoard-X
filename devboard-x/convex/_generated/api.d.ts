/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activity from "../activity.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as crypto from "../crypto.js";
import type * as dashboard from "../dashboard.js";
import type * as execution from "../execution.js";
import type * as files from "../files.js";
import type * as github from "../github.js";
import type * as githubActions from "../githubActions.js";
import type * as projects from "../projects.js";
import type * as resources from "../resources.js";
import type * as search from "../search.js";
import type * as snippets from "../snippets.js";
import type * as tasks from "../tasks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activity: typeof activity;
  analytics: typeof analytics;
  auth: typeof auth;
  crypto: typeof crypto;
  dashboard: typeof dashboard;
  execution: typeof execution;
  files: typeof files;
  github: typeof github;
  githubActions: typeof githubActions;
  projects: typeof projects;
  resources: typeof resources;
  search: typeof search;
  snippets: typeof snippets;
  tasks: typeof tasks;
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
