PGDMP      7                }            Intramurals    16.2    16.2 �    p           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            q           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            r           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            s           1262    75408    Intramurals    DATABASE     �   CREATE DATABASE "Intramurals" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE "Intramurals";
                postgres    false                       1255    92031 D   fn_admin_add_category(integer, character varying, character varying)    FUNCTION     	  CREATE FUNCTION public.fn_admin_add_category(p_admin_id integer, p_category_name character varying, p_division character varying) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    category_record JSONB;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
    category_exists BOOLEAN;
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

    SELECT EXISTS (
        SELECT 1 FROM category WHERE LOWER(TRIM(category_name)) = LOWER(TRIM(p_category_name))
    ) INTO category_exists;

    IF category_exists THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'This category already exists!'
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
    WHEN unique_violation THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Unique violation! Category already exists.'
        );
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'An unexpected error occurred: ' || SQLERRM
        );
END;
$$;
 �   DROP FUNCTION public.fn_admin_add_category(p_admin_id integer, p_category_name character varying, p_division character varying);
       public          postgres    false                       1255    92026 S   fn_admin_add_event(integer, character varying, character varying, integer, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_add_event(p_admin_id integer, p_event_name character varying, p_venue character varying, p_team_id integer, p_category_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    event_record JSONB;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
    event_exists BOOLEAN;
BEGIN
    event_record := NULL;
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
            'message', 'Permission Denied: Only admins can add a new team'
        );
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM events WHERE event_id = p_event_id
    ) INTO event_exists;

    IF NOT event_exists THEN
        INSERT INTO events (event_name, venue, team_id, category_id) 
        VALUES (p_event_name, p_venue, p_team_id, p_category_id); 

        SELECT to_jsonb(u)
        INTO event_record
        FROM events e
        WHERE e.event_id = p_event_id;

        IF FOUND THEN
            msg_type := 'success';
            msg_detail := p_event_id || ' New event added successfully!';
        ELSE
            event_record := NULL;
            msg_type := 'error';
            msg_detail := p_event_id || ' Event not found!';
        END IF;
    ELSE
        msg_type := 'error';
        msg_detail := 'This event already exists!';
    END IF;

    RETURN jsonb_build_object(
        'content', event_record,
        'type', msg_type,
        'message', msg_detail
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
 �   DROP FUNCTION public.fn_admin_add_event(p_admin_id integer, p_event_name character varying, p_venue character varying, p_team_id integer, p_category_id integer);
       public          postgres    false                       1255    100310 f   fn_admin_add_schedule(integer, date, time without time zone, time without time zone, integer, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_add_schedule(p_admin_id integer, p_date date, p_start_time time without time zone, p_end_time time without time zone, p_event_id integer, p_category_id integer) RETURNS jsonb
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
    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;
	
    IF user_role IS NULL THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Admin user not found');
    END IF;
	
    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Permission Denied: Only admins can add a schedule');
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
    ) INTO venue_conflict;
    
    IF venue_conflict THEN
        RETURN jsonb_build_object(
            'type', 'error', 
            'message', 'Venue conflict: ' || event_venue || ' is already booked during this time slot'
        );
    END IF;
    
    INSERT INTO schedule (date, start_time, end_time, event_id, category_id)
    VALUES (p_date, p_start_time, p_end_time, p_event_id, p_category_id)
    RETURNING schedule_id INTO new_schedule_id;
    
    RETURN jsonb_build_object(
        'type', 'success', 
        'message', 'Schedule added successfully!', 
        'schedule_id', new_schedule_id
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
       public          postgres    false                       1255    100301 M   fn_admin_add_scoreboard(integer, integer, integer, integer, integer, integer)    FUNCTION     Q  CREATE FUNCTION public.fn_admin_add_scoreboard(p_admin_id integer, p_user_id integer, p_team_id integer, p_event_id integer, p_schedule_id integer, p_category_id integer) RETURNS jsonb
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

    IF NOT EXISTS (SELECT 1 FROM category WHERE category_id = p_category_id) THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Error: Category ID does not exist!'
        );
    END IF;

    INSERT INTO scoreboard (user_id, team_id, event_id, schedule_id, category_id) 
    VALUES (p_user_id, p_team_id, p_event_id, p_schedule_id, p_category_id)
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
 �   DROP FUNCTION public.fn_admin_add_scoreboard(p_admin_id integer, p_user_id integer, p_team_id integer, p_event_id integer, p_schedule_id integer, p_category_id integer);
       public          postgres    false                       1255    100313 @   fn_admin_add_team(integer, character varying, character varying)    FUNCTION     �	  CREATE FUNCTION public.fn_admin_add_team(p_admin_id integer, p_team_name character varying, p_team_color character varying) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    team_record JSONB;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
    team_exists BOOLEAN;
BEGIN
    team_record := NULL;
    msg_detail := '';

    -- Check the role of the user (admin)
    SELECT user_type INTO user_role 
    FROM useraccount 
    WHERE user_id = p_admin_id;

    -- If no user is found
    IF user_role IS NULL THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Admin user not found'
        );
    END IF;

    -- If the user is not an admin
    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Permission Denied: Only admins can add a new team'
        );
    END IF;

    -- Check if the team already exists
    SELECT EXISTS (
        SELECT 1 
        FROM team 
        WHERE team_name = p_team_name
    ) INTO team_exists;

    -- If the team doesn't exist, insert it
    IF NOT team_exists THEN
        INSERT INTO team (team_name, team_color) 
        VALUES (p_team_name, p_team_color); 

        -- Fetch the newly inserted team record
        SELECT to_jsonb(t)
        INTO team_record
        FROM team t
        WHERE t.team_name = p_team_name;

        IF FOUND THEN
            msg_type := 'success';
            msg_detail := p_team_name || ' New team added successfully!';
        ELSE
            team_record := NULL;
            msg_type := 'error';
            msg_detail := p_team_name || ' Team not found!';
        END IF;
    ELSE
        msg_type := 'error';
        msg_detail := 'This team already exists!';
    END IF;

    -- Return the result as a JSON object
    RETURN jsonb_build_object(
        'content', team_record,
        'type', msg_type,
        'message', msg_detail
    );

EXCEPTION
    -- Handle unique violation (team already exists)
    WHEN unique_violation THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Unique violation! Team already exists.'
        );
    -- Handle other exceptions
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'An unexpected error occurred: ' || SQLERRM
        );
END;
$$;
 {   DROP FUNCTION public.fn_admin_add_team(p_admin_id integer, p_team_name character varying, p_team_color character varying);
       public          postgres    false                       1255    92095 N   fn_admin_add_user_account(integer, character varying, text, character varying)    FUNCTION     x  CREATE FUNCTION public.fn_admin_add_user_account(p_admin_id integer, p_user_name character varying, p_password text, p_user_type character varying) RETURNS jsonb
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
            msg_detail := p_user_name || ' User added successfully!';
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
       public          postgres    false                       1255    92032 *   fn_admin_delete_category(integer, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_delete_category(p_admin_id integer, p_category_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    92020 '   fn_admin_delete_event(integer, integer)    FUNCTION     y  CREATE FUNCTION public.fn_admin_delete_event(p_admin_id integer, p_event_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    92012 *   fn_admin_delete_schedule(integer, integer)    FUNCTION     q  CREATE FUNCTION public.fn_admin_delete_schedule(p_admin_id integer, p_schedule_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    92107 ,   fn_admin_delete_scoreboard(integer, integer)    FUNCTION       CREATE FUNCTION public.fn_admin_delete_scoreboard(p_admin_id integer, p_scoreboard_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    92019 &   fn_admin_delete_team(integer, integer)    FUNCTION     `  CREATE FUNCTION public.fn_admin_delete_team(p_admin_id integer, p_team_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    83864 .   fn_admin_delete_user_account(integer, integer)    FUNCTION     W  CREATE FUNCTION public.fn_admin_delete_user_account(p_admin_id integer, p_user_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    83899 P   fn_admin_update_category(integer, integer, character varying, character varying)    FUNCTION     �  CREATE FUNCTION public.fn_admin_update_category(p_admin_id integer, p_category_id integer, p_category_name character varying, p_division character varying) RETURNS jsonb
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
       public          postgres    false                       1255    92097 _   fn_admin_update_event(integer, integer, character varying, character varying, integer, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_update_event(p_admin_id integer, p_event_id integer, p_event_name character varying, p_venue character varying, p_team_id integer, p_category_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
    event_exists BOOLEAN;
BEGIN
    msg_detail := '';

    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;

    IF user_role IS NULL THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Admin user not found');
    END IF;

    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Permission Denied: Only admins can update events');
    END IF;

    SELECT EXISTS (SELECT 1 FROM events WHERE event_id = p_event_id) INTO event_exists;

    IF NOT event_exists THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Event not found');
    END IF;

    UPDATE events 
    SET event_name = p_event_name,
        venue = p_venue,
        team_id = p_team_id,
        category_id = p_category_id
    WHERE event_id = p_event_id;

    msg_type := 'success';
    msg_detail := p_event_name || ' Event updated successfully!';

    RETURN jsonb_build_object('type', msg_type, 'message', msg_detail);

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'An unexpected error occurred: ' || SQLERRM);
END;
$$;
 �   DROP FUNCTION public.fn_admin_update_event(p_admin_id integer, p_event_id integer, p_event_name character varying, p_venue character varying, p_team_id integer, p_category_id integer);
       public          postgres    false                       1255    100312 r   fn_admin_update_schedule(integer, integer, date, time without time zone, time without time zone, integer, integer)    FUNCTION     �	  CREATE FUNCTION public.fn_admin_update_schedule(p_admin_id integer, p_schedule_id integer, p_date date, p_start_time time without time zone, p_end_time time without time zone, p_event_id integer, p_category_id integer) RETURNS jsonb
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
       public          postgres    false                        1255    100314 L   fn_admin_update_team(integer, integer, character varying, character varying)    FUNCTION     D  CREATE FUNCTION public.fn_admin_update_team(p_admin_id integer, p_team_id integer, p_team_name character varying, p_team_color character varying) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
    team_exists BOOLEAN;
BEGIN
    msg_detail := '';

    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;

    IF user_role IS NULL THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Admin user not found');
    END IF;

    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Permission Denied: Only admins can update a team');
    END IF;

    SELECT EXISTS (SELECT 1 FROM team WHERE team_id = p_team_id) INTO team_exists;

    IF NOT team_exists THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Team not found');
    END IF;

    UPDATE team 
    SET team_name = p_team_name, team_color = p_team_color 
    WHERE team_id = p_team_id;

    msg_type := 'success';
    msg_detail := p_team_name || ' Team updated successfully!';

    RETURN jsonb_build_object('type', msg_type, 'message', msg_detail);

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'An unexpected error occurred: ' || SQLERRM);
END;
$$;
 �   DROP FUNCTION public.fn_admin_update_team(p_admin_id integer, p_team_id integer, p_team_name character varying, p_team_color character varying);
       public          postgres    false                       1255    92096 Z   fn_admin_update_user_account(integer, integer, character varying, text, character varying)    FUNCTION     �  CREATE FUNCTION public.fn_admin_update_user_account(p_admin_id integer, p_user_id integer, p_user_name character varying, p_password text, p_user_type character varying) RETURNS jsonb
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
    SET user_name = p_user_name,
        password = p_password,
        user_type = p_user_type
    WHERE user_id = p_user_id;

    msg_type := 'success';
    msg_detail := p_user_name || ' User updated successfully!';

    RETURN jsonb_build_object('type', msg_type, 'message', msg_detail);

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'An unexpected error occurred: ' || SQLERRM);
END;
$$;
 �   DROP FUNCTION public.fn_admin_update_user_account(p_admin_id integer, p_user_id integer, p_user_name character varying, p_password text, p_user_type character varying);
       public          postgres    false                       1255    92056 &   fn_delete_scoreboard(integer, integer)    FUNCTION     r  CREATE FUNCTION public.fn_delete_scoreboard(p_admin_id integer, p_scoreboard_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    92094    fn_login(character varying)    FUNCTION     �  CREATE FUNCTION public.fn_login(p_user_name character varying) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    stored_password TEXT;
	stored_username VARCHAR;
	stored_usertype VARCHAR;
BEGIN
    SELECT password INTO stored_password FROM UserAccount WHERE user_name = p_user_name;
	SELECT user_name INTO stored_username FROM UserAccount WHERE user_name = p_user_name;
	SELECT user_type INTO stored_usertype FROM UserAccount WHERE user_name = p_user_name;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'User not found');
    END IF;

    RETURN jsonb_build_object('password', stored_password, 'user_name',stored_username, 'user_type',stored_usertype);
END;
$$;
 >   DROP FUNCTION public.fn_login(p_user_name character varying);
       public          postgres    false                       1255    92090    fn_update_team_rank()    FUNCTION     �  CREATE FUNCTION public.fn_update_team_rank() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.score IS DISTINCT FROM NEW.score)) THEN
        PERFORM 1 FROM scoreboard WHERE scoreboard_id = NEW.scoreboard_id; -- Prevent infinite recursion
        UPDATE scoreboard AS s
        SET ranking = sub.rank
        FROM (
            SELECT scoreboard_id, 
                   RANK() OVER (PARTITION BY category_id, event_id, schedule_id ORDER BY score DESC) AS rank
            FROM scoreboard
        ) AS sub
        WHERE s.scoreboard_id = sub.scoreboard_id;
    END IF;
    RETURN NEW;
END;
$$;
 ,   DROP FUNCTION public.fn_update_team_rank();
       public          postgres    false                       1255    92088    fn_update_totalscore()    FUNCTION     |   CREATE FUNCTION public.fn_update_totalscore() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN NEW;
END;
$$;
 -   DROP FUNCTION public.fn_update_totalscore();
       public          postgres    false                       1255    92062 4   fn_user_update_scoreboard(integer, integer, integer)    FUNCTION     f  CREATE FUNCTION public.fn_user_update_scoreboard(p_user_id integer, p_scoreboard_id integer, p_score integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
    existing_user_id INTEGER;
BEGIN
    msg_detail := '';

    -- Check if the user exists
    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'User not found');
    END IF;

    IF user_role <> 'user' THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Permission Denied: Only users can update scores');
    END IF;

    -- Check if the scoreboard entry exists
    SELECT user_id INTO existing_user_id FROM scoreboard WHERE scoreboard_id = p_scoreboard_id;

    IF existing_user_id IS NULL THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Scoreboard entry not found');
    END IF;

    -- Check if the user is updating their own score
    IF existing_user_id <> p_user_id THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Permission Denied: You can only update your own score');
    END IF;

    -- Update the score
    UPDATE scoreboard 
    SET score = p_score 
    WHERE scoreboard_id = p_scoreboard_id;

    msg_type := 'success';
    msg_detail := 'Score updated successfully!';

    RETURN jsonb_build_object('type', msg_type, 'message', msg_detail);

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'An unexpected error occurred: ' || SQLERRM);
END;
$$;
 m   DROP FUNCTION public.fn_user_update_scoreboard(p_user_id integer, p_scoreboard_id integer, p_score integer);
       public          postgres    false                       1255    75623 ;   pr_admin_add_category(character varying, character varying) 	   PROCEDURE     T  CREATE PROCEDURE public.pr_admin_add_category(IN p_category_name character varying, IN p_division character varying)
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
       public          postgres    false                       1255    75620 K   pr_admin_add_events(character varying, character varying, integer, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_add_events(IN p_event_name character varying, IN p_venue character varying, IN p_team_id integer, IN p_category_id integer)
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
       public          postgres    false                       1255    75616 T   pr_admin_add_schedule(date, time without time zone, time without time zone, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_add_schedule(IN p_date date, IN p_start_time time without time zone, IN p_end_time time without time zone, IN p_event_id integer)
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
       public          postgres    false            
           1255    75626 !   pr_admin_delete_category(integer) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_category(IN p_category_id integer)
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
       public          postgres    false                       1255    75622    pr_admin_delete_events(integer) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_events(IN p_event_id integer)
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
       public          postgres    false                       1255    75614 #   pr_admin_delete_scoreboard(integer) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_scoreboard(IN p_scoreboard_id integer)
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
       public          postgres    false            	           1255    75625 G   pr_admin_update_category(integer, character varying, character varying) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_update_category(IN p_category_id integer, IN p_category_name character varying, IN p_division character varying)
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
       public          postgres    false                       1255    75621 W   pr_admin_update_events(integer, character varying, character varying, integer, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_update_events(IN p_event_id integer, IN p_event_name character varying, IN p_venue character varying, IN p_team_id integer, IN p_category_id integer)
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
       public          postgres    false                       1255    75618 `   pr_admin_update_schedule(integer, date, time without time zone, time without time zone, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_update_schedule(IN p_schedule_id integer, IN p_date date, IN p_start_time time without time zone, IN p_end_time time without time zone, IN p_event_id integer)
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
       public          postgres    false                        1255    75613 Y   pr_admin_update_scoreboard(integer, integer, integer, integer, integer, integer, integer) 	   PROCEDURE     (  CREATE PROCEDURE public.pr_admin_update_scoreboard(IN p_scoreboard_id integer, IN p_user_id integer, IN p_team_id integer, IN p_event_id integer, IN p_schedule_id integer, IN p_score integer, IN p_ranking integer)
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
       public          postgres    false                       1255    75594 =   pr_user_update_scoreboard(integer, integer, integer, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_user_update_scoreboard(IN p_user_id integer, IN p_scoreboard_id integer, IN p_score integer, IN p_ranking integer)
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
    division character varying(15) NOT NULL
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
       public          postgres    false    218            t           0    0    category_category_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.category_category_id_seq OWNED BY public.category.category_id;
          public          postgres    false    217            �            1259    75472    events    TABLE     �   CREATE TABLE public.events (
    event_id integer NOT NULL,
    event_name character varying(50) NOT NULL,
    venue character varying(100) NOT NULL,
    team_id integer NOT NULL,
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
       public          postgres    false    222            u           0    0    events_category_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.events_category_id_seq OWNED BY public.events.category_id;
          public          postgres    false    221            �            1259    75469    events_event_id_seq    SEQUENCE     �   CREATE SEQUENCE public.events_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.events_event_id_seq;
       public          postgres    false    222            v           0    0    events_event_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.events_event_id_seq OWNED BY public.events.event_id;
          public          postgres    false    219            �            1259    75470    events_team_id_seq    SEQUENCE     �   CREATE SEQUENCE public.events_team_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.events_team_id_seq;
       public          postgres    false    222            w           0    0    events_team_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.events_team_id_seq OWNED BY public.events.team_id;
          public          postgres    false    220            �            1259    75501    schedule    TABLE     �   CREATE TABLE public.schedule (
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
       public          postgres    false    225            x           0    0    schedule_event_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.schedule_event_id_seq OWNED BY public.schedule.event_id;
          public          postgres    false    224            �            1259    75499    schedule_schedule_id_seq    SEQUENCE     �   CREATE SEQUENCE public.schedule_schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.schedule_schedule_id_seq;
       public          postgres    false    225            y           0    0    schedule_schedule_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.schedule_schedule_id_seq OWNED BY public.schedule.schedule_id;
          public          postgres    false    223            �            1259    75557 
   scoreboard    TABLE       CREATE TABLE public.scoreboard (
    scoreboard_id integer NOT NULL,
    score integer,
    ranking integer,
    team_id integer NOT NULL,
    user_id integer NOT NULL,
    event_id integer NOT NULL,
    schedule_id integer NOT NULL,
    category_id integer
);
    DROP TABLE public.scoreboard;
       public         heap    postgres    false            �            1259    75555    scoreboard_event_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scoreboard_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.scoreboard_event_id_seq;
       public          postgres    false    233            z           0    0    scoreboard_event_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.scoreboard_event_id_seq OWNED BY public.scoreboard.event_id;
          public          postgres    false    231            �            1259    75556    scoreboard_schedule_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scoreboard_schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE public.scoreboard_schedule_id_seq;
       public          postgres    false    233            {           0    0    scoreboard_schedule_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE public.scoreboard_schedule_id_seq OWNED BY public.scoreboard.schedule_id;
          public          postgres    false    232            �            1259    75552    scoreboard_scoreboard_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scoreboard_scoreboard_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public.scoreboard_scoreboard_id_seq;
       public          postgres    false    233            |           0    0    scoreboard_scoreboard_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE public.scoreboard_scoreboard_id_seq OWNED BY public.scoreboard.scoreboard_id;
          public          postgres    false    228            �            1259    75553    scoreboard_team_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scoreboard_team_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.scoreboard_team_id_seq;
       public          postgres    false    233            }           0    0    scoreboard_team_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.scoreboard_team_id_seq OWNED BY public.scoreboard.team_id;
          public          postgres    false    229            �            1259    75554    scoreboard_user_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scoreboard_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.scoreboard_user_id_seq;
       public          postgres    false    233            ~           0    0    scoreboard_user_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.scoreboard_user_id_seq OWNED BY public.scoreboard.user_id;
          public          postgres    false    230            �            1259    75424    team    TABLE     �   CREATE TABLE public.team (
    team_id integer NOT NULL,
    team_name character varying(15) NOT NULL,
    team_color character varying(25)
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
       public          postgres    false    216                       0    0    team_team_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.team_team_id_seq OWNED BY public.team.team_id;
          public          postgres    false    215            �            1259    92122    team_total_scores    VIEW     �   CREATE VIEW public.team_total_scores AS
 SELECT team_id,
    COALESCE(sum(score), (0)::bigint) AS total_score
   FROM public.scoreboard
  GROUP BY team_id;
 $   DROP VIEW public.team_total_scores;
       public          postgres    false    233    233            �            1259    75514    useraccount    TABLE     �   CREATE TABLE public.useraccount (
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
       public          postgres    false    227            �           0    0    useraccount_user_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.useraccount_user_id_seq OWNED BY public.useraccount.user_id;
          public          postgres    false    226            �            1259    92151    vw_eventdetails    VIEW     g  CREATE VIEW public.vw_eventdetails AS
 SELECT e.event_id,
    e.event_name,
    e.venue,
    c.category_name,
    c.division,
    t.team_name,
    s.date AS event_date,
    s.start_time,
    s.end_time,
    sb.score,
    sb.ranking,
    ua.user_name AS user_assigned
   FROM (((((public.events e
     JOIN public.category c ON ((e.category_id = c.category_id)))
     JOIN public.team t ON ((e.team_id = t.team_id)))
     JOIN public.schedule s ON ((e.event_id = s.event_id)))
     LEFT JOIN public.scoreboard sb ON ((e.event_id = sb.event_id)))
     LEFT JOIN public.useraccount ua ON ((sb.user_id = ua.user_id)));
 "   DROP VIEW public.vw_eventdetails;
       public          postgres    false    225    225    227    227    225    233    216    216    233    233    218    218    218    222    222    222    222    222    225    233            �           2604    75434    category category_id    DEFAULT     |   ALTER TABLE ONLY public.category ALTER COLUMN category_id SET DEFAULT nextval('public.category_category_id_seq'::regclass);
 C   ALTER TABLE public.category ALTER COLUMN category_id DROP DEFAULT;
       public          postgres    false    217    218    218            �           2604    75475    events event_id    DEFAULT     r   ALTER TABLE ONLY public.events ALTER COLUMN event_id SET DEFAULT nextval('public.events_event_id_seq'::regclass);
 >   ALTER TABLE public.events ALTER COLUMN event_id DROP DEFAULT;
       public          postgres    false    219    222    222            �           2604    75476    events team_id    DEFAULT     p   ALTER TABLE ONLY public.events ALTER COLUMN team_id SET DEFAULT nextval('public.events_team_id_seq'::regclass);
 =   ALTER TABLE public.events ALTER COLUMN team_id DROP DEFAULT;
       public          postgres    false    220    222    222            �           2604    75477    events category_id    DEFAULT     x   ALTER TABLE ONLY public.events ALTER COLUMN category_id SET DEFAULT nextval('public.events_category_id_seq'::regclass);
 A   ALTER TABLE public.events ALTER COLUMN category_id DROP DEFAULT;
       public          postgres    false    221    222    222            �           2604    75504    schedule schedule_id    DEFAULT     |   ALTER TABLE ONLY public.schedule ALTER COLUMN schedule_id SET DEFAULT nextval('public.schedule_schedule_id_seq'::regclass);
 C   ALTER TABLE public.schedule ALTER COLUMN schedule_id DROP DEFAULT;
       public          postgres    false    225    223    225            �           2604    75505    schedule event_id    DEFAULT     v   ALTER TABLE ONLY public.schedule ALTER COLUMN event_id SET DEFAULT nextval('public.schedule_event_id_seq'::regclass);
 @   ALTER TABLE public.schedule ALTER COLUMN event_id DROP DEFAULT;
       public          postgres    false    224    225    225            �           2604    75560    scoreboard scoreboard_id    DEFAULT     �   ALTER TABLE ONLY public.scoreboard ALTER COLUMN scoreboard_id SET DEFAULT nextval('public.scoreboard_scoreboard_id_seq'::regclass);
 G   ALTER TABLE public.scoreboard ALTER COLUMN scoreboard_id DROP DEFAULT;
       public          postgres    false    233    228    233            �           2604    75561    scoreboard team_id    DEFAULT     x   ALTER TABLE ONLY public.scoreboard ALTER COLUMN team_id SET DEFAULT nextval('public.scoreboard_team_id_seq'::regclass);
 A   ALTER TABLE public.scoreboard ALTER COLUMN team_id DROP DEFAULT;
       public          postgres    false    229    233    233            �           2604    75562    scoreboard user_id    DEFAULT     x   ALTER TABLE ONLY public.scoreboard ALTER COLUMN user_id SET DEFAULT nextval('public.scoreboard_user_id_seq'::regclass);
 A   ALTER TABLE public.scoreboard ALTER COLUMN user_id DROP DEFAULT;
       public          postgres    false    230    233    233            �           2604    75563    scoreboard event_id    DEFAULT     z   ALTER TABLE ONLY public.scoreboard ALTER COLUMN event_id SET DEFAULT nextval('public.scoreboard_event_id_seq'::regclass);
 B   ALTER TABLE public.scoreboard ALTER COLUMN event_id DROP DEFAULT;
       public          postgres    false    233    231    233            �           2604    75564    scoreboard schedule_id    DEFAULT     �   ALTER TABLE ONLY public.scoreboard ALTER COLUMN schedule_id SET DEFAULT nextval('public.scoreboard_schedule_id_seq'::regclass);
 E   ALTER TABLE public.scoreboard ALTER COLUMN schedule_id DROP DEFAULT;
       public          postgres    false    232    233    233            �           2604    75427    team team_id    DEFAULT     l   ALTER TABLE ONLY public.team ALTER COLUMN team_id SET DEFAULT nextval('public.team_team_id_seq'::regclass);
 ;   ALTER TABLE public.team ALTER COLUMN team_id DROP DEFAULT;
       public          postgres    false    216    215    216            �           2604    75517    useraccount user_id    DEFAULT     z   ALTER TABLE ONLY public.useraccount ALTER COLUMN user_id SET DEFAULT nextval('public.useraccount_user_id_seq'::regclass);
 B   ALTER TABLE public.useraccount ALTER COLUMN user_id DROP DEFAULT;
       public          postgres    false    226    227    227            m          0    92108    anecedent_schedule 
   TABLE DATA           6   COPY public.anecedent_schedule ("exists") FROM stdin;
    public          postgres    false    234   �Q      ]          0    75431    category 
   TABLE DATA           H   COPY public.category (category_id, category_name, division) FROM stdin;
    public          postgres    false    218   �Q      a          0    75472    events 
   TABLE DATA           S   COPY public.events (event_id, event_name, venue, team_id, category_id) FROM stdin;
    public          postgres    false    222   ^R      d          0    75501    schedule 
   TABLE DATA           b   COPY public.schedule (schedule_id, date, start_time, end_time, event_id, category_id) FROM stdin;
    public          postgres    false    225   �R      l          0    75557 
   scoreboard 
   TABLE DATA           y   COPY public.scoreboard (scoreboard_id, score, ranking, team_id, user_id, event_id, schedule_id, category_id) FROM stdin;
    public          postgres    false    233   CS      [          0    75424    team 
   TABLE DATA           >   COPY public.team (team_id, team_name, team_color) FROM stdin;
    public          postgres    false    216   pS      f          0    75514    useraccount 
   TABLE DATA           N   COPY public.useraccount (user_id, user_name, password, user_type) FROM stdin;
    public          postgres    false    227   �S      �           0    0    category_category_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.category_category_id_seq', 6, true);
          public          postgres    false    217            �           0    0    events_category_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.events_category_id_seq', 1, false);
          public          postgres    false    221            �           0    0    events_event_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.events_event_id_seq', 21, true);
          public          postgres    false    219            �           0    0    events_team_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.events_team_id_seq', 1, false);
          public          postgres    false    220            �           0    0    schedule_event_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.schedule_event_id_seq', 1, false);
          public          postgres    false    224            �           0    0    schedule_schedule_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.schedule_schedule_id_seq', 63, true);
          public          postgres    false    223            �           0    0    scoreboard_event_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.scoreboard_event_id_seq', 1, false);
          public          postgres    false    231            �           0    0    scoreboard_schedule_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.scoreboard_schedule_id_seq', 1, false);
          public          postgres    false    232            �           0    0    scoreboard_scoreboard_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.scoreboard_scoreboard_id_seq', 96, true);
          public          postgres    false    228            �           0    0    scoreboard_team_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.scoreboard_team_id_seq', 1, false);
          public          postgres    false    229            �           0    0    scoreboard_user_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.scoreboard_user_id_seq', 2, true);
          public          postgres    false    230            �           0    0    team_team_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.team_team_id_seq', 12, true);
          public          postgres    false    215            �           0    0    useraccount_user_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.useraccount_user_id_seq', 55, true);
          public          postgres    false    226            �           2606    75436    category category_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (category_id);
 @   ALTER TABLE ONLY public.category DROP CONSTRAINT category_pkey;
       public            postgres    false    218            �           2606    75479    events events_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (event_id);
 <   ALTER TABLE ONLY public.events DROP CONSTRAINT events_pkey;
       public            postgres    false    222            �           2606    75507    schedule schedule_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT schedule_pkey PRIMARY KEY (schedule_id);
 @   ALTER TABLE ONLY public.schedule DROP CONSTRAINT schedule_pkey;
       public            postgres    false    225            �           2606    75566    scoreboard scoreboard_pkey 
   CONSTRAINT     c   ALTER TABLE ONLY public.scoreboard
    ADD CONSTRAINT scoreboard_pkey PRIMARY KEY (scoreboard_id);
 D   ALTER TABLE ONLY public.scoreboard DROP CONSTRAINT scoreboard_pkey;
       public            postgres    false    233            �           2606    75429    team team_pkey 
   CONSTRAINT     Q   ALTER TABLE ONLY public.team
    ADD CONSTRAINT team_pkey PRIMARY KEY (team_id);
 8   ALTER TABLE ONLY public.team DROP CONSTRAINT team_pkey;
       public            postgres    false    216            �           2606    75521    useraccount useraccount_pkey 
   CONSTRAINT     _   ALTER TABLE ONLY public.useraccount
    ADD CONSTRAINT useraccount_pkey PRIMARY KEY (user_id);
 F   ALTER TABLE ONLY public.useraccount DROP CONSTRAINT useraccount_pkey;
       public            postgres    false    227            �           1259    75587 
   event_name    INDEX     C   CREATE INDEX event_name ON public.events USING btree (event_name);
    DROP INDEX public.event_name;
       public            postgres    false    222            �           2620    92091    scoreboard tr_team_rank    TRIGGER     �   CREATE TRIGGER tr_team_rank AFTER INSERT OR UPDATE ON public.scoreboard FOR EACH ROW EXECUTE FUNCTION public.fn_update_team_rank();

ALTER TABLE public.scoreboard DISABLE TRIGGER tr_team_rank;
 0   DROP TRIGGER tr_team_rank ON public.scoreboard;
       public          postgres    false    284    233            �           2620    100307    scoreboard trg_update_team_rank    TRIGGER     �   CREATE TRIGGER trg_update_team_rank AFTER INSERT OR UPDATE ON public.scoreboard FOR EACH ROW EXECUTE FUNCTION public.fn_update_team_rank();
 8   DROP TRIGGER trg_update_team_rank ON public.scoreboard;
       public          postgres    false    284    233            �           2620    92098     scoreboard trg_update_totalscore    TRIGGER     �   CREATE TRIGGER trg_update_totalscore AFTER INSERT OR UPDATE ON public.scoreboard FOR EACH ROW EXECUTE FUNCTION public.fn_update_totalscore();
 9   DROP TRIGGER trg_update_totalscore ON public.scoreboard;
       public          postgres    false    277    233            �           2606    75485    events category_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.events
    ADD CONSTRAINT category_id FOREIGN KEY (category_id) REFERENCES public.category(category_id) ON DELETE CASCADE;
 <   ALTER TABLE ONLY public.events DROP CONSTRAINT category_id;
       public          postgres    false    222    218    4789            �           2606    75508    schedule event_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT event_id FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE;
 ;   ALTER TABLE ONLY public.schedule DROP CONSTRAINT event_id;
       public          postgres    false    4792    222    225            �           2606    92039    scoreboard event_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.scoreboard
    ADD CONSTRAINT event_id FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON UPDATE CASCADE ON DELETE CASCADE;
 =   ALTER TABLE ONLY public.scoreboard DROP CONSTRAINT event_id;
       public          postgres    false    222    4792    233            �           2606    92044    scoreboard schedule_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.scoreboard
    ADD CONSTRAINT schedule_id FOREIGN KEY (schedule_id) REFERENCES public.schedule(schedule_id) ON UPDATE CASCADE ON DELETE CASCADE;
 @   ALTER TABLE ONLY public.scoreboard DROP CONSTRAINT schedule_id;
       public          postgres    false    4794    233    225            �           2606    75480    events team_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.events
    ADD CONSTRAINT team_id FOREIGN KEY (team_id) REFERENCES public.team(team_id) ON DELETE CASCADE;
 8   ALTER TABLE ONLY public.events DROP CONSTRAINT team_id;
       public          postgres    false    216    4787    222            �           2606    92034    scoreboard team_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.scoreboard
    ADD CONSTRAINT team_id FOREIGN KEY (team_id) REFERENCES public.team(team_id) ON UPDATE CASCADE ON DELETE CASCADE;
 <   ALTER TABLE ONLY public.scoreboard DROP CONSTRAINT team_id;
       public          postgres    false    216    233    4787            �           2606    75572    scoreboard user_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.scoreboard
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES public.useraccount(user_id) ON DELETE CASCADE;
 <   ALTER TABLE ONLY public.scoreboard DROP CONSTRAINT user_id;
       public          postgres    false    227    233    4796            m      x�+����� /'      ]   f   x�3�tJ��QpO�M-��M�IUp�,�,����2���,�-�
��''�p����Rs���>�E�
y�
>��09�AF�A��٩%��))@�����t�b���� ͧ-�      a   �   x��K
�0�����'�m.`](
��Lc�`:#M{{k�߃{ɯPFI	W�G��L`0q���3��4GӪ���ɨQ7���T�g��s�4�-�>��3-!a�*�b[Ԣ%v��Uφ���>��"ppt���r0�      d   9   x�33�4202�50�54�44�2 !NC#ÐӔ�̈�"#�"c\��!c��=... �r�      l      x��4�0�4�4�4BC ����� *u+      [   t   x�=ͽ�0���;C<�(+l�G�ۄhI��/��l�;�%�a�ːV�7�p�-/GtAmr�Љ��+�Zg<��f�����q�5k�c��h%ʘ��Q��\\�a�5���o�,�      f     x�]ַ��� �X�9N���Fx���M����w�4;{������(vz&���	����3�����T}�ʄl#H�F�u��C�+�K��Sn����)���i�Z�-9h��"�]�~IW0� �铛]o�Ġ�/U�v����R�GB�|
�h� �)O�6¢�ޠAx����qG
�n�*��z$2�-�j��kc�Ǘ�`Η�����zʊ6��8h�7��TD{�< (��:�;�Ӊ-�:Ĭ�ȃ�,�m��q��S��G�KP���6-�q��É�������%��'�?���\
��~��T`���n�6�S�%u�u�֞�j�T��s1��\v�R8Ͱ�ʚ���޶�y�D&sw����*h�)�gR�=9 6�2AI���T�&`�0R��:ג��k�=|��\($�6{����&i�qף��b�T�,<�АDV�g�)X��zN�@���*<%�)�&�O���&H��8�03�n���b<,��:�he�+�"r��G�Pʙ℈�E�_	��W��`,~���fO�����t<���Y:�f�cz��>�
�2">W���q#^���o�
�.�ELy�JT�vK��)�6��� �6��3^����D!���8��^c<�F	H%�z���VzP{�z��'���5!�,f4i?_��>�������W�ցӌ�%VD����Ht����.����������_�O�z.�(�~�SA�f�t)��ܮ �U[�\A��Ⱦ�R�g����F����{�W��p�{6�����|�Ω�8n����A8�T������@�7�� OD�z�Z�>�=���r��hC2$��(X-}���d� Y�E���࢒�3�Ɇш����F:�e6���\�#�>X*�`����g�+�*��'8�3���s��1�����~����̀�K�ݎ���	@���B��S�P!���e�\�"�e��G�@��R�QA���m- j��q�^A��p�_�r�(@�,?B��R.�Yu��)Ж6�'�.ũ�Α/��G�;@��e�)-�m0h�	�%{�M��|$*R��嘧�F!���y�cqTs�3%�qe�l��Ou�9'2L�}��Z��.��` U`��(q��zl�K�ߔ�H��B�v�Y��f���8��,��;�3��(����d�?��h�jI�&Z�ḍa�)�gl��N����Y��Vv���w�g�Z�r���y"���,�V"&���r?���I�D��G�b�J��������E(k��ƣ��A�d��;i�k.q]fjG��b-o���~��m��8��l��lk{B�^��Yõs���e 땝{��
�-^�%��[���aʹ��呇�0�����N�V��3�p�����C��d�$�*�<{m��6�B,�:��x'6�rЯ�Q1��pHY�˂O�/�w٥�M]+K)ۨC.	B���>TwɃ�E�}b�)���T�����,~C�M���q�s��f?�p��ԋٓ>ޠ���}�O���ι�
�5.(�uP�t&SҞ��Й �'�Jd'��!v�d8�Z�i�4��c���1�aNƟ��zt�Zε�:,�o%�Z��yỞ�ä��������G�SW�J����Ʊ6f�f�͆�)��{X������5�ʢ�`P�O�w�>����`�o9p�Vܣ+�J1GE�%KDb%&�Rd��2������dQ5�f�o�>����gs�a,jZNmh�͒�&�a�bYr�c҅�/�k������!�a�/��'v��(Z�sA;�eR��E��Я"Ef|ob�^��5��_�ï��m��{�Fopڅvw�
�`���v霮]��G��)!��,I�����9�}˾%����^J�T@��R8��l̂n����뽲�n�@�j�I�M���ѯ��'�Ǽ���Rk���1a�����]�ڱ�/W�
�j�u��2[}9��~�G����>e��~�Ӣ3�xj�����a3$CHW<I�z�!cR�=�)���e� ���i^��     