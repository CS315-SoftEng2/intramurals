export const rootSchema = `#graphql
type Query {
    users: [User] 
    user(id: Int!): User

    teams: [Team] 
    team(id: Int!): Team

    categories: [Category] 
    category(id: Int!): Category

    events: [Event] 
    event(id: Int!): Event

    schedules: [Schedule] 
    schedule(id: Int!): Schedule

    scoreboards: [Scoreboard] 
    scoreboard(id: Int!): Scoreboard

}

type Mutation {
    userLogin(user_name: String!, password: String!): loginResponse

    addUserAccount(useraccount: AddUserInput!, admin_id: Int!): addUserResponse
    updateUserAccount(useraccount: UpdateUserInput!, admin_id: Int!, user_id: Int!): updateUserResponse
    deleteUserAccount(admin_id: Int!, user_id: Int!): deleteUserResponse
    
    addTeam(team: AddTeamInput, admin_id: Int!): addTeamResponse
    updateTeam(team: UpdateTeamInput!, admin_id: Int!, team_id: Int!): updateTeamResponse
    deleteTeam(admin_id: Int!, team_id: Int!): deleteTeamResponse

    addCategory(category: AddCategoryInput!, admin_id: Int!): addCategoryResponse
    updateCategory(category: UpdateCategoryInput!, admin_id: Int!, category_id: Int!): updateCategoryResponse
    deleteCategory(admin_id: Int!, category_id: Int!): deleteCategoryResponse

    addEvent(event: AddEventInput!, admin_id: Int!): addEventResponse
    updateEvent(event: UpdateEventInput!, admin_id: Int!, event_id: Int!): updateEventResponse
    deleteEvent(admin_id: Int!, event_id: Int!): deleteEventResponse

    addSchedule(schedule: AddScheduleInput!, admin_id: Int!): addScheduleResponse
    updateSchedule(schedule: UpdateScheduleInput!, admin_id: Int!, schedule_id: Int!): updateScheduleResponse
    deleteSchedule(admin_id: Int!, schedule_id: Int!): deleteScheduleResponse

    addScoreboard(scoreboard: AddScoreboardInput!, admin_id: Int!): addScoreboardResponse
    updateScoreboard(user_id: Int!, scoreboard_id: Int!, score: Int!): updateScoreboardResponse
    deleteScoreboard(admin_id: Int!, scoreboard_id: Int!): deleteScoreboardResponse
}
`;
