import { gql } from "@apollo/client";

const GET_TEAMS = gql`
  query Teams {
    teams {
      team_id
      team_name
      team_color
      team_logo
      team_motto
    }
  }
`;

export default GET_TEAMS;
