PGDMP              	        }            Intramurals    16.2    16.2 �    k           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            l           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            m           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            n           1262    75408    Intramurals    DATABASE     �   CREATE DATABASE "Intramurals" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE "Intramurals";
                postgres    false                       1255    92031 D   fn_admin_add_category(integer, character varying, character varying)    FUNCTION     	  CREATE FUNCTION public.fn_admin_add_category(p_admin_id integer, p_category_name character varying, p_division character varying) RETURNS jsonb
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
       public          postgres    false                       1255    92026 S   fn_admin_add_event(integer, character varying, character varying, integer, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_add_event(p_admin_id integer, p_event_name character varying, p_venue character varying, p_team_id integer, p_category_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    92010 ]   fn_admin_add_schedule(integer, date, time without time zone, time without time zone, integer)    FUNCTION     �
  CREATE FUNCTION public.fn_admin_add_schedule(p_admin_id integer, p_date date, p_start_time time without time zone, p_end_time time without time zone, p_event_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    schedule_record JSONB;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
    schedule_exists BOOLEAN;
    new_schedule_id INTEGER;
BEGIN
    schedule_record := NULL;
    msg_detail := '';

    -- Check if admin exists and has correct permissions
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
            'message', 'Permission Denied: Only admins can add a new schedule'
        );
    END IF;

    -- Check if a schedule already exists for the same event at the same time
    SELECT EXISTS (
        SELECT 1 FROM schedule 
        WHERE date = p_date 
        AND event_id = p_event_id
        AND start_time = p_start_time
        AND end_time = p_end_time
    ) INTO schedule_exists;

    IF NOT schedule_exists THEN
        -- Insert new schedule and return the generated schedule_id
        INSERT INTO schedule (date, start_time, end_time, event_id) 
        VALUES (p_date, p_start_time, p_end_time, p_event_id) 
        RETURNING schedule_id INTO new_schedule_id;

        -- Retrieve the inserted schedule
        SELECT to_jsonb(s) 
        INTO schedule_record
        FROM schedule s
        WHERE s.schedule_id = new_schedule_id;

        IF FOUND THEN
            msg_type := 'success';
            msg_detail := 'New schedule added successfully!';
        ELSE
            schedule_record := NULL;
            msg_type := 'error';
            msg_detail := 'Schedule not found after insertion!';
        END IF;
    ELSE
        msg_type := 'error';
        msg_detail := 'This schedule already exists!';
    END IF;

    RETURN jsonb_build_object(
        'content', schedule_record,
        'type', msg_type,
        'message', msg_detail
    );

EXCEPTION
    WHEN unique_violation THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'Unique violation! Schedule already exists.'
        );
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'content', NULL,
            'type', 'error',
            'message', 'An unexpected error occurred: ' || SQLERRM
        );
END;
$$;
 �   DROP FUNCTION public.fn_admin_add_schedule(p_admin_id integer, p_date date, p_start_time time without time zone, p_end_time time without time zone, p_event_id integer);
       public          postgres    false                       1255    92100 D   fn_admin_add_scoreboard(integer, integer, integer, integer, integer)    FUNCTION       CREATE FUNCTION public.fn_admin_add_scoreboard(p_admin_id integer, p_user_id integer, p_team_id integer, p_event_id integer, p_schedule_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    83901 -   fn_admin_add_team(integer, character varying)    FUNCTION       CREATE FUNCTION public.fn_admin_add_team(p_admin_id integer, p_team_name character varying) RETURNS jsonb
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
        SELECT 1 FROM team WHERE team_name = p_team_name
    ) INTO team_exists;

    IF NOT team_exists THEN
        INSERT INTO team (team_name) 
        VALUES (p_team_name); 

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
 [   DROP FUNCTION public.fn_admin_add_team(p_admin_id integer, p_team_name character varying);
       public          postgres    false                       1255    92095 N   fn_admin_add_user_account(integer, character varying, text, character varying)    FUNCTION     x  CREATE FUNCTION public.fn_admin_add_user_account(p_admin_id integer, p_user_name character varying, p_password text, p_user_type character varying) RETURNS jsonb
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
       public          postgres    false                       1255    92032 *   fn_admin_delete_category(integer, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_delete_category(p_admin_id integer, p_category_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    92020 '   fn_admin_delete_event(integer, integer)    FUNCTION     y  CREATE FUNCTION public.fn_admin_delete_event(p_admin_id integer, p_event_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    92012 *   fn_admin_delete_schedule(integer, integer)    FUNCTION     q  CREATE FUNCTION public.fn_admin_delete_schedule(p_admin_id integer, p_schedule_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    92107 ,   fn_admin_delete_scoreboard(integer, integer)    FUNCTION       CREATE FUNCTION public.fn_admin_delete_scoreboard(p_admin_id integer, p_scoreboard_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    92019 &   fn_admin_delete_team(integer, integer)    FUNCTION     `  CREATE FUNCTION public.fn_admin_delete_team(p_admin_id integer, p_team_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    83899 P   fn_admin_update_category(integer, integer, character varying, character varying)    FUNCTION     �  CREATE FUNCTION public.fn_admin_update_category(p_admin_id integer, p_category_id integer, p_category_name character varying, p_division character varying) RETURNS jsonb
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
       public          postgres    false                       1255    92097 _   fn_admin_update_event(integer, integer, character varying, character varying, integer, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_update_event(p_admin_id integer, p_event_id integer, p_event_name character varying, p_venue character varying, p_team_id integer, p_category_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    92011 i   fn_admin_update_schedule(integer, integer, date, time without time zone, time without time zone, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_update_schedule(p_admin_id integer, p_schedule_id integer, p_date date, p_start_time time without time zone, p_end_time time without time zone, p_event_id integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
    schedule_exists BOOLEAN;
    row_count INT;
BEGIN
    msg_detail := '';

    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_admin_id;
    IF user_role IS NULL THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Admin user not found');
    END IF;
    IF user_role <> 'admin' THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Permission Denied: Only admins can update a schedule');
    END IF;

    SELECT EXISTS (SELECT 1 FROM schedule WHERE schedule_id = p_schedule_id) INTO schedule_exists;
    IF NOT schedule_exists THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Schedule not found');
    END IF;

    UPDATE schedule 
    SET date = p_date, 
        start_time = p_start_time, 
        end_time = p_end_time, 
        event_id = p_event_id
    WHERE schedule_id = p_schedule_id;

    GET DIAGNOSTICS row_count = ROW_COUNT;
    IF row_count = 0 THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'No schedule was updated. Check if the input values are correct.');
    END IF;

    msg_type := 'success';
    msg_detail := 'Schedule updated successfully!';

    RETURN jsonb_build_object('type', msg_type, 'message', msg_detail);

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'An unexpected error occurred: ' || SQLERRM);
END;
$$;
 �   DROP FUNCTION public.fn_admin_update_schedule(p_admin_id integer, p_schedule_id integer, p_date date, p_start_time time without time zone, p_end_time time without time zone, p_event_id integer);
       public          postgres    false                       1255    83895 9   fn_admin_update_team(integer, integer, character varying)    FUNCTION     	  CREATE FUNCTION public.fn_admin_update_team(p_admin_id integer, p_team_id integer, p_team_name character varying) RETURNS jsonb
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

    IF NOT user_exists THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Team not found');
    END IF;

    UPDATE team 
    SET team_name = p_team_name 
    WHERE team_id = p_team_id;

    msg_type := 'success';
    msg_detail := p_team_name || ' Team updated successfully!';

    RETURN jsonb_build_object('type', msg_type, 'message', msg_detail);

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'An unexpected error occurred: ' || SQLERRM);
END;
$$;
 q   DROP FUNCTION public.fn_admin_update_team(p_admin_id integer, p_team_id integer, p_team_name character varying);
       public          postgres    false                       1255    92096 Z   fn_admin_update_user_account(integer, integer, character varying, text, character varying)    FUNCTION     �  CREATE FUNCTION public.fn_admin_update_user_account(p_admin_id integer, p_user_id integer, p_user_name character varying, p_password text, p_user_type character varying) RETURNS jsonb
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
       public          postgres    false                       1255    92056 &   fn_delete_scoreboard(integer, integer)    FUNCTION     r  CREATE FUNCTION public.fn_delete_scoreboard(p_admin_id integer, p_scoreboard_id integer) RETURNS jsonb
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
       public          postgres    false                       1255    92094    fn_login(character varying)    FUNCTION     �  CREATE FUNCTION public.fn_login(p_user_name character varying) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    stored_password TEXT;
BEGIN
    SELECT password INTO stored_password FROM UserAccount WHERE user_name = p_user_name;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'User not found');
    END IF;

    RETURN jsonb_build_object('password', stored_password);
END;
$$;
 >   DROP FUNCTION public.fn_login(p_user_name character varying);
       public          postgres    false            
           1255    92090    fn_update_team_rank()    FUNCTION     �  CREATE FUNCTION public.fn_update_team_rank() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.ranking = OLD.ranking THEN
        RETURN NEW; 
    END IF;

    UPDATE scoreboard
    SET ranking = sub.rank
    FROM (
        SELECT team_id, RANK() OVER (ORDER BY COALESCE(SUM(score), 0) DESC) AS rank
        FROM scoreboard
        GROUP BY team_id
    ) AS sub
    WHERE scoreboard.team_id = sub.team_id;

    RETURN NEW;
END;
$$;
 ,   DROP FUNCTION public.fn_update_team_rank();
       public          postgres    false                       1255    92088    fn_update_totalscore()    FUNCTION     |   CREATE FUNCTION public.fn_update_totalscore() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN NEW;
END;
$$;
 -   DROP FUNCTION public.fn_update_totalscore();
       public          postgres    false                       1255    92062 4   fn_user_update_scoreboard(integer, integer, integer)    FUNCTION     �  CREATE FUNCTION public.fn_user_update_scoreboard(p_user_id integer, p_scoreboard_id integer, p_score integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    msg_type VARCHAR(20) DEFAULT 'error';
    msg_detail VARCHAR(200);
    existing_user_id INTEGER;
BEGIN
    msg_detail := '';

    SELECT user_type INTO user_role FROM useraccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'User not found');
    END IF;

    IF user_role <> 'user' THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Permission Denied: Only users can update scores');
    END IF;

    SELECT user_id INTO existing_user_id FROM scoreboard WHERE scoreboard_id = p_scoreboard_id;

    IF existing_user_id IS NULL THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Scoreboard entry not found');
    END IF;

    IF existing_user_id <> p_user_id THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'Permission Denied: You can only update your own score');
    END IF;

    UPDATE scoreboard 
	SET score = p_score WHERE scoreboard_id = p_scoreboard_id;

    msg_type := 'success';
    msg_detail := 'Score updated successfully!';

    RETURN jsonb_build_object('type', msg_type, 'message', msg_detail);

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('type', 'error', 'message', 'An unexpected error occurred: ' || SQLERRM);
END;
$$;
 m   DROP FUNCTION public.fn_user_update_scoreboard(p_user_id integer, p_scoreboard_id integer, p_score integer);
       public          postgres    false                       1255    75623 ;   pr_admin_add_category(character varying, character varying) 	   PROCEDURE     T  CREATE PROCEDURE public.pr_admin_add_category(IN p_category_name character varying, IN p_division character varying)
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
       public          postgres    false                       1255    75620 K   pr_admin_add_events(character varying, character varying, integer, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_add_events(IN p_event_name character varying, IN p_venue character varying, IN p_team_id integer, IN p_category_id integer)
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
       public          postgres    false                       1255    75616 T   pr_admin_add_schedule(date, time without time zone, time without time zone, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_add_schedule(IN p_date date, IN p_start_time time without time zone, IN p_end_time time without time zone, IN p_event_id integer)
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
       public          postgres    false            	           1255    75626 !   pr_admin_delete_category(integer) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_category(IN p_category_id integer)
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
       public          postgres    false                       1255    75622    pr_admin_delete_events(integer) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_events(IN p_event_id integer)
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
       public          postgres    false                        1255    75614 #   pr_admin_delete_scoreboard(integer) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_scoreboard(IN p_scoreboard_id integer)
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
       public          postgres    false                       1255    75625 G   pr_admin_update_category(integer, character varying, character varying) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_update_category(IN p_category_id integer, IN p_category_name character varying, IN p_division character varying)
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
       public          postgres    false                       1255    75621 W   pr_admin_update_events(integer, character varying, character varying, integer, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_update_events(IN p_event_id integer, IN p_event_name character varying, IN p_venue character varying, IN p_team_id integer, IN p_category_id integer)
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
       public          postgres    false                       1255    75618 `   pr_admin_update_schedule(integer, date, time without time zone, time without time zone, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_update_schedule(IN p_schedule_id integer, IN p_date date, IN p_start_time time without time zone, IN p_end_time time without time zone, IN p_event_id integer)
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
       public          postgres    false                       1255    75594 =   pr_user_update_scoreboard(integer, integer, integer, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_user_update_scoreboard(IN p_user_id integer, IN p_scoreboard_id integer, IN p_score integer, IN p_ranking integer)
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
       public          postgres    false            �            1259    75431    category    TABLE     �   CREATE TABLE public.category (
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
       public          postgres    false    218            o           0    0    category_category_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.category_category_id_seq OWNED BY public.category.category_id;
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
       public          postgres    false    222            p           0    0    events_category_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.events_category_id_seq OWNED BY public.events.category_id;
          public          postgres    false    221            �            1259    75469    events_event_id_seq    SEQUENCE     �   CREATE SEQUENCE public.events_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.events_event_id_seq;
       public          postgres    false    222            q           0    0    events_event_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.events_event_id_seq OWNED BY public.events.event_id;
          public          postgres    false    219            �            1259    75470    events_team_id_seq    SEQUENCE     �   CREATE SEQUENCE public.events_team_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.events_team_id_seq;
       public          postgres    false    222            r           0    0    events_team_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.events_team_id_seq OWNED BY public.events.team_id;
          public          postgres    false    220            �            1259    75501    schedule    TABLE     �   CREATE TABLE public.schedule (
    schedule_id integer NOT NULL,
    date date,
    start_time time without time zone,
    end_time time without time zone,
    event_id integer NOT NULL
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
       public          postgres    false    225            s           0    0    schedule_event_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.schedule_event_id_seq OWNED BY public.schedule.event_id;
          public          postgres    false    224            �            1259    75499    schedule_schedule_id_seq    SEQUENCE     �   CREATE SEQUENCE public.schedule_schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.schedule_schedule_id_seq;
       public          postgres    false    225            t           0    0    schedule_schedule_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.schedule_schedule_id_seq OWNED BY public.schedule.schedule_id;
          public          postgres    false    223            �            1259    75557 
   scoreboard    TABLE     �   CREATE TABLE public.scoreboard (
    scoreboard_id integer NOT NULL,
    score integer,
    ranking integer,
    team_id integer NOT NULL,
    user_id integer NOT NULL,
    event_id integer NOT NULL,
    schedule_id integer NOT NULL
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
       public          postgres    false    233            u           0    0    scoreboard_event_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.scoreboard_event_id_seq OWNED BY public.scoreboard.event_id;
          public          postgres    false    231            �            1259    75556    scoreboard_schedule_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scoreboard_schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE public.scoreboard_schedule_id_seq;
       public          postgres    false    233            v           0    0    scoreboard_schedule_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE public.scoreboard_schedule_id_seq OWNED BY public.scoreboard.schedule_id;
          public          postgres    false    232            �            1259    75552    scoreboard_scoreboard_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scoreboard_scoreboard_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public.scoreboard_scoreboard_id_seq;
       public          postgres    false    233            w           0    0    scoreboard_scoreboard_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE public.scoreboard_scoreboard_id_seq OWNED BY public.scoreboard.scoreboard_id;
          public          postgres    false    228            �            1259    75553    scoreboard_team_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scoreboard_team_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.scoreboard_team_id_seq;
       public          postgres    false    233            x           0    0    scoreboard_team_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.scoreboard_team_id_seq OWNED BY public.scoreboard.team_id;
          public          postgres    false    229            �            1259    75554    scoreboard_user_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scoreboard_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.scoreboard_user_id_seq;
       public          postgres    false    233            y           0    0    scoreboard_user_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.scoreboard_user_id_seq OWNED BY public.scoreboard.user_id;
          public          postgres    false    230            �            1259    75424    team    TABLE     i   CREATE TABLE public.team (
    team_id integer NOT NULL,
    team_name character varying(15) NOT NULL
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
       public          postgres    false    216            z           0    0    team_team_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.team_team_id_seq OWNED BY public.team.team_id;
          public          postgres    false    215            �            1259    92102    team_total_scores    VIEW     �   CREATE VIEW public.team_total_scores AS
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
       public          postgres    false    227            {           0    0    useraccount_user_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.useraccount_user_id_seq OWNED BY public.useraccount.user_id;
          public          postgres    false    226            �            1259    92073    vw_eventdetails    VIEW     g  CREATE VIEW public.vw_eventdetails AS
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
       public          postgres    false    222    233    233    233    233    227    227    225    225    225    225    218    222    222    222    222    218    218    216    216            �           2604    75434    category category_id    DEFAULT     |   ALTER TABLE ONLY public.category ALTER COLUMN category_id SET DEFAULT nextval('public.category_category_id_seq'::regclass);
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
       public          postgres    false    225    224    225            �           2604    75560    scoreboard scoreboard_id    DEFAULT     �   ALTER TABLE ONLY public.scoreboard ALTER COLUMN scoreboard_id SET DEFAULT nextval('public.scoreboard_scoreboard_id_seq'::regclass);
 G   ALTER TABLE public.scoreboard ALTER COLUMN scoreboard_id DROP DEFAULT;
       public          postgres    false    228    233    233            �           2604    75561    scoreboard team_id    DEFAULT     x   ALTER TABLE ONLY public.scoreboard ALTER COLUMN team_id SET DEFAULT nextval('public.scoreboard_team_id_seq'::regclass);
 A   ALTER TABLE public.scoreboard ALTER COLUMN team_id DROP DEFAULT;
       public          postgres    false    229    233    233            �           2604    75562    scoreboard user_id    DEFAULT     x   ALTER TABLE ONLY public.scoreboard ALTER COLUMN user_id SET DEFAULT nextval('public.scoreboard_user_id_seq'::regclass);
 A   ALTER TABLE public.scoreboard ALTER COLUMN user_id DROP DEFAULT;
       public          postgres    false    233    230    233            �           2604    75563    scoreboard event_id    DEFAULT     z   ALTER TABLE ONLY public.scoreboard ALTER COLUMN event_id SET DEFAULT nextval('public.scoreboard_event_id_seq'::regclass);
 B   ALTER TABLE public.scoreboard ALTER COLUMN event_id DROP DEFAULT;
       public          postgres    false    231    233    233            �           2604    75564    scoreboard schedule_id    DEFAULT     �   ALTER TABLE ONLY public.scoreboard ALTER COLUMN schedule_id SET DEFAULT nextval('public.scoreboard_schedule_id_seq'::regclass);
 E   ALTER TABLE public.scoreboard ALTER COLUMN schedule_id DROP DEFAULT;
       public          postgres    false    233    232    233            �           2604    75427    team team_id    DEFAULT     l   ALTER TABLE ONLY public.team ALTER COLUMN team_id SET DEFAULT nextval('public.team_team_id_seq'::regclass);
 ;   ALTER TABLE public.team ALTER COLUMN team_id DROP DEFAULT;
       public          postgres    false    215    216    216            �           2604    75517    useraccount user_id    DEFAULT     z   ALTER TABLE ONLY public.useraccount ALTER COLUMN user_id SET DEFAULT nextval('public.useraccount_user_id_seq'::regclass);
 B   ALTER TABLE public.useraccount ALTER COLUMN user_id DROP DEFAULT;
       public          postgres    false    226    227    227            Y          0    75431    category 
   TABLE DATA           H   COPY public.category (category_id, category_name, division) FROM stdin;
    public          postgres    false    218   H      ]          0    75472    events 
   TABLE DATA           S   COPY public.events (event_id, event_name, venue, team_id, category_id) FROM stdin;
    public          postgres    false    222   }H      `          0    75501    schedule 
   TABLE DATA           U   COPY public.schedule (schedule_id, date, start_time, end_time, event_id) FROM stdin;
    public          postgres    false    225   I      h          0    75557 
   scoreboard 
   TABLE DATA           l   COPY public.scoreboard (scoreboard_id, score, ranking, team_id, user_id, event_id, schedule_id) FROM stdin;
    public          postgres    false    233   wI      W          0    75424    team 
   TABLE DATA           2   COPY public.team (team_id, team_name) FROM stdin;
    public          postgres    false    216   J      b          0    75514    useraccount 
   TABLE DATA           N   COPY public.useraccount (user_id, user_name, password, user_type) FROM stdin;
    public          postgres    false    227   �J      |           0    0    category_category_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.category_category_id_seq', 6, true);
          public          postgres    false    217            }           0    0    events_category_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.events_category_id_seq', 1, false);
          public          postgres    false    221            ~           0    0    events_event_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.events_event_id_seq', 21, true);
          public          postgres    false    219                       0    0    events_team_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.events_team_id_seq', 1, false);
          public          postgres    false    220            �           0    0    schedule_event_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.schedule_event_id_seq', 1, false);
          public          postgres    false    224            �           0    0    schedule_schedule_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.schedule_schedule_id_seq', 29, true);
          public          postgres    false    223            �           0    0    scoreboard_event_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.scoreboard_event_id_seq', 1, false);
          public          postgres    false    231            �           0    0    scoreboard_schedule_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.scoreboard_schedule_id_seq', 1, false);
          public          postgres    false    232            �           0    0    scoreboard_scoreboard_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.scoreboard_scoreboard_id_seq', 75, true);
          public          postgres    false    228            �           0    0    scoreboard_team_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.scoreboard_team_id_seq', 1, false);
          public          postgres    false    229            �           0    0    scoreboard_user_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.scoreboard_user_id_seq', 1, false);
          public          postgres    false    230            �           0    0    team_team_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.team_team_id_seq', 10, true);
          public          postgres    false    215            �           0    0    useraccount_user_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.useraccount_user_id_seq', 51, true);
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
       public          postgres    false    266    233            �           2620    92106    scoreboard trg_update_team_rank    TRIGGER     �   CREATE TRIGGER trg_update_team_rank AFTER UPDATE OF score ON public.scoreboard FOR EACH ROW EXECUTE FUNCTION public.fn_update_team_rank();
 8   DROP TRIGGER trg_update_team_rank ON public.scoreboard;
       public          postgres    false    266    233    233            �           2620    92098     scoreboard trg_update_totalscore    TRIGGER     �   CREATE TRIGGER trg_update_totalscore AFTER INSERT OR UPDATE ON public.scoreboard FOR EACH ROW EXECUTE FUNCTION public.fn_update_totalscore();
 9   DROP TRIGGER trg_update_totalscore ON public.scoreboard;
       public          postgres    false    233    281            �           2606    75485    events category_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.events
    ADD CONSTRAINT category_id FOREIGN KEY (category_id) REFERENCES public.category(category_id) ON DELETE CASCADE;
 <   ALTER TABLE ONLY public.events DROP CONSTRAINT category_id;
       public          postgres    false    222    4785    218            �           2606    75508    schedule event_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT event_id FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE;
 ;   ALTER TABLE ONLY public.schedule DROP CONSTRAINT event_id;
       public          postgres    false    225    222    4788            �           2606    92039    scoreboard event_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.scoreboard
    ADD CONSTRAINT event_id FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON UPDATE CASCADE ON DELETE CASCADE;
 =   ALTER TABLE ONLY public.scoreboard DROP CONSTRAINT event_id;
       public          postgres    false    4788    222    233            �           2606    92044    scoreboard schedule_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.scoreboard
    ADD CONSTRAINT schedule_id FOREIGN KEY (schedule_id) REFERENCES public.schedule(schedule_id) ON UPDATE CASCADE ON DELETE CASCADE;
 @   ALTER TABLE ONLY public.scoreboard DROP CONSTRAINT schedule_id;
       public          postgres    false    233    4790    225            �           2606    75480    events team_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.events
    ADD CONSTRAINT team_id FOREIGN KEY (team_id) REFERENCES public.team(team_id) ON DELETE CASCADE;
 8   ALTER TABLE ONLY public.events DROP CONSTRAINT team_id;
       public          postgres    false    216    222    4783            �           2606    92034    scoreboard team_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.scoreboard
    ADD CONSTRAINT team_id FOREIGN KEY (team_id) REFERENCES public.team(team_id) ON UPDATE CASCADE ON DELETE CASCADE;
 <   ALTER TABLE ONLY public.scoreboard DROP CONSTRAINT team_id;
       public          postgres    false    233    4783    216            �           2606    75572    scoreboard user_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.scoreboard
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES public.useraccount(user_id) ON DELETE CASCADE;
 <   ALTER TABLE ONLY public.scoreboard DROP CONSTRAINT user_id;
       public          postgres    false    227    4792    233            Y   V   x�3�tJ��QpO�M-��M�IUp�,�,����2B�rK�E�4���,�-��	�ON��2��ACDM9}����|321����� ^m*�      ]   �   x��K
�0����"'��X�"B���i$�N$�`oo��{0�(���$1�&:1㺀��lr�g��k	I� ��[Р!n�HN��)&\�M��}n�w8����!i����%��5�Q����]j�tN�����g�����@D8�/      `   O   x�M�A
�@��_V��+�[��;�C[!��L�hr��Zt���ŨB�ƨf��(2�z\P�Ƭ�,Hh���q?�9 ���      h   �   x�e��!C�N1+���
��:6a.,!�Sb;�n`(�a�`<��{^��"�$^u�����dѷf`��ʮ4T҉�T�<�nd�-e{��Z^{�n'	93�^�6b�q���Ʊ�5|��N�yj�m�Z�e�Y�x>D���7�      W   b   x�-�1
�@�z�a���h�������@uVV������������xo�S:�C���N��JZ.1�KF]uS�	Ƅ���i� .���      b   L  x�]�ǖ�J е�;�o�B�	�tf�I�Gد��.��߬rwOdDFd������,���9S�qo�jp��`�3��t�!e��Yv��/���r�R�4O`�����k����a.�bw��%]ἂ<�w���kI �5^*�v���3j@#�|
��h���J		Ӎe�i�۾u0;��<m�qu���^��
�}1�B.ҌzS�i�h�0*���T��ί6Vh�p�49���l�D�?uC#��&w����[⧬h�8L¶�pHRME�W%B��PP�\gcg�B���n �J�"�ϊ�fQi�7G�@8�_y[º�����<=O�^E�x����U���^�:����G�b�`u÷I����R��G{=������eู�I�t��a+ok��*��c�7(�p��ko�>Ua�<l_��xjm�c���HX5�L�<�g#��uP�r���)u� ��o��� (�HV���hU[XE���L`���j�F��f�,Śu�"�%ۡ�o��M��ބ࣍��3�n��-!�*�s�W����=���(�IK�0Y�(���(��M8?\��S�g�{o�]H{���fHv��L�1�7_���q����->P� -�_ELE�I\�vحҚ�+�N����,NV�QB&���C�hԄHi1��\��z!��� i�	`�������g9ci��NJ������(�{5�l�1͸YaQ��?��Ʒ��	���2�8�]Ұ?��~n����/}*�լZ>�\vCصB�j��+���wW)��l�_/��Qo�_��a�����bg]/7���Ꜫ�����iF3�|x��������B�ԉ�� �
	�'u'�����7oh��8�@�ա��u6��GdN�
..�:3�lxP��O��,�
6�K.�e�w�b�f+���lC�.���;c��Ua��?��H7��m=�B������2.��U���w)��q�m�	�^\H�"����F����a�>��,�8q*���T6na�͌��B�>܎���]��H/��U>�,��q�E�TH^[u
��͓	��$��9��e�������XJ�XHL��"��u�4�����7���z���3���G�C�5�ޅ����C�BY5[r��������S�<���w��_�s�!�ă�(I����0⏄~(K�E%�ET�J�A���xy��U�apg�aq1�c�7x�zy�k�=P�=�
�˸GÏS���x�
C��y��V~V���I��=40�o�/"�k���Z��[�Y���}�cE�:���y�K+7��%���b�$�gQ@���V�Q�`d*L�M��+B�Y�M��#3���,�����E�l�y��������*B8��]�Fk��C���+?�h�_�%����o�����h��"�*�����<���T9oc?3���M�������,I�h��ޫ�w;q��@��W��$�d�a�:fřW��`o=�Iw��U��7m�ud\��F�� �=T� ޢ=��$S.�u��v*��)wC�'}���5{fi0�v�z�I6x���W>'_�E��g���.8�g7�y�\���"g���2*��y����'�p�ҵ.�.�X�g���?1Q�a�O�u���,��G��� ��0-�b��]��h��A⭵���8}����m2��KX9BXfuwh�*��aߍ47�&�x<�L&{�)�)��a���=�{]���ʯR�Ӱ|ɀ,"��eN���\Fɵ<۸KU��f��S^|��|�D��(PY���j�[ah�"7%�z���=~��ھt�G��U�s|/���~���_�N��     