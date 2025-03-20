export const scoreboardSchema = `#graphql
    type Scoreboard {
        scoreboard_id: Int!
        user_id: Int!
        team_id: Int!
        event_id: Int!
        schedule_id: Int!
        category_id: Int!
    }

    type addScoreboardResponse {
        content: Scoreboard
        type: String!
        message: String!
    }

    type updateScoreboardResponse {
        type: String!
        message: String!
    }

    type deleteScoreboardResponse {
        type: String!
        message: String!
    }

    input AddScoreboardInput {
        user_id: Int!
        team_id: Int!
        event_id: Int!
        schedule_id: Int!
        category_id: Int!
}
`;

