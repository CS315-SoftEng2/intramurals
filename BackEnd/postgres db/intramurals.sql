PGDMP       $                }            Intramurals    16.2    16.2 �    e           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            f           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            g           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            h           1262    75408    Intramurals    DATABASE     �   CREATE DATABASE "Intramurals" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE "Intramurals";
                postgres    false                        2615    2200    public    SCHEMA        CREATE SCHEMA public;
    DROP SCHEMA public;
                pg_database_owner    false            i           0    0    SCHEMA public    COMMENT     6   COMMENT ON SCHEMA public IS 'standard public schema';
                   pg_database_owner    false    4                       1255    83799 D   fn_admin_add_category(integer, character varying, character varying)    FUNCTION     �  CREATE FUNCTION public.fn_admin_add_category(p_user_id integer, p_category_name character varying, p_division character varying) RETURNS TABLE(category_id integer, category_name character varying, division character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    new_category_id INTEGER;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        INSERT INTO Category (category_name, division)
        VALUES (p_category_name, p_division)
        RETURNING category_id, category_name, division INTO new_category_id, p_category_name, p_division;

        RETURN QUERY SELECT new_category_id, p_category_name, p_division;
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can add category entries';
    END IF;
END;
$$;
 �   DROP FUNCTION public.fn_admin_add_category(p_user_id integer, p_category_name character varying, p_division character varying);
       public          postgres    false    4                       1255    83800 S   fn_admin_add_event(integer, character varying, character varying, integer, integer)    FUNCTION     #  CREATE FUNCTION public.fn_admin_add_event(p_user_id integer, p_event_name character varying, p_venue character varying, p_team_id integer, p_category_id integer) RETURNS TABLE(event_id integer, event_name character varying, venue character varying, team_id integer, category_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    new_event_id INTEGER;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        INSERT INTO Events (event_name, venue, team_id, category_id)
        VALUES (p_event_name, p_venue, p_team_id, p_category_id)
        RETURNING event_id, event_name, venue, team_id, category_id 
        INTO new_event_id, p_event_name, p_venue, p_team_id, p_category_id;

        RETURN QUERY SELECT new_event_id, p_event_name, p_venue, p_team_id, p_category_id;
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can add event entries';
    END IF;
END;
$$;
 �   DROP FUNCTION public.fn_admin_add_event(p_user_id integer, p_event_name character varying, p_venue character varying, p_team_id integer, p_category_id integer);
       public          postgres    false    4                       1255    83801 ]   fn_admin_add_schedule(integer, date, time without time zone, time without time zone, integer)    FUNCTION     3  CREATE FUNCTION public.fn_admin_add_schedule(p_user_id integer, p_date date, p_start_time time without time zone, p_end_time time without time zone, p_event_id integer) RETURNS TABLE(schedule_id integer, date date, start_time time without time zone, end_time time without time zone, event_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    new_schedule_id INTEGER;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        INSERT INTO Schedule (date, start_time, end_time, event_id)
        VALUES (p_date, p_start_time, p_end_time, p_event_id)
        RETURNING schedule_id, date, start_time, end_time, event_id 
        INTO new_schedule_id, p_date, p_start_time, p_end_time, p_event_id;

        RETURN QUERY SELECT new_schedule_id, p_date, p_start_time, p_end_time, p_event_id;
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can add schedule entries';
    END IF;
END;
$$;
 �   DROP FUNCTION public.fn_admin_add_schedule(p_user_id integer, p_date date, p_start_time time without time zone, p_end_time time without time zone, p_event_id integer);
       public          postgres    false    4                       1255    83802 M   fn_admin_add_scoreboard(integer, integer, integer, integer, integer, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_add_scoreboard(p_user_id integer, p_team_id integer, p_event_id integer, p_schedule_id integer, p_score integer, p_ranking integer) RETURNS TABLE(scoreboard_id integer, user_id integer, team_id integer, event_id integer, schedule_id integer, score integer, ranking integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    new_scoreboard_id INTEGER;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        INSERT INTO Scoreboard (user_id, team_id, event_id, schedule_id, score, ranking)
        VALUES (p_user_id, p_team_id, p_event_id, p_schedule_id, p_score, p_ranking)
        RETURNING scoreboard_id, user_id, team_id, event_id, schedule_id, score, ranking 
        INTO new_scoreboard_id, p_user_id, p_team_id, p_event_id, p_schedule_id, p_score, p_ranking;

        RETURN QUERY SELECT new_scoreboard_id, p_user_id, p_team_id, p_event_id, p_schedule_id, p_score, p_ranking;
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can add scoreboard entries';
    END IF;
END;
$$;
 �   DROP FUNCTION public.fn_admin_add_scoreboard(p_user_id integer, p_team_id integer, p_event_id integer, p_schedule_id integer, p_score integer, p_ranking integer);
       public          postgres    false    4                       1255    83798 6   fn_admin_add_team(integer, integer, character varying)    FUNCTION     �  CREATE FUNCTION public.fn_admin_add_team(p_user_id integer, p_team_id integer, p_team_name character varying) RETURNS TABLE(team_id integer, team_name character varying)
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
        INSERT INTO Team (team_id, team_name)
        VALUES (p_team_id, p_team_name)
        RETURNING team_id, team_name INTO p_team_id, p_team_name;

        RETURN QUERY SELECT p_team_id, p_team_name;
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can add a team';
    END IF;
END;
$$;
 m   DROP FUNCTION public.fn_admin_add_team(p_user_id integer, p_team_id integer, p_team_name character varying);
       public          postgres    false    4                       1255    83803 [   fn_admin_add_user_account(integer, character varying, character varying, character varying)    FUNCTION     �  CREATE FUNCTION public.fn_admin_add_user_account(p_user_id integer, p_user_name character varying, p_password character varying, p_user_type character varying) RETURNS TABLE(user_id integer, user_name character varying, user_type character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_role VARCHAR;
    new_user_id INTEGER;
BEGIN
    SELECT user_type INTO user_role FROM UserAccount WHERE user_id = p_user_id;

    IF user_role IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF user_role = 'admin' THEN
        INSERT INTO UserAccount (user_name, password, user_type)
        VALUES (p_user_name, p_password, p_user_type)
        RETURNING user_id, user_name, user_type 
        INTO new_user_id, p_user_name, p_user_type;

        RETURN QUERY SELECT new_user_id, p_user_name, p_user_type;
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can add user accounts';
    END IF;
END;
$$;
 �   DROP FUNCTION public.fn_admin_add_user_account(p_user_id integer, p_user_name character varying, p_password character varying, p_user_type character varying);
       public          postgres    false    4                       1255    83804 *   fn_admin_delete_category(integer, integer)    FUNCTION     Q  CREATE FUNCTION public.fn_admin_delete_category(p_user_id integer, p_category_id integer) RETURNS TABLE(category_id integer, category_name character varying, division character varying)
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
        IF NOT EXISTS (SELECT 1 FROM Category WHERE category_id = p_category_id) THEN
            RAISE EXCEPTION 'Category not found';
        END IF;

        DELETE FROM Category 
        WHERE category_id = p_category_id
        RETURNING category_id, category_name, division;

    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can delete category entries';
    END IF;
END;
$$;
 Y   DROP FUNCTION public.fn_admin_delete_category(p_user_id integer, p_category_id integer);
       public          postgres    false    4                       1255    83805 '   fn_admin_delete_event(integer, integer)    FUNCTION     _  CREATE FUNCTION public.fn_admin_delete_event(p_user_id integer, p_event_id integer) RETURNS TABLE(event_id integer, event_name character varying, venue character varying, team_id integer, category_id integer)
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
        IF NOT EXISTS (SELECT 1 FROM Events WHERE event_id = p_event_id) THEN
            RAISE EXCEPTION 'Event not found';
        END IF;

        DELETE FROM Events 
        WHERE event_id = p_event_id
        RETURNING event_id, event_name, venue, team_id, category_id;

    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can delete event entries';
    END IF;
END;
$$;
 S   DROP FUNCTION public.fn_admin_delete_event(p_user_id integer, p_event_id integer);
       public          postgres    false    4                       1255    83806 *   fn_admin_delete_schedule(integer, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_delete_schedule(p_user_id integer, p_schedule_id integer) RETURNS TABLE(schedule_id integer, date date, start_time time without time zone, end_time time without time zone, event_id integer)
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
        IF NOT EXISTS (SELECT 1 FROM Schedule WHERE schedule_id = p_schedule_id) THEN
            RAISE EXCEPTION 'Schedule not found';
        END IF;

        DELETE FROM Schedule 
        WHERE schedule_id = p_schedule_id
        RETURNING schedule_id, date, start_time, end_time, event_id;

    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can delete schedule entries';
    END IF;
END;
$$;
 Y   DROP FUNCTION public.fn_admin_delete_schedule(p_user_id integer, p_schedule_id integer);
       public          postgres    false    4                       1255    83807 ,   fn_admin_delete_scoreboard(integer, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_delete_scoreboard(p_user_id integer, p_scoreboard_id integer) RETURNS TABLE(scoreboard_id integer, user_id integer, team_id integer, event_id integer, schedule_id integer, score integer, ranking integer)
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
        IF NOT EXISTS (SELECT 1 FROM Scoreboard WHERE scoreboard_id = p_scoreboard_id) THEN
            RAISE EXCEPTION 'Scoreboard entry not found';
        END IF;

        DELETE FROM Scoreboard 
        WHERE scoreboard_id = p_scoreboard_id
        RETURNING scoreboard_id, user_id, team_id, event_id, schedule_id, score, ranking;

    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can delete scoreboard entries';
    END IF;
END;
$$;
 ]   DROP FUNCTION public.fn_admin_delete_scoreboard(p_user_id integer, p_scoreboard_id integer);
       public          postgres    false    4                       1255    83808 &   fn_admin_delete_team(integer, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_delete_team(p_user_id integer, p_team_id integer) RETURNS TABLE(team_id integer, team_name character varying)
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
        IF NOT EXISTS (SELECT 1 FROM Team WHERE team_id = p_team_id) THEN
            RAISE EXCEPTION 'Team not found';
        END IF;

        DELETE FROM Team 
        WHERE team_id = p_team_id
        RETURNING team_id, team_name;

    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can delete a team';
    END IF;
END;
$$;
 Q   DROP FUNCTION public.fn_admin_delete_team(p_user_id integer, p_team_id integer);
       public          postgres    false    4                       1255    83809 &   fn_admin_delete_user(integer, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_delete_user(p_admin_id integer, p_user_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    admin_role VARCHAR;
BEGIN
    SELECT user_type INTO admin_role FROM UserAccount WHERE user_id = p_admin_id;

    IF admin_role IS NULL THEN
        RAISE EXCEPTION 'Admin user not found';
    END IF;

    IF admin_role = 'admin' THEN
        IF NOT EXISTS (SELECT 1 FROM UserAccount WHERE user_id = p_user_id) THEN
            RAISE EXCEPTION 'User not found';
        END IF;

        DELETE FROM UserAccount WHERE user_id = p_user_id;

    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can delete a user account';
    END IF;
END;
$$;
 R   DROP FUNCTION public.fn_admin_delete_user(p_admin_id integer, p_user_id integer);
       public          postgres    false    4                       1255    83810 P   fn_admin_update_category(integer, integer, character varying, character varying)    FUNCTION     �  CREATE FUNCTION public.fn_admin_update_category(p_admin_id integer, p_category_id integer, p_category_name character varying, p_division character varying) RETURNS TABLE(category_id integer, category_name character varying, division character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    admin_role VARCHAR;
BEGIN
    SELECT user_type INTO admin_role FROM UserAccount WHERE user_id = p_admin_id;

    IF admin_role IS NULL THEN
        RAISE EXCEPTION 'Admin user not found';
    END IF;
    
    IF admin_role = 'admin' THEN
        IF NOT EXISTS (SELECT 1 FROM Category WHERE category_id = p_category_id) THEN
            RAISE EXCEPTION 'Category not found';
        END IF;

        UPDATE Category 
        SET category_name = p_category_name, division = p_division
        WHERE category_id = p_category_id
        RETURNING category_id, category_name, division;

    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can update category entries';
    END IF;
END;
$$;
 �   DROP FUNCTION public.fn_admin_update_category(p_admin_id integer, p_category_id integer, p_category_name character varying, p_division character varying);
       public          postgres    false    4                       1255    83811 _   fn_admin_update_event(integer, integer, character varying, character varying, integer, integer)    FUNCTION     _  CREATE FUNCTION public.fn_admin_update_event(p_admin_id integer, p_event_id integer, p_event_name character varying, p_venue character varying, p_team_id integer, p_category_id integer) RETURNS TABLE(event_id integer, event_name character varying, venue character varying, team_id integer, category_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    admin_role VARCHAR;
BEGIN
    SELECT user_type INTO admin_role FROM UserAccount WHERE user_id = p_admin_id;

    IF admin_role IS NULL THEN
        RAISE EXCEPTION 'Admin user not found';
    END IF;
    
    IF admin_role = 'admin' THEN
        IF NOT EXISTS (SELECT 1 FROM Events WHERE event_id = p_event_id) THEN
            RAISE EXCEPTION 'Event not found';
        END IF;

        UPDATE Events 
        SET event_name = p_event_name, 
            venue = p_venue, 
            team_id = p_team_id, 
            category_id = p_category_id
        WHERE event_id = p_event_id
        RETURNING event_id, event_name, venue, team_id, category_id;

    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can update event entries';
    END IF;
END;
$$;
 �   DROP FUNCTION public.fn_admin_update_event(p_admin_id integer, p_event_id integer, p_event_name character varying, p_venue character varying, p_team_id integer, p_category_id integer);
       public          postgres    false    4                       1255    83812 i   fn_admin_update_schedule(integer, integer, date, time without time zone, time without time zone, integer)    FUNCTION     �  CREATE FUNCTION public.fn_admin_update_schedule(p_admin_id integer, p_schedule_id integer, p_date date, p_start_time time without time zone, p_end_time time without time zone, p_event_id integer) RETURNS TABLE(schedule_id integer, date date, start_time time without time zone, end_time time without time zone, event_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    admin_role VARCHAR;
BEGIN
    SELECT user_type INTO admin_role FROM UserAccount WHERE user_id = p_admin_id;

    IF admin_role IS NULL THEN
        RAISE EXCEPTION 'Admin user not found';
    END IF;
    
    IF admin_role = 'admin' THEN
        IF NOT EXISTS (SELECT 1 FROM Schedule WHERE schedule_id = p_schedule_id) THEN
            RAISE EXCEPTION 'Schedule not found';
        END IF;

        UPDATE Schedule 
        SET date = p_date, 
            start_time = p_start_time, 
            end_time = p_end_time, 
            event_id = p_event_id
        WHERE schedule_id = p_schedule_id
        RETURNING schedule_id, date, start_time, end_time, event_id;

    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can update schedule entries';
    END IF;
END;
$$;
 �   DROP FUNCTION public.fn_admin_update_schedule(p_admin_id integer, p_schedule_id integer, p_date date, p_start_time time without time zone, p_end_time time without time zone, p_event_id integer);
       public          postgres    false    4                       1255    83813 b   fn_admin_update_scoreboard(integer, integer, integer, integer, integer, integer, integer, integer)    FUNCTION       CREATE FUNCTION public.fn_admin_update_scoreboard(p_admin_id integer, p_scoreboard_id integer, p_user_id integer, p_team_id integer, p_event_id integer, p_schedule_id integer, p_score integer, p_ranking integer) RETURNS TABLE(scoreboard_id integer, user_id integer, team_id integer, event_id integer, schedule_id integer, score integer, ranking integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    admin_role VARCHAR;
BEGIN
    SELECT user_type INTO admin_role FROM UserAccount WHERE user_id = p_admin_id;

    IF admin_role IS NULL THEN
        RAISE EXCEPTION 'Admin user not found';
    END IF;
    
    IF admin_role = 'admin' THEN
        IF NOT EXISTS (SELECT 1 FROM Scoreboard WHERE scoreboard_id = p_scoreboard_id) THEN
            RAISE EXCEPTION 'Scoreboard entry not found';
        END IF;

        UPDATE Scoreboard 
        SET user_id = p_user_id, 
            team_id = p_team_id, 
            event_id = p_event_id, 
            schedule_id = p_schedule_id, 
            score = p_score, 
            ranking = p_ranking
        WHERE scoreboard_id = p_scoreboard_id
        RETURNING scoreboard_id, user_id, team_id, event_id, schedule_id, score, ranking;

    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can update scoreboard entries';
    END IF;
END;
$$;
 �   DROP FUNCTION public.fn_admin_update_scoreboard(p_admin_id integer, p_scoreboard_id integer, p_user_id integer, p_team_id integer, p_event_id integer, p_schedule_id integer, p_score integer, p_ranking integer);
       public          postgres    false    4                       1255    83814 9   fn_admin_update_team(integer, integer, character varying)    FUNCTION     ;  CREATE FUNCTION public.fn_admin_update_team(p_admin_id integer, p_team_id integer, p_team_name character varying) RETURNS TABLE(team_id integer, team_name character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    admin_role VARCHAR;
BEGIN
    SELECT user_type INTO admin_role FROM UserAccount WHERE user_id = p_admin_id;

    IF admin_role IS NULL THEN
        RAISE EXCEPTION 'Admin user not found';
    END IF;
    
    IF admin_role = 'admin' THEN
        IF NOT EXISTS (SELECT 1 FROM Team WHERE team_id = p_team_id) THEN
            RAISE EXCEPTION 'Team not found';
        END IF;

        UPDATE Team 
        SET team_name = p_team_name
        WHERE team_id = p_team_id
        RETURNING team_id, team_name;

    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can update a team';
    END IF;
END;
$$;
 q   DROP FUNCTION public.fn_admin_update_team(p_admin_id integer, p_team_id integer, p_team_name character varying);
       public          postgres    false    4                       1255    83815 g   fn_admin_update_user_account(integer, integer, character varying, character varying, character varying)    FUNCTION     �  CREATE FUNCTION public.fn_admin_update_user_account(p_admin_id integer, p_user_id integer, p_user_name character varying, p_password character varying, p_user_type character varying) RETURNS TABLE(user_id integer, user_name character varying, user_type character varying)
    LANGUAGE plpgsql
    AS $$
DECLARE
    admin_role VARCHAR;
BEGIN
    SELECT user_type INTO admin_role FROM UserAccount WHERE user_id = p_admin_id;

    IF admin_role IS NULL THEN
        RAISE EXCEPTION 'Admin user not found';
    END IF;
    
    IF admin_role = 'admin' THEN
        IF NOT EXISTS (SELECT 1 FROM UserAccount WHERE user_id = p_user_id) THEN
            RAISE EXCEPTION 'User not found';
        END IF;

        UPDATE UserAccount
        SET user_name = p_user_name, password = p_password, user_type = p_user_type
        WHERE user_id = p_user_id
        RETURNING user_id, user_name, user_type;

    ELSE
        RAISE EXCEPTION 'Permission Denied: Only admin can update the user account';
    END IF;
END;
$$;
 �   DROP FUNCTION public.fn_admin_update_user_account(p_admin_id integer, p_user_id integer, p_user_name character varying, p_password character varying, p_user_type character varying);
       public          postgres    false    4                       1255    83817 7   fn_login_function(character varying, character varying)    FUNCTION     A  CREATE FUNCTION public.fn_login_function(p_user_name character varying, p_password character varying) RETURNS TABLE(user_id integer, user_name character varying, user_type character varying, message text)
    LANGUAGE plpgsql
    AS $$
DECLARE
    stored_password VARCHAR;
    user_record RECORD;
BEGIN
    SELECT user_id, user_name, user_type, password INTO user_record
    FROM UserAccount
    WHERE user_name = p_user_name;

    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL, NULL, NULL, 'User not found';
        RETURN;
    END IF;

    IF crypt(p_password, user_record.password) = user_record.password THEN
        RETURN QUERY SELECT user_record.user_id, user_record.user_name, user_record.user_type, 'Login successful!';
    ELSE
        RETURN QUERY SELECT NULL, NULL, NULL, 'Invalid credentials';
    END IF;
END;
$$;
 e   DROP FUNCTION public.fn_login_function(p_user_name character varying, p_password character varying);
       public          postgres    false    4            �            1255    75596    fn_teamrank(integer)    FUNCTION     �  CREATE FUNCTION public.fn_teamrank(p_team_id integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    team_rank INT;
BEGIN
    WITH rankings AS (
        SELECT team_id, 
               RANK() OVER (ORDER BY SUM(score) DESC) AS rank_position
        FROM Scoreboard
        GROUP BY team_id
    )
    SELECT rank_position INTO team_rank FROM rankings WHERE team_id = p_team_id;

    RETURN team_rank;
END;
$$;
 5   DROP FUNCTION public.fn_teamrank(p_team_id integer);
       public          postgres    false    4            �            1255    75595    fn_totalscore(integer)    FUNCTION       CREATE FUNCTION public.fn_totalscore(p_team_id integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    total_score INT;
BEGIN
    SELECT COALESCE(SUM(score), 0) INTO total_score 
    FROM Scoreboard 
    WHERE team_id = p_team_id;

    RETURN total_score;
END;
$$;
 7   DROP FUNCTION public.fn_totalscore(p_team_id integer);
       public          postgres    false    4            �            1255    75597    fn_update_totalscore()    FUNCTION     �   CREATE FUNCTION public.fn_update_totalscore() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE Scoreboard 
    SET total_score = fn_totalscore(NEW.team_id)
    WHERE team_id = NEW.team_id;
    
    RETURN NEW;
END;
$$;
 -   DROP FUNCTION public.fn_update_totalscore();
       public          postgres    false    4                       1255    83816 =   fn_user_update_scoreboard(integer, integer, integer, integer)    FUNCTION     �  CREATE FUNCTION public.fn_user_update_scoreboard(p_user_id integer, p_scoreboard_id integer, p_score integer, p_ranking integer) RETURNS TABLE(scoreboard_id integer, score integer, ranking integer)
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
        IF NOT EXISTS (SELECT 1 FROM Scoreboard WHERE scoreboard_id = p_scoreboard_id) THEN
            RAISE EXCEPTION 'Scoreboard entry not found';
        END IF;

        UPDATE Scoreboard
        SET score = p_score, ranking = p_ranking
        WHERE scoreboard_id = p_scoreboard_id
        RETURNING scoreboard_id, score, ranking;
    ELSE
        RAISE EXCEPTION 'Permission Denied: Only users can update the scoreboard';
    END IF;
END;
$$;
 �   DROP FUNCTION public.fn_user_update_scoreboard(p_user_id integer, p_scoreboard_id integer, p_score integer, p_ranking integer);
       public          postgres    false    4            	           1255    75623 ;   pr_admin_add_category(character varying, character varying) 	   PROCEDURE     T  CREATE PROCEDURE public.pr_admin_add_category(IN p_category_name character varying, IN p_division character varying)
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
       public          postgres    false    4                       1255    75620 K   pr_admin_add_events(character varying, character varying, integer, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_add_events(IN p_event_name character varying, IN p_venue character varying, IN p_team_id integer, IN p_category_id integer)
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
       public          postgres    false    4                       1255    75616 T   pr_admin_add_schedule(date, time without time zone, time without time zone, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_add_schedule(IN p_date date, IN p_start_time time without time zone, IN p_end_time time without time zone, IN p_event_id integer)
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
       public          postgres    false    4                        1255    75612 M   pr_admin_add_scoreboard(integer, integer, integer, integer, integer, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_add_scoreboard(IN p_user_id integer, IN p_team_id integer, IN p_event_id integer, IN p_schedule_id integer, IN p_score integer, IN p_ranking integer)
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
       public          postgres    false    4            �            1255    75609 -   pr_admin_add_team(integer, character varying) 	   PROCEDURE     )  CREATE PROCEDURE public.pr_admin_add_team(IN p_team_id integer, IN p_team_name character varying)
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
       public          postgres    false    4            �            1255    75608 M   pr_admin_add_useraccount(integer, character varying, text, character varying) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_add_useraccount(IN p_user_id integer, IN p_user_name character varying, IN p_password text, IN p_user_type character varying)
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
       public          postgres    false    4                       1255    75626 !   pr_admin_delete_category(integer) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_category(IN p_category_id integer)
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
       public          postgres    false    4                       1255    75622    pr_admin_delete_events(integer) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_events(IN p_event_id integer)
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
       public          postgres    false    4            �            1255    75619 !   pr_admin_delete_schedule(integer) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_schedule(IN p_schedule_id integer)
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
       public          postgres    false    4                       1255    75614 #   pr_admin_delete_scoreboard(integer) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_scoreboard(IN p_scoreboard_id integer)
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
       public          postgres    false    4            �            1255    75611 0   pr_admin_delete_team(integer, character varying) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_team(IN p_team_id integer, IN p_team_name character varying)
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
       public          postgres    false    4            �            1255    75607 $   pr_admin_delete_useraccount(integer) 	   PROCEDURE       CREATE PROCEDURE public.pr_admin_delete_useraccount(IN p_user_id integer)
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
       public          postgres    false    4            
           1255    75625 G   pr_admin_update_category(integer, character varying, character varying) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_update_category(IN p_category_id integer, IN p_category_name character varying, IN p_division character varying)
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
       public          postgres    false    4                       1255    75621 W   pr_admin_update_events(integer, character varying, character varying, integer, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_update_events(IN p_event_id integer, IN p_event_name character varying, IN p_venue character varying, IN p_team_id integer, IN p_category_id integer)
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
       public          postgres    false    4                       1255    75618 `   pr_admin_update_schedule(integer, date, time without time zone, time without time zone, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_update_schedule(IN p_schedule_id integer, IN p_date date, IN p_start_time time without time zone, IN p_end_time time without time zone, IN p_event_id integer)
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
       public          postgres    false    4                       1255    75613 Y   pr_admin_update_scoreboard(integer, integer, integer, integer, integer, integer, integer) 	   PROCEDURE     (  CREATE PROCEDURE public.pr_admin_update_scoreboard(IN p_scoreboard_id integer, IN p_user_id integer, IN p_team_id integer, IN p_event_id integer, IN p_schedule_id integer, IN p_score integer, IN p_ranking integer)
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
       public          postgres    false    4            �            1255    75610 0   pr_admin_update_team(integer, character varying) 	   PROCEDURE     .  CREATE PROCEDURE public.pr_admin_update_team(IN p_team_id integer, IN p_team_name character varying)
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
       public          postgres    false    4            �            1255    75606 P   pr_admin_update_useraccount(integer, character varying, text, character varying) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_admin_update_useraccount(IN p_user_id integer, IN p_user_name character varying, IN p_password text, IN p_user_type character varying)
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
       public          postgres    false    4                       1255    75594 =   pr_user_update_scoreboard(integer, integer, integer, integer) 	   PROCEDURE     �  CREATE PROCEDURE public.pr_user_update_scoreboard(IN p_user_id integer, IN p_scoreboard_id integer, IN p_score integer, IN p_ranking integer)
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
       public          postgres    false    4            �            1259    75431    category    TABLE     �   CREATE TABLE public.category (
    category_id integer NOT NULL,
    category_name character varying(50) NOT NULL,
    division character varying(15) NOT NULL
);
    DROP TABLE public.category;
       public         heap    postgres    false    4            �            1259    75430    category_category_id_seq    SEQUENCE     �   CREATE SEQUENCE public.category_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.category_category_id_seq;
       public          postgres    false    218    4            j           0    0    category_category_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.category_category_id_seq OWNED BY public.category.category_id;
          public          postgres    false    217            �            1259    75472    events    TABLE     �   CREATE TABLE public.events (
    event_id integer NOT NULL,
    event_name character varying(50) NOT NULL,
    venue character varying(100) NOT NULL,
    team_id integer NOT NULL,
    category_id integer NOT NULL
);
    DROP TABLE public.events;
       public         heap    postgres    false    4            �            1259    75471    events_category_id_seq    SEQUENCE     �   CREATE SEQUENCE public.events_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.events_category_id_seq;
       public          postgres    false    222    4            k           0    0    events_category_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.events_category_id_seq OWNED BY public.events.category_id;
          public          postgres    false    221            �            1259    75469    events_event_id_seq    SEQUENCE     �   CREATE SEQUENCE public.events_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.events_event_id_seq;
       public          postgres    false    222    4            l           0    0    events_event_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.events_event_id_seq OWNED BY public.events.event_id;
          public          postgres    false    219            �            1259    75470    events_team_id_seq    SEQUENCE     �   CREATE SEQUENCE public.events_team_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.events_team_id_seq;
       public          postgres    false    222    4            m           0    0    events_team_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.events_team_id_seq OWNED BY public.events.team_id;
          public          postgres    false    220            �            1259    75501    schedule    TABLE     �   CREATE TABLE public.schedule (
    schedule_id integer NOT NULL,
    date date,
    start_time time without time zone,
    end_time time without time zone,
    event_id integer NOT NULL
);
    DROP TABLE public.schedule;
       public         heap    postgres    false    4            �            1259    75500    schedule_event_id_seq    SEQUENCE     �   CREATE SEQUENCE public.schedule_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.schedule_event_id_seq;
       public          postgres    false    225    4            n           0    0    schedule_event_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.schedule_event_id_seq OWNED BY public.schedule.event_id;
          public          postgres    false    224            �            1259    75499    schedule_schedule_id_seq    SEQUENCE     �   CREATE SEQUENCE public.schedule_schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.schedule_schedule_id_seq;
       public          postgres    false    225    4            o           0    0    schedule_schedule_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.schedule_schedule_id_seq OWNED BY public.schedule.schedule_id;
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
       public         heap    postgres    false    4            �            1259    75555    scoreboard_event_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scoreboard_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.scoreboard_event_id_seq;
       public          postgres    false    4    233            p           0    0    scoreboard_event_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.scoreboard_event_id_seq OWNED BY public.scoreboard.event_id;
          public          postgres    false    231            �            1259    75556    scoreboard_schedule_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scoreboard_schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE public.scoreboard_schedule_id_seq;
       public          postgres    false    233    4            q           0    0    scoreboard_schedule_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE public.scoreboard_schedule_id_seq OWNED BY public.scoreboard.schedule_id;
          public          postgres    false    232            �            1259    75552    scoreboard_scoreboard_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scoreboard_scoreboard_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public.scoreboard_scoreboard_id_seq;
       public          postgres    false    233    4            r           0    0    scoreboard_scoreboard_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE public.scoreboard_scoreboard_id_seq OWNED BY public.scoreboard.scoreboard_id;
          public          postgres    false    228            �            1259    75553    scoreboard_team_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scoreboard_team_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.scoreboard_team_id_seq;
       public          postgres    false    233    4            s           0    0    scoreboard_team_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.scoreboard_team_id_seq OWNED BY public.scoreboard.team_id;
          public          postgres    false    229            �            1259    75554    scoreboard_user_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scoreboard_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.scoreboard_user_id_seq;
       public          postgres    false    4    233            t           0    0    scoreboard_user_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.scoreboard_user_id_seq OWNED BY public.scoreboard.user_id;
          public          postgres    false    230            �            1259    75424    team    TABLE     i   CREATE TABLE public.team (
    team_id integer NOT NULL,
    team_name character varying(15) NOT NULL
);
    DROP TABLE public.team;
       public         heap    postgres    false    4            �            1259    75423    team_team_id_seq    SEQUENCE     �   CREATE SEQUENCE public.team_team_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.team_team_id_seq;
       public          postgres    false    216    4            u           0    0    team_team_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.team_team_id_seq OWNED BY public.team.team_id;
          public          postgres    false    215            �            1259    75514    useraccount    TABLE     �   CREATE TABLE public.useraccount (
    user_id integer NOT NULL,
    user_name character varying(15),
    password text,
    user_type character varying(15)
);
    DROP TABLE public.useraccount;
       public         heap    postgres    false    4            �            1259    75513    useraccount_user_id_seq    SEQUENCE     �   CREATE SEQUENCE public.useraccount_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.useraccount_user_id_seq;
       public          postgres    false    227    4            v           0    0    useraccount_user_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.useraccount_user_id_seq OWNED BY public.useraccount.user_id;
          public          postgres    false    226            �            1259    75588    vw_eventdetails    VIEW     g  CREATE VIEW public.vw_eventdetails AS
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
       public          postgres    false    225    233    233    233    233    227    227    225    225    225    222    222    222    222    222    218    218    218    216    216    4            �           2604    75434    category category_id    DEFAULT     |   ALTER TABLE ONLY public.category ALTER COLUMN category_id SET DEFAULT nextval('public.category_category_id_seq'::regclass);
 C   ALTER TABLE public.category ALTER COLUMN category_id DROP DEFAULT;
       public          postgres    false    217    218    218            �           2604    75475    events event_id    DEFAULT     r   ALTER TABLE ONLY public.events ALTER COLUMN event_id SET DEFAULT nextval('public.events_event_id_seq'::regclass);
 >   ALTER TABLE public.events ALTER COLUMN event_id DROP DEFAULT;
       public          postgres    false    219    222    222            �           2604    75476    events team_id    DEFAULT     p   ALTER TABLE ONLY public.events ALTER COLUMN team_id SET DEFAULT nextval('public.events_team_id_seq'::regclass);
 =   ALTER TABLE public.events ALTER COLUMN team_id DROP DEFAULT;
       public          postgres    false    222    220    222            �           2604    75477    events category_id    DEFAULT     x   ALTER TABLE ONLY public.events ALTER COLUMN category_id SET DEFAULT nextval('public.events_category_id_seq'::regclass);
 A   ALTER TABLE public.events ALTER COLUMN category_id DROP DEFAULT;
       public          postgres    false    222    221    222            �           2604    75504    schedule schedule_id    DEFAULT     |   ALTER TABLE ONLY public.schedule ALTER COLUMN schedule_id SET DEFAULT nextval('public.schedule_schedule_id_seq'::regclass);
 C   ALTER TABLE public.schedule ALTER COLUMN schedule_id DROP DEFAULT;
       public          postgres    false    223    225    225            �           2604    75505    schedule event_id    DEFAULT     v   ALTER TABLE ONLY public.schedule ALTER COLUMN event_id SET DEFAULT nextval('public.schedule_event_id_seq'::regclass);
 @   ALTER TABLE public.schedule ALTER COLUMN event_id DROP DEFAULT;
       public          postgres    false    224    225    225            �           2604    75560    scoreboard scoreboard_id    DEFAULT     �   ALTER TABLE ONLY public.scoreboard ALTER COLUMN scoreboard_id SET DEFAULT nextval('public.scoreboard_scoreboard_id_seq'::regclass);
 G   ALTER TABLE public.scoreboard ALTER COLUMN scoreboard_id DROP DEFAULT;
       public          postgres    false    228    233    233            �           2604    75561    scoreboard team_id    DEFAULT     x   ALTER TABLE ONLY public.scoreboard ALTER COLUMN team_id SET DEFAULT nextval('public.scoreboard_team_id_seq'::regclass);
 A   ALTER TABLE public.scoreboard ALTER COLUMN team_id DROP DEFAULT;
       public          postgres    false    233    229    233            �           2604    75562    scoreboard user_id    DEFAULT     x   ALTER TABLE ONLY public.scoreboard ALTER COLUMN user_id SET DEFAULT nextval('public.scoreboard_user_id_seq'::regclass);
 A   ALTER TABLE public.scoreboard ALTER COLUMN user_id DROP DEFAULT;
       public          postgres    false    233    230    233            �           2604    75563    scoreboard event_id    DEFAULT     z   ALTER TABLE ONLY public.scoreboard ALTER COLUMN event_id SET DEFAULT nextval('public.scoreboard_event_id_seq'::regclass);
 B   ALTER TABLE public.scoreboard ALTER COLUMN event_id DROP DEFAULT;
       public          postgres    false    233    231    233            �           2604    75564    scoreboard schedule_id    DEFAULT     �   ALTER TABLE ONLY public.scoreboard ALTER COLUMN schedule_id SET DEFAULT nextval('public.scoreboard_schedule_id_seq'::regclass);
 E   ALTER TABLE public.scoreboard ALTER COLUMN schedule_id DROP DEFAULT;
       public          postgres    false    233    232    233            �           2604    75427    team team_id    DEFAULT     l   ALTER TABLE ONLY public.team ALTER COLUMN team_id SET DEFAULT nextval('public.team_team_id_seq'::regclass);
 ;   ALTER TABLE public.team ALTER COLUMN team_id DROP DEFAULT;
       public          postgres    false    216    215    216            �           2604    75517    useraccount user_id    DEFAULT     z   ALTER TABLE ONLY public.useraccount ALTER COLUMN user_id SET DEFAULT nextval('public.useraccount_user_id_seq'::regclass);
 B   ALTER TABLE public.useraccount ALTER COLUMN user_id DROP DEFAULT;
       public          postgres    false    227    226    227            S          0    75431    category 
   TABLE DATA           H   COPY public.category (category_id, category_name, division) FROM stdin;
    public          postgres    false    218   F      W          0    75472    events 
   TABLE DATA           S   COPY public.events (event_id, event_name, venue, team_id, category_id) FROM stdin;
    public          postgres    false    222   �      Z          0    75501    schedule 
   TABLE DATA           U   COPY public.schedule (schedule_id, date, start_time, end_time, event_id) FROM stdin;
    public          postgres    false    225   G      b          0    75557 
   scoreboard 
   TABLE DATA           l   COPY public.scoreboard (scoreboard_id, score, ranking, team_id, user_id, event_id, schedule_id) FROM stdin;
    public          postgres    false    233   �      Q          0    75424    team 
   TABLE DATA           2   COPY public.team (team_id, team_name) FROM stdin;
    public          postgres    false    216   �      \          0    75514    useraccount 
   TABLE DATA           N   COPY public.useraccount (user_id, user_name, password, user_type) FROM stdin;
    public          postgres    false    227   U      w           0    0    category_category_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.category_category_id_seq', 5, true);
          public          postgres    false    217            x           0    0    events_category_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.events_category_id_seq', 1, false);
          public          postgres    false    221            y           0    0    events_event_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.events_event_id_seq', 20, true);
          public          postgres    false    219            z           0    0    events_team_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.events_team_id_seq', 1, false);
          public          postgres    false    220            {           0    0    schedule_event_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.schedule_event_id_seq', 1, false);
          public          postgres    false    224            |           0    0    schedule_schedule_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.schedule_schedule_id_seq', 25, true);
          public          postgres    false    223            }           0    0    scoreboard_event_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.scoreboard_event_id_seq', 1, false);
          public          postgres    false    231            ~           0    0    scoreboard_schedule_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.scoreboard_schedule_id_seq', 1, false);
          public          postgres    false    232                       0    0    scoreboard_scoreboard_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.scoreboard_scoreboard_id_seq', 40, true);
          public          postgres    false    228            �           0    0    scoreboard_team_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.scoreboard_team_id_seq', 1, false);
          public          postgres    false    229            �           0    0    scoreboard_user_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.scoreboard_user_id_seq', 1, false);
          public          postgres    false    230            �           0    0    team_team_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.team_team_id_seq', 6, true);
          public          postgres    false    215            �           0    0    useraccount_user_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('public.useraccount_user_id_seq', 8, true);
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
       public            postgres    false    222            �           2620    75598     scoreboard trg_update_totalscore    TRIGGER     �   CREATE TRIGGER trg_update_totalscore AFTER INSERT OR DELETE OR UPDATE ON public.scoreboard FOR EACH ROW EXECUTE FUNCTION public.fn_update_totalscore();
 9   DROP TRIGGER trg_update_totalscore ON public.scoreboard;
       public          postgres    false    233    238            �           2606    75485    events category_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.events
    ADD CONSTRAINT category_id FOREIGN KEY (category_id) REFERENCES public.category(category_id) ON DELETE CASCADE;
 <   ALTER TABLE ONLY public.events DROP CONSTRAINT category_id;
       public          postgres    false    218    222    4782            �           2606    75508    schedule event_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.schedule
    ADD CONSTRAINT event_id FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE;
 ;   ALTER TABLE ONLY public.schedule DROP CONSTRAINT event_id;
       public          postgres    false    225    4785    222            �           2606    75577    scoreboard event_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.scoreboard
    ADD CONSTRAINT event_id FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE;
 =   ALTER TABLE ONLY public.scoreboard DROP CONSTRAINT event_id;
       public          postgres    false    222    4785    233            �           2606    75582    scoreboard schedule_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.scoreboard
    ADD CONSTRAINT schedule_id FOREIGN KEY (schedule_id) REFERENCES public.schedule(schedule_id) ON DELETE CASCADE;
 @   ALTER TABLE ONLY public.scoreboard DROP CONSTRAINT schedule_id;
       public          postgres    false    233    4787    225            �           2606    75480    events team_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.events
    ADD CONSTRAINT team_id FOREIGN KEY (team_id) REFERENCES public.team(team_id) ON DELETE CASCADE;
 8   ALTER TABLE ONLY public.events DROP CONSTRAINT team_id;
       public          postgres    false    216    4780    222            �           2606    75567    scoreboard team_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.scoreboard
    ADD CONSTRAINT team_id FOREIGN KEY (team_id) REFERENCES public.team(team_id) ON DELETE CASCADE;
 <   ALTER TABLE ONLY public.scoreboard DROP CONSTRAINT team_id;
       public          postgres    false    233    4780    216            �           2606    75572    scoreboard user_id    FK CONSTRAINT     �   ALTER TABLE ONLY public.scoreboard
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES public.useraccount(user_id) ON DELETE CASCADE;
 <   ALTER TABLE ONLY public.scoreboard DROP CONSTRAINT user_id;
       public          postgres    false    233    4789    227            S   V   x�3�tJ��QpO�M-��M�IUp�,�,����2B�rK�E�4���,�-��	�ON��2��ACDM9}����|321����� ^m*�      W   �   x��K
�0����"'��X�"B���i$�N$�`oo��{0�(���$1�&:1㺀��lr�g��k	I� ��[Р!n�HN��)&\�M��}n�w8����!i����%��5�Q����]j�tN�����g�����@D8�/      Z   O   x�M�A
�@��_V��+�[��;�C[!��L�hr��Zt���ŨB�ƨf��(2�z\P�Ƭ�,Hh���q?�9 ���      b   F   x�%���0�7S��N�]��E�NB�@ӈ_ �:8���#���Y)��n��(d�f���l>�t\�      Q   I   x�3��M,�L�+-�2���/N-� 2�9K����L8��A��D.SN�ļ����\.3N�Ģ��R�h� �,      \   �   x�M�Ms�0E���`�$`ťR�Q��7/&`Jx��:�_�
�͝�����Yjl��ʉ;+� BcN�|ȋS�$�'��U��	�kl�W0�O����`�\���:1$�rg�oe�ǅ�|.l�ɉGE=�ҕ�4Vq�F���3���,t��&Q���m_���c�r�B�����k�����>9,'۱ٛ/�F��e��l����w�`�V{��_�_     