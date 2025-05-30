PGDMP  6    6                }            Intramurals    17.5    17.5 q    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    24584    Intramurals    DATABASE     �   CREATE DATABASE "Intramurals" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_Philippines.1252';
    DROP DATABASE "Intramurals";
                     postgres    false            �            1255    24585 D   fn_admin_add_category(integer, character varying, character varying)    FUNCTION     �  CREATE FUNCTION public.fn_admin_add_category(p_admin_id integer, p_category_name character varying, p_division character varying) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    category_record JSONB;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
    new_category_id INTEGER;
BEGIN
    category_record := NULL;
    msg_detail := '';

    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;

    IF user_role IS NULL THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Admin user not found'
        );
    END IF;

    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Permission Denied: Only admins can add a new category'
        );
    END IF;

    INSERT INTO category (category_name, division) 
    VALUES (TRIM(p_category_name), p_division)
    RETURNING category_id INTO new_category_id; 

    SELECT to_jsonb(c)
    INTO category_record
    FROM category c
    WHERE c.category_id = new_category_id;

    IF FOUND THEN
        msg_type := 'success';
        msg_detail := 'New category added successfully!';
    ELSE
        category_record := NULL;
        msg_type := 'error';
        msg_detail := 'Category not found after insertion!';
    END IF;

    RETURN jsonb_build_object(
        'content', category_record,
        'type', msg_type,
        'message', msg_detail
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'An unexpected error occurred: ' || SQLERRM
        );
END;
$$;
 �   DROP FUNCTION public.fn_admin_add_category(p_admin_id integer, p_category_name character varying, p_division character varying);
       public               postgres    false            �            1255    24586 J   fn_admin_add_event(integer, character varying, character varying, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_add_event(p_admin_id integer, p_event_name character varying, p_venue character varying, p_category_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    event_record JSONB;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
    new_event_id INTEGER;
BEGIN
    -- Check if the user is an admin
    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;

    IF user_role IS NULL THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Admin user not found'
        );
    END IF;

    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Permission Denied: Only admins can add a new event'
        );
    END IF;

    -- Insert the new event
    INSERT INTO events (event_name, venue, category_id)
    VALUES (p_event_name, p_venue, p_category_id)
    RETURNING event_id INTO new_event_id;

    -- Fetch the inserted event as JSONB
    SELECT to_jsonb(e) INTO event_record FROM events e WHERE e.event_id = new_event_id;

    RETURN jsonb_build_object(
        'content', event_record,
        'type', 'success',
        'message', p_event_name || ' event added successfully!'
    );

EXCEPTION
    WHEN unique_violation THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Unique violation! Event already exists.'
        );
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'An unexpected error occurred: ' || SQLERRM
        );
END;
$$;
 �   DROP FUNCTION public.fn_admin_add_event(p_admin_id integer, p_event_name character varying, p_venue character varying, p_category_id integer);
       public               postgres    false            #           1255    24726 Q   fn_admin_add_match(integer, integer, integer, integer, integer, integer, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_add_match(p_admin_id integer, p_schedule_id integer, p_team_a_id integer, p_team_b_id integer, p_score_a integer DEFAULT NULL::integer, p_score_b integer DEFAULT NULL::integer, p_user_assigned integer DEFAULT NULL::integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    match_record JSONB;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
    new_match_id INTEGER;
    match_exists BOOLEAN;
    user_to_assign INTEGER;
BEGIN
    match_record := NULL;
    msg_detail := '';

    -- Validate admin user
    SELECT user_type INTO user_role 
    FROM useraccount 
    WHERE user_id = p_admin_id;

    IF user_role IS NULL THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Admin user not found'
        );
    END IF;

    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Permission Denied: Only admins can add a match'
        );
    END IF;

    -- Check for existing match
    SELECT EXISTS (
        SELECT 1 
        FROM match 
        WHERE schedule_id = p_schedule_id 
          AND team_a_id = p_team_a_id 
          AND team_b_id = p_team_b_id
    ) INTO match_exists;

    IF match_exists THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Match already exists for the given schedule and teams.'
        );
    END IF;

	    -- Set user to assign
    user_to_assign := COALESCE(p_user_assigned, p_admin_id);

    -- Insert the new match and construct the match_record directly
    INSERT INTO match (schedule_id, team_a_id, team_b_id, score_a, score_b, user_assigned_id)
VALUES (p_schedule_id, p_team_a_id, p_team_b_id, p_score_a, p_score_b, user_to_assign)
RETURNING match_id,
    jsonb_build_object(
        'match_id', match_id,
        'schedule_id', schedule_id,
        'team_a_id', team_a_id,
        'team_a_name', (SELECT team_name FROM team WHERE team_id = team_a_id),
        'team_b_id', team_b_id,
        'team_b_name', (SELECT team_name FROM team WHERE team_id = team_b_id),
        'score_a', score_a,
        'score_b', score_b,
        'user_assigned_id', user_assigned_id
    )
INTO new_match_id, match_record;

    -- Set success response
    msg_type := 'success';
    msg_detail := 'Match added successfully!';

    RETURN jsonb_build_object(
        'content', match_record,
        'type', msg_type,
        'message', msg_detail
    );

EXCEPTION
    WHEN foreign_key_violation THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Foreign key constraint failed: Invalid schedule or team ID.'
        );

    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Unexpected error: ' || SQLERRM
        );
END;
$$;
 �   DROP FUNCTION public.fn_admin_add_match(p_admin_id integer, p_schedule_id integer, p_team_a_id integer, p_team_b_id integer, p_score_a integer, p_score_b integer, p_user_assigned integer);
       public               postgres    false            $           1255    24727 ]   fn_admin_add_schedule(integer, date, time without time zone, time without time zone, integer)    FUNCTION     (
  CREATE FUNCTION public.fn_admin_add_schedule(p_admin_id integer, p_date date, p_start_time time without time zone, p_end_time time without time zone, p_event_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
    venue_conflict BOOLEAN;
    event_venue TEXT;
    new_schedule_id INTEGER;
BEGIN
    -- Check if admin exists
    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;
    
    IF user_role IS NULL THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Admin user not found');
    END IF;
    
    -- Check admin permissions
    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Permission Denied: Only admins can add a schedule');
    END IF;
    
    -- Validate time
    IF p_end_time <= p_start_time THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'End time must be after start time');
    END IF;
    
    -- Check if event exists
    SELECT venue INTO event_venue FROM events WHERE event_id = p_event_id;
    IF event_venue IS NULL THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Event not found');
    END IF;
    
    -- Check for venue conflicts
    SELECT EXISTS (
        SELECT 1
        FROM schedule s
        JOIN events e ON s.event_id = e.event_id
        WHERE e.venue = event_venue
          AND s.date = p_date
          AND (p_start_time < s.end_time AND p_end_time > s.start_time)
    ) INTO venue_conflict;
    
    IF venue_conflict THEN
        RETURN jsonb_build_object(
            'type', 'error', 
            'message', 'Venue conflict: ' || event_venue || ' is already booked during this time slot'
        );
    END IF;
    
    -- Insert the new schedule and get the schedule_id
    INSERT INTO schedule (date, start_time, end_time, event_id)
    VALUES (p_date, p_start_time, p_end_time, p_event_id)
    RETURNING schedule_id INTO new_schedule_id;
    
    -- Return success response with content
    RETURN jsonb_build_object(
        'type', 'success',
        'message', 'Schedule added successfully!',
        'content', jsonb_build_object(
            'schedule_id', new_schedule_id,
            'date', p_date,
            'start_time', p_start_time,
            'end_time', p_end_time,
            'event_id', p_event_id
        )
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'type', 'error',
            'message', 'An unexpected error occurred: ' || SQLERRM
        );
END;
$$;
 �   DROP FUNCTION public.fn_admin_add_schedule(p_admin_id integer, p_date date, p_start_time time without time zone, p_end_time time without time zone, p_event_id integer);
       public               postgres    false            �            1255    24589 D   fn_admin_add_scoreboard(integer, integer, integer, integer, integer)    FUNCTION       CREATE FUNCTION public.fn_admin_add_scoreboard(p_admin_id integer, p_user_id integer, p_team_id integer, p_event_id integer, p_schedule_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    scoreboard_record JSONB;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
    new_scoreboard_id INTEGER;
BEGIN
    scoreboard_record := NULL;
    msg_detail := '';

    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;

    IF user_role IS NULL THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Admin user not found'
        );
    END IF;

    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Permission Denied: Only admins can add a scoreboard entry'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM team WHERE team_id = p_team_id) THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Error: Team ID does not exist!'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM useraccount WHERE user_id = p_user_id) THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Error: User ID does not exist!'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM events WHERE event_id = p_event_id) THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Error: Event ID does not exist!'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM schedule WHERE schedule_id = p_schedule_id) THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Error: Schedule ID does not exist!'
        );
    END IF;

    INSERT INTO scoreboard (user_id, team_id, event_id, schedule_id) 
    VALUES (p_user_id, p_team_id, p_event_id, p_schedule_id)
    RETURNING scoreboard_id INTO new_scoreboard_id;

    SELECT to_jsonb(s) 
    INTO scoreboard_record
    FROM scoreboard s 
    WHERE s.scoreboard_id = new_scoreboard_id;

    IF FOUND THEN
        msg_type := 'success';
        msg_detail := 'New scoreboard entry added successfully!';
    ELSE
        scoreboard_record := NULL;
        msg_type := 'error';
        msg_detail := 'Scoreboard entry not found after insertion!';
    END IF;

    RETURN jsonb_build_object(
        'content', scoreboard_record,
        'type', msg_type,
        'message', msg_detail
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'An unexpected error occurred: ' || SQLERRM
        );
END;
$$;
 �   DROP FUNCTION public.fn_admin_add_scoreboard(p_admin_id integer, p_user_id integer, p_team_id integer, p_event_id integer, p_schedule_id integer);
       public               postgres    false            �            1255    24590 f   fn_admin_add_team(integer, character varying, character varying, character varying, character varying)    FUNCTION     ;
  CREATE FUNCTION public.fn_admin_add_team(p_admin_id integer, p_team_name character varying, p_team_color character varying, p_team_logo character varying, p_team_motto character varying) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR(20);
    team_record JSONB;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
    team_exists BOOLEAN;
    new_team_id INTEGER;
BEGIN
    team_record := NULL;
    msg_detail := '';

    -- Check if the user is an admin
    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;

    IF user_role IS NULL THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Admin user not found'
        );
    END IF;

    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Permission Denied: Only admins can add a new team'
        );
    END IF;

    -- Check if the team already exists
    SELECT EXISTS (
        SELECT 1 FROM team WHERE LOWER(TRIM(team_name)) = LOWER(TRIM(p_team_name))
    ) INTO team_exists;

    IF team_exists THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'This team already exists!'
        );
    END IF;

    -- Insert the new team (without created_by column)
    INSERT INTO team (team_name, team_color, team_logo, team_motto)
    VALUES (TRIM(p_team_name), p_team_color, p_team_logo, p_team_motto)
    RETURNING team_id INTO new_team_id; 

    -- Fetch the newly added team data
    SELECT to_jsonb(t)
    INTO team_record
    FROM team t
    WHERE t.team_id = new_team_id;

    -- Check if team was inserted successfully
    IF FOUND THEN
        msg_type := 'success';
        msg_detail := 'Team "' || p_team_name || '" added successfully!';
    ELSE
        team_record := NULL;
        msg_type := 'error';
        msg_detail := 'Team not found after insertion!';
    END IF;

    -- Return the result as JSONB object
    RETURN jsonb_build_object(
        'content', team_record,
        'type', msg_type,
        'message', msg_detail
    );

EXCEPTION
    WHEN unique_violation THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Unique violation! Team already exists.'
        );
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'An unexpected error occurred: ' || SQLERRM
        );
END;
$$;
 �   DROP FUNCTION public.fn_admin_add_team(p_admin_id integer, p_team_name character varying, p_team_color character varying, p_team_logo character varying, p_team_motto character varying);
       public               postgres    false                        1255    24591 N   fn_admin_add_user_account(integer, character varying, text, character varying)    FUNCTION     �  CREATE FUNCTION public.fn_admin_add_user_account(p_admin_id integer, p_user_name character varying, p_password text, p_user_type character varying) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    user_record JSONB;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
    user_exists BOOLEAN;
BEGIN
    user_record := NULL;
    msg_detail := '';

    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;

    IF user_role IS NULL THEN
        RETURN jsonb_build_object('content', NULL, 'type', 'error', 'message', 'Admin user not found');
    END IF;

    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object('content', NULL, 'type', 'error', 'message', 'Permission Denied: Only admins can add user accounts');
    END IF;

    SELECT EXISTS (SELECT 1 FROM useraccount WHERE user_name = p_user_name) INTO user_exists;

    IF NOT user_exists THEN
        INSERT INTO useraccount (user_name, password, user_type) 
        VALUES (p_user_name, p_password, p_user_type);

        SELECT to_jsonb(u) INTO user_record FROM useraccount u WHERE u.user_name = p_user_name;

        IF FOUND THEN
            msg_type := 'success';
            msg_detail := 'User "' || p_user_name || '" added successfully!';
        ELSE
            msg_type := 'error';
            msg_detail := p_user_name || ' User not found!';
        END IF;
    ELSE
        msg_type := 'error';
        msg_detail := 'User already exists!';
    END IF;

    RETURN jsonb_build_object('content', user_record, 'type', msg_type, 'message', msg_detail);

EXCEPTION
    WHEN unique_violation THEN
        RETURN jsonb_build_object('content', NULL, 'type', 'error', 'message', 'Unique violation! User already exists.');
    WHEN OTHERS THEN
        RETURN jsonb_build_object('content', NULL, 'type', 'error', 'message', 'An unexpected error occurred: ' || SQLERRM);
END;
$$;
 �   DROP FUNCTION public.fn_admin_add_user_account(p_admin_id integer, p_user_name character varying, p_password text, p_user_type character varying);
       public               postgres    false                       1255    24592 *   fn_admin_delete_category(integer, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_delete_category(p_admin_id integer, p_category_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    category_exists BOOLEAN;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
BEGIN
    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;

    IF user_role IS NULL THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Admin user not found');
    END IF;

    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Permission Denied: Only admins can delete a category');
    END IF;

    SELECT EXISTS (SELECT 1 FROM category WHERE category_id = p_category_id) INTO category_exists;

    IF NOT category_exists THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Category does not exist!');
    END IF;

    DELETE FROM category WHERE category_id = p_category_id;

    IF NOT FOUND THEN
        msg_detail := 'Failed to delete the category!';
    ELSE
        msg_type := 'success';
        msg_detail := 'Category deleted successfully!';
    END IF;

    RETURN jsonb_build_object('type', msg_type, 'message', msg_detail);

EXCEPTION
    WHEN foreign_key_violation THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Cannot delete category: It is referenced by another record.');
    WHEN OTHERS THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'An unexpected error occurred: ' || SQLERRM);
END;
$$;
 Z   DROP FUNCTION public.fn_admin_delete_category(p_admin_id integer, p_category_id integer);
       public               postgres    false                       1255    24593 '   fn_admin_delete_event(integer, integer)    FUNCTION     y  CREATE FUNCTION public.fn_admin_delete_event(p_admin_id integer, p_event_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    event_exists BOOLEAN;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
BEGIN
    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;

    IF user_role IS NULL THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Admin user not found');
    END IF;

    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Permission Denied: Only admins can delete events');
    END IF;

    SELECT EXISTS (SELECT 1 FROM events WHERE event_id = p_event_id) INTO event_exists;

    IF NOT event_exists THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Event not found!');
    END IF;

    DELETE FROM events WHERE event_id = p_event_id;

    RETURN jsonb_build_object('type', 'success', 'message', 'Event deleted successfully!');

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'An unexpected error occurred: ' || SQLERRM);
END;
$$;
 T   DROP FUNCTION public.fn_admin_delete_event(p_admin_id integer, p_event_id integer);
       public               postgres    false                       1255    24594 '   fn_admin_delete_match(integer, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_delete_match(p_admin_id integer, p_match_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
BEGIN
    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;

    IF user_role IS NULL THEN
        RETURN jsonb_build_object(
            'type', 'error',
            'message', 'Admin user not found'
        );
    END IF;

    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object(
            'type', 'error',
            'message', 'Permission Denied: Only admins can delete matches.'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM match WHERE match_id = p_match_id) THEN
        RETURN jsonb_build_object(
            'type', 'error',
            'message', 'Match not found.'
        );
    END IF;

    DELETE FROM match WHERE match_id = p_match_id;

    RETURN jsonb_build_object(
        'type', 'success',
        'message', 'Match deleted successfully.'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'type', 'error',
            'message', 'Unexpected error: ' || SQLERRM
        );
END;
$$;
 T   DROP FUNCTION public.fn_admin_delete_match(p_admin_id integer, p_match_id integer);
       public               postgres    false                       1255    24595 *   fn_admin_delete_schedule(integer, integer)    FUNCTION     q  CREATE FUNCTION public.fn_admin_delete_schedule(p_admin_id integer, p_schedule_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    schedule_exists BOOLEAN;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
BEGIN
    msg_detail := '';

    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;

    IF user_role IS NULL THEN
        RETURN jsonb_build_object(
            'type', 'error',
            'message', 'Admin user not found'
        );
    END IF;

    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object(
            'type', 'error',
            'message', 'Permission Denied: Only admins can delete a schedule'
        );
    END IF;

    SELECT EXISTS (SELECT 1 FROM schedule WHERE schedule_id = p_schedule_id) INTO schedule_exists;

    IF schedule_exists THEN
        DELETE FROM schedule WHERE schedule_id = p_schedule_id;
        msg_type := 'success';
        msg_detail := 'Schedule deleted successfully!';
    ELSE
        msg_type := 'error';
        msg_detail := 'Schedule not found!';
    END IF;

    RETURN jsonb_build_object(
        'type', msg_type,
        'message', msg_detail
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'type', 'error',
            'message', 'An unexpected error occurred: ' || SQLERRM
        );
END;
$$;
 Z   DROP FUNCTION public.fn_admin_delete_schedule(p_admin_id integer, p_schedule_id integer);
       public               postgres    false                       1255    24596 ,   fn_admin_delete_scoreboard(integer, integer)    FUNCTION       CREATE FUNCTION public.fn_admin_delete_scoreboard(p_admin_id integer, p_scoreboard_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    scoreboard_exists BOOLEAN;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
BEGIN
    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;

    IF user_role IS NULL THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Admin user not found');
    END IF;

    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Permission Denied: Only admins can delete a scoreboard');
    END IF;

    SELECT EXISTS (SELECT 1 FROM scoreboard WHERE scoreboard_id = p_scoreboard_id) INTO scoreboard_exists;

    IF NOT scoreboard_exists THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Scoreboard does not exist!');
    END IF;

    DELETE FROM scoreboard WHERE scoreboard_id = p_scoreboard_id;

    IF NOT FOUND THEN
        msg_detail := 'Failed to delete the scoreboard!';
    ELSE
        msg_type := 'success';
        msg_detail := 'Scoreboard deleted successfully!';
    END IF;

    RETURN jsonb_build_object('type', msg_type, 'message', msg_detail);

EXCEPTION
    WHEN foreign_key_violation THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Cannot delete scoreboard: It is referenced by another record.');
    WHEN OTHERS THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'An unexpected error occurred: ' || SQLERRM);
END;
$$;
 ^   DROP FUNCTION public.fn_admin_delete_scoreboard(p_admin_id integer, p_scoreboard_id integer);
       public               postgres    false                       1255    24597 &   fn_admin_delete_team(integer, integer)    FUNCTION     `  CREATE FUNCTION public.fn_admin_delete_team(p_admin_id integer, p_team_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    team_exists BOOLEAN;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
BEGIN
    msg_detail := '';

    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;

    IF user_role IS NULL THEN
        RETURN jsonb_build_object(
            'type', 'error',
            'message', 'Admin user not found'
        );
    END IF;

    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object(
            'type', 'error',
            'message', 'Permission Denied: Only admins can delete teams'
        );
    END IF;

    SELECT EXISTS (SELECT 1 FROM team WHERE team_id = p_team_id) INTO team_exists;

    IF NOT team_exists THEN
        RETURN jsonb_build_object(
            'type', 'error',
            'message', 'Team not found!'
        );
    END IF;

    BEGIN
        DELETE FROM team WHERE team_id = p_team_id;
        msg_type := 'success';
        msg_detail := 'Team deleted successfully!';
    EXCEPTION
        WHEN foreign_key_violation THEN
            RETURN jsonb_build_object(
                'type', 'error',
                'message', 'Cannot delete team: It is referenced in another table.'
            );
        WHEN OTHERS THEN
            RETURN jsonb_build_object(
                'type', 'error',
                'message', 'An unexpected error occurred: ' || SQLERRM
            );
    END;

    RETURN jsonb_build_object(
        'type', msg_type,
        'message', msg_detail
    );

END;
$$;
 R   DROP FUNCTION public.fn_admin_delete_team(p_admin_id integer, p_team_id integer);
       public               postgres    false                       1255    24598 .   fn_admin_delete_user_account(integer, integer)    FUNCTION     W  CREATE FUNCTION public.fn_admin_delete_user_account(p_admin_id integer, p_user_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    user_exists BOOLEAN;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
BEGIN
    msg_detail := '';

    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;

    IF user_role IS NULL THEN
        RETURN jsonb_build_object(
            'type', 'error',
            'message', 'Admin user not found'
        );
    END IF;

    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object(
            'type', 'error',
            'message', 'Permission Denied: Only admins can delete user accounts'
        );
    END IF;

    SELECT EXISTS (SELECT 1 FROM useraccount WHERE user_id = p_user_id) INTO user_exists;

    IF user_exists THEN
        DELETE FROM useraccount WHERE user_id = p_user_id;

        msg_type := 'success';
        msg_detail := 'User deleted successfully!';
    ELSE
        msg_type := 'error';
        msg_detail := 'User not found!';
    END IF;

    RETURN jsonb_build_object(
        'type', msg_type,
        'message', msg_detail
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'type', 'error',
            'message', 'An unexpected error occurred: ' || SQLERRM
        );
END;
$$;
 Z   DROP FUNCTION public.fn_admin_delete_user_account(p_admin_id integer, p_user_id integer);
       public               postgres    false                       1255    24599 P   fn_admin_update_category(integer, integer, character varying, character varying)    FUNCTION     �  CREATE FUNCTION public.fn_admin_update_category(p_admin_id integer, p_category_id integer, p_category_name character varying, p_division character varying) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
    category_exists BOOLEAN;
BEGIN
    msg_detail := '';

    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;

    IF user_role IS NULL THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Admin user not found');
    END IF;

    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Permission Denied: Only admins can update a category');
    END IF;

    SELECT EXISTS (SELECT 1 FROM category WHERE category_id = p_category_id) INTO category_exists;

    IF NOT category_exists THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Category not found');
    END IF;

        UPDATE Category 
        SET category_name = p_category_name, division = p_division
        WHERE category_id = p_category_id;

    msg_type := 'success';
    msg_detail := p_category_name || ' Category updated successfully!';

    RETURN jsonb_build_object('type', msg_type, 'message', msg_detail);

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'An unexpected error occurred: ' || SQLERRM);
END;
$$;
 �   DROP FUNCTION public.fn_admin_update_category(p_admin_id integer, p_category_id integer, p_category_name character varying, p_division character varying);
       public               postgres    false            	           1255    24600 V   fn_admin_update_event(integer, integer, character varying, character varying, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_update_event(p_admin_id integer, p_event_id integer, p_event_name character varying, p_venue character varying, p_category_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
	user_role VARCHAR;
	msg_type VARCHAR(20) DEFAULT 'error';
	msg_detail VARCHAR(200);
	event_exists BOOLEAN;
BEGIN
	-- Check if admin exists
	SELECT user_type INTO user_role
	FROM useraccount
	WHERE user_id = p_admin_id;

	IF user_role IS NULL THEN
		RETURN jsonb_build_object(
			'type', 'error',
			'message', 'Admin user not found'
		);
	END IF;

	-- Check if user is admin
	IF user_role <> 'admin' THEN
		RETURN jsonb_build_object(
			'type', 'error',
			'message', 'Permission Denied: Only admins can update events'
		);
	END IF;

	-- Check if event exists
	SELECT EXISTS (
		SELECT 1 FROM events WHERE events.event_id = p_event_id
	) INTO event_exists;

	IF NOT event_exists THEN
		RETURN jsonb_build_object(
			'type', 'error',
			'message', 'Event not found'
		);
	END IF;

	-- Update the event
	UPDATE events
	SET event_name = p_event_name,
		venue = p_venue,
		category_id = p_category_id
	WHERE events.event_id = p_event_id;

	RETURN jsonb_build_object(
		'type', 'success',
		'message', p_event_name || ' event updated successfully!'
	);

EXCEPTION
	WHEN OTHERS THEN
		RETURN jsonb_build_object(
			'type', 'error',
			'message', 'An unexpected error occurred: ' || SQLERRM
		);
END;
$$;
 �   DROP FUNCTION public.fn_admin_update_event(p_admin_id integer, p_event_id integer, p_event_name character varying, p_venue character varying, p_category_id integer);
       public               postgres    false            
           1255    24601 ]   fn_admin_update_match(integer, integer, integer, integer, integer, integer, integer, integer)    FUNCTION     �
  CREATE FUNCTION public.fn_admin_update_match(p_admin_id integer, p_match_id integer, p_schedule_id integer, p_team_a_id integer, p_team_b_id integer, p_score_a integer DEFAULT NULL::integer, p_score_b integer DEFAULT NULL::integer, p_user_assigned_id integer DEFAULT NULL::integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    match_record JSONB;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
    match_exists BOOLEAN;
BEGIN
    match_record := NULL;
    msg_detail := '';

    -- Validate admin user
    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;
    IF user_role IS NULL THEN
        RETURN jsonb_build_object('content', NULL, 'type', 'error', 'message', 'Admin user not found');
    END IF;
    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object('content', NULL, 'type', 'error', 'message', 'Permission Denied: Only admins can update a match');
    END IF;

    -- Validate match exists
    SELECT EXISTS (SELECT 1 FROM match WHERE match_id = p_match_id) INTO match_exists;
    IF NOT match_exists THEN
        RETURN jsonb_build_object('content', NULL, 'type', 'error', 'message', 'Match not found');
    END IF;

    -- Validate schedule and team IDs
    IF NOT EXISTS (SELECT 1 FROM schedule WHERE schedule_id = p_schedule_id) THEN
        RETURN jsonb_build_object('content', NULL, 'type', 'error', 'message', 'Invalid schedule ID');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM team WHERE team_id = p_team_a_id) OR
       NOT EXISTS (SELECT 1 FROM team WHERE team_id = p_team_b_id) THEN
        RETURN jsonb_build_object('content', NULL, 'type', 'error', 'message', 'One or both team IDs not found');
    END IF;

    -- Update match
    UPDATE match
    SET
        schedule_id = p_schedule_id,
        team_a_id = p_team_a_id,
        team_b_id = p_team_b_id,
        score_a = p_score_a,
        score_b = p_score_b,
        user_assigned_id = COALESCE(p_user_assigned_id, p_admin_id)
    WHERE match_id = p_match_id;

    -- Fetch updated match
    SELECT to_jsonb(m) INTO match_record FROM match m WHERE m.match_id = p_match_id;
    IF FOUND THEN
        msg_type := 'success';
        msg_detail := 'Match updated successfully!';
    ELSE
        match_record := NULL;
        msg_detail := 'Match not found after update!';
    END IF;

    RETURN jsonb_build_object('content', match_record, 'type', msg_type, 'message', msg_detail);

EXCEPTION
    WHEN foreign_key_violation THEN
        RETURN jsonb_build_object('content', NULL, 'type', 'error', 'message', 'Foreign key constraint failed: Invalid schedule or team ID.');
    WHEN OTHERS THEN
        RETURN jsonb_build_object('content', NULL, 'type', 'error', 'message', 'Unexpected error: ' || SQLERRM);
END;
$$;
 �   DROP FUNCTION public.fn_admin_update_match(p_admin_id integer, p_match_id integer, p_schedule_id integer, p_team_a_id integer, p_team_b_id integer, p_score_a integer, p_score_b integer, p_user_assigned_id integer);
       public               postgres    false            %           1255    24728 i   fn_admin_update_schedule(integer, integer, date, time without time zone, time without time zone, integer)    FUNCTION     B	  CREATE FUNCTION public.fn_admin_update_schedule(p_admin_id integer, p_schedule_id integer, p_date date, p_start_time time without time zone, p_end_time time without time zone, p_event_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    venue_conflict BOOLEAN;
    event_venue TEXT;
    existing_event_id INTEGER;
BEGIN
    -- Check if admin exists
    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;
    
    IF user_role IS NULL THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Admin user not found');
    END IF;

    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Permission Denied: Only admins can edit a schedule');
    END IF;

    SELECT event_id INTO existing_event_id FROM schedule WHERE schedule_id = p_schedule_id;
    IF existing_event_id IS NULL THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Schedule not found');
    END IF;

    IF p_end_time <= p_start_time THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'End time must be after start time');
    END IF;

    SELECT venue INTO event_venue FROM events WHERE event_id = p_event_id;
    IF event_venue IS NULL THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Event not found');
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM schedule s
        JOIN events e ON s.event_id = e.event_id
        WHERE e.venue = event_venue
          AND s.date = p_date
          AND (p_start_time < s.end_time AND p_end_time > s.start_time)
          AND s.schedule_id <> p_schedule_id
    ) INTO venue_conflict;

    IF venue_conflict THEN
        RETURN jsonb_build_object(
            'type', 'error', 
            'message', 'Venue conflict: ' || event_venue || ' is already booked during this time slot'
        );
    END IF;

    UPDATE schedule
    SET date = p_date,
        start_time = p_start_time,
        end_time = p_end_time,
        event_id = p_event_id
    WHERE schedule_id = p_schedule_id;

    RETURN jsonb_build_object(
        'type', 'success', 
        'message', 'Schedule updated successfully!'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'type', 'error', 
            'message', 'An unexpected error occurred: ' || SQLERRM
        );
END;
$$;
 �   DROP FUNCTION public.fn_admin_update_schedule(p_admin_id integer, p_schedule_id integer, p_date date, p_start_time time without time zone, p_end_time time without time zone, p_event_id integer);
       public               postgres    false                       1255    24603 Y   fn_admin_update_scoreboard(integer, integer, integer, integer, integer, integer, integer)    FUNCTION     d  CREATE FUNCTION public.fn_admin_update_scoreboard(p_admin_id integer, p_scoreboard_id integer, p_user_id integer, p_team_id integer, p_event_id integer, p_schedule_id integer, p_user_assigned integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    scoreboard_record JSONB;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
BEGIN
    scoreboard_record := NULL;
    msg_detail := '';

    -- Check if the admin user exists and has the correct role
    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;

    IF user_role IS NULL THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Admin user not found'
        );
    END IF;

    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Permission Denied: Only admins can update a scoreboard entry'
        );
    END IF;

    -- Validate scoreboard_id exists
    IF NOT EXISTS (SELECT 1 FROM scoreboard WHERE scoreboard_id = p_scoreboard_id) THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Error: Scoreboard ID does not exist!'
        );
    END IF;

    -- Validate team_id
    IF NOT EXISTS (SELECT 1 FROM team WHERE team_id = p_team_id) THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Error: Team ID does not exist!'
        );
    END IF;

    -- Validate user_id
    IF NOT EXISTS (SELECT 1 FROM useraccount WHERE user_id = p_user_id) THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Error: User ID does not exist!'
        );
    END IF;

    -- Validate event_id
    IF NOT EXISTS (SELECT 1 FROM events WHERE event_id = p_event_id) THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Error: Event ID does not exist!'
        );
    END IF;

    -- Validate schedule_id
    IF NOT EXISTS (SELECT 1 FROM schedule WHERE schedule_id = p_schedule_id) THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Error: Schedule ID does not exist!'
        );
    END IF;

    -- Validate user_assigned
    IF NOT EXISTS (SELECT 1 FROM useraccount WHERE user_id = p_user_assigned) THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Error: Assigned User ID does not exist!'
        );
    END IF;

    -- Update the existing scoreboard entry
    UPDATE scoreboard
    SET 
        user_id = p_user_id,
        team_id = p_team_id,
        event_id = p_event_id,
        schedule_id = p_schedule_id,
        user_assigned = p_user_assigned
    WHERE scoreboard_id = p_scoreboard_id
    RETURNING * INTO scoreboard_record;

    -- Check if the update was successful
    IF FOUND THEN
        msg_type := 'success';
        msg_detail := 'Scoreboard entry updated successfully!';
    ELSE
        scoreboard_record := NULL;
        msg_type := 'error';
        msg_detail := 'Scoreboard entry not found for update!';
    END IF;

    RETURN jsonb_build_object(
        'content', scoreboard_record,
        'type', msg_type,
        'message', msg_detail
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'An unexpected error occurred: ' || SQLERRM
        );
END;
$$;
 �   DROP FUNCTION public.fn_admin_update_scoreboard(p_admin_id integer, p_scoreboard_id integer, p_user_id integer, p_team_id integer, p_event_id integer, p_schedule_id integer, p_user_assigned integer);
       public               postgres    false                       1255    24604 r   fn_admin_update_team(integer, integer, character varying, character varying, character varying, character varying)    FUNCTION     �  CREATE FUNCTION public.fn_admin_update_team(p_admin_id integer, p_team_id integer, p_team_name character varying, p_team_color character varying, p_team_logo character varying, p_team_motto character varying) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR(20);
    team_record JSONB;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
    team_exists BOOLEAN;
BEGIN
    team_record := NULL;
    msg_detail := '';

    -- Check if the user is an admin
    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;

    IF user_role IS NULL THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Admin user not found'
        );
    END IF;

    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Permission Denied: Only admins can update a team'
        );
    END IF;

    -- Check if the team exists
    SELECT EXISTS (
        SELECT 1 FROM team WHERE team_id = p_team_id
    ) INTO team_exists;

    IF NOT team_exists THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Team not found'
        );
    END IF;

    -- Update the team data
    UPDATE team
    SET
        team_name = TRIM(p_team_name),
        team_color = p_team_color,
        team_logo = p_team_logo,
        team_motto = p_team_motto
    WHERE team_id = p_team_id
    RETURNING team_id, team_name, team_color, team_logo, team_motto INTO team_record;

    -- Check if team was updated successfully
    IF FOUND THEN
        msg_type := 'success';
        msg_detail := 'Team "' || p_team_name || '" updated successfully!';
    ELSE
        team_record := NULL;
        msg_type := 'error';
        msg_detail := 'Failed to update team!';
    END IF;

    -- Return the result as JSONB object
    RETURN jsonb_build_object(
        'content', team_record,
        'type', msg_type,
        'message', msg_detail
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'An unexpected error occurred: ' || SQLERRM
        );
END;
$$;
 �   DROP FUNCTION public.fn_admin_update_team(p_admin_id integer, p_team_id integer, p_team_name character varying, p_team_color character varying, p_team_logo character varying, p_team_motto character varying);
       public               postgres    false                       1255    24605 Z   fn_admin_update_user_account(integer, integer, character varying, text, character varying)    FUNCTION     �  CREATE FUNCTION public.fn_admin_update_user_account(p_admin_id integer, p_user_id integer, p_user_name character varying, p_password text, p_user_type character varying) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
    user_exists BOOLEAN;
BEGIN
    msg_detail := '';

    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;

    IF user_role IS NULL THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Admin user not found');
    END IF;

    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Permission Denied: Only admins can update user accounts');
    END IF;

    SELECT EXISTS (SELECT 1 FROM useraccount WHERE user_id = p_user_id) INTO user_exists;

    IF NOT user_exists THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'User not found');
    END IF;

    UPDATE useraccount
    SET 
        user_name = COALESCE(p_user_name, user_name),
        password = COALESCE(p_password, password),
        user_type = COALESCE(p_user_type, user_type)
    WHERE user_id = p_user_id;

    msg_type := 'success';
    msg_detail := 'User "' || p_user_name || '" updated successfully!';

    RETURN jsonb_build_object('type', msg_type, 'message', msg_detail);

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'An unexpected error occurred: ' || SQLERRM);
END;
$$;
 �   DROP FUNCTION public.fn_admin_update_user_account(p_admin_id integer, p_user_id integer, p_user_name character varying, p_password text, p_user_type character varying);
       public               postgres    false                       1255    24606 &   fn_delete_scoreboard(integer, integer)    FUNCTION     r  CREATE FUNCTION public.fn_delete_scoreboard(p_admin_id integer, p_scoreboard_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;

    IF user_role IS NULL OR user_role <> 'admin' THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Permission Denied: Only admins can delete a scoreboard entry');
    END IF;

    DELETE FROM scoreboard WHERE scoreboard_id = p_scoreboard_id;

    RETURN jsonb_build_object('type', 'success', 'message', 'Scoreboard entry deleted successfully!');
END;
$$;
 X   DROP FUNCTION public.fn_delete_scoreboard(p_admin_id integer, p_scoreboard_id integer);
       public               postgres    false                       1255    24607    fn_login(character varying)    FUNCTION     �  CREATE FUNCTION public.fn_login(p_user_name character varying) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    stored_password TEXT;
    stored_username VARCHAR;
    stored_usertype VARCHAR;
    stored_user_id INT;
BEGIN    
    SELECT user_id, password, user_name, user_type
    INTO stored_user_id, stored_password, stored_username, stored_usertype
    FROM UserAccount
    WHERE user_name = p_user_name;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'User not found');
    END IF;

    RETURN jsonb_build_object(
        'user_id', stored_user_id,
        'password', stored_password,
        'user_name', stored_username,
        'user_type', stored_usertype
    );
END;
$$;
 >   DROP FUNCTION public.fn_login(p_user_name character varying);
       public               postgres    false                       1255    24608    fn_sync_match_to_scoreboard()    FUNCTION       CREATE FUNCTION public.fn_sync_match_to_scoreboard() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Upsert scoreboard for team_a
  INSERT INTO public.scoreboard (match_id, team_id, score, schedule_id, user_id, category_id)
  VALUES (
    NEW.match_id,
    NEW.team_a_id,
    NEW.score_a,
    NEW.schedule_id,
    NEW.user_assigned_id,
    (SELECT category_id FROM public.match WHERE match_id = NEW.match_id)
  )
  ON CONFLICT ON CONSTRAINT unique_match_team
  DO UPDATE SET 
    score = EXCLUDED.score,
    schedule_id = EXCLUDED.schedule_id,
    user_id = EXCLUDED.user_id,
    category_id = EXCLUDED.category_id;

  -- Upsert scoreboard for team_b
  INSERT INTO public.scoreboard (match_id, team_id, score, schedule_id, user_id, category_id)
  VALUES (
    NEW.match_id,
    NEW.team_b_id,
    NEW.score_b,
    NEW.schedule_id,
    NEW.user_assigned_id,
    (SELECT category_id FROM public.match WHERE match_id = NEW.match_id)
  )
  ON CONFLICT ON CONSTRAINT unique_match_team
  DO UPDATE SET 
    score = EXCLUDED.score,
    schedule_id = EXCLUDED.schedule_id,
    user_id = EXCLUDED.user_id,
    category_id = EXCLUDED.category_id;

  RAISE NOTICE 'Syncing scoreboard for match_id: %, team_a_id: %, team_b_id: %', NEW.match_id, NEW.team_a_id, NEW.team_b_id;
  RETURN NEW;
END;
$$;
 4   DROP FUNCTION public.fn_sync_match_to_scoreboard();
       public               postgres    false                       1255    24609 &   fn_sync_scoreboard_from_match(integer)    FUNCTION       CREATE FUNCTION public.fn_sync_scoreboard_from_match(p_match_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_team_a_id INTEGER;
    v_team_b_id INTEGER;
    v_score_a INTEGER;
    v_score_b INTEGER;
    v_schedule_id INTEGER;
    v_category_id INTEGER;
    v_user_id INTEGER;
BEGIN
    SELECT 
        team_a_id, team_b_id,
        score_a, score_b,
        schedule_id,
        user_assigned_id
    INTO 
        v_team_a_id, v_team_b_id,
        v_score_a, v_score_b,
        v_schedule_id,
        v_user_id
    FROM public.match
    WHERE match_id = p_match_id;

    SELECT category_id INTO v_category_id
    FROM public.schedule
    WHERE schedule_id = v_schedule_id;

    INSERT INTO public.scoreboard(score, team_id, user_id, schedule_id, category_id, match_id)
    VALUES (v_score_a, v_team_a_id, v_user_id, v_schedule_id, v_category_id, p_match_id)
    ON CONFLICT (match_id, team_id) DO UPDATE
    SET score = EXCLUDED.score, category_id = EXCLUDED.category_id;

    INSERT INTO public.scoreboard(score, team_id, user_id, schedule_id, category_id, match_id)
    VALUES (v_score_b, v_team_b_id, v_user_id, v_schedule_id, v_category_id, p_match_id)
    ON CONFLICT (match_id, team_id) DO UPDATE
    SET score = EXCLUDED.score, category_id = EXCLUDED.category_id;
END;
$$;
 H   DROP FUNCTION public.fn_sync_scoreboard_from_match(p_match_id integer);
       public               postgres    false                       1255    24610    fn_update_scoreboard_rank()    FUNCTION     �  CREATE FUNCTION public.fn_update_scoreboard_rank() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Update ranking based on score per schedule_id
  WITH ranked_teams AS (
    SELECT team_id, score,
           RANK() OVER (PARTITION BY schedule_id ORDER BY score DESC NULLS LAST) AS new_rank
    FROM public.scoreboard
    WHERE schedule_id = NEW.schedule_id
  )
  UPDATE public.scoreboard
  SET ranking = ranked_teams.new_rank
  FROM ranked_teams
  WHERE scoreboard.team_id = ranked_teams.team_id
    AND scoreboard.schedule_id = NEW.schedule_id;

  RAISE NOTICE 'Updated rankings for schedule_id: %', NEW.schedule_id;
  RETURN NEW;
END;
$$;
 2   DROP FUNCTION public.fn_update_scoreboard_rank();
       public               postgres    false                       1255    24611    fn_update_team_rank()    FUNCTION     2  CREATE FUNCTION public.fn_update_team_rank() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Update ranking based on total score per team
  WITH ranked_teams AS (
    SELECT team_id, score,
           RANK() OVER (PARTITION BY schedule_id ORDER BY score DESC) AS new_rank
    FROM public.scoreboard
    WHERE schedule_id = NEW.schedule_id
  )
  UPDATE public.scoreboard
  SET ranking = ranked_teams.new_rank
  FROM ranked_teams
  WHERE scoreboard.team_id = ranked_teams.team_id
    AND scoreboard.schedule_id = NEW.schedule_id;

  RETURN NEW;
END;
$$;
 ,   DROP FUNCTION public.fn_update_team_rank();
       public               postgres    false                       1255    24612    fn_update_totalscore()    FUNCTION     �  CREATE FUNCTION public.fn_update_totalscore() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE public.scoreboard
  SET score = (
    SELECT CASE
      WHEN team_id = m.team_a_id THEN m.score_a
      WHEN team_id = m.team_b_id THEN m.score_b
      ELSE 0
    END
    FROM public.match m
    WHERE m.match_id = NEW.match_id
  )
  WHERE scoreboard.match_id = NEW.match_id
    AND scoreboard.team_id IN (NEW.team_id);

  RETURN NEW;
END;
$$;
 -   DROP FUNCTION public.fn_update_totalscore();
       public               postgres    false            �            1255    24613 >   fn_user_update_match_score(integer, integer, integer, integer)    FUNCTION     �	  CREATE FUNCTION public.fn_user_update_match_score(p_user_id integer, p_match_id integer, p_score_a integer, p_score_b integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    assigned_user_id INTEGER;
    match_record JSONB;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200) DEFAULT '';
    updated_match_id INTEGER;
    updated_score_a INTEGER;
    updated_score_b INTEGER;
    updated_score_updated_at TIMESTAMP WITH TIME ZONE;
BEGIN
    match_record := NULL;
    msg_detail := '';

    -- Get the user_assigned_id for the match
    SELECT user_assigned_id INTO assigned_user_id
    FROM public.match
    WHERE match_id = p_match_id;

    -- Check if match exists
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Match not found'
        );
    END IF;

    -- Allow updates if user_assigned_id is null or matches p_user_id
    IF assigned_user_id IS NOT NULL AND assigned_user_id IS DISTINCT FROM p_user_id THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'You are not authorized to update this match'
        );
    END IF;

    -- Update scores and score_updated_at, capture updated data
    UPDATE public.match
    SET score_a = p_score_a,
        score_b = p_score_b,
        score_updated_at = CURRENT_TIMESTAMP
    WHERE match_id = p_match_id
    RETURNING match_id, score_a, score_b, score_updated_at
    INTO updated_match_id, updated_score_a, updated_score_b, updated_score_updated_at;

    -- Build JSONB for the updated match
    SELECT jsonb_build_object(
        'match_id', updated_match_id,
        'score_a', updated_score_a,
        'score_b', updated_score_b,
        'score_updated_at', updated_score_updated_at
    ) INTO match_record
    FROM public.match
    WHERE match_id = updated_match_id;

    IF FOUND THEN
        msg_type := 'success';
        msg_detail := 'Match score updated successfully!';
    ELSE
        match_record := NULL;
        msg_type := 'error';
        msg_detail := 'Match not found after update!';
    END IF;

    RETURN jsonb_build_object(
        'content', match_record,
        'type', msg_type,
        'message', msg_detail
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'An unexpected error occurred: ' || SQLERRM
        );
END;
$$;
 ~   DROP FUNCTION public.fn_user_update_match_score(p_user_id integer, p_match_id integer, p_score_a integer, p_score_b integer);
       public               postgres    false                       1255    24614 ;   pr_admin_add_category(character varying, character varying) 	   PROCEDURE     T  CREATE PROCEDURE public.pr_admin_add_category(IN p_category_name character varying, IN p_division character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        INSERT INTO Category (category_name, division)
        VALUES (p_category_name, p_division);
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can add category entries';
    END IF;
END;
$$;
 t   DROP PROCEDURE public.pr_admin_add_category(IN p_category_name character varying, IN p_division character varying);
       public               postgres    false            �            1255    24615 K   pr_admin_add_events(character varying, character varying, integer, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_add_events(IN p_event_name character varying, IN p_venue character varying, IN p_team_id integer, IN p_category_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        INSERT INTO Events (event_name, venue, team_id, category_id)
        VALUES (p_event_name, p_venue, p_team_id, p_category_id);
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can add event entries';
    END IF;
END;
$$;
 �   DROP PROCEDURE public.pr_admin_add_events(IN p_event_name character varying, IN p_venue character varying, IN p_team_id integer, IN p_category_id integer);
       public               postgres    false            �            1255    24616 T   pr_admin_add_schedule(date, time without time zone, time without time zone, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_add_schedule(IN p_date date, IN p_start_time time without time zone, IN p_end_time time without time zone, IN p_event_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        INSERT INTO Schedule (date, start_time, end_time, event_id)
        VALUES (p_date, p_start_time, p_end_time, p_event_id);
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can add schedule entries';
    END IF;
END;
$$;
 �   DROP PROCEDURE public.pr_admin_add_schedule(IN p_date date, IN p_start_time time without time zone, IN p_end_time time without time zone, IN p_event_id integer);
       public               postgres    false            �            1255    24617 M   pr_admin_add_scoreboard(integer, integer, integer, integer, integer, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_add_scoreboard(IN p_user_id integer, IN p_team_id integer, IN p_event_id integer, IN p_schedule_id integer, IN p_score integer, IN p_ranking integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        INSERT INTO Scoreboard (user_id, team_id, event_id, schedule_id, score, ranking)
        VALUES (p_user_id, p_team_id, p_event_id, p_schedule_id, p_score, p_ranking);
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can add scoreboard entries';
    END IF;
END;
$$;
 �   DROP PROCEDURE public.pr_admin_add_scoreboard(IN p_user_id integer, IN p_team_id integer, IN p_event_id integer, IN p_schedule_id integer, IN p_score integer, IN p_ranking integer);
       public               postgres    false            �            1255    24618 -   pr_admin_add_team(integer, character varying) 	   PROCEDURE     )  CREATE PROCEDURE public.pr_admin_add_team(IN p_team_id integer, IN p_team_name character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        Insert INTO Team (team_id, team_name)
        VALUES (p_team_id, p_team_name);
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can add a team';
    END IF;
END;
$$;
 a   DROP PROCEDURE public.pr_admin_add_team(IN p_team_id integer, IN p_team_name character varying);
       public               postgres    false                       1255    24619 M   pr_admin_add_useraccount(integer, character varying, text, character varying) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_add_useraccount(IN p_user_id integer, IN p_user_name character varying, IN p_password text, IN p_user_type character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        Insert INTO UserAccount (user_name, password, user_type)
        VALUES (p_use_name, p_password, p_user_type);
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can add the user account';
    END IF;
END;
$$;
 �   DROP PROCEDURE public.pr_admin_add_useraccount(IN p_user_id integer, IN p_user_name character varying, IN p_password text, IN p_user_type character varying);
       public               postgres    false                       1255    24620 !   pr_admin_delete_category(integer) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_category(IN p_category_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        DELETE FROM Category
        WHERE category_id = p_category_id;
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can delete category entries';
    END IF;
END;
$$;
 J   DROP PROCEDURE public.pr_admin_delete_category(IN p_category_id integer);
       public               postgres    false                       1255    24621    pr_admin_delete_events(integer) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_events(IN p_event_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        DELETE FROM Events 
        WHERE event_id = p_event_id;
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can delete event entries';
    END IF;
END;
$$;
 E   DROP PROCEDURE public.pr_admin_delete_events(IN p_event_id integer);
       public               postgres    false                       1255    24622 !   pr_admin_delete_schedule(integer) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_schedule(IN p_schedule_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        DELETE FROM Schedule 
        WHERE schedule_id = p_schedule_id;
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can delete schedule entries';
    END IF;
END;
$$;
 J   DROP PROCEDURE public.pr_admin_delete_schedule(IN p_schedule_id integer);
       public               postgres    false                       1255    24623 #   pr_admin_delete_scoreboard(integer) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_scoreboard(IN p_scoreboard_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        DELETE FROM Scoreboard 
        WHERE scoreboard_id = p_scoreboard_id;
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can delete scoreboard entries';
    END IF;
END;
$$;
 N   DROP PROCEDURE public.pr_admin_delete_scoreboard(IN p_scoreboard_id integer);
       public               postgres    false                       1255    24624 0   pr_admin_delete_team(integer, character varying) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_team(IN p_team_id integer, IN p_team_name character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        DELETE FROM Team 
		WHERE team_id = p_team_id;
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can delete a team';
    END IF;
END;
$$;
 d   DROP PROCEDURE public.pr_admin_delete_team(IN p_team_id integer, IN p_team_name character varying);
       public               postgres    false                       1255    24625 $   pr_admin_delete_useraccount(integer) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_useraccount(IN p_user_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        DELETE FROM UserAccount 
		WHERE user_id = p_user_id;
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can delete an user account';
    END IF;
END;
$$;
 I   DROP PROCEDURE public.pr_admin_delete_useraccount(IN p_user_id integer);
       public               postgres    false                       1255    24626 G   pr_admin_update_category(integer, character varying, character varying) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_update_category(IN p_category_id integer, IN p_category_name character varying, IN p_division character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        UPDATE Category 
		SET category_name = p_category_name, division = p_division
        WHERE category_id = p_category_id;
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can update category entries';
    END IF;
END;
$$;
 �   DROP PROCEDURE public.pr_admin_update_category(IN p_category_id integer, IN p_category_name character varying, IN p_division character varying);
       public               postgres    false                       1255    24627 W   pr_admin_update_events(integer, character varying, character varying, integer, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_update_events(IN p_event_id integer, IN p_event_name character varying, IN p_venue character varying, IN p_team_id integer, IN p_category_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        UPDATE Events 
		SET event_name = p_event_name, venue = p_venue, team_id = p_team_id, category_id = p_category_id
        WHERE event_id = p_event_id;
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can update event entries';
    END IF;
END;
$$;
 �   DROP PROCEDURE public.pr_admin_update_events(IN p_event_id integer, IN p_event_name character varying, IN p_venue character varying, IN p_team_id integer, IN p_category_id integer);
       public               postgres    false                       1255    24628 `   pr_admin_update_schedule(integer, date, time without time zone, time without time zone, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_update_schedule(IN p_schedule_id integer, IN p_date date, IN p_start_time time without time zone, IN p_end_time time without time zone, IN p_event_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        UPDATE Schedule 
		SET date = p_date, start_time = p_start_time, end_time = p_end_time, event_id = p_event_id
        WHERE schedule_id = p_schedule_id;
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can update schedule entries';
    END IF;
END;
$$;
 �   DROP PROCEDURE public.pr_admin_update_schedule(IN p_schedule_id integer, IN p_date date, IN p_start_time time without time zone, IN p_end_time time without time zone, IN p_event_id integer);
       public               postgres    false                        1255    24629 Y   pr_admin_update_scoreboard(integer, integer, integer, integer, integer, integer, integer) 	   PROCEDURE     (  CREATE PROCEDURE public.pr_admin_update_scoreboard(IN p_scoreboard_id integer, IN p_user_id integer, IN p_team_id integer, IN p_event_id integer, IN p_schedule_id integer, IN p_score integer, IN p_ranking integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        UPDATE Scoreboard 
		SET user_id = p_user_id, team_id = p_team_id, event_id = p_event_id, schedule_id = p_schedule_id, score = p_score, ranking = p_ranking
        WHERE scoreboard_id = p_scoreboard_id;
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can update scoreboard entries';
    END IF;
END;
$$;
 �   DROP PROCEDURE public.pr_admin_update_scoreboard(IN p_scoreboard_id integer, IN p_user_id integer, IN p_team_id integer, IN p_event_id integer, IN p_schedule_id integer, IN p_score integer, IN p_ranking integer);
       public               postgres    false            �            1255    24630 0   pr_admin_update_team(integer, character varying) 	   PROCEDURE     .  CREATE PROCEDURE public.pr_admin_update_team(IN p_team_id integer, IN p_team_name character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        UPDATE Team 
        SET team_name = p_team_name
		WHERE team_id = p_team_id;
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can update a team';
    END IF;
END;
$$;
 d   DROP PROCEDURE public.pr_admin_update_team(IN p_team_id integer, IN p_team_name character varying);
       public               postgres    false            !           1255    24631 P   pr_admin_update_useraccount(integer, character varying, text, character varying) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_update_useraccount(IN p_user_id integer, IN p_user_name character varying, IN p_password text, IN p_user_type character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        UPDATE UserAccount
        SET user_name = p_use_name, password = p_password, user_type = p_user_type
		WHERE user_id = p_user_id;
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can update the user account';
    END IF;
END;
$$;
 �   DROP PROCEDURE public.pr_admin_update_useraccount(IN p_user_id integer, IN p_user_name character varying, IN p_password text, IN p_user_type character varying);
       public               postgres    false            "           1255    24632 =   pr_user_update_scoreboard(integer, integer, integer, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_user_update_scoreboard(IN p_user_id integer, IN p_scoreboard_id integer, IN p_score integer, IN p_ranking integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'user' THEN
        UPDATE Scoreboard
        SET score = p_score, ranking = p_ranking
        WHERE scoreboard_id = p_scoreboard_id;
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only users can update the scoreboard';
    END IF;
END;
$$;
 �   DROP PROCEDURE public.pr_user_update_scoreboard(IN p_user_id integer, IN p_scoreboard_id integer, IN p_score integer, IN p_ranking integer);
       public               postgres    false            �            1259    24633    anecedent_schedule    TABLE     A   CREATE TABLE public.anecedent_schedule (
    "exists" boolean
);
 &   DROP TABLE public.anecedent_schedule;
       public         heap r       postgres    false            �            1259    24636    category    TABLE     �   CREATE TABLE public.category (
    category_id integer NOT NULL,
    category_name character varying(50) NOT NULL,
    division character varying(50) NOT NULL
);
    DROP TABLE public.category;
       public         heap r       postgres    false            �            1259    24639    category_category_id_seq    SEQUENCE     �   CREATE SEQUENCE public.category_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.category_category_id_seq;
       public               postgres    false    218            �           0    0    category_category_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.category_category_id_seq OWNED BY public.category.category_id;
          public               postgres    false    219            �            1259    24640    events    TABLE     �   CREATE TABLE public.events (
    event_id integer NOT NULL,
    event_name character varying(50) NOT NULL,
    venue character varying(100) NOT NULL,
    category_id integer NOT NULL
);
    DROP TABLE public.events;
       public         heap r       postgres    false            �            1259    24643    events_category_id_seq    SEQUENCE     �   CREATE SEQUENCE public.events_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.events_category_id_seq;
       public               postgres    false    220            �           0    0    events_category_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.events_category_id_seq OWNED BY public.events.category_id;
          public               postgres    false    221            �            1259    24644    events_event_id_seq    SEQUENCE     �   CREATE SEQUENCE public.events_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.events_event_id_seq;
       public               postgres    false    220            �           0    0    events_event_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.events_event_id_seq OWNED BY public.events.event_id;
          public               postgres    false    222            �            1259    24645    match    TABLE       CREATE TABLE public.match (
    match_id integer NOT NULL,
    schedule_id integer NOT NULL,
    team_a_id integer NOT NULL,
    team_b_id integer NOT NULL,
    score_a integer,
    score_b integer,
    user_assigned_id integer,
    score_updated_at timestamp with time zone
);
    DROP TABLE public.match;
       public         heap r       postgres    false            �            1259    24648    match_match_id_seq    SEQUENCE     �   CREATE SEQUENCE public.match_match_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.match_match_id_seq;
       public               postgres    false    223            �           0    0    match_match_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.match_match_id_seq OWNED BY public.match.match_id;
          public               postgres    false    224            �            1259    24649    schedule    TABLE     �   CREATE TABLE public.schedule (
    schedule_id integer NOT NULL,
    date date,
    start_time time without time zone,
    end_time time without time zone,
    event_id integer NOT NULL
);
    DROP TABLE public.schedule;
       public         heap r       postgres    false            �            1259    24652    schedule_event_id_seq    SEQUENCE     �   CREATE SEQUENCE public.schedule_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.schedule_event_id_seq;
       public               postgres    false    225            �           0    0    schedule_event_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.schedule_event_id_seq OWNED BY public.schedule.event_id;
          public               postgres    false    226            �            1259    24653    schedule_schedule_id_seq    SEQUENCE     �   CREATE SEQUENCE public.schedule_schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.schedule_schedule_id_seq;
       public               postgres    false    225            �           0    0    schedule_schedule_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.schedule_schedule_id_seq OWNED BY public.schedule.schedule_id;
          public               postgres    false    227            �            1259    24654    team    TABLE     �   CREATE TABLE public.team (
    team_id integer NOT NULL,
    team_name character varying(15) NOT NULL,
    team_color character varying(25),
    team_logo character varying,
    team_motto character varying
);
    DROP TABLE public.team;
       public         heap r       postgres    false            �            1259    24659    team_team_id_seq    SEQUENCE     �   CREATE SEQUENCE public.team_team_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.team_team_id_seq;
       public               postgres    false    228            �           0    0    team_team_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.team_team_id_seq OWNED BY public.team.team_id;
          public               postgres    false    229            �            1259    24660    useraccount    TABLE     �   CREATE TABLE public.useraccount (
    user_id integer NOT NULL,
    user_name character varying(15),
    password text,
    user_type character varying(15)
);
    DROP TABLE public.useraccount;
       public         heap r       postgres    false            �            1259    24665    useraccount_user_id_seq    SEQUENCE     �   CREATE SEQUENCE public.useraccount_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.useraccount_user_id_seq;
       public               postgres    false    230            �           0    0    useraccount_user_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.useraccount_user_id_seq OWNED BY public.useraccount.user_id;
          public               postgres    false    231            �            1259    24666 
   vw_matches    VIEW     �  CREATE VIEW public.vw_matches AS
 SELECT m.match_id,
    m.schedule_id,
    m.team_a_id,
    m.team_b_id,
    m.score_a,
    m.score_b,
    ta.team_logo AS team_a_logo,
    tb.team_logo AS team_b_logo,
    ta.team_color AS team_a_color,
    tb.team_color AS team_b_color,
    m.user_assigned_id,
        CASE
            WHEN (m.score_a > m.score_b) THEN ta.team_color
            WHEN (m.score_b > m.score_a) THEN tb.team_color
            ELSE NULL::character varying
        END AS winner_team_color,
        CASE
            WHEN (m.score_a > m.score_b) THEN m.team_a_id
            WHEN (m.score_b > m.score_a) THEN m.team_b_id
            ELSE NULL::integer
        END AS winner_team_id,
    e.event_name,
    c.division,
    ta.team_name AS team_a_name,
    tb.team_name AS team_b_name,
    m.score_updated_at
   FROM (((((public.match m
     LEFT JOIN public.team ta ON ((m.team_a_id = ta.team_id)))
     LEFT JOIN public.team tb ON ((m.team_b_id = tb.team_id)))
     LEFT JOIN public.schedule s ON ((m.schedule_id = s.schedule_id)))
     LEFT JOIN public.events e ON ((s.event_id = e.event_id)))
     LEFT JOIN public.category c ON ((e.category_id = c.category_id)));
    DROP VIEW public.vw_matches;
       public       v       postgres    false    223    223    223    223    223    223    220    220    218    218    220    228    228    228    228    225    225    223    223            �            1259    24671    vw_scoreboard    VIEW     o  CREATE VIEW public.vw_scoreboard AS
 SELECT ev.event_id,
    ev.event_name,
    ev.venue,
    cat.category_name,
    cat.division,
    sch.schedule_id,
    sch.date,
    sch.start_time,
    sch.end_time
   FROM ((public.events ev
     JOIN public.category cat ON ((ev.category_id = cat.category_id)))
     JOIN public.schedule sch ON ((ev.event_id = sch.event_id)));
     DROP VIEW public.vw_scoreboard;
       public       v       postgres    false    220    225    225    225    225    225    220    220    220    218    218    218            �            1259    24675    vw_team_total_scores    VIEW     �  CREATE VIEW public.vw_team_total_scores AS
 SELECT t.team_id,
    t.team_name,
    t.team_logo,
    t.team_color,
    COALESCE(sum(
        CASE
            WHEN (m.team_a_id = t.team_id) THEN m.score_a
            WHEN (m.team_b_id = t.team_id) THEN m.score_b
            ELSE 0
        END), (0)::bigint) AS total_score,
    rank() OVER (ORDER BY COALESCE(sum(
        CASE
            WHEN (m.team_a_id = t.team_id) THEN m.score_a
            WHEN (m.team_b_id = t.team_id) THEN m.score_b
            ELSE 0
        END), (0)::bigint) DESC) AS overall_ranking
   FROM (public.team t
     LEFT JOIN public.match m ON (((t.team_id = m.team_a_id) OR (t.team_id = m.team_b_id))))
  GROUP BY t.team_id, t.team_name, t.team_logo, t.team_color;
 '   DROP VIEW public.vw_team_total_scores;
       public       v       postgres    false    223    223    223    223    228    228    228    228            �           2604    24680    category category_id    DEFAULT     |   ALTER TABLE ONLY public.category ALTER COLUMN category_id SET DEFAULT nextval('public.category_category_id_seq'::regclass);
 C   ALTER TABLE public.category ALTER COLUMN category_id DROP DEFAULT;
       public               postgres    false    219    218            �           2604    24681    events event_id    DEFAULT     r   ALTER TABLE ONLY public.events ALTER COLUMN event_id SET DEFAULT nextval('public.events_event_id_seq'::regclass);
 >   ALTER TABLE public.events ALTER COLUMN event_id DROP DEFAULT;
       public               postgres    false    222    220            �           2604    24682    events category_id    DEFAULT     x   ALTER TABLE ONLY public.events ALTER COLUMN category_id SET DEFAULT nextval('public.events_category_id_seq'::regclass);
 A   ALTER TABLE public.events ALTER COLUMN category_id DROP DEFAULT;
       public               postgres    false    221    220            �           2604    24683    match match_id    DEFAULT     p   ALTER TABLE ONLY public.match ALTER COLUMN match_id SET DEFAULT nextval('public.match_match_id_seq'::regclass);
 =   ALTER TABLE public.match ALTER COLUMN match_id DROP DEFAULT;
       public               postgres    false    224    223            �           2604    24684    schedule schedule_id    DEFAULT     |   ALTER TABLE ONLY public.schedule ALTER COLUMN schedule_id SET DEFAULT nextval('public.schedule_schedule_id_seq'::regclass);
 C   ALTER TABLE public.schedule ALTER COLUMN schedule_id DROP DEFAULT;
       public               postgres    false    227    225            �           2604    24685    schedule event_id    DEFAULT     v   ALTER TABLE ONLY public.schedule ALTER COLUMN event_id SET DEFAULT nextval('public.schedule_event_id_seq'::regclass);
 @   ALTER TABLE public.schedule ALTER COLUMN event_id DROP DEFAULT;
       public               postgres    false    226    225            �           2604    24686    team team_id    DEFAULT     l   ALTER TABLE ONLY public.team ALTER COLUMN team_id SET DEFAULT nextval('public.team_team_id_seq'::regclass);
 ;   ALTER TABLE public.team ALTER COLUMN team_id DROP DEFAULT;
       public               postgres    false    229    228            �           2604    24687    useraccount user_id    DEFAULT     z   ALTER TABLE ONLY public.useraccount ALTER COLUMN user_id SET DEFAULT nextval('public.useraccount_user_id_seq'::regclass);
 B   ALTER TABLE public.useraccount ALTER COLUMN user_id DROP DEFAULT;
       public               postgres    false    231    230            �          0    24633    anecedent_schedule 
   TABLE DATA           6   COPY public.anecedent_schedule ("exists") FROM stdin;
    public               postgres    false    217   �      �          0    24636    category 
   TABLE DATA           H   COPY public.category (category_id, category_name, division) FROM stdin;
    public               postgres    false    218   �      �          0    24640    events 
   TABLE DATA           J   COPY public.events (event_id, event_name, venue, category_id) FROM stdin;
    public               postgres    false    220   ��      �          0    24645    match 
   TABLE DATA           �   COPY public.match (match_id, schedule_id, team_a_id, team_b_id, score_a, score_b, user_assigned_id, score_updated_at) FROM stdin;
    public               postgres    false    223   ��      �          0    24649    schedule 
   TABLE DATA           U   COPY public.schedule (schedule_id, date, start_time, end_time, event_id) FROM stdin;
    public               postgres    false    225   с      �          0    24654    team 
   TABLE DATA           U   COPY public.team (team_id, team_name, team_color, team_logo, team_motto) FROM stdin;
    public               postgres    false    228   :�      �          0    24660    useraccount 
   TABLE DATA           N   COPY public.useraccount (user_id, user_name, password, user_type) FROM stdin;
    public               postgres    false    230   ނ      �           0    0    category_category_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.category_category_id_seq', 22, true);
          public               postgres    false    219            �           0    0    events_category_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.events_category_id_seq', 1, false);
          public               postgres    false    221            �           0    0    events_event_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.events_event_id_seq', 34, true);
          public               postgres    false    222            �           0    0    match_match_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.match_match_id_seq', 47, true);
          public               postgres    false    224            �           0    0    schedule_event_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.schedule_event_id_seq', 1, false);
          public               postgres    false    226            �           0    0    schedule_schedule_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.schedule_schedule_id_seq', 82, true);
          public               postgres    false    227            �           0    0    team_team_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.team_team_id_seq', 15, true);
          public               postgres    false    229            �           0    0    useraccount_user_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.useraccount_user_id_seq', 73, true);
          public               postgres    false    231            �           2606    24689    category category_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (category_id);
 @   ALTER TABLE ONLY public.category DROP CONSTRAINT category_pkey;
       public                 postgres    false    218            �           2606    24691    events events_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (event_id);
 <   ALTER TABLE ONLY public.events DROP CONSTRAINT events_pkey;
       public                 postgres    false    220            �           2606    24693    match match_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_pkey PRIMARY KEY (match_id);
 :   ALTER TABLE ONLY public.match DROP CONSTRAINT match_pkey;
       public                 postgres    false    223            �           2606    24695    schedule schedule_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT schedule_pkey PRIMARY KEY (schedule_id);
 @   ALTER TABLE ONLY public.schedule DROP CONSTRAINT schedule_pkey;
       public                 postgres    false    225            �           2606    24697    team team_pkey 
   CONSTRAINT     Q   ALTER TABLE ONLY public.team
    ADD CONSTRAINT team_pkey PRIMARY KEY (team_id);
 8   ALTER TABLE ONLY public.team DROP CONSTRAINT team_pkey;
       public                 postgres    false    228            �           2606    24699    useraccount useraccount_pkey 
   CONSTRAINT     _   ALTER TABLE ONLY public.useraccount
    ADD CONSTRAINT useraccount_pkey PRIMARY KEY (user_id);
 F   ALTER TABLE ONLY public.useraccount DROP CONSTRAINT useraccount_pkey;
       public                 postgres    false    230            �           1259    24700 
   event_name    INDEX     C   CREATE INDEX event_name ON public.events USING btree (event_name);
    DROP INDEX public.event_name;
       public                 postgres    false    220            �           2606    24701    events category_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.events
    ADD CONSTRAINT category_id FOREIGN KEY (category_id) REFERENCES public.category(category_id) ON DELETE CASCADE;
 <   ALTER TABLE ONLY public.events DROP CONSTRAINT category_id;
       public               postgres    false    4842    220    218            �           2606    24706    schedule event_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT event_id FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE;
 ;   ALTER TABLE ONLY public.schedule DROP CONSTRAINT event_id;
       public               postgres    false    225    220    4845            �           2606    24711    match match_schedule_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.schedule(schedule_id) ON DELETE CASCADE;
 F   ALTER TABLE ONLY public.match DROP CONSTRAINT match_schedule_id_fkey;
       public               postgres    false    225    223    4849            �           2606    24716    match match_team_a_id_fkey    FK CONSTRAINT        ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_team_a_id_fkey FOREIGN KEY (team_a_id) REFERENCES public.team(team_id);
 D   ALTER TABLE ONLY public.match DROP CONSTRAINT match_team_a_id_fkey;
       public               postgres    false    4851    223    228            �           2606    24721    match match_team_b_id_fkey    FK CONSTRAINT        ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_team_b_id_fkey FOREIGN KEY (team_b_id) REFERENCES public.team(team_id);
 D   ALTER TABLE ONLY public.match DROP CONSTRAINT match_team_b_id_fkey;
       public               postgres    false    4851    228    223            �      x�+�*�=... U�      �   �   x�}��
�0Eי�����m)�Q��� �I#m*~�����v;���������QŎh���a*�B�pG����YNazB��H�}����X�b9�S��Y�@�Fe��z�e����6,�X���?�� 9c\�/>C˕��hIS��l�g���:�@\�>      �   �   x����
�0����S�(&�Ԃ�(H]�����4�^}{S�]���3r��)�9��6���@���̔�sՅ�%���9�~b�-�H#:�3ڴ�i�o}�&��M]��zJ�|�u��J�
	b�J@v��(��5m]Ul�y
b�J��F�9_���&x8r>;��asTӏ�/��2F��dR�      �   ?   x�31�47�4�4��!Ss �eb�ia5E5�0 �D5�0�4�d�)PY4F��� �{R      �   Y   x�Mα�PE�vѼQ�Y�-�cBAq�!Bvl8��� !��B#���T�Ҩ!54qhbRh]�&��������q!��T�]U�%�      �   �   x�3�JM�Tvs3 Β��\C���tN��Ԣ�T��� ��X��Z\���a������qr����q��I�F#�������t�м̒�]\�_P����
�=iX�gdjNN~9g%��7�w�WH! PTTj��h�
�=... 	�=�      �   �  x�5�I��P�1��1�tC�&�/ �&�H�J���ZB���R6pϋ�v���lZlK�-Eo�[9��R*���GǠpv��E�rý�����杮�d��=.NO�F4lv�C5��7��<��%
�A������)��
�Q�p��5h��f"�#E+���o��Jؠ1��U�gB�G���a]��P7�@��2b�T��rY#�`�Ka�d�3�=3TUKѪ���'Ir��ћ�J��?OS�������tN�����n�꓎����8o�//�R�v��F��r��<*:�n9M�h�^`�~��{�p	���_4��`O�,�x���Z��=���
�J��}U�\��~EG�9�L��IY�NƷt9��D��"[ouެҕl�����u
����Dۨ4.��9�}!��,�R�sob��9WLL�S|E!L�%�?L���
8�`灍Tf�B?��d�u%�;+`M�������8́?�Ul�\?���2���1�����a��6������)Y����b�7��ִ1j�L���D9���t&�J�#J2{�l]��@��{�>=#�=zUw�@����/u�	�%����	�^:��S_&z䧠�X�NV�ym+��:_1�2!�ޢ{�*_ߴ�NH=�O��C���K]QR�dL�������f�]�&V     