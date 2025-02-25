export const scoreboardSchema = `#graphql
    type Scoreboard {
    scoreboard_id: ID!
    user_id: ID!
    team_id: ID!
    event_id: ID!
    schedule_id: ID!
    score: Int!
    ranking: Int!
    }

    input AddScoreboardInput {
    team_id: ID!
    event_id: ID!
    schedule_id: ID!
    score: Int!
    ranking: Int!
    }

    input UpdateScoreboardInput {
    team_id: ID
    event_id: ID
    schedule_id: ID
    score: Int
    ranking: Int
    }
`;

