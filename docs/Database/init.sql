-- Active: 1775691267862@@127.0.0.1@5432@sales_weakness

-- CREATE DATABASE "sales_weakness";

CREATE TABLE "campaigns" (
  "id" integer PRIMARY KEY,
  "tenant_id" integer NOT NULL,
  "name" varchar,
  "budget" decimal,
  "status" varchar,
  "created_at" timestamp
);

CREATE TABLE "leads" (
  "id" integer PRIMARY KEY,
  "tenant_id" integer NOT NULL,
  "campaign_id" integer,
  "first_name" varchar,
  "last_name" varchar,
  "email" varchar,
  "source" varchar,
  "is_inactive" boolean DEFAULT false,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "contacts" (
  "id" integer PRIMARY KEY,
  "tenant_id" integer NOT NULL,
  "lead_id" integer UNIQUE,
  "phone" varchar,
  "linkedin_url" varchar
);

CREATE TABLE "stages" (
  "id" integer PRIMARY KEY,
  "tenant_id" integer NOT NULL,
  "name" varchar,
  "order_position" integer,
  "probability_percent" integer
);

CREATE TABLE "opportunities" (
  "id" integer PRIMARY KEY,
  "tenant_id" integer NOT NULL,
  "lead_id" integer,
  "stage_id" integer,
  "assigned_user_id" integer,
  "value" decimal,
  "status" varchar,
  "lost_reason" varchar,
  "expected_close_date" date,
  "updated_at" timestamp,
  "created_at" timestamp
);

CREATE TABLE "audit_logs" (
  "id" integer PRIMARY KEY,
  "tenant_id" integer NOT NULL,
  "opportunity_id" integer,
  "weakness_type" varchar,
  "description" text,
  "created_at" timestamp
);

ALTER TABLE "leads" ADD FOREIGN KEY ("campaign_id") REFERENCES "campaigns" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "contacts" ADD FOREIGN KEY ("lead_id") REFERENCES "leads" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "opportunities" ADD FOREIGN KEY ("lead_id") REFERENCES "leads" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "opportunities" ADD FOREIGN KEY ("stage_id") REFERENCES "stages" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "audit_logs" ADD FOREIGN KEY ("opportunity_id") REFERENCES "opportunities" ("id") DEFERRABLE INITIALLY IMMEDIATE;
