import { gql } from "@apollo/client";

const GET_MATCHES = gql`
  query GetMatches {
    getMatches {
      match_id
      schedule_id
      team_a_id
      team_b_id
      team_a_name
      team_b_name
      score_a
      score_b
      team_a_logo
      team_b_logo
      event_name
      division
      winner_team_id
      winner_team_color
      user_assigned_id
    }
  }
`;

export default GET_MATCHES;
