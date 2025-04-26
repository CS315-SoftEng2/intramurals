import { gql } from "@apollo/client";

export const ADD_TEAM = gql`
  mutation Mutation($adminId: Int!, $team: AddTeamInput) {
    addTeam(admin_id: $adminId, team: $team) {
      content {
        team_id
        team_name
        team_color
        team_logo
        team_motto
      }
      type
      message
    }
  }
`;

export const UPDATE_TEAM = gql`
  mutation UpdateTeam($team: UpdateTeamInput!, $adminId: Int!, $teamId: Int!) {
    updateTeam(team: $team, admin_id: $adminId, team_id: $teamId) {
      type
      message
    }
  }
`;

export const DELETE_TEAM = gql`
  mutation DeleteTeam($adminId: Int!, $teamId: Int!) {
    deleteTeam(admin_id: $adminId, team_id: $teamId) {
      type
      message
    }
  }
`;
