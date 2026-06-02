CREATE TYPE "public"."contact_type" AS ENUM('call', 'whatsapp', 'email', 'in_person');--> statement-breakpoint
CREATE TYPE "public"."supporter_status" AS ENUM('prospect', 'contacted', 'confirmed', 'active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."supporter_type" AS ENUM('individual', 'couple', 'church');--> statement-breakpoint
CREATE TABLE "contact_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supporter_id" uuid NOT NULL,
	"missionary_id" uuid NOT NULL,
	"contact_type" "contact_type" NOT NULL,
	"contact_date" date NOT NULL,
	"notes" text,
	"supporter_initiated" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "missionaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(50),
	"monthly_goal" numeric(10, 2) DEFAULT '0',
	"preferred_language" varchar(10) DEFAULT 'pt-BR',
	"theme_preference" varchar(20) DEFAULT 'light',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "missionaries_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "offerings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supporter_id" uuid NOT NULL,
	"missionary_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"offering_date" date NOT NULL,
	"month_reference" varchar(7) NOT NULL,
	"is_received" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supporters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"missionary_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "supporter_type" DEFAULT 'individual' NOT NULL,
	"status" "supporter_status" DEFAULT 'prospect' NOT NULL,
	"email" varchar(255),
	"phone" varchar(50),
	"city" varchar(255),
	"state" varchar(100),
	"country" varchar(100) DEFAULT 'Brasil',
	"birthday" date,
	"has_responded" boolean DEFAULT false,
	"has_returned_contact" boolean DEFAULT false,
	"estimated_offering" numeric(10, 2) DEFAULT '0',
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact_log" ADD CONSTRAINT "contact_log_supporter_id_supporters_id_fk" FOREIGN KEY ("supporter_id") REFERENCES "public"."supporters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_log" ADD CONSTRAINT "contact_log_missionary_id_missionaries_id_fk" FOREIGN KEY ("missionary_id") REFERENCES "public"."missionaries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offerings" ADD CONSTRAINT "offerings_supporter_id_supporters_id_fk" FOREIGN KEY ("supporter_id") REFERENCES "public"."supporters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offerings" ADD CONSTRAINT "offerings_missionary_id_missionaries_id_fk" FOREIGN KEY ("missionary_id") REFERENCES "public"."missionaries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supporters" ADD CONSTRAINT "supporters_missionary_id_missionaries_id_fk" FOREIGN KEY ("missionary_id") REFERENCES "public"."missionaries"("id") ON DELETE cascade ON UPDATE no action;