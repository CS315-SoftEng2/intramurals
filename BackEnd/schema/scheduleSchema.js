export const scheduleSchema = `#graphql
scalar Date
scalar Time

type Schedule {
  schedule_id: Int
  date: Date!
  start_time: Time!
  end_time: Time!
  event_id: Int!
  category_id: Int!
}

type addScheduleResponse {
  content: Schedule
  type: String!
  message: String!
}

type updateScheduleResponse {
  type: String!
  message: String!
}

type deleteScheduleResponse {
  type: String!
  message: String!
}

input AddScheduleInput {
  date: Date!
  start_time: Time!
  end_time: Time!
  event_id: Int!
  category_id: Int!
}

input UpdateScheduleInput {
  date: Date
  start_time: Time
  end_time: Time
  event_id: Int
  category_id: Int
}
`;
