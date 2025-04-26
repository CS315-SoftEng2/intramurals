import { gql } from "@apollo/client";

export const ADD_SCHEDULE = gql`
  mutation AddSchedule($schedule: AddScheduleInput!, $adminId: Int!) {
    addSchedule(schedule: $schedule, admin_id: $adminId) {
      content {
        schedule_id
        date
        start_time
        end_time
        event_id
        category_id
      }
      type
      message
    }
  }
`;

export const UPDATE_SCHEDULE = gql`
  mutation UpdateSchedule(
    $schedule: UpdateScheduleInput!
    $adminId: Int!
    $scheduleId: Int!
  ) {
    updateSchedule(
      schedule: $schedule
      admin_id: $adminId
      schedule_id: $scheduleId
    ) {
      type
      message
    }
  }
`;

export const DELETE_SCHEDULE = gql`
  mutation DeleteSchedule($adminId: Int!, $scheduleId: Int!) {
    deleteSchedule(admin_id: $adminId, schedule_id: $scheduleId) {
      type
      message
    }
  }
`;
