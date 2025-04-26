export const scoreboardSchema = `#graphql
    type Scoreboard {
        scoreboard_id: Int!
        match_id: Int!
        scoring_team_id: Int!
        score: Int!
        score_a: Int
        score_b: Int
        team_a: String
        team_b: String
        team_a_id: Int
        team_b_id: Int
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
        match_id: Int!
        schedule_id: Int!
        category_id: Int!
    }

    input UpdateScoreboardInput {
        user_id: Int
        team_id: Int
        match_id: Int
        schedule_id: Int
        category_id: Int
    }
`;
