import { mergeTypeDefs } from "@graphql-tools/merge";
import { rootSchema } from "./rootSchema.js";
import { loginSchema } from "./loginSchema.js";
import { userAccountSchema } from "./userAccountSchema.js";
import { teamSchema } from "./teamSchema.js";
import { categorySchema } from "./categorySchema.js";
import { eventSchema } from "./eventSchema.js";
import { scheduleSchema } from "./scheduleSchema.js";
import { userScoreboardSchema } from "./userScoreboardSchema.js";
import { viewDetails } from "./viewDetailsSchema.js";
import { matchSchema } from "./matchSchema.js";

export const typeDefs = mergeTypeDefs([
  rootSchema,
  loginSchema,
  userAccountSchema,
  teamSchema,
  categorySchema,
  eventSchema,
  scheduleSchema,
  userScoreboardSchema,
  viewDetails,
  matchSchema,
]);
