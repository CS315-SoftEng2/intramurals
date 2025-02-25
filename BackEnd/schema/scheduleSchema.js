export const scheduleSchema = `#graphql
    type Schedule {
    schedule_id: ID!
    date: String!
    start_time: String!
    end_time: String!
    event_id: ID!
    }

    input AddScheduleInput {
    date: String!
    start_time: String!
    end_time: String!
    event_id: ID!
    }

    input UpdateScheduleInput {
    date: String
    start_time: String
    end_time: String
    event_id: ID
    }
`;

