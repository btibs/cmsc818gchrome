-- SQL statements to set up tables in database

--DROP TABLE applications;
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  name varchar(50) NOT NULL,
  stamp timestamp without time zone NOT NULL
);

--DROP TABLE browsing;
CREATE TABLE browsing (
  id SERIAL PRIMARY KEY,
  url varchar NOT NULL,
  stamp timestamp without time zone NOT NULL
);

--DROP TABLE calendar;
CREATE TABLE calendar (
  id SERIAL PRIMARY KEY,
  event_time timestamp NOT NULL,
  event_end timestamp NOT NULL,
  event_name varchar NOT NULL,
  event_type int NOT NULL,
  comments text,
  workload int, -- how long user expects to spend on the task (in half-hours)
  priority int
);

--DROP USER cmsc818g;
CREATE USER cmsc818g PASSWORD 'pwd';
GRANT ALL ON DATABASE usagelog TO cmsc818g;
GRANT ALL ON ALL TABLES IN SCHEMA public TO cmsc818g;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO cmsc818g;
