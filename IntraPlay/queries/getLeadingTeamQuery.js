import { gql } from "@apollo/client";

const GET_LEADING_TEAM = gql`
  query TeamScores {
    teamScores {
      team_id
      team_name
      team_logo
      team_color
      total_score
      overall_ranking
    }
  }
`;

export default GET_LEADING_TEAM;
