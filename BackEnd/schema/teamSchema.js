export const teamSchema = `#graphql
    type Team {
        team_id: Int!
        team_name: String!
    }

    input AddTeamInput {
        team: String!
    }

    input UpdateTeamInput {
        team_name: String
    }
`;
