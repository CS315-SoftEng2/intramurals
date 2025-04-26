export const userScoreboardSchema = `#graphql
    input MatchScoreInput {
        score_a: Int!
        score_b: Int!
    }

    input userUpdateScoreInput {
        user_id: Int!
        match_id: Int!
        match: MatchScoreInput!
    }

    type userUpdateScoreResponse {
        type: String!
        message: String!
        match: Match
    }
`;
