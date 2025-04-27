import { gql } from "@apollo/client";

const GET_SCOREBOARD = gql`
  query GetScoreboard($match_id: Int!) {
    scoreboard(match_id: $match_id) {
      scoreboard_id
      match_id
      team_id
      score
      ranking
      schedule_id
      user_id
    }
  }
`;

export default GET_SCOREBOARD;
