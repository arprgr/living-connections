create table users (
	id SERIAL PRIMARY KEY,
	name varchar(24),
	google_id varchar,
	admin boolean DEFAULT FALSE,
	disabled boolean DEFAULT FALSE,
	created_at timestamp with time zone DEFAULT (now() at time zone 'utc')
);

create table user_contacts (
	user_id int REFERENCES users NOT NULL,
	contact_name varchar NOT NULL,
	contact_id int REFERENCES users NULL
);
