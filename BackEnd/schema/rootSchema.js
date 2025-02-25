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
        userLogin(user_name: String!, password: String!): LogInUser

        addUserAccount(useraccount: AddUserInput!): User
        updateUserAccount(id: Int!, useraccount: UpdateUserInput!): User
        deleteUserAccount(id: Int!): User
        
        addTeam(team: AddTeamInput): Team
        updateTeam(id: Int!, team: UpdateTeamInput!): Team
        deleteTeam(id: Int!): Team

        addCategory(category: AddCategoryInput!): Category
        updateCategory(id: Int!, category: UpdateCategoryInput!): Category
        deleteCategory(id: Int!): Category

        addEvent(event: AddEventInput!): Event
        updateEvent(id: Int!, event: UpdateEventInput!): Event
        deleteEvent(id: Int!): Event

        addSchedule(schedule: AddScheduleInput!): Schedule
        updateSchedule(id: Int!, schedule: UpdateScheduleInput!): Schedule
        deleteSchedule(id: Int!): Schedule

        addScoreboard(scoreboard: AddScoreboardInput!): Scoreboard
        updateScoreboard(id: Int!, scoreboard: UpdateScoreboardInput!): Scoreboard
        deleteScoreboard(id: Int!): Scoreboard
    }
`;
