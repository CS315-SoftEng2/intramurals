PGDMP  6                    }            Intramurals    16.2    16.2 q    h           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            i           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            j           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            k           1262    75408    Intramurals    DATABASE     �   CREATE DATABASE "Intramurals" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE "Intramurals";
                postgres    false            !           1255    92031 D   fn_admin_add_category(integer, character varying, character varying)    FUNCTION     �  CREATE FUNCTION public.fn_admin_add_category(p_admin_id integer, p_category_name character varying, p_division character varying) RETURNS jsonb
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
       public          postgres    false                       1255    116698 J   fn_admin_add_event(integer, character varying, character varying, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_add_event(p_admin_id integer, p_event_name character varying, p_venue character varying, p_category_id integer) RETURNS jsonb
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
       public          postgres    false            "           1255    108533 Q   fn_admin_add_match(integer, integer, integer, integer, integer, integer, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_add_match(p_admin_id integer, p_schedule_id integer, p_team_a_id integer, p_team_b_id integer, p_score_a integer DEFAULT NULL::integer, p_score_b integer DEFAULT NULL::integer, p_user_assigned integer DEFAULT NULL::integer) RETURNS jsonb
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
            'message', 'Permission Denied: Only admins can add a match'
        );
    END IF;

    -- Check for existing match
    SELECT EXISTS (
        SELECT 1 FROM match 
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

    -- Insert the new match and construct the match_record directly
    INSERT INTO match (schedule_id, team_a_id, team_b_id, score_a, score_b)
    VALUES (p_schedule_id, p_team_a_id, p_team_b_id, p_score_a, p_score_b)
    RETURNING match_id, 
              jsonb_build_object(
                  'match_id', match_id,
                  'schedule_id', schedule_id,
                  'team_a_id', team_a_id,
                  'team_b_id', team_b_id,
                  'score_a', score_a,
                  'score_b', score_b
              ) INTO new_match_id, match_record;

    -- Set user to assign
    user_to_assign := COALESCE(p_user_assigned, p_admin_id);

    -- Insert scores if provided
    IF p_score_a IS NOT NULL THEN
        INSERT INTO scoreboard (score, team_id, schedule_id, match_id, user_id)
        VALUES (p_score_a, p_team_a_id, p_schedule_id, new_match_id, user_to_assign);
    END IF;

    IF p_score_b IS NOT NULL THEN
        INSERT INTO scoreboard (score, team_id, schedule_id, match_id, user_id)
        VALUES (p_score_b, p_team_b_id, p_schedule_id, new_match_id, user_to_assign);
    END IF;

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
       public          postgres    false                       1255    100310 f   fn_admin_add_schedule(integer, date, time without time zone, time without time zone, integer, integer)    FUNCTION     �
  CREATE FUNCTION public.fn_admin_add_schedule(p_admin_id integer, p_date date, p_start_time time without time zone, p_end_time time without time zone, p_event_id integer, p_category_id integer) RETURNS jsonb
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
    INSERT INTO schedule (date, start_time, end_time, event_id, category_id)
    VALUES (p_date, p_start_time, p_end_time, p_event_id, p_category_id)
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
            'event_id', p_event_id,
            'category_id', p_category_id
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
 �   DROP FUNCTION public.fn_admin_add_schedule(p_admin_id integer, p_date date, p_start_time time without time zone, p_end_time time without time zone, p_event_id integer, p_category_id integer);
       public          postgres    false                       1255    116910 D   fn_admin_add_scoreboard(integer, integer, integer, integer, integer)    FUNCTION       CREATE FUNCTION public.fn_admin_add_scoreboard(p_admin_id integer, p_user_id integer, p_team_id integer, p_event_id integer, p_schedule_id integer) RETURNS jsonb
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
       public          postgres    false                        1255    117149 f   fn_admin_add_team(integer, character varying, character varying, character varying, character varying)    FUNCTION     ;
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
       public          postgres    false            #           1255    92095 N   fn_admin_add_user_account(integer, character varying, text, character varying)    FUNCTION     �  CREATE FUNCTION public.fn_admin_add_user_account(p_admin_id integer, p_user_name character varying, p_password text, p_user_type character varying) RETURNS jsonb
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
       public          postgres    false                       1255    92032 *   fn_admin_delete_category(integer, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_delete_category(p_admin_id integer, p_category_id integer) RETURNS jsonb
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
       public          postgres    false            	           1255    92020 '   fn_admin_delete_event(integer, integer)    FUNCTION     y  CREATE FUNCTION public.fn_admin_delete_event(p_admin_id integer, p_event_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    100426 '   fn_admin_delete_match(integer, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_delete_match(p_admin_id integer, p_match_id integer) RETURNS jsonb
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
       public          postgres    false            
           1255    92012 *   fn_admin_delete_schedule(integer, integer)    FUNCTION     q  CREATE FUNCTION public.fn_admin_delete_schedule(p_admin_id integer, p_schedule_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    92107 ,   fn_admin_delete_scoreboard(integer, integer)    FUNCTION       CREATE FUNCTION public.fn_admin_delete_scoreboard(p_admin_id integer, p_scoreboard_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    92019 &   fn_admin_delete_team(integer, integer)    FUNCTION     `  CREATE FUNCTION public.fn_admin_delete_team(p_admin_id integer, p_team_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    83864 .   fn_admin_delete_user_account(integer, integer)    FUNCTION     W  CREATE FUNCTION public.fn_admin_delete_user_account(p_admin_id integer, p_user_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    83899 P   fn_admin_update_category(integer, integer, character varying, character varying)    FUNCTION     �  CREATE FUNCTION public.fn_admin_update_category(p_admin_id integer, p_category_id integer, p_category_name character varying, p_division character varying) RETURNS jsonb
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
       public          postgres    false                       1255    116700 V   fn_admin_update_event(integer, integer, character varying, character varying, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_update_event(p_admin_id integer, p_event_id integer, p_event_name character varying, p_venue character varying, p_category_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    116701 ]   fn_admin_update_match(integer, integer, integer, integer, integer, integer, integer, integer)    FUNCTION     �
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
       public          postgres    false                       1255    100312 r   fn_admin_update_schedule(integer, integer, date, time without time zone, time without time zone, integer, integer)    FUNCTION     �	  CREATE FUNCTION public.fn_admin_update_schedule(p_admin_id integer, p_schedule_id integer, p_date date, p_start_time time without time zone, p_end_time time without time zone, p_event_id integer, p_category_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
    venue_conflict BOOLEAN;
    event_venue TEXT;
    existing_event_id INTEGER;
BEGIN
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
        event_id = p_event_id,
        category_id = p_category_id
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
 �   DROP FUNCTION public.fn_admin_update_schedule(p_admin_id integer, p_schedule_id integer, p_date date, p_start_time time without time zone, p_end_time time without time zone, p_event_id integer, p_category_id integer);
       public          postgres    false                       1255    116911 Y   fn_admin_update_scoreboard(integer, integer, integer, integer, integer, integer, integer)    FUNCTION     d  CREATE FUNCTION public.fn_admin_update_scoreboard(p_admin_id integer, p_scoreboard_id integer, p_user_id integer, p_team_id integer, p_event_id integer, p_schedule_id integer, p_user_assigned integer) RETURNS jsonb
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
       public          postgres    false                       1255    108526 r   fn_admin_update_team(integer, integer, character varying, character varying, character varying, character varying)    FUNCTION     �  CREATE FUNCTION public.fn_admin_update_team(p_admin_id integer, p_team_id integer, p_team_name character varying, p_team_color character varying, p_team_logo character varying, p_team_motto character varying) RETURNS jsonb
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
       public          postgres    false                       1255    92096 Z   fn_admin_update_user_account(integer, integer, character varying, text, character varying)    FUNCTION     �  CREATE FUNCTION public.fn_admin_update_user_account(p_admin_id integer, p_user_id integer, p_user_name character varying, p_password text, p_user_type character varying) RETURNS jsonb
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
       public          postgres    false                       1255    92056 &   fn_delete_scoreboard(integer, integer)    FUNCTION     r  CREATE FUNCTION public.fn_delete_scoreboard(p_admin_id integer, p_scoreboard_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    108879    fn_login(character varying)    FUNCTION     �  CREATE FUNCTION public.fn_login(p_user_name character varying) RETURNS jsonb
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
       public          postgres    false                       1255    116906    fn_sync_match_to_scoreboard()    FUNCTION       CREATE FUNCTION public.fn_sync_match_to_scoreboard() RETURNS trigger
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
       public          postgres    false                       1255    109032 &   fn_sync_scoreboard_from_match(integer)    FUNCTION       CREATE FUNCTION public.fn_sync_scoreboard_from_match(p_match_id integer) RETURNS void
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
       public          postgres    false                       1255    116908    fn_update_scoreboard_rank()    FUNCTION     �  CREATE FUNCTION public.fn_update_scoreboard_rank() RETURNS trigger
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
       public          postgres    false                       1255    92090    fn_update_team_rank()    FUNCTION     2  CREATE FUNCTION public.fn_update_team_rank() RETURNS trigger
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
       public          postgres    false                       1255    92088    fn_update_totalscore()    FUNCTION     �  CREATE FUNCTION public.fn_update_totalscore() RETURNS trigger
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
       public          postgres    false                       1255    117278 >   fn_user_update_match_score(integer, integer, integer, integer)    FUNCTION     �	  CREATE FUNCTION public.fn_user_update_match_score(p_user_id integer, p_match_id integer, p_score_a integer, p_score_b integer) RETURNS jsonb
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
       public          postgres    false                       1255    75623 ;   pr_admin_add_category(character varying, character varying) 	   PROCEDURE     T  CREATE PROCEDURE public.pr_admin_add_category(IN p_category_name character varying, IN p_division character varying)
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
       public          postgres    false                       1255    75620 K   pr_admin_add_events(character varying, character varying, integer, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_add_events(IN p_event_name character varying, IN p_venue character varying, IN p_team_id integer, IN p_category_id integer)
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
       public          postgres    false            �            1255    75616 T   pr_admin_add_schedule(date, time without time zone, time without time zone, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_add_schedule(IN p_date date, IN p_start_time time without time zone, IN p_end_time time without time zone, IN p_event_id integer)
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
       public          postgres    false            �            1255    75612 M   pr_admin_add_scoreboard(integer, integer, integer, integer, integer, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_add_scoreboard(IN p_user_id integer, IN p_team_id integer, IN p_event_id integer, IN p_schedule_id integer, IN p_score integer, IN p_ranking integer)
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
       public          postgres    false            �            1255    75609 -   pr_admin_add_team(integer, character varying) 	   PROCEDURE     )  CREATE PROCEDURE public.pr_admin_add_team(IN p_team_id integer, IN p_team_name character varying)
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
       public          postgres    false            �            1255    75608 M   pr_admin_add_useraccount(integer, character varying, text, character varying) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_add_useraccount(IN p_user_id integer, IN p_user_name character varying, IN p_password text, IN p_user_type character varying)
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
       public          postgres    false                       1255    75626 !   pr_admin_delete_category(integer) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_category(IN p_category_id integer)
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
       public          postgres    false                       1255    75622    pr_admin_delete_events(integer) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_events(IN p_event_id integer)
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
       public          postgres    false            �            1255    75619 !   pr_admin_delete_schedule(integer) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_schedule(IN p_schedule_id integer)
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
       public          postgres    false            �            1255    75614 #   pr_admin_delete_scoreboard(integer) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_scoreboard(IN p_scoreboard_id integer)
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
       public          postgres    false            �            1255    75611 0   pr_admin_delete_team(integer, character varying) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_team(IN p_team_id integer, IN p_team_name character varying)
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
       public          postgres    false            �            1255    75607 $   pr_admin_delete_useraccount(integer) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_useraccount(IN p_user_id integer)
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
       public          postgres    false                       1255    75625 G   pr_admin_update_category(integer, character varying, character varying) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_update_category(IN p_category_id integer, IN p_category_name character varying, IN p_division character varying)
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
       public          postgres    false                       1255    75621 W   pr_admin_update_events(integer, character varying, character varying, integer, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_update_events(IN p_event_id integer, IN p_event_name character varying, IN p_venue character varying, IN p_team_id integer, IN p_category_id integer)
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
       public          postgres    false                        1255    75618 `   pr_admin_update_schedule(integer, date, time without time zone, time without time zone, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_update_schedule(IN p_schedule_id integer, IN p_date date, IN p_start_time time without time zone, IN p_end_time time without time zone, IN p_event_id integer)
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
       public          postgres    false            �            1255    75613 Y   pr_admin_update_scoreboard(integer, integer, integer, integer, integer, integer, integer) 	   PROCEDURE     (  CREATE PROCEDURE public.pr_admin_update_scoreboard(IN p_scoreboard_id integer, IN p_user_id integer, IN p_team_id integer, IN p_event_id integer, IN p_schedule_id integer, IN p_score integer, IN p_ranking integer)
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
       public          postgres    false            �            1255    75610 0   pr_admin_update_team(integer, character varying) 	   PROCEDURE     .  CREATE PROCEDURE public.pr_admin_update_team(IN p_team_id integer, IN p_team_name character varying)
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
       public          postgres    false            �            1255    75606 P   pr_admin_update_useraccount(integer, character varying, text, character varying) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_update_useraccount(IN p_user_id integer, IN p_user_name character varying, IN p_password text, IN p_user_type character varying)
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
       public          postgres    false            �            1255    75594 =   pr_user_update_scoreboard(integer, integer, integer, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_user_update_scoreboard(IN p_user_id integer, IN p_scoreboard_id integer, IN p_score integer, IN p_ranking integer)
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
       public          postgres    false            �            1259    92108    anecedent_schedule    TABLE     A   CREATE TABLE public.anecedent_schedule (
    "exists" boolean
);
 &   DROP TABLE public.anecedent_schedule;
       public         heap    postgres    false            �            1259    75431    category    TABLE     �   CREATE TABLE public.category (
    category_id integer NOT NULL,
    category_name character varying(50) NOT NULL,
    division character varying(50) NOT NULL
);
    DROP TABLE public.category;
       public         heap    postgres    false            �            1259    75430    category_category_id_seq    SEQUENCE     �   CREATE SEQUENCE public.category_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.category_category_id_seq;
       public          postgres    false    218            l           0    0    category_category_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.category_category_id_seq OWNED BY public.category.category_id;
          public          postgres    false    217            �            1259    75472    events    TABLE     �   CREATE TABLE public.events (
    event_id integer NOT NULL,
    event_name character varying(50) NOT NULL,
    venue character varying(100) NOT NULL,
    category_id integer NOT NULL
);
    DROP TABLE public.events;
       public         heap    postgres    false            �            1259    75471    events_category_id_seq    SEQUENCE     �   CREATE SEQUENCE public.events_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.events_category_id_seq;
       public          postgres    false    221            m           0    0    events_category_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.events_category_id_seq OWNED BY public.events.category_id;
          public          postgres    false    220            �            1259    75469    events_event_id_seq    SEQUENCE     �   CREATE SEQUENCE public.events_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.events_event_id_seq;
       public          postgres    false    221            n           0    0    events_event_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.events_event_id_seq OWNED BY public.events.event_id;
          public          postgres    false    219            �            1259    100403    match    TABLE       CREATE TABLE public.match (
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
       public         heap    postgres    false            �            1259    100402    match_match_id_seq    SEQUENCE     �   CREATE SEQUENCE public.match_match_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.match_match_id_seq;
       public          postgres    false    229            o           0    0    match_match_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.match_match_id_seq OWNED BY public.match.match_id;
          public          postgres    false    228            �            1259    75501    schedule    TABLE     �   CREATE TABLE public.schedule (
    schedule_id integer NOT NULL,
    date date,
    start_time time without time zone,
    end_time time without time zone,
    event_id integer NOT NULL,
    category_id integer
);
    DROP TABLE public.schedule;
       public         heap    postgres    false            �            1259    75500    schedule_event_id_seq    SEQUENCE     �   CREATE SEQUENCE public.schedule_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.schedule_event_id_seq;
       public          postgres    false    224            p           0    0    schedule_event_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.schedule_event_id_seq OWNED BY public.schedule.event_id;
          public          postgres    false    223            �            1259    75499    schedule_schedule_id_seq    SEQUENCE     �   CREATE SEQUENCE public.schedule_schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.schedule_schedule_id_seq;
       public          postgres    false    224            q           0    0    schedule_schedule_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.schedule_schedule_id_seq OWNED BY public.schedule.schedule_id;
          public          postgres    false    222            �            1259    75424    team    TABLE     �   CREATE TABLE public.team (
    team_id integer NOT NULL,
    team_name character varying(15) NOT NULL,
    team_color character varying(25),
    team_logo character varying,
    team_motto character varying
);
    DROP TABLE public.team;
       public         heap    postgres    false            �            1259    75423    team_team_id_seq    SEQUENCE     �   CREATE SEQUENCE public.team_team_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.team_team_id_seq;
       public          postgres    false    216            r           0    0    team_team_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.team_team_id_seq OWNED BY public.team.team_id;
          public          postgres    false    215            �            1259    75514    useraccount    TABLE     �   CREATE TABLE public.useraccount (
    user_id integer NOT NULL,
    user_name character varying(15),
    password text,
    user_type character varying(15)
);
    DROP TABLE public.useraccount;
       public         heap    postgres    false            �            1259    75513    useraccount_user_id_seq    SEQUENCE     �   CREATE SEQUENCE public.useraccount_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.useraccount_user_id_seq;
       public          postgres    false    226            s           0    0    useraccount_user_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.useraccount_user_id_seq OWNED BY public.useraccount.user_id;
          public          postgres    false    225            �            1259    117273 
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
       public          postgres    false    216    216    218    218    216    216    229    229    229    229    229    229    229    229    224    224    221    221    221            �            1259    117140    vw_scoreboard    VIEW     o  CREATE VIEW public.vw_scoreboard AS
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
       public          postgres    false    224    224    224    224    224    221    221    221    221    218    218    218            �            1259    109033    vw_team_total_scores    VIEW     �  CREATE VIEW public.vw_team_total_scores AS
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
       public          postgres    false    216    229    229    229    229    216    216    216            �           2604    100349    category category_id    DEFAULT     |   ALTER TABLE ONLY public.category ALTER COLUMN category_id SET DEFAULT nextval('public.category_category_id_seq'::regclass);
 C   ALTER TABLE public.category ALTER COLUMN category_id DROP DEFAULT;
       public          postgres    false    217    218    218            �           2604    100350    events event_id    DEFAULT     r   ALTER TABLE ONLY public.events ALTER COLUMN event_id SET DEFAULT nextval('public.events_event_id_seq'::regclass);
 >   ALTER TABLE public.events ALTER COLUMN event_id DROP DEFAULT;
       public          postgres    false    221    219    221            �           2604    100352    events category_id    DEFAULT     x   ALTER TABLE ONLY public.events ALTER COLUMN category_id SET DEFAULT nextval('public.events_category_id_seq'::regclass);
 A   ALTER TABLE public.events ALTER COLUMN category_id DROP DEFAULT;
       public          postgres    false    220    221    221            �           2604    100406    match match_id    DEFAULT     p   ALTER TABLE ONLY public.match ALTER COLUMN match_id SET DEFAULT nextval('public.match_match_id_seq'::regclass);
 =   ALTER TABLE public.match ALTER COLUMN match_id DROP DEFAULT;
       public          postgres    false    228    229    229            �           2604    100353    schedule schedule_id    DEFAULT     |   ALTER TABLE ONLY public.schedule ALTER COLUMN schedule_id SET DEFAULT nextval('public.schedule_schedule_id_seq'::regclass);
 C   ALTER TABLE public.schedule ALTER COLUMN schedule_id DROP DEFAULT;
       public          postgres    false    224    222    224            �           2604    100354    schedule event_id    DEFAULT     v   ALTER TABLE ONLY public.schedule ALTER COLUMN event_id SET DEFAULT nextval('public.schedule_event_id_seq'::regclass);
 @   ALTER TABLE public.schedule ALTER COLUMN event_id DROP DEFAULT;
       public          postgres    false    224    223    224            �           2604    100360    team team_id    DEFAULT     l   ALTER TABLE ONLY public.team ALTER COLUMN team_id SET DEFAULT nextval('public.team_team_id_seq'::regclass);
 ;   ALTER TABLE public.team ALTER COLUMN team_id DROP DEFAULT;
       public          postgres    false    216    215    216            �           2604    100361    useraccount user_id    DEFAULT     z   ALTER TABLE ONLY public.useraccount ALTER COLUMN user_id SET DEFAULT nextval('public.useraccount_user_id_seq'::regclass);
 B   ALTER TABLE public.useraccount ALTER COLUMN user_id DROP DEFAULT;
       public          postgres    false    226    225    226            c          0    92108    anecedent_schedule 
   TABLE DATA           6   COPY public.anecedent_schedule ("exists") FROM stdin;
    public          postgres    false    227   e�      Z          0    75431    category 
   TABLE DATA           H   COPY public.category (category_id, category_name, division) FROM stdin;
    public          postgres    false    218   ��      ]          0    75472    events 
   TABLE DATA           J   COPY public.events (event_id, event_name, venue, category_id) FROM stdin;
    public          postgres    false    221   �      e          0    100403    match 
   TABLE DATA           �   COPY public.match (match_id, schedule_id, team_a_id, team_b_id, score_a, score_b, user_assigned_id, score_updated_at) FROM stdin;
    public          postgres    false    229   ��      `          0    75501    schedule 
   TABLE DATA           b   COPY public.schedule (schedule_id, date, start_time, end_time, event_id, category_id) FROM stdin;
    public          postgres    false    224   G�      X          0    75424    team 
   TABLE DATA           U   COPY public.team (team_id, team_name, team_color, team_logo, team_motto) FROM stdin;
    public          postgres    false    216   т      b          0    75514    useraccount 
   TABLE DATA           N   COPY public.useraccount (user_id, user_name, password, user_type) FROM stdin;
    public          postgres    false    226   u�      t           0    0    category_category_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.category_category_id_seq', 10, true);
          public          postgres    false    217            u           0    0    events_category_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.events_category_id_seq', 1, false);
          public          postgres    false    220            v           0    0    events_event_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.events_event_id_seq', 26, true);
          public          postgres    false    219            w           0    0    match_match_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.match_match_id_seq', 10, true);
          public          postgres    false    228            x           0    0    schedule_event_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.schedule_event_id_seq', 1, false);
          public          postgres    false    223            y           0    0    schedule_schedule_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.schedule_schedule_id_seq', 75, true);
          public          postgres    false    222            z           0    0    team_team_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.team_team_id_seq', 15, true);
          public          postgres    false    215            {           0    0    useraccount_user_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.useraccount_user_id_seq', 72, true);
          public          postgres    false    225            �           2606    75436    category category_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (category_id);
 @   ALTER TABLE ONLY public.category DROP CONSTRAINT category_pkey;
       public            postgres    false    218            �           2606    75479    events events_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (event_id);
 <   ALTER TABLE ONLY public.events DROP CONSTRAINT events_pkey;
       public            postgres    false    221            �           2606    100408    match match_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_pkey PRIMARY KEY (match_id);
 :   ALTER TABLE ONLY public.match DROP CONSTRAINT match_pkey;
       public            postgres    false    229            �           2606    75507    schedule schedule_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT schedule_pkey PRIMARY KEY (schedule_id);
 @   ALTER TABLE ONLY public.schedule DROP CONSTRAINT schedule_pkey;
       public            postgres    false    224            �           2606    75429    team team_pkey 
   CONSTRAINT     Q   ALTER TABLE ONLY public.team
    ADD CONSTRAINT team_pkey PRIMARY KEY (team_id);
 8   ALTER TABLE ONLY public.team DROP CONSTRAINT team_pkey;
       public            postgres    false    216            �           2606    75521    useraccount useraccount_pkey 
   CONSTRAINT     _   ALTER TABLE ONLY public.useraccount
    ADD CONSTRAINT useraccount_pkey PRIMARY KEY (user_id);
 F   ALTER TABLE ONLY public.useraccount DROP CONSTRAINT useraccount_pkey;
       public            postgres    false    226            �           1259    75587 
   event_name    INDEX     C   CREATE INDEX event_name ON public.events USING btree (event_name);
    DROP INDEX public.event_name;
       public            postgres    false    221            �           2606    75485    events category_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.events
    ADD CONSTRAINT category_id FOREIGN KEY (category_id) REFERENCES public.category(category_id) ON DELETE CASCADE;
 <   ALTER TABLE ONLY public.events DROP CONSTRAINT category_id;
       public          postgres    false    218    4790    221            �           2606    75508    schedule event_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT event_id FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE;
 ;   ALTER TABLE ONLY public.schedule DROP CONSTRAINT event_id;
       public          postgres    false    224    4793    221            �           2606    100409    match match_schedule_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.schedule(schedule_id) ON DELETE CASCADE;
 F   ALTER TABLE ONLY public.match DROP CONSTRAINT match_schedule_id_fkey;
       public          postgres    false    4795    229    224            �           2606    100414    match match_team_a_id_fkey    FK CONSTRAINT        ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_team_a_id_fkey FOREIGN KEY (team_a_id) REFERENCES public.team(team_id);
 D   ALTER TABLE ONLY public.match DROP CONSTRAINT match_team_a_id_fkey;
       public          postgres    false    216    4788    229            �           2606    100419    match match_team_b_id_fkey    FK CONSTRAINT        ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_team_b_id_fkey FOREIGN KEY (team_b_id) REFERENCES public.team(team_id);
 D   ALTER TABLE ONLY public.match DROP CONSTRAINT match_team_b_id_fkey;
       public          postgres    false    229    216    4788            c      x�+�*�=... U�      Z   �   x�]ͻ
�@��z�)�������R�l�8��lr��-L ����O'6�3G���&T�W;��s�$&���}���k6��9n'3�A�֩yQ�fo��Ô���Az<­��C�T�	�U�Y��D�,dR      ]   {   x�E�A
�@�ur�\@���R�n�t�Mŉ�������D<��}�����a��1�
E��{�������<�&5�ۣP丠TU��g�5��g?Z�Th�!L�U}���2�y�0g�7�*4      e   �   x�m��1߸��Gg-`�vW��_G �DJ"x��ew�;91@�Ȃb'�)qo�������Aa�`�������\�ET
�i;y"����k�An���~_M��u���Y�X�tN呅F��
4�/���3��z�wo�=�:-�      `   z   x�m�A�0��W,6P���u'N�J{�È���Z�V4H�"ҳ˽8A�����Fz�1�$��[e���R}��8l@V�$�c��mB��c��'{�!\�z���6���\o}1�t�4a      X   �   x�3�JM�Tvs3 Β��\C���tN��Ԣ�T��� ��X��Z\���a������qr����q��I�F#�������t�м̒�]\�_P����
�=iX�gdjNN~9g%��7�w�WH! PTTj��h�
�=... 	�=�      b   4	  x�]�G��H �q�u�1ވ!��ޜ����ZB���gBVUo�����mq�v���7����j,��� H� �2��S��o*�,���� �YX>w�c����C=t���'<���;�l�N��p'��E.�?���$f�s/L���#�u�o����6�}'���2�
G��qi�L�g�R!Z�JR�<t:ӷJŅr3���ۻ|�y��Am#�IR"�.{+��ȉ7��)$�(��>�՜��H���RxR��B�MRȺޚ 9�����aT�o-v�E�^�����zD��,�J9�1"�*�ǁa��Q�`(~��S��R�>��t<�S�Iإ��Ԡ�}2���px��G���N��� 'T�i��絧7�J_�r��d�R@n��� �2>�w<[Y�9�Dp���8�'T���r����_��r�b��@j�8�f8ysYy�GȥE���`���}���{��B���4c&��e 0P7��Dנ�1��e�zFao�qZ�a�����o�>��j5�"\7�����j��;��A�l�-k@?���x`ā���Y�n\%�é��l$�Yb/�Qѩ�8n�j��A8���v��� �O�'D^���b���m����uD�����ɐc�P�Xj��g-� Y����_�E�ΞM�2��ᎋ�̞���_'͈V�FIU��^��:�q�<��ઠﶟ�$��r]�+���u�V�s�
zdO�����'OV������@������e��Hҥ��a�mT��'�y�TC�2pk�ʈ1�ǃ ��o�r�(}�7���Z�K�Xe��@��<AC�S��">�'�Yg��ǗuRJH��IaLh����m"M�;/\")�X�y�A�*ā��s�"�C|6�j
~ʡD0���5�o�[�@�eʉ|_�]�ٙ��y6i�G��!a_|R�����ZHT�8�y��s}����J<���F
�`��*+h�o
�?��������ņh�\�P�#9��bK^����e�E�$ �h�uE@砈�ה?W��.�Rqk�k^f�5��������~�[׳y��\�@��f�5��]�-m��@��1-�0�Y�6�Y�^���]M�g��2�����F
n��'���S���B�Q�[��##��%��
Lf��"Le�K�@m���\yƧD}�����ws�n��P�"�ZЖ{5sૐ�=�e���Q���ݑ�8�լ?��7��$cdg��a?�ʍ��-�:w����~I"�{#�g��]����ѧq��"�%��*
��iڝ�Ϊ�v�.U��KJ�~7	!d4u���Mў�@�hf�+����b9='^�Bq��剫���n�@�l�I���7�G�f�OT�4���Ri�������Y���|����d�.���⋑xZ����1Oo��}B$O���%yO[��	!�+ޒ�V�ѐ�^B��D���~�N|q����A��j�^3�s�KP �A�ޮ�ڄ��2k��5_��
@	r��G��i�f��:ޕMa��Q��5r�lvxѭ����%��"Κ��qzS�,��
��v�B&ed�ږ(��<y\3����\I��)q��F���?���V.;S��[�8��}�yxyw_�U�)��U�>�03�nfX��yΏ�K����%F�?[��;�T�X<^	3!B��Z^��H���\�hL4ㆢf�����:�m?�^./���!��{�n���G��i���n+�M7���N��k[��$iL�L�"�<�@8kD~�Wx|� ^_�1�r�vH�i�j�\H�6O@'�Z �䂆���ٓx(���ku/��*�5fѹ!�!X��.�W3��o>5��0D�7.#��1�y��Na_B�.u��<� ��V��_ӱ���hrj詁����t-T���Px�T)'���e���ml�pdj����H-��Qzjة�oY��;<2��H~ų��õ�oi+ݩ+ۻ�)�� �h�8��N�ihV'���nkZ�9��.l�M�ms��eT�#b����=��:O���S#~R�U5u]������
�3VA��h��a����+(Z�mqj�1��\1!��#��&�}�MD��}��i�DW���:#L]�a��S#O�rjo5
ת%��W���N[ �0�Per�ʣ2�3)u����7cr��w�4��p1�%X�-��!!�A�V����D/�����,�����>��K�]	�tWG�_��(X��P  ��ug�� �5�)R	�oY��<���1�H�N������K�����`�Cp�`H�\��1�6nӫ����M�Jt�?��_����x�     