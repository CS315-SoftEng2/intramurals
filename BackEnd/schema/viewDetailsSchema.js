export const viewDetails = `#graphql
scalar Date
scalar Time

    type Scoreboard {
        event_id: ID!
        event_name: String!
        venue: String!
        category_name: String!
        division: String!
        schedule_id: Int!
        date: Date!
        start_time: Time!
        end_time: Time!
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
