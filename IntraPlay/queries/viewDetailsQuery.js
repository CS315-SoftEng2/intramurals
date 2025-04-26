import { gql } from "@apollo/client";

const VIEW_DETAILS = gql`
  query EventDetails {
    eventDetails {
      schedule_id
      event_id
      event_name
      event_date
      start_time
      end_time
      venue
      team_a_name
      team_b_name
      division
    }
  }
`;

export default VIEW_DETAILS;
