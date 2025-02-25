import { mergeTypeDefs } from "@graphql-tools/merge";
import { rootSchema } from "./rootSchema.js";  
import { loginSchema } from "./loginSchema.js";
import { userAccountSchema } from "./userAccountSchema.js";
import { teamSchema } from "./teamSchema.js";
import { categorySchema } from "./categorySchema.js"; 
import { eventSchema } from "./eventSchema.js";
import { scheduleSchema } from "./scheduleSchema.js";
import { scoreboardSchema } from "./scoreboardSchema.js";

export const typeDefs = mergeTypeDefs([
    rootSchema,
    loginSchema,
    userAccountSchema,
    teamSchema,
    categorySchema,
    eventSchema,
    scheduleSchema,
    scoreboardSchema,
]);
