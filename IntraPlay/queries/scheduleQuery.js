import { gql } from "@apollo/client";

const GET_SCHEDULES = gql`
  query Schedules {
    schedules {
      schedule_id
      date
      start_time
      end_time
      event_id
    }
  }
`;

export default GET_SCHEDULES;
