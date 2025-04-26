import { gql } from "@apollo/client";

export const ADD_EVENT = gql`
  mutation Mutation($event: AddEventInput!, $adminId: Int!) {
    addEvent(event: $event, admin_id: $adminId) {
      content {
        event_id
        event_name
        venue
        category_id
      }
      type
      message
    }
  }
`;

export const UPDATE_EVENT = gql`
  mutation UpdateEvent(
    $event: UpdateEventInput!
    $adminId: Int!
    $eventId: Int!
  ) {
    updateEvent(event: $event, admin_id: $adminId, event_id: $eventId) {
      type
      message
    }
  }
`;

export const DELETE_EVENT = gql`
  mutation DeleteEvent($adminId: Int!, $eventId: Int!) {
    deleteEvent(admin_id: $adminId, event_id: $eventId) {
      type
      message
    }
  }
`;
