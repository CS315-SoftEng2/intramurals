import { gql } from "@apollo/client";

const GET_EVENTS = gql`
  query Events {
    events {
      event_id
      event_name
      venue
      category_id
    }
  }
`;

export default GET_EVENTS;
