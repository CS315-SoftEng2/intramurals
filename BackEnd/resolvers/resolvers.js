import { loginResolver } from "./loginResolver.js";
import { userAccountResolver } from "./userAccountResolver.js";
import { teamResolver } from "./teamResolver.js";
import { categoryResolver } from "./categoryResolver.js";
import { eventResolver } from "./eventResolver.js";
import { scheduleResolver } from "./scheduleResolver.js";
import { scoreboardResolver } from "./scoreboardResolver.js";

export const resolvers = {
    Query: {
        ...userAccountResolver.Query,
        ...teamResolver.Query,
        ...categoryResolver.Query,
        ...eventResolver.Query,
        ...scheduleResolver.Query,
        ...scoreboardResolver.Query,
    },

    Mutation: {
        ...loginResolver.Mutation,
        ...userAccountResolver.Mutation,
        ...teamResolver.Mutation,
        ...categoryResolver.Mutation,
        ...eventResolver.Mutation,
        ...scheduleResolver.Mutation,
        ...scoreboardResolver.Mutation,
    },
};


