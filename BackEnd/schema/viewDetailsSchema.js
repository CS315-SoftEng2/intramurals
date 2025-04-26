export const viewDetails = `#graphql
    type EventDetail {
        event_id: ID!
        event_name: String!
        event_date: String!
        start_time: String!
        end_time: String!
        venue: String!
        team_a_name: String!
        team_b_name: String!
        division: String!
        schedule_id: Int!
    }

  type TeamTotalScore {
    team_id: ID!
    team_name: String!
    team_logo: String
    team_color: String
    total_score: Int!
    overall_ranking: Int!
}
  `;
