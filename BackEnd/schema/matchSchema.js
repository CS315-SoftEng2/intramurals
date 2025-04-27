export const matchSchema = `#graphql
type Match {
    match_id: Int!
    schedule_id: Int!
    team_a_id: Int
    team_b_id: Int
    team_a_name: String!
    team_b_name: String!
    score_a: Int
    score_b: Int
    team_a_logo: String  
    team_b_logo: String
    event_name: String
    division: String
    winner_team_id: Int
    winner_team_color: String
    user_assigned_id: Int 
    score_updated_at: String
}

type addMatchResponse {
    content: Match
    type: String!
    message: String!
}

type updateMatchResponse {
    type: String!
    message: String!
}

type deleteMatchResponse {
    type: String!
    message: String!
}

input AddMatchInput {
    schedule_id: Int!
    team_a_name: String!
    team_b_name: String!
    score_a: Int
    score_b: Int
    user_assigned_id: Int 
}

input UpdateMatchInput {
    schedule_id: Int!
    team_a_name: String!
    team_b_name: String!
    score_a: Int
    score_b: Int
    user_assigned_id: Int 
}
`;
