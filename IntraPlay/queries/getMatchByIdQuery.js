import { gql } from "@apollo/client";

const GET_MATCH_BY_ID = gql`
  query GetMatchById($matchId: Int!) {
    getMatchById(match_id: $matchId) {
      match_id
      schedule_id
      team_a_id
      team_b_id
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

export default GET_MATCH_BY_ID;
