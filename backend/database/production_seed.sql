--
-- PostgreSQL database dump
--


-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: bid_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.bid_status_enum AS ENUM (
    'active',
    'outbid',
    'won',
    'rejected'
);


--
-- Name: notification_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_type_enum AS ENUM (
    'bid_received',
    'bid_outbid',
    'bid_won',
    'bid_rejected',
    'order_update',
    'product_approved',
    'product_rejected',
    'verification_update'
);


--
-- Name: order_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.order_status_enum AS ENUM (
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'delivered',
    'cancelled'
);


--
-- Name: payment_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status_enum AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed'
);


--
-- Name: product_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.product_status_enum AS ENUM (
    'pending_approval',
    'active',
    'sold',
    'bidding_closed',
    'rejected'
);


--
-- Name: quality_grade_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quality_grade_enum AS ENUM (
    'A+',
    'A',
    'B'
);


--
-- Name: selling_mode_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.selling_mode_enum AS ENUM (
    'fixed_price',
    'bidding'
);


--
-- Name: user_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_type_enum AS ENUM (
    'farmer',
    'buyer',
    'admin'
);


--
-- Name: verification_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.verification_status_enum AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: apmc_reference; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.apmc_reference (
    id integer NOT NULL,
    crop_name character varying(100) NOT NULL,
    market_name character varying(200) NOT NULL,
    price_per_quintal numeric(10,2) NOT NULL,
    date date NOT NULL,
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: apmc_reference_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.apmc_reference_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: apmc_reference_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.apmc_reference_id_seq OWNED BY public.apmc_reference.id;


--
-- Name: bids; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bids (
    id integer NOT NULL,
    product_id integer NOT NULL,
    buyer_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    status public.bid_status_enum DEFAULT 'active'::public.bid_status_enum,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bids_amount_check CHECK ((amount > (0)::numeric))
);


--
-- Name: bids_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bids_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bids_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bids_id_seq OWNED BY public.bids.id;


--
-- Name: buyers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.buyers (
    id integer NOT NULL,
    user_id integer NOT NULL,
    business_name character varying(200),
    business_type character varying(100),
    gst_number character varying(20),
    gst_verified boolean DEFAULT false,
    business_address text,
    registration_number character varying(50),
    contact_person character varying(100),
    total_purchases integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: buyers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.buyers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: buyers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.buyers_id_seq OWNED BY public.buyers.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    image_url character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: farmers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.farmers (
    id integer NOT NULL,
    user_id integer NOT NULL,
    farm_address text,
    city character varying(100),
    state character varying(100),
    pincode character varying(10),
    farm_size numeric(10,2),
    overall_rating numeric(3,2) DEFAULT 0,
    total_orders integer DEFAULT 0,
    bank_name character varying(100),
    account_number character varying(50),
    ifsc_code character varying(20),
    account_holder character varying(100),
    verified_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    price_watchlist jsonb DEFAULT '[]'::jsonb,
    CONSTRAINT farmers_overall_rating_check CHECK (((overall_rating >= (0)::numeric) AND (overall_rating <= (5)::numeric)))
);


--
-- Name: farmers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.farmers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: farmers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.farmers_id_seq OWNED BY public.farmers.id;


--
-- Name: msp_reference; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.msp_reference (
    id integer NOT NULL,
    crop_name character varying(100) NOT NULL,
    msp_price_per_quintal numeric(10,2) NOT NULL,
    year integer NOT NULL,
    season character varying(50),
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: msp_reference_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.msp_reference_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: msp_reference_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.msp_reference_id_seq OWNED BY public.msp_reference.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type public.notification_type_enum NOT NULL,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    link character varying(500),
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    order_number character varying(50) NOT NULL,
    product_id integer NOT NULL,
    farmer_id integer NOT NULL,
    buyer_id integer NOT NULL,
    quantity_kg numeric(10,2) NOT NULL,
    price_per_kg numeric(10,2) NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    commission_amount numeric(12,2) NOT NULL,
    order_status public.order_status_enum DEFAULT 'pending'::public.order_status_enum,
    payment_status public.payment_status_enum DEFAULT 'pending'::public.payment_status_enum,
    payment_method character varying(50),
    transaction_id character varying(100),
    invoice_url character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    delivered_at timestamp without time zone,
    CONSTRAINT orders_quantity_kg_check CHECK ((quantity_kg >= (50)::numeric))
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: platform_analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_analytics (
    id integer NOT NULL,
    metric_date date NOT NULL,
    total_orders integer DEFAULT 0,
    total_value numeric(15,2) DEFAULT 0,
    commission_earned numeric(12,2) DEFAULT 0,
    avg_farmer_price numeric(10,2) DEFAULT 0,
    avg_buyer_savings numeric(10,2) DEFAULT 0,
    failed_auctions integer DEFAULT 0,
    active_farmers integer DEFAULT 0,
    active_buyers integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: platform_analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.platform_analytics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: platform_analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.platform_analytics_id_seq OWNED BY public.platform_analytics.id;


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id integer NOT NULL,
    product_id integer NOT NULL,
    image_url character varying(500) NOT NULL,
    is_primary boolean DEFAULT false,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    farmer_id integer NOT NULL,
    category_id integer NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    quantity_kg numeric(10,2) NOT NULL,
    selling_mode public.selling_mode_enum NOT NULL,
    fixed_price numeric(10,2),
    base_price numeric(10,2),
    current_highest_bid numeric(10,2) DEFAULT 0,
    quality_grade public.quality_grade_enum NOT NULL,
    is_organic boolean DEFAULT false,
    status public.product_status_enum DEFAULT 'pending_approval'::public.product_status_enum,
    rejection_reason text,
    failure_reason text,
    failure_suggestions text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT products_base_price_check CHECK ((base_price > (0)::numeric)),
    CONSTRAINT products_fixed_price_check CHECK ((fixed_price > (0)::numeric)),
    CONSTRAINT products_quantity_kg_check CHECK ((quantity_kg > (0)::numeric)),
    CONSTRAINT valid_selling_mode CHECK ((((selling_mode = 'fixed_price'::public.selling_mode_enum) AND (fixed_price IS NOT NULL)) OR ((selling_mode = 'bidding'::public.selling_mode_enum) AND (base_price IS NOT NULL))))
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    order_id integer NOT NULL,
    buyer_id integer NOT NULL,
    farmer_id integer NOT NULL,
    rating integer NOT NULL,
    review_text text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT reviews_review_text_check CHECK (((length(review_text) >= 10) AND (length(review_text) <= 500)))
);


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    id integer NOT NULL,
    version character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    applied_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    checksum character varying(64)
);


--
-- Name: schema_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.schema_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: schema_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.schema_migrations_id_seq OWNED BY public.schema_migrations.id;


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id integer NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: site_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.site_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: site_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    user_type public.user_type_enum NOT NULL,
    name character varying(100) NOT NULL,
    mobile character varying(15),
    avatar_url character varying(500),
    is_verified boolean DEFAULT false,
    verification_status public.verification_status_enum DEFAULT 'pending'::public.verification_status_enum,
    admin_notes text,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    public_id uuid DEFAULT public.uuid_generate_v4()
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: apmc_reference id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.apmc_reference ALTER COLUMN id SET DEFAULT nextval('public.apmc_reference_id_seq'::regclass);


--
-- Name: bids id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bids ALTER COLUMN id SET DEFAULT nextval('public.bids_id_seq'::regclass);


--
-- Name: buyers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buyers ALTER COLUMN id SET DEFAULT nextval('public.buyers_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: farmers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmers ALTER COLUMN id SET DEFAULT nextval('public.farmers_id_seq'::regclass);


--
-- Name: msp_reference id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.msp_reference ALTER COLUMN id SET DEFAULT nextval('public.msp_reference_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: platform_analytics id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_analytics ALTER COLUMN id SET DEFAULT nextval('public.platform_analytics_id_seq'::regclass);


--
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: schema_migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations ALTER COLUMN id SET DEFAULT nextval('public.schema_migrations_id_seq'::regclass);


--
-- Name: site_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: apmc_reference; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.apmc_reference VALUES (1, 'Chickoo', 'Navsari APMC', 4800.00, '2026-01-26', '2026-01-27 09:27:47.688579');
INSERT INTO public.apmc_reference VALUES (2, 'Chickoo', 'Navsari APMC', 4750.00, '2026-01-25', '2026-01-27 09:27:47.688579');
INSERT INTO public.apmc_reference VALUES (3, 'Chickoo', 'Navsari APMC', 4900.00, '2026-01-24', '2026-01-27 09:27:47.688579');
INSERT INTO public.apmc_reference VALUES (4, 'Chickoo', 'Navsari APMC', 4600.00, '2026-01-23', '2026-01-27 09:27:47.688579');
INSERT INTO public.apmc_reference VALUES (5, 'Chickoo', 'Navsari APMC', 4700.00, '2026-01-22', '2026-01-27 09:27:47.688579');
INSERT INTO public.apmc_reference VALUES (6, 'Chickoo', 'Surat APMC', 4850.00, '2026-01-26', '2026-01-27 09:27:47.688579');
INSERT INTO public.apmc_reference VALUES (7, 'Chickoo', 'Surat APMC', 4800.00, '2026-01-25', '2026-01-27 09:27:47.688579');
INSERT INTO public.apmc_reference VALUES (8, 'Mango', 'Navsari APMC', 6500.00, '2026-01-26', '2026-01-27 09:27:47.688579');
INSERT INTO public.apmc_reference VALUES (9, 'Mango', 'Navsari APMC', 6400.00, '2026-01-25', '2026-01-27 09:27:47.688579');
INSERT INTO public.apmc_reference VALUES (10, 'Mango', 'Navsari APMC', 6600.00, '2026-01-24', '2026-01-27 09:27:47.688579');
INSERT INTO public.apmc_reference VALUES (11, 'Mango', 'Ahmedabad APMC', 6800.00, '2026-01-26', '2026-01-27 09:27:47.688579');
INSERT INTO public.apmc_reference VALUES (12, 'Banana', 'Navsari APMC', 3200.00, '2026-01-26', '2026-01-27 09:27:47.688579');
INSERT INTO public.apmc_reference VALUES (13, 'Banana', 'Navsari APMC', 3100.00, '2026-01-25', '2026-01-27 09:27:47.688579');
INSERT INTO public.apmc_reference VALUES (14, 'Banana', 'Navsari APMC', 3250.00, '2026-01-24', '2026-01-27 09:27:47.688579');
INSERT INTO public.apmc_reference VALUES (15, 'Papaya', 'Navsari APMC', 2800.00, '2026-01-26', '2026-01-27 09:27:47.688579');
INSERT INTO public.apmc_reference VALUES (16, 'Papaya', 'Navsari APMC', 2750.00, '2026-01-25', '2026-01-27 09:27:47.688579');
INSERT INTO public.apmc_reference VALUES (17, 'Papaya', 'Surat APMC', 2900.00, '2026-01-26', '2026-01-27 09:27:47.688579');


--
-- Data for Name: bids; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: buyers; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.buyers VALUES (2, 20, 'Gujarat Export House', 'Exporter', '24AABCU9603R1ZN', true, 'Export Zone, Ahmedabad, Gujarat', NULL, NULL, 62, '2026-01-27 09:27:47.6849');
INSERT INTO public.buyers VALUES (3, 21, 'Wholesale Fruits Mart', 'Wholesaler', '24AABCU9603R1ZO', true, 'APMC Yard, Navsari, Gujarat', NULL, NULL, 38, '2026-01-27 09:27:47.6849');
INSERT INTO public.buyers VALUES (4, 22, 'Food Processing Ltd.', 'Manufacturer', '24AABCU9603R1ZP', true, 'GIDC, Vapi, Gujarat', NULL, NULL, 55, '2026-01-27 09:27:47.6849');
INSERT INTO public.buyers VALUES (5, 23, 'Organic Foods Pvt Ltd', 'Retailer', '24AABCU9603R1ZQ', true, 'SG Highway, Ahmedabad, Gujarat', NULL, NULL, 28, '2026-01-27 09:27:47.6849');
INSERT INTO public.buyers VALUES (6, 24, 'Fruit Mart Retail', 'Retailer', '24AABCU9603R1ZR', true, 'Ring Road, Surat, Gujarat', NULL, NULL, 42, '2026-01-27 09:27:47.6849');
INSERT INTO public.buyers VALUES (7, 25, 'Juice Factory India', 'Manufacturer', '24AABCU9603R1ZS', true, 'Industrial Estate, Vadodara, Gujarat', NULL, NULL, 35, '2026-01-27 09:27:47.6849');
INSERT INTO public.buyers VALUES (8, 26, 'Export House Trading', 'Exporter', '24AABCU9603R1ZT', true, 'Port Area, Hazira, Gujarat', NULL, NULL, 50, '2026-01-27 09:27:47.6849');
INSERT INTO public.buyers VALUES (9, 27, 'BigBasket Gujarat', 'E-commerce', '24AABCU9603R1ZU', true, 'Warehouse Zone, Ahmedabad, Gujarat', NULL, NULL, 70, '2026-01-27 09:27:47.6849');
INSERT INTO public.buyers VALUES (10, 28, 'Retail Mart Chain', 'Retailer', '24AABCU9603R1ZV', true, 'Multiple Locations, Gujarat', NULL, NULL, 48, '2026-01-27 09:27:47.6849');
INSERT INTO public.buyers VALUES (11, 29, 'New Buyer Corp', 'Wholesaler', NULL, false, 'Navsari, Gujarat', NULL, NULL, 0, '2026-01-27 09:27:47.6849');
INSERT INTO public.buyers VALUES (12, 30, 'Fresh Start Foods', 'Manufacturer', NULL, false, 'Surat, Gujarat', NULL, NULL, 0, '2026-01-27 09:27:47.6849');
INSERT INTO public.buyers VALUES (14, 35, 'Singh organic Foods', 'Wholesaler', NULL, false, '101 Trade Center, Pune', NULL, NULL, 0, '2026-02-02 02:31:45.208836');
INSERT INTO public.buyers VALUES (13, 34, 'Monika Fresh Mart', 'Retailer', NULL, false, '789 Market Street, Mumbai', NULL, NULL, 2, '2026-02-02 02:31:45.208836');
INSERT INTO public.buyers VALUES (1, 19, 'Fresh Juice Co.', 'Manufacturer', '24AABCU9603R1ZM', true, 'Industrial Area, Surat, Gujarat', NULL, NULL, 47, '2026-01-27 09:27:47.6849');


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.categories VALUES (1, 'Chickoo', 'Premium quality Chickoo (Sapota) from South Gujarat, known for its sweetness and rich flavor.', '/uploads/categories/chickoo.jpg', '2026-01-27 09:27:47.686607');
INSERT INTO public.categories VALUES (2, 'Mango', 'Fresh Alphonso and Kesar mangoes from the mango belt of Gujarat.', '/uploads/categories/mango.jpg', '2026-01-27 09:27:47.686607');
INSERT INTO public.categories VALUES (3, 'Banana', 'High-quality Cavendish and local variety bananas, perfect for wholesale.', '/uploads/categories/banana.jpg', '2026-01-27 09:27:47.686607');
INSERT INTO public.categories VALUES (4, 'Papaya', 'Fresh and ripe papayas, ideal for juice manufacturers and retailers.', '/uploads/categories/papaya.jpg', '2026-01-27 09:27:47.686607');
INSERT INTO public.categories VALUES (7, 'Grains', NULL, 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80', '2026-02-02 02:31:45.208836');
INSERT INTO public.categories VALUES (5, 'Fruits', NULL, 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg', '2026-02-02 02:31:45.208836');
INSERT INTO public.categories VALUES (6, 'Vegetables', NULL, 'https://images.pexels.com/photos/1656666/pexels-photo-1656666.jpeg', '2026-02-02 02:31:45.208836');
INSERT INTO public.categories VALUES (14, 'Tomato', 'Fresh red tomatoes, ideal for wholesale and processing.', 'https://images.unsplash.com/photo-1589010588553-46e8e7c21788?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (15, 'Potato', 'Premium quality potatoes for retail and industrial use.', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (16, 'Onion', 'Fresh onions â€” red and white varieties for bulk buyers.', 'https://images.unsplash.com/photo-1524593166156-312f362cada0?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (17, 'Brinjal', 'Fresh purple brinjal (eggplant) from Gujarat farms.', 'https://images.unsplash.com/photo-1615485500704-8e3b85d0b4e4?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (18, 'Spinach', 'Tender green spinach leaves, freshly harvested.', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (19, 'Okra', 'Fresh Bhindi (Lady Finger) â€” crisp, green, export quality.', 'https://images.unsplash.com/photo-1643241641773-ac2e3cfab65d?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (20, 'Cabbage', 'Fresh green cabbage heads, uniform size.', 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (21, 'Cauliflower', 'White, firm cauliflower, ideal for retail and processing.', 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (22, 'Carrot', 'Fresh orange carrots, premium quality, bulk available.', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (23, 'Radish', 'Crisp white radish from Gujarat farms.', 'https://images.unsplash.com/photo-1582515073490-39981397c445?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (24, 'Beetroot', 'Deep red beetroot â€” fresh and nutritious.', 'https://images.unsplash.com/photo-1589621316382-008455b857cd?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (25, 'Capsicum', 'Colourful bell peppers â€” green, red, yellow available.', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (26, 'Green Chilli', 'Fresh green chillies, medium to hot varieties.', 'https://images.unsplash.com/photo-1583119022894-919a5a21ddb7?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (27, 'Bottle Gourd', 'Fresh Lauki (bottle gourd) â€” light green, firm.', 'https://images.unsplash.com/photo-1617346867781-f5f5e5ff2e02?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (28, 'Bitter Gourd', 'Fresh Karela (bitter gourd) â€” high medicinal value.', 'https://images.unsplash.com/photo-1628089999575-7ac61b36e1a0?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (29, 'Ridge Gourd', 'Fresh Turai (ridge gourd) â€” tender and crisp.', 'https://images.unsplash.com/photo-1625938144755-652e08e359b7?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (30, 'Pumpkin', 'Large yellow pumpkins â€” bulk quantity available.', 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (31, 'Sweet Corn', 'Fresh sweet corn cobs â€” ideal for processing.', 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (32, 'Peas', 'Fresh green peas â€” shelled and pod varieties.', 'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (33, 'Beans', 'Fresh green beans â€” flat and round varieties.', 'https://images.unsplash.com/photo-1601493700638-b54ebe8fd796?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (34, 'Garlic', 'Strong flavoured dry garlic bulbs for wholesale.', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (35, 'Ginger', 'Fresh fibrous ginger root â€” high oil content.', 'https://images.unsplash.com/photo-1598736736862-6e71dbde93f0?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (36, 'Spring Onion', 'Tender spring onions â€” bundle packs for retail.', 'https://images.unsplash.com/photo-1601493700638-b54ebe8fd796?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (37, 'Fenugreek Leaves', 'Fresh Methi leaves â€” aromatic and nutritious.', 'https://images.unsplash.com/photo-1625938144755-652e08e359b7?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (38, 'Coriander Leaves', 'Fresh green coriander (Dhania) â€” bulk bundles.', 'https://images.unsplash.com/photo-1593845677045-ba74d6e45e9b?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (39, 'Drumstick', 'Fresh Moringa drumstick pods â€” export quality.', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (40, 'Tinda', 'Fresh Tinda (round gourd) â€” Gujarat specialty.', 'https://images.unsplash.com/photo-1617346867781-f5f5e5ff2e02?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (41, 'Ivy Gourd', 'Fresh Tindora (ivy gourd) â€” popular in Gujarat.', 'https://images.unsplash.com/photo-1628089999575-7ac61b36e1a0?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (42, 'Apple', 'Himachal Pradesh red apples â€” crisp and sweet.', 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (43, 'Orange', 'Fresh Nagpur oranges â€” juicy and vitamin-rich.', 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (44, 'Grapes', 'Thompson and Bangalore blue grape varieties.', 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (45, 'Guava', 'Fresh guavas â€” pink and white flesh varieties.', 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (46, 'Pineapple', 'Ripe golden pineapples â€” ideal for processing.', 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (47, 'Watermelon', 'Large sweet watermelons â€” bulk summer supply.', 'https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (48, 'Muskmelon', 'Sweet and fragrant muskmelons for retail.', 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (49, 'Pomegranate', 'Bhagwa pomegranates â€” deep red arils, export quality.', 'https://images.unsplash.com/photo-1541156639-b7e016e86b35?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (50, 'Kiwi', 'Fresh green kiwi from Himachal Pradesh.', 'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (51, 'Strawberry', 'Fresh Mahabaleshwar strawberries â€” bright red.', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (52, 'Litchi', 'Sweet and juicy litchi â€” seasonal premium lot.', 'https://images.unsplash.com/photo-1588614959060-4d144f28b207?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (53, 'Coconut', 'Mature and tender coconuts â€” dual variety bulk.', 'https://images.unsplash.com/photo-1605201100110-1cbedaef5d7b?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (54, 'Custard Apple', 'Sitaphal (custard apple) â€” creamy sweet variety.', 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (55, 'Dragon Fruit', 'Red and white dragon fruit â€” premium exotic lot.', 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (56, 'Jamun', 'Fresh Indian blackberry (Jamun) â€” seasonal bulk.', 'https://images.unsplash.com/photo-1544025162-d76594e8bb5c?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (57, 'Amla', 'Indian gooseberry (Amla) â€” high Vitamin C content.', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (58, 'Fig', 'Fresh Anjeer (fig) â€” honey-sweet, export quality.', 'https://images.unsplash.com/photo-1601493700638-b54ebe8fd796?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (59, 'Turmeric', 'Raw and dry turmeric â€” high curcumin content.', 'https://images.unsplash.com/photo-1615485500704-8e3b85d0b4e4?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (60, 'Red Chilli', 'Dried red chillies â€” Kashmiri and Byadagi varieties.', 'https://images.unsplash.com/photo-1583119022894-919a5a21ddb7?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (61, 'Coriander Seeds', 'Whole coriander (Dhania) seeds for wholesale.', 'https://images.unsplash.com/photo-1593845677045-ba74d6e45e9b?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (62, 'Cumin Seeds', 'Premium Jeera (cumin) seeds â€” light green variety.', 'https://images.unsplash.com/photo-1613543000879-9d9aec6dfa4d?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (63, 'Mustard Seeds', 'Black and yellow mustard seeds in bulk.', 'https://images.unsplash.com/photo-1615485500704-8e3b85d0b4e4?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (64, 'Fenugreek Seeds', 'Methi seeds â€” slightly bitter, high in fibre.', 'https://images.unsplash.com/photo-1625938144755-652e08e359b7?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (65, 'Fennel Seeds', 'Saunf (fennel seeds) â€” sweet aromatic variety.', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (66, 'Black Pepper', 'Dried black pepper (Kali Mirch) â€” Wayanad origin.', 'https://images.unsplash.com/photo-1599689019338-7c531e7e4028?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (67, 'Cardamom', 'Green cardamom (Elaichi) â€” small, aromatic pods.', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (68, 'Clove', 'Whole cloves â€” strong aromatic spice, dried.', 'https://images.unsplash.com/photo-1575386150878-8e6b66de0eel?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (69, 'Cinnamon', 'Ceylon cinnamon sticks â€” fragrant and fresh.', 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (70, 'Bay Leaf', 'Whole dried bay leaves (Tej Patta) for bulk use.', 'https://images.unsplash.com/photo-1625937329935-f4a0f4ecf01e?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (71, 'Toor Dal', 'Split pigeon peas â€” polished, clean, export quality.', 'https://images.unsplash.com/photo-1612257999756-9e49e0e6a700?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (72, 'Moong Dal', 'Split green gram (Moong) â€” yellow and whole variety.', 'https://images.unsplash.com/photo-1612257999756-9e49e0e6a700?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (73, 'Chana Dal', 'Split Bengal gram (Chana) â€” hulled, yellow variety.', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (74, 'Masoor Dal', 'Red lentils (Masoor) â€” whole and split variety.', 'https://images.unsplash.com/photo-1612257999756-9e49e0e6a700?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (75, 'Urad Dal', 'Black gram (Urad) â€” whole and split available.', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (76, 'Kabuli Chana', 'White chickpea (Kabuli Chana) â€” large grain size.', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (77, 'Black Chana', 'Desi black chickpea â€” strong flavour, high protein.', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (78, 'Green Gram', 'Whole green gram (Moong) â€” export grade quality.', 'https://images.unsplash.com/photo-1612257999756-9e49e0e6a700?w=400', '2026-02-20 02:42:44.40675');
INSERT INTO public.categories VALUES (79, 'Yellow Peas', 'Dried yellow peas â€” split and whole bulk supply.', 'https://images.unsplash.com/photo-1563113523-f7765f3a6b29?w=400', '2026-02-20 02:42:44.40675');


--
-- Data for Name: farmers; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.farmers VALUES (1, 4, 'Village Chikhli, Ta. Chikhli', 'Navsari', 'Gujarat', '396521', 5.50, 4.50, 25, 'SBI', '1234567890', 'SBIN0001234', 'Ramesh Patel', '2026-01-27 09:27:47.682499', '2026-01-27 09:27:47.682499', '[]');
INSERT INTO public.farmers VALUES (2, 5, 'Village Jalalpore, Ta. Jalalpore', 'Navsari', 'Gujarat', '396440', 8.20, 4.80, 32, 'HDFC', '9876543210', 'HDFC0001234', 'Suresh Kumar', '2026-01-27 09:27:47.682499', '2026-01-27 09:27:47.682499', '[]');
INSERT INTO public.farmers VALUES (3, 6, 'Village Maroli, Ta. Navsari', 'Navsari', 'Gujarat', '396436', 3.50, 4.20, 18, 'ICICI', '5678901234', 'ICIC0001234', 'Mahesh Desai', '2026-01-27 09:27:47.682499', '2026-01-27 09:27:47.682499', '[]');
INSERT INTO public.farmers VALUES (4, 7, 'Village Gandevi, Ta. Gandevi', 'Navsari', 'Gujarat', '396360', 6.00, 4.60, 28, 'BOB', '4567890123', 'BARB0001234', 'Jayesh Shah', '2026-01-27 09:27:47.682499', '2026-01-27 09:27:47.682499', '[]');
INSERT INTO public.farmers VALUES (5, 8, 'Village Bilimora, Ta. Gandevi', 'Navsari', 'Gujarat', '396321', 4.00, 4.30, 15, 'SBI', '3456789012', 'SBIN0002345', 'Kiran Modi', '2026-01-27 09:27:47.682499', '2026-01-27 09:27:47.682499', '[]');
INSERT INTO public.farmers VALUES (6, 9, 'Village Valsad, Ta. Valsad', 'Valsad', 'Gujarat', '396001', 7.50, 4.70, 35, 'PNB', '2345678901', 'PUNB0001234', 'Vishal Patel', '2026-01-27 09:27:47.682499', '2026-01-27 09:27:47.682499', '[]');
INSERT INTO public.farmers VALUES (7, 10, 'Village Dharampur, Ta. Dharampur', 'Valsad', 'Gujarat', '396050', 5.00, 4.40, 20, 'Axis', '1234509876', 'UTIB0001234', 'Rajesh Sharma', '2026-01-27 09:27:47.682499', '2026-01-27 09:27:47.682499', '[]');
INSERT INTO public.farmers VALUES (8, 11, 'Village Pardi, Ta. Pardi', 'Valsad', 'Gujarat', '396125', 6.50, 4.10, 22, 'SBI', '6789012345', 'SBIN0003456', 'Dinesh Parmar', '2026-01-27 09:27:47.682499', '2026-01-27 09:27:47.682499', '[]');
INSERT INTO public.farmers VALUES (9, 12, 'Village Umargam, Ta. Umargam', 'Valsad', 'Gujarat', '396165', 4.50, 4.50, 17, 'HDFC', '7890123456', 'HDFC0002345', 'Nilesh Joshi', '2026-01-27 09:27:47.682499', '2026-01-27 09:27:47.682499', '[]');
INSERT INTO public.farmers VALUES (10, 13, 'Village Kaprada, Ta. Kaprada', 'Valsad', 'Gujarat', '396470', 8.00, 4.90, 40, 'ICICI', '8901234567', 'ICIC0002345', 'Bhavesh Mehta', '2026-01-27 09:27:47.682499', '2026-01-27 09:27:47.682499', '[]');
INSERT INTO public.farmers VALUES (11, 14, 'Village Ahwa, Ta. Dang', 'Dang', 'Gujarat', '394730', 3.00, 0.00, 0, NULL, NULL, NULL, NULL, NULL, '2026-01-27 09:27:47.682499', '[]');
INSERT INTO public.farmers VALUES (12, 15, 'Village Waghai, Ta. Dang', 'Dang', 'Gujarat', '394730', 4.50, 0.00, 0, NULL, NULL, NULL, NULL, NULL, '2026-01-27 09:27:47.682499', '[]');
INSERT INTO public.farmers VALUES (13, 16, 'Village Saputara, Ta. Dang', 'Dang', 'Gujarat', '394720', 5.00, 0.00, 0, NULL, NULL, NULL, NULL, NULL, '2026-01-27 09:27:47.682499', '[]');
INSERT INTO public.farmers VALUES (14, 17, 'Village Subir, Ta. Dang', 'Dang', 'Gujarat', '394710', 2.50, 0.00, 0, NULL, NULL, NULL, NULL, NULL, '2026-01-27 09:27:47.682499', '[]');
INSERT INTO public.farmers VALUES (15, 18, 'Village Shamgahan, Ta. Dang', 'Dang', 'Gujarat', '394716', 3.50, 0.00, 0, NULL, NULL, NULL, NULL, NULL, '2026-01-27 09:27:47.682499', '[]');
INSERT INTO public.farmers VALUES (16, 31, '308,tirupati plaza', 'surat', 'Gujarat', '394221', 11.30, 0.00, 0, NULL, NULL, NULL, NULL, NULL, '2026-01-31 08:47:58.025545', '[]');
INSERT INTO public.farmers VALUES (17, 32, '123 Green Valley', 'Nagpur', 'Maharashtra', '440001', 15.50, 0.00, 0, NULL, NULL, NULL, NULL, NULL, '2026-02-02 02:31:45.208836', '[]');
INSERT INTO public.farmers VALUES (18, 33, '456 River Side', 'Nasik', 'Maharashtra', '422001', 10.00, 0.00, 4, NULL, NULL, NULL, NULL, NULL, '2026-02-02 02:31:45.208836', '["Banana - Robusta", "Apple"]');
INSERT INTO public.farmers VALUES (19, 36, 'Village Raipur, Ta. Amrapur', 'Gandhinagar', 'Gujarat', '382421', 4.50, 4.70, 30, 'SBI', '1122334455', 'SBIN0009001', 'Rani Sahu', '2026-02-20 02:42:44.398157', '2026-02-20 02:42:44.398157', '[]');
INSERT INTO public.farmers VALUES (20, 37, 'Village Talala, Ta. Talala', 'Junagadh', 'Gujarat', '362150', 6.00, 4.90, 45, 'HDFC', '5566778899', 'HDFC0009002', 'Arpit Jaiswal', '2026-02-20 02:42:44.404767', '2026-02-20 02:42:44.404767', '[]');
INSERT INTO public.farmers VALUES (21, 38, 'Village Sangli, Ta. Sangli', 'Sangli', 'Maharashtra', '416416', 5.00, 4.60, 38, 'ICICI', '9988776655', 'ICIC0009003', 'Damini Gavali', '2026-02-20 02:42:44.405787', '2026-02-20 02:42:44.405787', '[]');


--
-- Data for Name: msp_reference; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.msp_reference VALUES (1, 'Chickoo', 3500.00, 2024, 'Kharif', '2026-01-27 09:27:47.687619');
INSERT INTO public.msp_reference VALUES (2, 'Mango', 4500.00, 2024, 'Rabi', '2026-01-27 09:27:47.687619');
INSERT INTO public.msp_reference VALUES (3, 'Banana', 2800.00, 2024, 'All Season', '2026-01-27 09:27:47.687619');
INSERT INTO public.msp_reference VALUES (4, 'Papaya', 2500.00, 2024, 'All Season', '2026-01-27 09:27:47.687619');


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.notifications VALUES (1, 4, 'order_update', 'New Order Received', 'You have received a new order for Premium Chickoo', '/farmer/orders/35', false, '2026-01-27 09:27:47.725692');
INSERT INTO public.notifications VALUES (2, 4, 'bid_received', 'New Bid on Your Product', 'A buyer has placed a bid of â‚¹55/kg on your chickoo auction', '/farmer/products/12/bids', false, '2026-01-27 09:27:47.725692');
INSERT INTO public.notifications VALUES (3, 19, 'order_update', 'Order Status Updated', 'Your order ORD_20240121_1021 is ready for pickup', '/buyer/orders/21', false, '2026-01-27 09:27:47.725692');
INSERT INTO public.notifications VALUES (4, 20, 'bid_won', 'Congratulations! You Won the Auction', 'Your bid of â‚¹88/kg on Alphonso Mango was accepted', '/buyer/orders/2', false, '2026-01-27 09:27:47.725692');
INSERT INTO public.notifications VALUES (5, 5, 'product_approved', 'Product Approved', 'Your product Fresh Chickoo Bulk is now live', '/farmer/products/2', false, '2026-01-27 09:27:47.725692');
INSERT INTO public.notifications VALUES (6, 14, 'verification_update', 'Verification Pending', 'Your account verification is under review', '/profile', false, '2026-01-27 09:27:47.725692');
INSERT INTO public.notifications VALUES (7, 33, 'order_update', 'New Order Received', 'New order of 100kg for Red Onion', '/farmer/orders/36', false, '2026-02-02 02:54:55.610129');
INSERT INTO public.notifications VALUES (8, 33, 'order_update', 'New Order Received', 'New order of 100kg for Red Onion', '/farmer/orders/37', false, '2026-02-02 02:55:42.193522');
INSERT INTO public.notifications VALUES (9, 34, 'order_update', 'Order Status Updated', 'Your order #ORD_20260201_1510 is now confirmed', '/buyer/orders/37', false, '2026-02-02 02:57:25.977088');
INSERT INTO public.notifications VALUES (10, 33, 'order_update', 'New Order Received', 'New order of 50kg for Cabbage', '/farmer/orders/38', false, '2026-02-02 12:29:46.350145');
INSERT INTO public.notifications VALUES (11, 33, 'order_update', 'New Order Received', 'New order of 100kg for Cabbage', '/farmer/orders/39', false, '2026-02-02 12:30:26.8609');
INSERT INTO public.notifications VALUES (12, 19, 'order_update', 'Order Status Updated', 'Your order #ORD_20260202_4390 is now confirmed', '/buyer/orders/39', false, '2026-02-02 12:40:19.569945');
INSERT INTO public.notifications VALUES (13, 19, 'order_update', 'Order Status Updated', 'Your order #ORD_20260202_5732 is now confirmed', '/buyer/orders/38', false, '2026-02-02 12:40:20.701533');


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.orders VALUES (36, 'ORD_20260201_6497', 58, 18, 13, 100.00, 30.00, 3000.00, 150.00, 'pending', 'pending', NULL, NULL, NULL, '2026-02-02 02:54:55.436835', '2026-02-02 02:54:55.436835', NULL);
INSERT INTO public.orders VALUES (39, 'ORD_20260202_4390', 63, 18, 1, 100.00, 26.40, 2640.00, 132.00, 'confirmed', 'completed', 'online', 'TXN_20260202_53299378', '/uploads/invoices/invoice_ORD_20260202_4390.pdf', '2026-02-02 12:30:26.794865', '2026-02-02 12:40:19.564675', NULL);
INSERT INTO public.orders VALUES (37, 'ORD_20260201_1510', 58, 18, 13, 100.00, 30.00, 3000.00, 150.00, 'confirmed', 'completed', 'online', 'TXN_20260201_38540332', '/uploads/invoices/invoice_ORD_20260201_1510.pdf', '2026-02-02 02:55:42.06701', '2026-02-02 02:57:25.965756', NULL);
INSERT INTO public.orders VALUES (38, 'ORD_20260202_5732', 63, 18, 1, 50.00, 26.40, 1320.00, 66.00, 'confirmed', 'pending', NULL, NULL, NULL, '2026-02-02 12:29:46.339723', '2026-02-02 12:40:20.69853', NULL);


--
-- Data for Name: platform_analytics; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.platform_analytics VALUES (1, '2026-01-26', 11, 95486.00, 2641.00, 48.00, 5.00, 0, 10, 10, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (2, '2026-01-25', 14, 68703.00, 3936.00, 45.00, 19.00, 1, 11, 5, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (3, '2026-01-24', 9, 54591.00, 7016.00, 48.00, 11.00, 1, 5, 6, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (4, '2026-01-23', 12, 124873.00, 5343.00, 58.00, 8.00, 1, 7, 8, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (5, '2026-01-22', 9, 106480.00, 5673.00, 37.00, 14.00, 1, 11, 7, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (6, '2026-01-21', 9, 118958.00, 4128.00, 43.00, 16.00, 1, 10, 4, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (7, '2026-01-20', 11, 83559.00, 4444.00, 50.00, 11.00, 2, 5, 4, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (8, '2026-01-19', 8, 110133.00, 5636.00, 64.00, 6.00, 1, 5, 7, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (9, '2026-01-18', 9, 125556.00, 2637.00, 63.00, 11.00, 2, 6, 4, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (10, '2026-01-17', 9, 57267.00, 2848.00, 61.00, 17.00, 0, 11, 9, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (11, '2026-01-16', 8, 116895.00, 6535.00, 55.00, 13.00, 0, 12, 10, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (12, '2026-01-15', 14, 78754.00, 3635.00, 52.00, 19.00, 1, 9, 6, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (13, '2026-01-14', 8, 84342.00, 7423.00, 55.00, 13.00, 0, 10, 4, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (14, '2026-01-13', 11, 117244.00, 4251.00, 45.00, 8.00, 0, 7, 8, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (15, '2026-01-12', 11, 112611.00, 5091.00, 56.00, 9.00, 1, 6, 9, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (16, '2026-01-11', 14, 140494.00, 4487.00, 64.00, 16.00, 2, 5, 6, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (17, '2026-01-10', 10, 72836.00, 6701.00, 52.00, 18.00, 1, 9, 5, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (18, '2026-01-09', 8, 68891.00, 5709.00, 57.00, 9.00, 0, 10, 4, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (19, '2026-01-08', 12, 86828.00, 2967.00, 54.00, 5.00, 0, 9, 11, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (20, '2026-01-07', 5, 117811.00, 5214.00, 54.00, 13.00, 0, 11, 6, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (21, '2026-01-06', 11, 94403.00, 3885.00, 50.00, 14.00, 2, 6, 10, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (22, '2026-01-05', 13, 89854.00, 5955.00, 55.00, 14.00, 2, 6, 8, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (23, '2026-01-04', 5, 104449.00, 6882.00, 42.00, 15.00, 0, 10, 6, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (24, '2026-01-03', 9, 91341.00, 5637.00, 42.00, 8.00, 1, 9, 11, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (25, '2026-01-02', 8, 51135.00, 4729.00, 48.00, 10.00, 0, 7, 6, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (26, '2026-01-01', 6, 133863.00, 3873.00, 42.00, 5.00, 2, 9, 9, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (27, '2025-12-31', 5, 79723.00, 4569.00, 64.00, 10.00, 1, 6, 4, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (28, '2025-12-30', 13, 124692.00, 5355.00, 45.00, 8.00, 0, 11, 4, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (29, '2025-12-29', 14, 116597.00, 5017.00, 35.00, 9.00, 1, 7, 8, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (30, '2025-12-28', 6, 105323.00, 3856.00, 46.00, 11.00, 1, 7, 4, '2026-01-27 09:27:47.722501');
INSERT INTO public.platform_analytics VALUES (31, '2026-02-04', 0, 0.00, 0.00, 0.00, 0.00, 0, 0, 0, '2026-02-06 00:30:01.12007');


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.product_images VALUES (68, 46, 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (177, 155, 'https://images.pexels.com/photos/5945753/pexels-photo-5945753.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (190, 168, 'https://images.pexels.com/photos/4198131/pexels-photo-4198131.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (152, 130, 'https://images.unsplash.com/photo-1567375698348-5d9d5ae10c3a?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (196, 174, 'https://images.pexels.com/photos/4110252/pexels-photo-4110252.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (199, 177, 'https://images.unsplash.com/photo-1599689019338-7c531e7e4028?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (200, 178, 'https://images.pexels.com/photos/6157037/pexels-photo-6157037.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (193, 171, 'https://images.pexels.com/photos/4110250/pexels-photo-4110250.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (189, 167, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (188, 166, 'https://images.pexels.com/photos/4198025/pexels-photo-4198025.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (174, 152, 'https://images.unsplash.com/photo-1580984969071-a8da8c33d45f?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (183, 161, 'https://images.pexels.com/photos/6157010/pexels-photo-6157010.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (184, 162, 'https://images.unsplash.com/photo-1599909346839-5b7a6a5da386?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (175, 153, 'https://images.pexels.com/photos/5946081/pexels-photo-5946081.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (179, 157, 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (187, 165, 'https://images.pexels.com/photos/6157055/pexels-photo-6157055.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (186, 164, 'https://images.pexels.com/photos/7456525/pexels-photo-7456525.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (180, 158, 'https://images.unsplash.com/photo-1601379760883-1bb497c558e0?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (197, 175, 'https://images.pexels.com/photos/7456520/pexels-photo-7456520.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (176, 154, 'https://images.pexels.com/photos/5474640/pexels-photo-5474640.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (201, 179, 'https://images.pexels.com/photos/4110255/pexels-photo-4110255.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (178, 156, 'https://images.unsplash.com/photo-1588614959060-4d144f28b207?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (194, 172, 'https://images.pexels.com/photos/7456518/pexels-photo-7456518.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (192, 170, 'https://images.pexels.com/photos/7456521/pexels-photo-7456521.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (185, 163, 'https://images.pexels.com/photos/4198017/pexels-photo-4198017.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (74, 52, 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (182, 160, 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (173, 151, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (191, 169, 'https://images.pexels.com/photos/4110257/pexels-photo-4110257.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (181, 159, 'https://images.unsplash.com/photo-1615485500704-8e3b5908d41c?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (195, 173, 'https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (198, 176, 'https://images.pexels.com/photos/4110258/pexels-photo-4110258.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (164, 142, 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (162, 140, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (143, 121, 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (147, 125, 'https://images.unsplash.com/photo-1614797136987-8b03b88bc0ec?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (146, 124, 'https://images.unsplash.com/photo-1596451190630-186aff535bf2?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (136, 114, 'https://images.unsplash.com/photo-1629226960235-64a9fb8e9db4?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (86, 64, 'https://images.unsplash.com/photo-1629226960235-64a9fb8e9db4?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (139, 117, 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (85, 63, 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (144, 122, 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (90, 68, 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (89, 67, 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (141, 119, 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (140, 118, 'https://images.unsplash.com/photo-1613743983303-b3e89f8a2b80?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (84, 62, 'https://images.unsplash.com/photo-1613743983303-b3e89f8a2b80?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (157, 135, 'https://images.unsplash.com/photo-1592502712628-64e4e5ad0e4e?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (158, 136, 'https://images.pexels.com/photos/11489498/pexels-photo-11489498.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (156, 134, 'https://images.pexels.com/photos/4198370/pexels-photo-4198370.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (153, 131, 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (154, 132, 'https://images.unsplash.com/photo-1573414405272-b5a4f3e5bfb5?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (91, 69, 'https://images.unsplash.com/photo-1573414405272-b5a4f3e5bfb5?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (166, 144, 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (145, 123, 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (83, 61, 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (72, 50, 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (167, 145, 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (77, 55, 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (160, 138, 'https://images.pexels.com/photos/5529607/pexels-photo-5529607.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (69, 47, 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (172, 150, 'https://images.unsplash.com/photo-1585059895524-72f0a4ebb35a?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (161, 139, 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (170, 148, 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (71, 49, 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (138, 116, 'https://images.unsplash.com/photo-1604177091072-8c28d9b462a1?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (87, 65, 'https://images.unsplash.com/photo-1604177091072-8c28d9b462a1?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (135, 113, 'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (165, 143, 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (163, 141, 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (151, 129, 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (76, 54, 'https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (168, 146, 'https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (171, 149, 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (73, 51, 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (134, 112, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (81, 59, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (149, 127, 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (142, 120, 'https://images.unsplash.com/photo-1594282486786-8d97a9f30e8f?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (80, 58, 'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (148, 126, 'https://images.pexels.com/photos/6316515/pexels-photo-6316515.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (70, 48, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (88, 66, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (137, 115, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (155, 133, 'https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (78, 56, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (150, 128, 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (79, 57, 'https://images.unsplash.com/photo-1582476561071-f3965a6acee6?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (159, 137, 'https://images.pexels.com/photos/5529607/pexels-photo-5529607.jpeg?auto=compress&cs=tinysrgb&w=600', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (133, 111, 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (82, 60, 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&q=80', true, '2026-02-02 03:10:51.354383');
INSERT INTO public.product_images VALUES (169, 147, 'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=600&q=80', true, '2026-02-20 02:47:06.734005');
INSERT INTO public.product_images VALUES (75, 53, 'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=600&q=80', true, '2026-02-02 03:10:51.354383');


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.products VALUES (63, 18, 6, 'Cabbage', 'Premium quality Cabbage sourced directly from verified farms.', 450.00, 'fixed_price', 26.40, NULL, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 12:30:26.794865');
INSERT INTO public.products VALUES (62, 18, 6, 'Cauliflower', 'Premium quality Cauliflower sourced directly from verified farms.', 400.00, 'fixed_price', 42.00, NULL, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (46, 17, 5, 'Alphonso Mango', 'Premium quality Alphonso Mango sourced directly from verified farms.', 500.00, 'fixed_price', 720.00, NULL, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (47, 17, 5, 'Kashmir Apple', 'Premium quality Kashmir Apple sourced directly from verified farms.', 1000.00, 'fixed_price', 216.00, NULL, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (48, 17, 5, 'Robusta Banana', 'Premium quality Robusta Banana sourced directly from verified farms.', 2000.00, 'fixed_price', 36.00, NULL, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (49, 17, 5, 'Nagpur Orange', 'Premium quality Nagpur Orange sourced directly from verified farms.', 800.00, 'fixed_price', 72.00, NULL, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (50, 17, 5, 'Green Grapes', 'Premium quality Green Grapes sourced directly from verified farms.', 600.00, 'fixed_price', 108.00, NULL, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (51, 17, 5, 'Pomegranate', 'Premium quality Pomegranate sourced directly from verified farms.', 400.00, 'fixed_price', 144.00, NULL, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (52, 17, 5, 'Papaya', 'Premium quality Papaya sourced directly from verified farms.', 700.00, 'fixed_price', 48.00, NULL, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (53, 17, 5, 'Watermelon', 'Premium quality Watermelon sourced directly from verified farms.', 1500.00, 'fixed_price', 24.00, NULL, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (54, 17, 5, 'Pineapple', 'Premium quality Pineapple sourced directly from verified farms.', 300.00, 'bidding', NULL, 60.00, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (55, 17, 5, 'Guava', 'Premium quality Guava sourced directly from verified farms.', 450.00, 'bidding', NULL, 50.00, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (56, 17, 5, 'Strawberry', 'Premium quality Strawberry sourced directly from verified farms.', 100.00, 'bidding', NULL, 250.00, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (57, 17, 5, 'Sweet Lime', 'Premium quality Sweet Lime sourced directly from verified farms.', 650.00, 'bidding', NULL, 55.00, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (58, 18, 6, 'Red Onion', 'Premium quality Red Onion sourced directly from verified farms.', 2000.00, 'fixed_price', 30.00, NULL, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (59, 18, 6, 'Potato (Indore)', 'Premium quality Potato (Indore) sourced directly from verified farms.', 3000.00, 'fixed_price', 24.00, NULL, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (60, 18, 6, 'Tomato Hybrid', 'Premium quality Tomato Hybrid sourced directly from verified farms.', 1500.00, 'fixed_price', 36.00, NULL, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (61, 18, 6, 'Green Chilli', 'Premium quality Green Chilli sourced directly from verified farms.', 200.00, 'fixed_price', 54.00, NULL, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (64, 18, 6, 'Brinjal (Purple)', 'Premium quality Brinjal (Purple) sourced directly from verified farms.', 350.00, 'fixed_price', 48.00, NULL, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (65, 18, 6, 'Okra (Bhindi)', 'Premium quality Okra (Bhindi) sourced directly from verified farms.', 250.00, 'fixed_price', 60.00, NULL, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (66, 18, 6, 'Spinach', 'Premium quality Spinach sourced directly from verified farms.', 150.00, 'bidding', NULL, 20.00, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (67, 18, 6, 'Carrot', 'Premium quality Carrot sourced directly from verified farms.', 800.00, 'bidding', NULL, 35.00, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (68, 18, 6, 'Capsicum', 'Premium quality Capsicum sourced directly from verified farms.', 300.00, 'bidding', NULL, 60.00, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (69, 18, 6, 'Ginger', 'Premium quality Ginger sourced directly from verified farms.', 100.00, 'bidding', NULL, 120.00, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-02 02:40:57.117445', '2026-02-02 03:10:51.354383');
INSERT INTO public.products VALUES (111, 19, 14, 'Tomato', 'Farm-fresh grade A+ tomatoes, perfect ripeness for wholesale.', 800.00, 'fixed_price', 18.00, NULL, 0.00, 'A+', true, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (112, 19, 15, 'Potato', 'Premium Jyoti potatoes — uniform size, low moisture.', 1200.00, 'fixed_price', 14.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (113, 19, 16, 'Onion', 'Red Nashik onions — strong pungent variety for bulk export.', 2000.00, 'fixed_price', 20.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (114, 19, 17, 'Brinjal', 'Fresh purple brinjal — Gujarat round variety.', 500.00, 'fixed_price', 22.00, NULL, 0.00, 'A+', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (115, 19, 18, 'Spinach', 'Organic palak (spinach) — freshly harvested bundles.', 300.00, 'fixed_price', 28.00, NULL, 0.00, 'A+', true, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (116, 19, 19, 'Okra', 'Tender Bhindi (lady finger) — green, crisp, no bruising.', 400.00, 'fixed_price', 30.00, NULL, 0.00, 'A+', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (117, 19, 20, 'Cabbage', 'Green round cabbage — firm and fresh, export-ready.', 900.00, 'fixed_price', 12.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (118, 19, 21, 'Cauliflower', 'Snow-white cauliflower — uniform curd, no yellowing.', 700.00, 'fixed_price', 25.00, NULL, 0.00, 'A+', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (119, 19, 22, 'Carrot', 'Nantes-type orange carrots — crunchy and sweet, no cracks.', 600.00, 'fixed_price', 20.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (120, 19, 23, 'Radish', 'White mooli radish — crisp, no piths, bulk available.', 400.00, 'fixed_price', 14.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (121, 19, 24, 'Beetroot', 'Deep red beetroot — uniform size, high sugar content.', 350.00, 'fixed_price', 22.00, NULL, 0.00, 'A+', true, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (122, 19, 25, 'Capsicum', 'Green and red bell peppers — thick flesh, export quality.', 500.00, 'fixed_price', 45.00, NULL, 0.00, 'A+', true, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (123, 19, 26, 'Green Chilli', 'Medium-hot green chillies — fresh and glossy, no blemish.', 200.00, 'fixed_price', 35.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (124, 19, 27, 'Bottle Gourd', 'Light green Lauki — tender, no seeds, perfect for retail.', 600.00, 'fixed_price', 16.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (125, 19, 28, 'Bitter Gourd', 'Fresh karela — bright green, no yellowing, firm.', 250.00, 'fixed_price', 28.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (126, 19, 29, 'Ridge Gourd', 'Tender Turai — dark green ridges, freshly cut.', 300.00, 'fixed_price', 18.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (127, 19, 30, 'Pumpkin', 'Large yellow pumpkins — hard skin, sweet flesh inside.', 1500.00, 'fixed_price', 12.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (128, 19, 31, 'Sweet Corn', 'Hybrid sweet corn cobs — yellow, high sugar content.', 500.00, 'fixed_price', 20.00, NULL, 0.00, 'A+', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (129, 19, 32, 'Peas', 'Fresh shelled green peas — sweet, no shrivelling.', 400.00, 'fixed_price', 55.00, NULL, 0.00, 'A+', true, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (130, 19, 33, 'Beans', 'Flat green beans — tender, no strings, farm fresh.', 350.00, 'fixed_price', 35.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (131, 19, 34, 'Garlic', 'Dry white garlic bulbs — strong aroma, clean outer skin.', 300.00, 'fixed_price', 90.00, NULL, 0.00, 'A+', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (132, 19, 35, 'Ginger', 'Fresh green ginger — high oil content, fibrous, clean.', 400.00, 'fixed_price', 65.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (133, 19, 36, 'Spring Onion', 'Tender spring onion bunches — bright green tops.', 200.00, 'fixed_price', 30.00, NULL, 0.00, 'A+', true, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (134, 19, 37, 'Fenugreek Leaves', 'Organic Methi leaves — aromatic, slightly bitter, tender.', 150.00, 'fixed_price', 25.00, NULL, 0.00, 'A+', true, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (135, 19, 38, 'Coriander Leaves', 'Fresh green Dhania bundles — strong fragrance, no wilting.', 200.00, 'fixed_price', 20.00, NULL, 0.00, 'A+', true, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (136, 19, 39, 'Drumstick', 'Moringa drumstick pods — long, firm, no bending.', 300.00, 'fixed_price', 40.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (137, 19, 40, 'Tinda', 'Round Tinda (apple gourd) — Gujarat specialty variety.', 250.00, 'fixed_price', 22.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (138, 19, 41, 'Ivy Gourd', 'Tindora (ivy gourd) — green, crisp, no yellowing.', 200.00, 'fixed_price', 25.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.710667', '2026-02-20 02:47:06.710667');
INSERT INTO public.products VALUES (139, 20, 2, 'Mango', 'Kesar and Alphonso mangoes — premium aroma, deep yellow pulp.', 600.00, 'fixed_price', 85.00, NULL, 0.00, 'A+', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.728438', '2026-02-20 02:47:06.728438');
INSERT INTO public.products VALUES (140, 20, 3, 'Banana', 'Cavendish bananas — uniform yellow, no bruising, export quality.', 1500.00, 'fixed_price', 28.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.728438', '2026-02-20 02:47:06.728438');
INSERT INTO public.products VALUES (141, 20, 4, 'Papaya', 'Red Lady papaya — sweet orange flesh, mature, no bruising.', 700.00, 'fixed_price', 32.00, NULL, 0.00, 'A+', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.728438', '2026-02-20 02:47:06.728438');
INSERT INTO public.products VALUES (142, 20, 42, 'Apple', 'Himachal Red Delicious apples — crisp, firm, Grade A+.', 800.00, 'fixed_price', 95.00, NULL, 0.00, 'A+', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.728438', '2026-02-20 02:47:06.728438');
INSERT INTO public.products VALUES (143, 20, 43, 'Orange', 'Nagpur Santra — fully ripe, juicy, loose-skin variety.', 900.00, 'fixed_price', 55.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.728438', '2026-02-20 02:47:06.728438');
INSERT INTO public.products VALUES (144, 20, 44, 'Grapes', 'Thompson seedless grapes — green, tight bunches, no shattering.', 500.00, 'fixed_price', 75.00, NULL, 0.00, 'A+', true, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.728438', '2026-02-20 02:47:06.728438');
INSERT INTO public.products VALUES (145, 20, 45, 'Guava', 'Allahabad Safeda guava — round, white flesh, sweet.', 600.00, 'fixed_price', 40.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.728438', '2026-02-20 02:47:06.728438');
INSERT INTO public.products VALUES (146, 20, 46, 'Pineapple', 'Queen variety pineapples — ripe, golden, tropical aroma.', 400.00, 'fixed_price', 35.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.728438', '2026-02-20 02:47:06.728438');
INSERT INTO public.products VALUES (147, 20, 47, 'Watermelon', 'Sugar Baby watermelons — deep red flesh, 8-10 kg average.', 2000.00, 'fixed_price', 15.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.728438', '2026-02-20 02:47:06.728438');
INSERT INTO public.products VALUES (148, 20, 48, 'Muskmelon', 'Kashi Madhu muskmelon — orange flesh, high sweetness.', 800.00, 'fixed_price', 22.00, NULL, 0.00, 'A+', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.728438', '2026-02-20 02:47:06.728438');
INSERT INTO public.products VALUES (149, 20, 49, 'Pomegranate', 'Bhagwa pomegranate — bright red arils, thick rind, export grade.', 500.00, 'fixed_price', 120.00, NULL, 0.00, 'A+', true, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.728438', '2026-02-20 02:47:06.728438');
INSERT INTO public.products VALUES (150, 20, 50, 'Kiwi', 'Himachal Allison kiwi — bright green flesh, tangy-sweet.', 300.00, 'fixed_price', 180.00, NULL, 0.00, 'A+', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.728438', '2026-02-20 02:47:06.728438');
INSERT INTO public.products VALUES (151, 20, 51, 'Strawberry', 'Mahabaleshwar strawberry — premium red, Grade A, 250g punnets.', 200.00, 'fixed_price', 250.00, NULL, 0.00, 'A+', true, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.728438', '2026-02-20 02:47:06.728438');
INSERT INTO public.products VALUES (152, 20, 53, 'Coconut', 'Mature coconuts — hard shell, white kernel, South Indian origin.', 1000.00, 'fixed_price', 20.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.728438', '2026-02-20 02:47:06.728438');
INSERT INTO public.products VALUES (153, 20, 54, 'Custard Apple', 'Sitaphal — creamy sweet white flesh, natural harvest.', 300.00, 'fixed_price', 70.00, NULL, 0.00, 'A+', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.728438', '2026-02-20 02:47:06.728438');
INSERT INTO public.products VALUES (154, 20, 56, 'Jamun', 'Indian blackberry — ripe, deep purple, seasonal special lot.', 200.00, 'fixed_price', 80.00, NULL, 0.00, 'A+', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.728438', '2026-02-20 02:47:06.728438');
INSERT INTO public.products VALUES (155, 20, 57, 'Amla', 'Indian gooseberry — firm, green, high Vitamin C content.', 400.00, 'fixed_price', 45.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.728438', '2026-02-20 02:47:06.728438');
INSERT INTO public.products VALUES (156, 20, 52, 'Litchi', 'Muzaffarpur litchi — juicy, translucent flesh, seasonal lot.', 400.00, 'bidding', NULL, 60.00, 0.00, 'A+', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.730252', '2026-02-20 02:47:06.730252');
INSERT INTO public.products VALUES (157, 20, 55, 'Dragon Fruit', 'Red-skin dragon fruit — bright pink flesh, premium variety.', 250.00, 'bidding', NULL, 120.00, 0.00, 'A+', true, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.730252', '2026-02-20 02:47:06.730252');
INSERT INTO public.products VALUES (158, 20, 58, 'Fig', 'Fresh Poona figs — honey-sweet, soft, export ready.', 250.00, 'bidding', NULL, 90.00, 0.00, 'A+', true, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.730252', '2026-02-20 02:47:06.730252');
INSERT INTO public.products VALUES (159, 21, 59, 'Turmeric', 'Salem / Erode dry turmeric — 5% curcumin, deep yellow, export.', 500.00, 'fixed_price', 110.00, NULL, 0.00, 'A+', true, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.73161', '2026-02-20 02:47:06.73161');
INSERT INTO public.products VALUES (160, 21, 60, 'Red Chilli', 'Byadagi dry red chillies — deep colour, moderate heat, clean.', 400.00, 'fixed_price', 145.00, NULL, 0.00, 'A+', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.73161', '2026-02-20 02:47:06.73161');
INSERT INTO public.products VALUES (161, 21, 61, 'Coriander Seeds', 'Eagle variety coriander — double-washed, fragrant, bulk.', 600.00, 'fixed_price', 85.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.73161', '2026-02-20 02:47:06.73161');
INSERT INTO public.products VALUES (162, 21, 62, 'Cumin Seeds', 'Unjha-origin Jeera — bold size, high volatile oil, clean.', 400.00, 'fixed_price', 250.00, NULL, 0.00, 'A+', true, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.73161', '2026-02-20 02:47:06.73161');
INSERT INTO public.products VALUES (163, 21, 63, 'Mustard Seeds', 'Black mustard seeds — small, uniform, no shrivelling.', 700.00, 'fixed_price', 70.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.73161', '2026-02-20 02:47:06.73161');
INSERT INTO public.products VALUES (164, 21, 64, 'Fenugreek Seeds', 'Methi seeds — machine-cleaned, low moisture content.', 350.00, 'fixed_price', 90.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.73161', '2026-02-20 02:47:06.73161');
INSERT INTO public.products VALUES (165, 21, 65, 'Fennel Seeds', 'Sweet saunf — Lucknow variety, bright green, aromatic.', 300.00, 'fixed_price', 130.00, NULL, 0.00, 'A+', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.73161', '2026-02-20 02:47:06.73161');
INSERT INTO public.products VALUES (166, 21, 68, 'Clove', 'Whole cloves — long stem, strong essential oil, cleaned.', 100.00, 'fixed_price', 800.00, NULL, 0.00, 'A+', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.73161', '2026-02-20 02:47:06.73161');
INSERT INTO public.products VALUES (167, 21, 69, 'Cinnamon', 'True Ceylon cinnamon quills — soft, multi-layered, fragrant.', 120.00, 'fixed_price', 350.00, NULL, 0.00, 'A+', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.73161', '2026-02-20 02:47:06.73161');
INSERT INTO public.products VALUES (168, 21, 70, 'Bay Leaf', 'Whole dried bay leaves — Tej Patta, long-leaf variety.', 200.00, 'fixed_price', 95.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.73161', '2026-02-20 02:47:06.73161');
INSERT INTO public.products VALUES (169, 21, 71, 'Toor Dal', 'Machine-polished toor dal — uniform split, no husk, low moisture.', 1000.00, 'fixed_price', 95.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.73161', '2026-02-20 02:47:06.73161');
INSERT INTO public.products VALUES (170, 21, 72, 'Moong Dal', 'Yellow moong dal — hulled, clean, low cooking time.', 800.00, 'fixed_price', 110.00, NULL, 0.00, 'A+', true, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.73161', '2026-02-20 02:47:06.73161');
INSERT INTO public.products VALUES (171, 21, 73, 'Chana Dal', 'Split Bengal gram — bold grain, low ash, machine-cleaned.', 900.00, 'fixed_price', 88.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.73161', '2026-02-20 02:47:06.73161');
INSERT INTO public.products VALUES (172, 21, 74, 'Masoor Dal', 'Red lentils — whole and split, uniform colour, no splits.', 700.00, 'fixed_price', 92.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.73161', '2026-02-20 02:47:06.73161');
INSERT INTO public.products VALUES (173, 21, 75, 'Urad Dal', 'Whole black gram — clean, low broken content, export grade.', 600.00, 'fixed_price', 120.00, NULL, 0.00, 'A+', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.73161', '2026-02-20 02:47:06.73161');
INSERT INTO public.products VALUES (174, 21, 77, 'Black Chana', 'Desi black chickpea — small, high protein, organic certified.', 450.00, 'fixed_price', 80.00, NULL, 0.00, 'A', true, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.73161', '2026-02-20 02:47:06.73161');
INSERT INTO public.products VALUES (175, 21, 78, 'Green Gram', 'Whole green moong — bright green skin, export packing.', 600.00, 'fixed_price', 105.00, NULL, 0.00, 'A+', true, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.73161', '2026-02-20 02:47:06.73161');
INSERT INTO public.products VALUES (176, 21, 79, 'Yellow Peas', 'Split yellow peas — smooth, uniform halves, no discolour.', 700.00, 'fixed_price', 75.00, NULL, 0.00, 'A', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.73161', '2026-02-20 02:47:06.73161');
INSERT INTO public.products VALUES (177, 21, 66, 'Black Pepper', 'Wayanad black pepper — bold 7mm+, high piperine, dried.', 200.00, 'bidding', NULL, 450.00, 0.00, 'A+', true, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.732913', '2026-02-20 02:47:06.732913');
INSERT INTO public.products VALUES (178, 21, 67, 'Cardamom', 'Green cardamom — 7mm bold size, strong aroma, Kerala origin.', 150.00, 'bidding', NULL, 1200.00, 0.00, 'A+', true, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.732913', '2026-02-20 02:47:06.732913');
INSERT INTO public.products VALUES (179, 21, 76, 'Kabuli Chana', 'Large white chickpeas — 9mm bold, premium export lot.', 500.00, 'bidding', NULL, 130.00, 0.00, 'A+', false, 'active', NULL, NULL, NULL, '2026-02-20 02:47:06.732913', '2026-02-20 02:47:06.732913');


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.schema_migrations VALUES (1, '20260215000000', '20260215000000_initial_baseline', '2026-02-15 13:36:38.304639', 'efe8b40e4d755a7b07ffbca9c24632e6');
INSERT INTO public.schema_migrations VALUES (2, '20260215000001', '20260215000001_add_uuid_extension', '2026-02-15 13:36:38.311082', '945775b61830cfae47777824afdfd7e8');


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.site_settings VALUES (1, 'commission_rate', '0.05', '2026-01-27 09:27:47.677498');
INSERT INTO public.site_settings VALUES (2, 'min_order_kg', '50', '2026-01-27 09:27:47.677498');
INSERT INTO public.site_settings VALUES (3, 'max_images_per_product', '3', '2026-01-27 09:27:47.677498');
INSERT INTO public.site_settings VALUES (4, 'platform_name', 'FarmerConnect', '2026-01-27 09:27:47.677498');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES (2, 'manager@farmerconnect.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'admin', 'Platform Manager', '9876543211', NULL, true, 'approved', NULL, NULL, '2026-01-27 09:27:47.679375', '2026-02-15 13:14:03.793805', 'd211ef65-b454-486f-a6b5-374fc9307a54');
INSERT INTO public.users VALUES (3, 'support@farmerconnect.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'admin', 'Support Admin', '9876543212', NULL, true, 'approved', NULL, NULL, '2026-01-27 09:27:47.679375', '2026-02-15 13:14:03.793805', '11fd747b-e4b6-4115-b22a-a10520e5b4a7');
INSERT INTO public.users VALUES (5, 'suresh.kumar@email.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'farmer', 'Suresh Kumar', '9898123402', NULL, true, 'approved', NULL, NULL, '2026-01-27 09:27:47.680704', '2026-02-15 13:14:03.793805', '617c1e66-e7e1-44b6-a712-a788460d8d50');
INSERT INTO public.users VALUES (6, 'mahesh.desai@email.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'farmer', 'Mahesh Desai', '9898123403', NULL, true, 'approved', NULL, NULL, '2026-01-27 09:27:47.680704', '2026-02-15 13:14:03.793805', '499e05d2-e533-4240-9652-8c89ebededee');
INSERT INTO public.users VALUES (7, 'jayesh.shah@email.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'farmer', 'Jayesh Shah', '9898123404', NULL, true, 'approved', NULL, NULL, '2026-01-27 09:27:47.680704', '2026-02-15 13:14:03.793805', '103db70f-d483-4544-84e2-a50ee1af2426');
INSERT INTO public.users VALUES (8, 'kiran.modi@email.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'farmer', 'Kiran Modi', '9898123405', NULL, true, 'approved', NULL, NULL, '2026-01-27 09:27:47.680704', '2026-02-15 13:14:03.793805', '4d9638d4-5950-4b73-a51a-a2f984973b85');
INSERT INTO public.users VALUES (9, 'vishal.patel@email.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'farmer', 'Vishal Patel', '9898123406', NULL, true, 'approved', NULL, NULL, '2026-01-27 09:27:47.680704', '2026-02-15 13:14:03.793805', 'e2f04f64-fcee-4fc0-8f12-ac42618b8ddc');
INSERT INTO public.users VALUES (10, 'rajesh.sharma@email.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'farmer', 'Rajesh Sharma', '9898123407', NULL, true, 'approved', NULL, NULL, '2026-01-27 09:27:47.680704', '2026-02-15 13:14:03.793805', '23c622ec-dee3-4d29-8041-42680406683c');
INSERT INTO public.users VALUES (11, 'dinesh.parmar@email.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'farmer', 'Dinesh Parmar', '9898123408', NULL, true, 'approved', NULL, NULL, '2026-01-27 09:27:47.680704', '2026-02-15 13:14:03.793805', '0d4d3108-1a25-4d1c-8d46-d8344fc16a9e');
INSERT INTO public.users VALUES (12, 'nilesh.joshi@email.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'farmer', 'Nilesh Joshi', '9898123409', NULL, true, 'approved', NULL, NULL, '2026-01-27 09:27:47.680704', '2026-02-15 13:14:03.793805', '73ff3f27-c949-43f1-a4f1-ccb72854c86b');
INSERT INTO public.users VALUES (13, 'bhavesh.mehta@email.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'farmer', 'Bhavesh Mehta', '9898123410', NULL, true, 'approved', NULL, NULL, '2026-01-27 09:27:47.680704', '2026-02-15 13:14:03.793805', '6dd2f1ed-ce34-423a-a66b-cfd12ceddee5');
INSERT INTO public.users VALUES (14, 'ashok.yadav@email.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'farmer', 'Ashok Yadav', '9898123411', NULL, false, 'pending', NULL, NULL, '2026-01-27 09:27:47.680704', '2026-02-15 13:14:03.793805', 'a5d009c8-11e0-45f9-904d-7d2fa4059895');
INSERT INTO public.users VALUES (15, 'pravin.naik@email.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'farmer', 'Pravin Naik', '9898123412', NULL, false, 'pending', NULL, NULL, '2026-01-27 09:27:47.680704', '2026-02-15 13:14:03.793805', '60cfee00-aaa8-419a-8f2f-c10c0bb0f228');
INSERT INTO public.users VALUES (16, 'govind.singh@email.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'farmer', 'Govind Singh', '9898123413', NULL, false, 'pending', NULL, NULL, '2026-01-27 09:27:47.680704', '2026-02-15 13:14:03.793805', 'edf80613-4963-450f-b478-3f180c5957f3');
INSERT INTO public.users VALUES (17, 'mohan.rathod@email.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'farmer', 'Mohan Rathod', '9898123414', NULL, false, 'pending', NULL, NULL, '2026-01-27 09:27:47.680704', '2026-02-15 13:14:03.793805', '7a4cba07-7b0a-420a-8fa9-af17cea81c53');
INSERT INTO public.users VALUES (18, 'sanjay.trivedi@email.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'farmer', 'Sanjay Trivedi', '9898123415', NULL, false, 'pending', NULL, NULL, '2026-01-27 09:27:47.680704', '2026-02-15 13:14:03.793805', '89806720-adf8-4bd3-976a-bf81c35885f2');
INSERT INTO public.users VALUES (20, 'purchase@gujaratexport.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'buyer', 'Priya Patel', '9898765402', NULL, true, 'approved', NULL, NULL, '2026-01-27 09:27:47.681591', '2026-02-15 13:14:03.793805', 'fba9b289-420a-44d0-959c-9e6173b5c745');
INSERT INTO public.users VALUES (21, 'buy@wholesalefruits.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'buyer', 'Vikram Singh', '9898765403', NULL, true, 'approved', NULL, NULL, '2026-01-27 09:27:47.681591', '2026-02-15 13:14:03.793805', '2ae5e193-1ba9-4c1d-95e4-33bbc0a6d012');
INSERT INTO public.users VALUES (1, 'admin@farmerconnect.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'admin', 'Super Admin', '9876543210', NULL, true, 'approved', NULL, '2026-02-15 13:17:39.259544', '2026-01-27 09:27:47.679375', '2026-02-15 13:17:39.259544', '3facc5c8-391c-4958-82f3-6aa8e9c75733');
INSERT INTO public.users VALUES (4, 'ramesh.patel@email.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'farmer', 'Ramesh Patel', '9898123401', NULL, true, 'approved', NULL, '2026-02-15 13:19:08.415725', '2026-01-27 09:27:47.680704', '2026-02-15 13:19:08.415725', '9ee3a68b-feb6-4369-8752-f3876e8f1029');
INSERT INTO public.users VALUES (22, 'manager@foodprocessing.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'buyer', 'Neha Desai', '9898765404', NULL, true, 'approved', NULL, NULL, '2026-01-27 09:27:47.681591', '2026-02-15 13:14:03.793805', 'e43263b8-5498-42fa-95d4-6ef6e5b3872d');
INSERT INTO public.users VALUES (23, 'sourcing@organicfoods.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'buyer', 'Rahul Joshi', '9898765405', NULL, true, 'approved', NULL, NULL, '2026-01-27 09:27:47.681591', '2026-02-15 13:14:03.793805', 'f58d8fb7-41ff-4e61-8536-8a69e3bd4d55');
INSERT INTO public.users VALUES (24, 'purchase@fruitmart.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'buyer', 'Sneha Modi', '9898765406', NULL, true, 'approved', NULL, NULL, '2026-01-27 09:27:47.681591', '2026-02-15 13:14:03.793805', '94bdac6d-cd91-4be5-a3cf-6703dbb4af70');
INSERT INTO public.users VALUES (25, 'orders@juicefactory.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'buyer', 'Karan Mehta', '9898765407', NULL, true, 'approved', NULL, NULL, '2026-01-27 09:27:47.681591', '2026-02-15 13:14:03.793805', '9ebf7290-b95b-4f20-bc91-d767b2a5a5d9');
INSERT INTO public.users VALUES (26, 'buy@exporthouse.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'buyer', 'Anita Shah', '9898765408', NULL, true, 'approved', NULL, NULL, '2026-01-27 09:27:47.681591', '2026-02-15 13:14:03.793805', '3959d64f-83ed-426e-a0e8-8f76aee662a4');
INSERT INTO public.users VALUES (27, 'sourcing@bigbasket.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'buyer', 'Deepak Kumar', '9898765409', NULL, true, 'approved', NULL, NULL, '2026-01-27 09:27:47.681591', '2026-02-15 13:14:03.793805', '92b281af-00e6-4fab-8c17-fd0d07a20524');
INSERT INTO public.users VALUES (28, 'purchase@retailmart.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'buyer', 'Meera Patel', '9898765410', NULL, true, 'approved', NULL, NULL, '2026-01-27 09:27:47.681591', '2026-02-15 13:14:03.793805', '06b24911-f47c-460d-900f-e11b4229dc69');
INSERT INTO public.users VALUES (29, 'orders@newbuyer1.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'buyer', 'Ravi Yadav', '9898765411', NULL, false, 'pending', NULL, NULL, '2026-01-27 09:27:47.681591', '2026-02-15 13:14:03.793805', 'cb8e2550-d67e-425e-8746-5e13ef061ab5');
INSERT INTO public.users VALUES (30, 'orders@newbuyer2.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'buyer', 'Sunita Sharma', '9898765412', NULL, false, 'pending', NULL, NULL, '2026-01-27 09:27:47.681591', '2026-02-15 13:14:03.793805', 'e02abd4d-203f-429a-947f-2a489030d3f6');
INSERT INTO public.users VALUES (31, 'jaiswalarpit4282@gmail.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'farmer', 'Arpit jaiswal', '9624997427', NULL, false, 'pending', NULL, '2026-02-02 01:34:52.159183', '2026-01-31 08:47:58.025545', '2026-02-15 13:14:03.793805', '494aa354-7639-4ddc-8ebf-cb0f13fa037e');
INSERT INTO public.users VALUES (19, 'orders@freshjuice.com', '$2a$12$46VrY62IRqjNGZyMupvKjuf8xtmJvD8rQWEzQpG5OT.wD2cM1Gqey', 'buyer', 'Amit Sharma', '9898765401', NULL, true, 'approved', NULL, '2026-02-15 13:18:09.822951', '2026-01-27 09:27:47.681591', '2026-02-15 13:18:09.822951', 'b03b55bd-e4d1-4399-ba82-b1c6daab1c54');
INSERT INTO public.users VALUES (35, 'vaishnavi@example.com', '$2a$12$jOwURRorT4PBFUG8zx4HueGWLJQPNRmZnyluX19DRBx4rqYGBAUD6', 'buyer', 'Vaishnavi Singh', NULL, NULL, true, 'approved', NULL, NULL, '2026-02-02 02:31:45.208836', '2026-02-15 13:21:42.111919', 'a3a12ca1-66fb-459e-8370-7e19a0a6f2a0');
INSERT INTO public.users VALUES (33, 'rani@example.com', '$2a$12$jOwURRorT4PBFUG8zx4HueGWLJQPNRmZnyluX19DRBx4rqYGBAUD6', 'farmer', 'Rani Sahu', NULL, NULL, true, 'approved', NULL, '2026-02-20 12:44:03.926595', '2026-02-02 02:31:45.208836', '2026-02-20 12:44:03.926595', '213b47db-0346-4570-b9bc-58f6e14d6637');
INSERT INTO public.users VALUES (34, 'monika@example.com', '$2a$12$jOwURRorT4PBFUG8zx4HueGWLJQPNRmZnyluX19DRBx4rqYGBAUD6', 'buyer', 'Monika Panday', NULL, NULL, true, 'approved', NULL, '2026-02-17 12:31:39.98002', '2026-02-02 02:31:45.208836', '2026-02-17 12:31:39.98002', '2761c03b-5138-4636-93ca-317c81a8df21');
INSERT INTO public.users VALUES (32, 'arpit@example.com', '$2a$12$jOwURRorT4PBFUG8zx4HueGWLJQPNRmZnyluX19DRBx4rqYGBAUD6', 'farmer', 'Arpit', NULL, NULL, true, 'approved', NULL, '2026-02-17 09:46:01.094384', '2026-02-02 02:31:45.208836', '2026-02-17 09:46:01.094384', 'f5688b13-5e29-495e-8c65-52be6fcd2f51');
INSERT INTO public.users VALUES (36, 'rani.sahu@email.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'farmer', 'Rani Sahu', '9898123420', NULL, true, 'approved', NULL, NULL, '2026-02-20 02:42:44.356407', '2026-02-20 02:42:44.356407', '314f28cb-8d96-408b-b4f9-6c23ed83a4ad');
INSERT INTO public.users VALUES (37, 'arpit.jaiswal@email.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'farmer', 'Arpit Jaiswal', '9898123421', NULL, true, 'approved', NULL, NULL, '2026-02-20 02:42:44.356407', '2026-02-20 02:42:44.356407', 'ff0dddc5-e38b-4f83-9172-fcdc5f5f6e61');
INSERT INTO public.users VALUES (38, 'damini.gavali@email.com', '$2a$12$nsj948PQDuP8hSq/4YwEsub88b4UWCzSKpFKsxGa.gWpHWxsHPE7G', 'farmer', 'Damini Gavali', '9898123422', NULL, true, 'approved', NULL, NULL, '2026-02-20 02:42:44.356407', '2026-02-20 02:42:44.356407', 'd62d82e4-0afd-4bd9-be42-0c761ee966b2');


--
-- Name: apmc_reference_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.apmc_reference_id_seq', 17, true);


--
-- Name: bids_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bids_id_seq', 25, true);


--
-- Name: buyers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.buyers_id_seq', 14, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 145, true);


--
-- Name: farmers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.farmers_id_seq', 24, true);


--
-- Name: msp_reference_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.msp_reference_id_seq', 4, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 13, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 39, true);


--
-- Name: platform_analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.platform_analytics_id_seq', 31, true);


--
-- Name: product_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_images_id_seq', 201, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 179, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reviews_id_seq', 20, true);


--
-- Name: schema_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.schema_migrations_id_seq', 2, true);


--
-- Name: site_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.site_settings_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 41, true);


--
-- Name: apmc_reference apmc_reference_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.apmc_reference
    ADD CONSTRAINT apmc_reference_pkey PRIMARY KEY (id);


--
-- Name: bids bids_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bids
    ADD CONSTRAINT bids_pkey PRIMARY KEY (id);


--
-- Name: buyers buyers_gst_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buyers
    ADD CONSTRAINT buyers_gst_number_key UNIQUE (gst_number);


--
-- Name: buyers buyers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buyers
    ADD CONSTRAINT buyers_pkey PRIMARY KEY (id);


--
-- Name: buyers buyers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buyers
    ADD CONSTRAINT buyers_user_id_key UNIQUE (user_id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: farmers farmers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmers
    ADD CONSTRAINT farmers_pkey PRIMARY KEY (id);


--
-- Name: farmers farmers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmers
    ADD CONSTRAINT farmers_user_id_key UNIQUE (user_id);


--
-- Name: msp_reference msp_reference_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.msp_reference
    ADD CONSTRAINT msp_reference_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: platform_analytics platform_analytics_metric_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_analytics
    ADD CONSTRAINT platform_analytics_metric_date_key UNIQUE (metric_date);


--
-- Name: platform_analytics platform_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_analytics
    ADD CONSTRAINT platform_analytics_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_order_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_order_id_key UNIQUE (order_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_version_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_version_key UNIQUE (version);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_public_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_public_id_key UNIQUE (public_id);


--
-- Name: idx_apmc_reference_crop_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_apmc_reference_crop_name ON public.apmc_reference USING btree (crop_name);


--
-- Name: idx_apmc_reference_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_apmc_reference_date ON public.apmc_reference USING btree (date);


--
-- Name: idx_bids_buyer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bids_buyer_id ON public.bids USING btree (buyer_id);


--
-- Name: idx_bids_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bids_created_at ON public.bids USING btree (created_at);


--
-- Name: idx_bids_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bids_product_id ON public.bids USING btree (product_id);


--
-- Name: idx_bids_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bids_status ON public.bids USING btree (status);


--
-- Name: idx_buyers_gst_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_buyers_gst_number ON public.buyers USING btree (gst_number);


--
-- Name: idx_buyers_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_buyers_user_id ON public.buyers USING btree (user_id);


--
-- Name: idx_farmers_city; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_farmers_city ON public.farmers USING btree (city);


--
-- Name: idx_farmers_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_farmers_state ON public.farmers USING btree (state);


--
-- Name: idx_farmers_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_farmers_user_id ON public.farmers USING btree (user_id);


--
-- Name: idx_msp_reference_crop_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_msp_reference_crop_name ON public.msp_reference USING btree (crop_name);


--
-- Name: idx_notifications_is_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_orders_buyer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_buyer_id ON public.orders USING btree (buyer_id);


--
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at);


--
-- Name: idx_orders_farmer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_farmer_id ON public.orders USING btree (farmer_id);


--
-- Name: idx_orders_order_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_order_number ON public.orders USING btree (order_number);


--
-- Name: idx_orders_order_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_order_status ON public.orders USING btree (order_status);


--
-- Name: idx_orders_payment_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_payment_status ON public.orders USING btree (payment_status);


--
-- Name: idx_product_images_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_images_product_id ON public.product_images USING btree (product_id);


--
-- Name: idx_products_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_category_id ON public.products USING btree (category_id);


--
-- Name: idx_products_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_created_at ON public.products USING btree (created_at);


--
-- Name: idx_products_farmer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_farmer_id ON public.products USING btree (farmer_id);


--
-- Name: idx_products_selling_mode; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_selling_mode ON public.products USING btree (selling_mode);


--
-- Name: idx_products_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_status ON public.products USING btree (status);


--
-- Name: idx_reviews_farmer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_farmer_id ON public.reviews USING btree (farmer_id);


--
-- Name: idx_reviews_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_order_id ON public.reviews USING btree (order_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_user_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_user_type ON public.users USING btree (user_type);


--
-- Name: idx_users_verification_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_verification_status ON public.users USING btree (verification_status);


--
-- Name: bids update_bids_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON public.bids FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: products update_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: bids bids_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bids
    ADD CONSTRAINT bids_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.buyers(id) ON DELETE CASCADE;


--
-- Name: bids bids_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bids
    ADD CONSTRAINT bids_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: buyers buyers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buyers
    ADD CONSTRAINT buyers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: farmers farmers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.farmers
    ADD CONSTRAINT farmers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: orders orders_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.buyers(id);


--
-- Name: orders orders_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmers(id);


--
-- Name: orders orders_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: products products_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmers(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.buyers(id);


--
-- Name: reviews reviews_farmer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmers(id);


--
-- Name: reviews reviews_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- PostgreSQL database dump complete
--


