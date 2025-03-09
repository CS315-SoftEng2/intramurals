export const eventSchema = `#graphql
    type Event {
        event_id: Int
        event_name: String!
        venue: String!
        team_id: Int!
        category_id: Int!
    }

    type addEventResponse {
        content: Event
        type: String!
        message: String!
    }

    type updateEventResponse {
        type: String!
        message: String!
    }

    type deleteEventResponse {
        type: String!
        message: String!
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