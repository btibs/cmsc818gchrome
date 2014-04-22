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
  event_name varchar NOT NULL,
  event_type int NOT NULL,
  comments text,
  priority int,
  difficulty int
);

-- even though we are planning on only one user, we need to store info somewhere
--DROP TABLE userinfo;
CREATE TABLE userinfo (
  id SERIAL PRIMARY KEY,
  name varchar NOT NULL,
  age int,
  gender varchar,
  location text
);

--DROP USER cmsc818g;
CREATE USER cmsc818g PASSWORD 'pwd';
GRANT ALL ON DATABASE usagelog TO cmsc818g;
GRANT ALL ON ALL TABLES IN SCHEMA public TO cmsc818g;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO cmsc818g;
