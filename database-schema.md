# Database Schema

**Instructions:**
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Run each query section from `database-schema-export.sql` 
4. Copy the results for each section below

---

## Tables and Columns

```
Paste PART 1 results here (all tables and their columns)
...

| table_name    | column_name        | data_type                   | character_maximum_length | is_nullable | column_default                                         |
| ------------- | ------------------ | --------------------------- | ------------------------ | ----------- | ------------------------------------------------------ |
| _categories   | cat_id             | smallint                    | null                     | NO          | null                                                   |
| _categories   | cat_name           | character varying           | 3                        | NO          | null                                                   |
| _categories   | age                | smallint                    | null                     | NO          | null                                                   |
| _categories   | cat_gender         | character                   | 1                        | NO          | null                                                   |
| _categories   | created_at         | timestamp with time zone    | null                     | YES         | now()                                                  |
| _categories   | updated_at         | timestamp with time zone    | null                     | YES         | now()                                                  |
| _categories   | cat_group_id       | integer                     | null                     | YES         | null                                                   |
| _groups       | id                 | bigint                      | null                     | NO          | null                                                   |
| _groups       | created_at         | timestamp with time zone    | null                     | NO          | now()                                                  |
| _groups       | group_name         | text                        | null                     | YES         | null                                                   |
| _limits       | lim_id             | smallint                    | null                     | NO          | null                                                   |
| _limits       | lim_course         | smallint                    | null                     | NO          | null                                                   |
| _limits       | lim_gender         | character                   | 1                        | NO          | null                                                   |
| _limits       | lim_cat            | integer                     | null                     | YES         | null                                                   |
| _limits       | lim_race_id        | integer                     | null                     | YES         | null                                                   |
| _limits       | lim_time_dec       | integer                     | null                     | YES         | null                                                   |
| _limits       | note               | text                        | null                     | YES         | null                                                   |
| _limits       | created_at         | timestamp with time zone    | null                     | YES         | now()                                                  |
| _limits       | updated_at         | timestamp with time zone    | null                     | YES         | now()                                                  |
| _limits       | lim_season_id      | smallint                    | null                     | YES         | '0'::smallint                                          |
| _races        | race_id            | smallint                    | null                     | NO          | null                                                   |
| _races        | race_id_fin        | smallint                    | null                     | YES         | null                                                   |
| _races        | distance           | smallint                    | null                     | NO          | null                                                   |
| _races        | relay_count        | smallint                    | null                     | YES         | null                                                   |
| _races        | stroke_long_en     | character varying           | 50                       | YES         | null                                                   |
| _races        | stroke_short_en    | character varying           | 10                       | YES         | null                                                   |
| _races        | stroke_long_it     | character varying           | 50                       | YES         | null                                                   |
| _races        | stroke_short_it    | character varying           | 10                       | YES         | null                                                   |
| _races        | stroke_long_de     | character varying           | 50                       | YES         | null                                                   |
| _races        | stroke_short_de    | character varying           | 10                       | YES         | null                                                   |
| _races        | created_at         | timestamp with time zone    | null                     | YES         | now()                                                  |
| _races        | updated_at         | timestamp with time zone    | null                     | YES         | now()                                                  |
| _seasons      | season_id          | smallint                    | null                     | NO          | null                                                   |
| _seasons      | season_name        | character varying           | 100                      | NO          | null                                                   |
| _seasons      | season_start       | date                        | null                     | NO          | null                                                   |
| _seasons      | season_end         | date                        | null                     | NO          | null                                                   |
| _seasons      | created_at         | timestamp with time zone    | null                     | YES         | now()                                                  |
| _seasons      | updated_at         | timestamp with time zone    | null                     | YES         | now()                                                  |
| _status       | status_id          | smallint                    | null                     | NO          | null                                                   |
| _status       | description        | character varying           | 100                      | NO          | null                                                   |
| athletes      | fincode            | integer                     | null                     | NO          | null                                                   |
| athletes      | firstname          | character varying           | 100                      | NO          | null                                                   |
| athletes      | lastname           | character varying           | 100                      | NO          | null                                                   |
| athletes      | birthdate          | date                        | null                     | NO          | null                                                   |
| athletes      | gender             | character                   | 1                        | NO          | null                                                   |
| athletes      | email              | character varying           | 255                      | YES         | null                                                   |
| athletes      | phone              | character varying           | 20                       | YES         | null                                                   |
| athletes      | created_at         | timestamp with time zone    | null                     | YES         | now()                                                  |
| athletes      | updated_at         | timestamp with time zone    | null                     | YES         | now()                                                  |
| attendance    | att_id             | bigint                      | null                     | NO          | nextval('attendance_att_id_seq'::regclass)             |
| attendance    | sess_id            | bigint                      | null                     | NO          | null                                                   |
| attendance    | fincode            | integer                     | null                     | NO          | null                                                   |
| attendance    | status_code        | smallint                    | null                     | NO          | null                                                   |
| attendance    | created_at         | timestamp with time zone    | null                     | YES         | now()                                                  |
| attendance    | updated_at         | timestamp with time zone    | null                     | YES         | now()                                                  |
| events        | ms_id              | bigint                      | null                     | NO          | nextval('events_ms_id_seq'::regclass)                  |
| events        | meet_id            | integer                     | null                     | YES         | null                                                   |
| events        | event_numb         | smallint                    | null                     | YES         | null                                                   |
| events        | ms_race_id         | smallint                    | null                     | YES         | null                                                   |
| events        | gender             | character varying           | null                     | YES         | null                                                   |
| events        | ms_group_id        | smallint                    | null                     | YES         | null                                                   |
| events        | created_at         | timestamp without time zone | null                     | YES         | now()                                                  |
| meet_groups   | meet_id            | integer                     | null                     | NO          | null                                                   |
| meet_groups   | group_id           | integer                     | null                     | NO          | null                                                   |
| meets         | meet_id            | smallint                    | null                     | NO          | nextval('meets_meet_id_seq'::regclass)                 |
| meets         | meet_name          | character varying           | 200                      | NO          | null                                                   |
| meets         | pool_name          | character varying           | 100                      | YES         | null                                                   |
| meets         | place              | character varying           | 100                      | YES         | null                                                   |
| meets         | nation             | character varying           | 3                        | YES         | null                                                   |
| meets         | min_date           | date                        | null                     | NO          | null                                                   |
| meets         | max_date           | date                        | null                     | NO          | null                                                   |
| meets         | meet_course        | smallint                    | null                     | NO          | null                                                   |
| meets         | created_at         | timestamp with time zone    | null                     | YES         | now()                                                  |
| meets         | updated_at         | timestamp with time zone    | null                     | YES         | now()                                                  |
| relay_results | relay_result_id    | bigint                      | null                     | NO          | nextval('relay_results_relay_result_id_seq'::regclass) |
| relay_results | meet_id            | smallint                    | null                     | NO          | null                                                   |
| relay_results | event_numb         | smallint                    | null                     | NO          | null                                                   |
| relay_results | relay_name         | character varying           | 100                      | NO          | null                                                   |
| relay_results | leg1_fincode       | integer                     | null                     | NO          | null                                                   |
| relay_results | leg1_entry_time    | integer                     | null                     | NO          | 0                                                      |
| relay_results | leg2_fincode       | integer                     | null                     | NO          | null                                                   |
| relay_results | leg2_entry_time    | integer                     | null                     | NO          | 0                                                      |
| relay_results | leg3_fincode       | integer                     | null                     | NO          | null                                                   |
| relay_results | leg3_entry_time    | integer                     | null                     | NO          | 0                                                      |
| relay_results | leg4_fincode       | integer                     | null                     | NO          | null                                                   |
| relay_results | leg4_entry_time    | integer                     | null                     | NO          | 0                                                      |
| relay_results | created_at         | timestamp with time zone    | null                     | NO          | now()                                                  |
| relay_results | updated_at         | timestamp with time zone    | null                     | NO          | now()                                                  |
| relay_results | leg1_res_time      | integer                     | null                     | YES         | 0                                                      |
| relay_results | leg2_res_time      | integer                     | null                     | YES         | 0                                                      |
| relay_results | leg3_res_time      | integer                     | null                     | YES         | 0                                                      |
| relay_results | leg4_res_time      | integer                     | null                     | YES         | 0                                                      |
| results       | res_id             | bigint                      | null                     | NO          | nextval('results_res_id_seq'::regclass)                |
| results       | fincode            | integer                     | null                     | NO          | null                                                   |
| results       | meet_id            | smallint                    | null                     | NO          | null                                                   |
| results       | event_numb         | smallint                    | null                     | NO          | null                                                   |
| results       | res_time_decimal   | integer                     | null                     | YES         | null                                                   |
| results       | created_at         | timestamp with time zone    | null                     | YES         | now()                                                  |
| results       | updated_at         | timestamp with time zone    | null                     | YES         | now()                                                  |
| results       | entry_time_decimal | integer                     | null                     | YES         | null                                                   |

---

## Primary Keys

```
Paste PART 2 results here (primary keys)
```
| table_name    | column_name     | constraint_type |
| ------------- | --------------- | --------------- |
| _categories   | cat_id          | PRIMARY KEY     |
| _groups       | id              | PRIMARY KEY     |
| _limits       | lim_id          | PRIMARY KEY     |
| _races        | race_id         | PRIMARY KEY     |
| _seasons      | season_id       | PRIMARY KEY     |
| _status       | status_id       | PRIMARY KEY     |
| athletes      | fincode         | PRIMARY KEY     |
| attendance    | att_id          | PRIMARY KEY     |
| events        | ms_id           | PRIMARY KEY     |
| meet_groups   | group_id        | PRIMARY KEY     |
| meet_groups   | meet_id         | PRIMARY KEY     |
| meets         | meet_id         | PRIMARY KEY     |
| relay_results | relay_result_id | PRIMARY KEY     |
| results       | res_id          | PRIMARY KEY     |
| roster        | roster_id       | PRIMARY KEY     |
| sessions      | sess_id         | PRIMARY KEY     |
| splits        | splits_id       | PRIMARY KEY     |
---

## Foreign Keys / Relationships

```
Paste PART 3 results here (foreign key relationships)
```
| from_table    | from_column   | to_table    | to_column |
| ------------- | ------------- | ----------- | --------- |
| _limits       | lim_cat       | _categories | cat_id    |
| _limits       | lim_race_id   | _races      | race_id   |
| attendance    | fincode       | athletes    | fincode   |
| attendance    | sess_id       | sessions    | sess_id   |
| attendance    | status_code   | _status     | status_id |
| events        | meet_id       | meets       | meet_id   |
| events        | ms_race_id    | _races      | race_id   |
| events        | ms_group_id   | _groups     | id        |
| meet_groups   | group_id      | _categories | cat_id    |
| meet_groups   | meet_id       | meets       | meet_id   |
| relay_results | leg1_fincode  | athletes    | fincode   |
| relay_results | leg2_fincode  | athletes    | fincode   |
| relay_results | leg3_fincode  | athletes    | fincode   |
| relay_results | leg4_fincode  | athletes    | fincode   |
| relay_results | meet_id       | meets       | meet_id   |
| results       | fincode       | athletes    | fincode   |
| results       | meet_id       | meets       | meet_id   |
| roster        | season_id     | _seasons    | season_id |
| roster        | ros_cat_id    | _categories | cat_id    |
| roster        | fincode       | athletes    | fincode   |
| sessions      | sess_group_id | _groups     | id        |
| splits        | splits_res_id | results     | res_id    |
---

## Stored Functions/Procedures

```
Paste PART 4 results here (function names and return types)
```
| routine_name                    | routine_type | return_type |
| ------------------------------- | ------------ | ----------- |
| attendance_summary              | FUNCTION     | record      |
| attendance_trend                | FUNCTION     | record      |
| get_athletes_details            | FUNCTION     | record      |
| get_attendance_trends_by_month  | FUNCTION     | record      |
| get_best_permillili             | FUNCTION     | record      |
| get_eligible_athletes_for_event | FUNCTION     | record      |
| get_meet_events_with_details    | FUNCTION     | record      |
| get_permillili                  | FUNCTION     | record      |
| get_personal_best               | FUNCTION     | record      |
| get_relay_swimmers              | FUNCTION     | record      |
| totaltime_to_timestr            | FUNCTION     | text        |
| update_relay_results_updated_at | FUNCTION     | trigger     |
| update_updated_at_column        | FUNCTION     | trigger     |
---

## Function Parameters

```
Paste PART 5 results here (function parameters)
```
| specific_name                         | routine_name                    | parameter_name        | parameter_mode | data_type                   |
| ------------------------------------- | ------------------------------- | --------------------- | -------------- | --------------------------- |
| attendance_summary_69113              | attendance_summary              | p_season_id           | IN             | integer                     |
| attendance_summary_69113              | attendance_summary              | p_group_id            | IN             | integer                     |
| attendance_summary_69113              | attendance_summary              | p_type                | IN             | text                        |
| attendance_summary_69113              | attendance_summary              | fincode               | OUT            | integer                     |
| attendance_summary_69113              | attendance_summary              | firstname             | OUT            | character varying           |
| attendance_summary_69113              | attendance_summary              | lastname              | OUT            | character varying           |
| attendance_summary_69113              | attendance_summary              | cat_name              | OUT            | character varying           |
| attendance_summary_69113              | attendance_summary              | group_name            | OUT            | text                        |
| attendance_summary_69113              | attendance_summary              | total_sessions        | OUT            | bigint                      |
| attendance_summary_69113              | attendance_summary              | present_count         | OUT            | bigint                      |
| attendance_summary_69113              | attendance_summary              | justified_count       | OUT            | bigint                      |
| attendance_summary_69113              | attendance_summary              | late_count            | OUT            | bigint                      |
| attendance_summary_69113              | attendance_summary              | absent_count          | OUT            | bigint                      |
| attendance_summary_69113              | attendance_summary              | attendance_percentage | OUT            | numeric                     |
| attendance_trend_69118                | attendance_trend                | p_season_id           | IN             | integer                     |
| attendance_trend_69118                | attendance_trend                | p_group_id            | IN             | integer                     |
| attendance_trend_69118                | attendance_trend                | p_type                | IN             | text                        |
| attendance_trend_69118                | attendance_trend                | p_fincode             | IN             | integer                     |
| attendance_trend_69118                | attendance_trend                | fincode               | OUT            | integer                     |
| attendance_trend_69118                | attendance_trend                | firstname             | OUT            | character varying           |
| attendance_trend_69118                | attendance_trend                | lastname              | OUT            | character varying           |
| attendance_trend_69118                | attendance_trend                | cat_name              | OUT            | character varying           |
| attendance_trend_69118                | attendance_trend                | group_name            | OUT            | text                        |
| attendance_trend_69118                | attendance_trend                | month_year            | OUT            | text                        |
| attendance_trend_69118                | attendance_trend                | month_date            | OUT            | date                        |
| attendance_trend_69118                | attendance_trend                | total_sessions        | OUT            | bigint                      |
| attendance_trend_69118                | attendance_trend                | present_count         | OUT            | bigint                      |
| attendance_trend_69118                | attendance_trend                | justified_count       | OUT            | bigint                      |
| attendance_trend_69118                | attendance_trend                | late_count            | OUT            | bigint                      |
| attendance_trend_69118                | attendance_trend                | absent_count          | OUT            | bigint                      |
| attendance_trend_69118                | attendance_trend                | attendance_percentage | OUT            | numeric                     |
| get_athletes_details_66889            | get_athletes_details            | p_season_id           | IN             | integer                     |
| get_athletes_details_66889            | get_athletes_details            | p_group_id            | IN             | integer                     |
| get_athletes_details_66889            | get_athletes_details            | fincode               | OUT            | integer                     |
| get_athletes_details_66889            | get_athletes_details            | firstname             | OUT            | character varying           |
| get_athletes_details_66889            | get_athletes_details            | lastname              | OUT            | character varying           |
| get_athletes_details_66889            | get_athletes_details            | birthdate             | OUT            | date                        |
| get_athletes_details_66889            | get_athletes_details            | gender                | OUT            | character                   |
| get_athletes_details_66889            | get_athletes_details            | email                 | OUT            | character varying           |
| get_athletes_details_66889            | get_athletes_details            | phone                 | OUT            | character varying           |
| get_athletes_details_66889            | get_athletes_details            | season_id             | OUT            | smallint                    |
| get_athletes_details_66889            | get_athletes_details            | ros_cat_id            | OUT            | smallint                    |
| get_athletes_details_66889            | get_athletes_details            | cat_name              | OUT            | character varying           |
| get_athletes_details_66889            | get_athletes_details            | cat_group_id          | OUT            | integer                     |
| get_athletes_details_66889            | get_athletes_details            | group_name            | OUT            | text                        |
| get_attendance_trends_by_month_67998  | get_attendance_trends_by_month  | p_season_id           | IN             | integer                     |
| get_attendance_trends_by_month_67998  | get_attendance_trends_by_month  | month_year            | OUT            | text                        |
| get_attendance_trends_by_month_67998  | get_attendance_trends_by_month  | total_sessions        | OUT            | bigint                      |
| get_attendance_trends_by_month_67998  | get_attendance_trends_by_month  | attendance_rate       | OUT            | numeric                     |
| get_best_permillili_66830             | get_best_permillili             | p_season_id           | IN             | integer                     |
| get_best_permillili_66830             | get_best_permillili             | p_course              | IN             | integer                     |
| get_best_permillili_66830             | get_best_permillili             | res_id                | OUT            | bigint                      |
| get_best_permillili_66830             | get_best_permillili             | fincode               | OUT            | integer                     |
| get_best_permillili_66830             | get_best_permillili             | meet_id               | OUT            | smallint                    |
| get_best_permillili_66830             | get_best_permillili             | event_numb            | OUT            | smallint                    |
| get_best_permillili_66830             | get_best_permillili             | ms_race_id            | OUT            | smallint                    |
| get_best_permillili_66830             | get_best_permillili             | res_time_decimal      | OUT            | integer                     |
| get_best_permillili_66830             | get_best_permillili             | res_time_str          | OUT            | text                        |
| get_best_permillili_66830             | get_best_permillili             | entry_time_decimal    | OUT            | integer                     |
| get_best_permillili_66830             | get_best_permillili             | entry_time_str        | OUT            | text                        |
| get_best_permillili_66830             | get_best_permillili             | result_status         | OUT            | USER-DEFINED                |
| get_best_permillili_66830             | get_best_permillili             | athlete_firstname     | OUT            | character varying           |
| get_best_permillili_66830             | get_best_permillili             | athlete_lastname      | OUT            | character varying           |
| get_best_permillili_66830             | get_best_permillili             | athlete_gender        | OUT            | character                   |
| get_best_permillili_66830             | get_best_permillili             | meet_name             | OUT            | character varying           |
| get_best_permillili_66830             | get_best_permillili             | min_date              | OUT            | date                        |
| get_best_permillili_66830             | get_best_permillili             | meet_course           | OUT            | smallint                    |
| get_best_permillili_66830             | get_best_permillili             | ros_cat_id            | OUT            | smallint                    |
| get_best_permillili_66830             | get_best_permillili             | lim_time_dec          | OUT            | integer                     |
| get_best_permillili_66830             | get_best_permillili             | lim_time_str          | OUT            | text                        |
| get_best_permillili_66830             | get_best_permillili             | note                  | OUT            | text                        |
| get_best_permillili_66830             | get_best_permillili             | permillili            | OUT            | integer                     |
| get_best_permillili_66830             | get_best_permillili             | race_distance         | OUT            | smallint                    |
| get_best_permillili_66830             | get_best_permillili             | race_stroke_short     | OUT            | character varying           |
| get_eligible_athletes_for_event_57592 | get_eligible_athletes_for_event | p_season_id           | IN             | integer                     |
| get_eligible_athletes_for_event_57592 | get_eligible_athletes_for_event | p_event_gender        | IN             | text                        |
| get_eligible_athletes_for_event_57592 | get_eligible_athletes_for_event | p_event_group_id      | IN             | integer                     |
| get_eligible_athletes_for_event_57592 | get_eligible_athletes_for_event | p_race_id             | IN             | integer                     |
| get_eligible_athletes_for_event_57592 | get_eligible_athletes_for_event | p_meet_course         | IN             | integer                     |
| get_eligible_athletes_for_event_57592 | get_eligible_athletes_for_event | fincode               | OUT            | integer                     |
| get_eligible_athletes_for_event_57592 | get_eligible_athletes_for_event | lastname              | OUT            | character varying           |
| get_eligible_athletes_for_event_57592 | get_eligible_athletes_for_event | firstname             | OUT            | character varying           |
| get_eligible_athletes_for_event_57592 | get_eligible_athletes_for_event | gender                | OUT            | character                   |
| get_eligible_athletes_for_event_57592 | get_eligible_athletes_for_event | group_id              | OUT            | integer                     |
| get_eligible_athletes_for_event_57592 | get_eligible_athletes_for_event | personal_best         | OUT            | integer                     |
| get_eligible_athletes_for_event_57592 | get_eligible_athletes_for_event | pb_string             | OUT            | text                        |
| get_meet_events_with_details_57572    | get_meet_events_with_details    | p_meet_id             | IN             | integer                     |
| get_meet_events_with_details_57572    | get_meet_events_with_details    | ms_id                 | OUT            | bigint                      |
| get_meet_events_with_details_57572    | get_meet_events_with_details    | meet_id               | OUT            | integer                     |
| get_meet_events_with_details_57572    | get_meet_events_with_details    | event_numb            | OUT            | smallint                    |
| get_meet_events_with_details_57572    | get_meet_events_with_details    | ms_race_id            | OUT            | smallint                    |
| get_meet_events_with_details_57572    | get_meet_events_with_details    | gender                | OUT            | character varying           |
| get_meet_events_with_details_57572    | get_meet_events_with_details    | ms_group_id           | OUT            | smallint                    |
| get_meet_events_with_details_57572    | get_meet_events_with_details    | created_at            | OUT            | timestamp without time zone |
| get_meet_events_with_details_57572    | get_meet_events_with_details    | group_id              | OUT            | bigint                      |
| get_meet_events_with_details_57572    | get_meet_events_with_details    | group_name            | OUT            | text                        |
| get_meet_events_with_details_57572    | get_meet_events_with_details    | race_id               | OUT            | smallint                    |
| get_meet_events_with_details_57572    | get_meet_events_with_details    | race_id_fin           | OUT            | smallint                    |
| get_meet_events_with_details_57572    | get_meet_events_with_details    | distance              | OUT            | smallint                    |
| get_meet_events_with_details_57572    | get_meet_events_with_details    | stroke_short_en       | OUT            | character varying           |
| get_meet_events_with_details_57572    | get_meet_events_with_details    | stroke_long_en        | OUT            | character varying           |
| get_meet_events_with_details_57572    | get_meet_events_with_details    | stroke_long_it        | OUT            | character varying           |
| get_meet_events_with_details_57572    | get_meet_events_with_details    | relay_count           | OUT            | smallint                    |
| get_permillili_64610                  | get_permillili                  | p_season_id           | IN             | integer                     |
| get_permillili_64610                  | get_permillili                  | res_id                | OUT            | bigint                      |
| get_permillili_64610                  | get_permillili                  | fincode               | OUT            | integer                     |
| get_permillili_64610                  | get_permillili                  | meet_id               | OUT            | smallint                    |
| get_permillili_64610                  | get_permillili                  | event_numb            | OUT            | smallint                    |
| get_permillili_64610                  | get_permillili                  | ms_race_id            | OUT            | smallint                    |
| get_permillili_64610                  | get_permillili                  | res_time_decimal      | OUT            | integer                     |
| get_permillili_64610                  | get_permillili                  | entry_time_decimal    | OUT            | integer                     |
| get_permillili_64610                  | get_permillili                  | result_status         | OUT            | USER-DEFINED                |
| get_permillili_64610                  | get_permillili                  | athlete_firstname     | OUT            | character varying           |
| get_permillili_64610                  | get_permillili                  | athlete_lastname      | OUT            | character varying           |
| get_permillili_64610                  | get_permillili                  | athlete_gender        | OUT            | character                   |
| get_permillili_64610                  | get_permillili                  | meet_name             | OUT            | character varying           |
| get_permillili_64610                  | get_permillili                  | min_date              | OUT            | date                        |
| get_permillili_64610                  | get_permillili                  | meet_course           | OUT            | smallint                    |
| get_permillili_64610                  | get_permillili                  | ros_cat_id            | OUT            | smallint                    |
| get_permillili_64610                  | get_permillili                  | lim_time_dec          | OUT            | integer                     |
| get_permillili_64610                  | get_permillili                  | note                  | OUT            | text                        |
| get_permillili_64610                  | get_permillili                  | permillili            | OUT            | integer                     |
| get_permillili_64610                  | get_permillili                  | race_distance         | OUT            | smallint                    |
| get_permillili_64610                  | get_permillili                  | race_stroke_short     | OUT            | character varying           |
| get_personal_best_61167               | get_personal_best               | p_fincode             | IN             | integer                     |
| get_personal_best_61167               | get_personal_best               | p_ms_race_id          | IN             | integer                     |
| get_personal_best_61167               | get_personal_best               | p_course              | IN             | integer                     |
| get_personal_best_61167               | get_personal_best               | res_id                | OUT            | bigint                      |
| get_personal_best_61167               | get_personal_best               | fincode               | OUT            | integer                     |
| get_personal_best_61167               | get_personal_best               | meet_id               | OUT            | bigint                      |
| get_personal_best_61167               | get_personal_best               | event_numb            | OUT            | integer                     |
| get_personal_best_61167               | get_personal_best               | ms_race_id            | OUT            | integer                     |
| get_personal_best_61167               | get_personal_best               | race_id_fin           | OUT            | integer                     |
| get_personal_best_61167               | get_personal_best               | entry_time_decimal    | OUT            | numeric                     |
| get_personal_best_61167               | get_personal_best               | res_time_decimal      | OUT            | numeric                     |
| get_personal_best_61167               | get_personal_best               | meet_course           | OUT            | integer                     |
| get_relay_swimmers_58836              | get_relay_swimmers              | p_res_id              | IN             | bigint                      |
| get_relay_swimmers_58836              | get_relay_swimmers              | relay_res_id          | OUT            | bigint                      |
| get_relay_swimmers_58836              | get_relay_swimmers              | leg_number            | OUT            | smallint                    |
| get_relay_swimmers_58836              | get_relay_swimmers              | fincode               | OUT            | integer                     |
| get_relay_swimmers_58836              | get_relay_swimmers              | firstname             | OUT            | character varying           |
| get_relay_swimmers_58836              | get_relay_swimmers              | lastname              | OUT            | character varying           |
| get_relay_swimmers_58836              | get_relay_swimmers              | leg_time_decimal      | OUT            | integer                     |
| get_relay_swimmers_58836              | get_relay_swimmers              | formatted_time        | OUT            | text                        |
| totaltime_to_timestr_52800            | totaltime_to_timestr            | tenths_of_seconds     | IN             | numeric                     |
---

## Views

```
Paste PART 6 results here (view definitions)
```
[
  {
    "table_name": "_categories",
    "columns": [
      {
        "column": "cat_id",
        "type": "smallint",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "cat_name",
        "type": "character varying",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "age",
        "type": "smallint",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "cat_gender",
        "type": "character",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "nullable": "YES",
        "default": "now()"
      },
      {
        "column": "updated_at",
        "type": "timestamp with time zone",
        "nullable": "YES",
        "default": "now()"
      },
      {
        "column": "cat_group_id",
        "type": "integer",
        "nullable": "YES",
        "default": null
      }
    ]
  },
  {
    "table_name": "_groups",
    "columns": [
      {
        "column": "id",
        "type": "bigint",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "nullable": "NO",
        "default": "now()"
      },
      {
        "column": "group_name",
        "type": "text",
        "nullable": "YES",
        "default": null
      }
    ]
  },
  {
    "table_name": "_limits",
    "columns": [
      {
        "column": "lim_id",
        "type": "smallint",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "lim_course",
        "type": "smallint",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "lim_gender",
        "type": "character",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "lim_cat",
        "type": "integer",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "lim_race_id",
        "type": "integer",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "lim_time_dec",
        "type": "integer",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "note",
        "type": "text",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "nullable": "YES",
        "default": "now()"
      },
      {
        "column": "updated_at",
        "type": "timestamp with time zone",
        "nullable": "YES",
        "default": "now()"
      },
      {
        "column": "lim_season_id",
        "type": "smallint",
        "nullable": "YES",
        "default": "'0'::smallint"
      }
    ]
  },
  {
    "table_name": "_races",
    "columns": [
      {
        "column": "race_id",
        "type": "smallint",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "race_id_fin",
        "type": "smallint",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "distance",
        "type": "smallint",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "relay_count",
        "type": "smallint",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "stroke_long_en",
        "type": "character varying",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "stroke_short_en",
        "type": "character varying",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "stroke_long_it",
        "type": "character varying",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "stroke_short_it",
        "type": "character varying",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "stroke_long_de",
        "type": "character varying",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "stroke_short_de",
        "type": "character varying",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "nullable": "YES",
        "default": "now()"
      },
      {
        "column": "updated_at",
        "type": "timestamp with time zone",
        "nullable": "YES",
        "default": "now()"
      }
    ]
  },
  {
    "table_name": "_seasons",
    "columns": [
      {
        "column": "season_id",
        "type": "smallint",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "season_name",
        "type": "character varying",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "season_start",
        "type": "date",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "season_end",
        "type": "date",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "nullable": "YES",
        "default": "now()"
      },
      {
        "column": "updated_at",
        "type": "timestamp with time zone",
        "nullable": "YES",
        "default": "now()"
      }
    ]
  },
  {
    "table_name": "_status",
    "columns": [
      {
        "column": "status_id",
        "type": "smallint",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "description",
        "type": "character varying",
        "nullable": "NO",
        "default": null
      }
    ]
  },
  {
    "table_name": "athletes",
    "columns": [
      {
        "column": "fincode",
        "type": "integer",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "firstname",
        "type": "character varying",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "lastname",
        "type": "character varying",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "birthdate",
        "type": "date",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "gender",
        "type": "character",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "email",
        "type": "character varying",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "phone",
        "type": "character varying",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "nullable": "YES",
        "default": "now()"
      },
      {
        "column": "updated_at",
        "type": "timestamp with time zone",
        "nullable": "YES",
        "default": "now()"
      }
    ]
  },
  {
    "table_name": "attendance",
    "columns": [
      {
        "column": "att_id",
        "type": "bigint",
        "nullable": "NO",
        "default": "nextval('attendance_att_id_seq'::regclass)"
      },
      {
        "column": "sess_id",
        "type": "bigint",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "fincode",
        "type": "integer",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "status_code",
        "type": "smallint",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "nullable": "YES",
        "default": "now()"
      },
      {
        "column": "updated_at",
        "type": "timestamp with time zone",
        "nullable": "YES",
        "default": "now()"
      }
    ]
  },
  {
    "table_name": "events",
    "columns": [
      {
        "column": "ms_id",
        "type": "bigint",
        "nullable": "NO",
        "default": "nextval('events_ms_id_seq'::regclass)"
      },
      {
        "column": "meet_id",
        "type": "integer",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "event_numb",
        "type": "smallint",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "ms_race_id",
        "type": "smallint",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "gender",
        "type": "character varying",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "ms_group_id",
        "type": "smallint",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "created_at",
        "type": "timestamp without time zone",
        "nullable": "YES",
        "default": "now()"
      }
    ]
  },
  {
    "table_name": "meet_groups",
    "columns": [
      {
        "column": "meet_id",
        "type": "integer",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "group_id",
        "type": "integer",
        "nullable": "NO",
        "default": null
      }
    ]
  },
  {
    "table_name": "meets",
    "columns": [
      {
        "column": "meet_id",
        "type": "smallint",
        "nullable": "NO",
        "default": "nextval('meets_meet_id_seq'::regclass)"
      },
      {
        "column": "meet_name",
        "type": "character varying",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "pool_name",
        "type": "character varying",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "place",
        "type": "character varying",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "nation",
        "type": "character varying",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "min_date",
        "type": "date",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "max_date",
        "type": "date",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "meet_course",
        "type": "smallint",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "nullable": "YES",
        "default": "now()"
      },
      {
        "column": "updated_at",
        "type": "timestamp with time zone",
        "nullable": "YES",
        "default": "now()"
      }
    ]
  },
  {
    "table_name": "relay_results",
    "columns": [
      {
        "column": "relay_result_id",
        "type": "bigint",
        "nullable": "NO",
        "default": "nextval('relay_results_relay_result_id_seq'::regclass)"
      },
      {
        "column": "meet_id",
        "type": "smallint",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "event_numb",
        "type": "smallint",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "relay_name",
        "type": "character varying",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "leg1_fincode",
        "type": "integer",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "leg1_entry_time",
        "type": "integer",
        "nullable": "NO",
        "default": "0"
      },
      {
        "column": "leg2_fincode",
        "type": "integer",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "leg2_entry_time",
        "type": "integer",
        "nullable": "NO",
        "default": "0"
      },
      {
        "column": "leg3_fincode",
        "type": "integer",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "leg3_entry_time",
        "type": "integer",
        "nullable": "NO",
        "default": "0"
      },
      {
        "column": "leg4_fincode",
        "type": "integer",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "leg4_entry_time",
        "type": "integer",
        "nullable": "NO",
        "default": "0"
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "nullable": "NO",
        "default": "now()"
      },
      {
        "column": "updated_at",
        "type": "timestamp with time zone",
        "nullable": "NO",
        "default": "now()"
      },
      {
        "column": "leg1_res_time",
        "type": "integer",
        "nullable": "YES",
        "default": "0"
      },
      {
        "column": "leg2_res_time",
        "type": "integer",
        "nullable": "YES",
        "default": "0"
      },
      {
        "column": "leg3_res_time",
        "type": "integer",
        "nullable": "YES",
        "default": "0"
      },
      {
        "column": "leg4_res_time",
        "type": "integer",
        "nullable": "YES",
        "default": "0"
      }
    ]
  },
  {
    "table_name": "results",
    "columns": [
      {
        "column": "res_id",
        "type": "bigint",
        "nullable": "NO",
        "default": "nextval('results_res_id_seq'::regclass)"
      },
      {
        "column": "fincode",
        "type": "integer",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "meet_id",
        "type": "smallint",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "event_numb",
        "type": "smallint",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "res_time_decimal",
        "type": "integer",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "nullable": "YES",
        "default": "now()"
      },
      {
        "column": "updated_at",
        "type": "timestamp with time zone",
        "nullable": "YES",
        "default": "now()"
      },
      {
        "column": "entry_time_decimal",
        "type": "integer",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "result_status",
        "type": "USER-DEFINED",
        "nullable": "YES",
        "default": "'FINISHED'::result_status"
      }
    ]
  },
  {
    "table_name": "roster",
    "columns": [
      {
        "column": "roster_id",
        "type": "bigint",
        "nullable": "NO",
        "default": "nextval('roster_roster_id_seq'::regclass)"
      },
      {
        "column": "fincode",
        "type": "integer",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "season_id",
        "type": "smallint",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "nullable": "YES",
        "default": "now()"
      },
      {
        "column": "updated_at",
        "type": "timestamp with time zone",
        "nullable": "YES",
        "default": "now()"
      },
      {
        "column": "ros_cat_id",
        "type": "smallint",
        "nullable": "YES",
        "default": null
      }
    ]
  },
  {
    "table_name": "sessions",
    "columns": [
      {
        "column": "sess_id",
        "type": "bigint",
        "nullable": "NO",
        "default": "nextval('sessions_sess_id_seq'::regclass)"
      },
      {
        "column": "date",
        "type": "date",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "time",
        "type": "time without time zone",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "type",
        "type": "character varying",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "sector",
        "type": "character varying",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "description",
        "type": "text",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "volume",
        "type": "integer",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "location",
        "type": "character varying",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "pool_name",
        "type": "character varying",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "sess_course",
        "type": "smallint",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "nullable": "YES",
        "default": "now()"
      },
      {
        "column": "updated_at",
        "type": "timestamp with time zone",
        "nullable": "YES",
        "default": "now()"
      },
      {
        "column": "sess_group_id",
        "type": "smallint",
        "nullable": "YES",
        "default": "'0'::smallint"
      }
    ]
  },
  {
    "table_name": "splits",
    "columns": [
      {
        "column": "splits_id",
        "type": "bigint",
        "nullable": "NO",
        "default": "nextval('splits_splits_id_seq'::regclass)"
      },
      {
        "column": "splits_res_id",
        "type": "bigint",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "distance",
        "type": "smallint",
        "nullable": "NO",
        "default": null
      },
      {
        "column": "split_time",
        "type": "integer",
        "nullable": "YES",
        "default": null
      },
      {
        "column": "created_at",
        "type": "timestamp with time zone",
        "nullable": "YES",
        "default": "now()"
      },
      {
        "column": "updated_at",
        "type": "timestamp with time zone",
        "nullable": "YES",
        "default": "now()"
      }
    ]
  }
]
---

## Alternative JSON Format (Optional)

```
Paste ALTERNATIVE query results here (JSON structured table info)
```
