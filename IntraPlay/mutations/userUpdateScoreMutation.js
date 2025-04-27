import { gql } from "@apollo/client";

const USER_UPDATE_SCORE = gql`
  mutation UserUpdateScore(
    $match: MatchScoreInput!
    $userId: Int!
    $matchId: Int!
  ) {
    userUpdateScore(match: $match, user_id: $userId, match_id: $matchId) {
      type
      message
      match {
        match_id
        score_a
        score_b
        score_updated_at
      }
    }
  }
`;

export default USER_UPDATE_SCORE;
