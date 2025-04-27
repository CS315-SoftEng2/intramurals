import { gql } from "@apollo/client";

const GET_SCOREBOARD = gql`
  query Scoreboard {
    scoreboard {
      event_id
      event_name
      venue
      category_name
      division
      schedule_id
      date
      start_time
      end_time
    }
  }
`;

export default GET_SCOREBOARD;
