export const teamSchema = `#graphql
    type Team {
        team_id: Int
        team_name: String!
    }

    type addTeamResponse {
        content: Team
        type: String!
        message: String!
    }

    type updateTeamResponse {
        type: String!
        message: String!
    }

    type deleteTeamResponse {
        type: String!
        message: String!
    }

    input AddTeamInput {
        team_name: String!
    }

    input UpdateTeamInput {
        team_name: String
    }
`;
