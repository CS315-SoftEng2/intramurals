import { gql } from "@apollo/client";

export const ADD_MATCH = gql`
  mutation AddMatch($match: AddMatchInput!, $adminId: Int!) {
    addMatch(match: $match, admin_id: $adminId) {
      content {
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
      type
      message
    }
  }
`;

export const UPDATE_MATCH = gql`
  mutation UpdateMatch(
    $match: UpdateMatchInput!
    $adminId: Int!
    $matchId: Int!
  ) {
    updateMatch(match: $match, admin_id: $adminId, match_id: $matchId) {
      type
      message
    }
  }
`;

export const DELETE_MATCH = gql`
  mutation DeleteMatch($adminId: Int!, $matchId: Int!) {
    deleteMatch(admin_id: $adminId, match_id: $matchId) {
      type
      message
    }
  }
`;
