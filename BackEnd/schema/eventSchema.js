export const eventSchema = `#graphql
    type Event {
        event_id: Int!
        event_name: String!
        venue: String!
        team_id: Int!
        category_id: Int!
    }

    input AddEventInput {
        event_name: String!
        venue: String!
        team_id: Int!
        category_id: Int!
    }

    input UpdateEventInput {
        event_name: String
        venue: String
        team_id: Int
        category_id: Int
    }
`;