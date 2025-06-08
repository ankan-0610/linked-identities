CREATE TABLE contact(
    id SERIAL NOT NULL,
    phonenumber varchar(255),
    email varchar(255),
    linkedid integer,
    linkprecedence varchar(10),
    createdat timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedat timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deletedat timestamp without time zone,
    PRIMARY KEY(id),
    CONSTRAINT contact_linkprecedence_check CHECK ((linkprecedence)::text = ANY ((ARRAY['primary'::character varying, 'secondary'::character varying])::text[]))
);

CREATE INDEX idx_contact_linkedid ON public.contact USING btree (linkedid) WHERE (linkedid IS NOT NULL);
CREATE INDEX idx_contact_email ON public.contact USING btree (email) WHERE (email IS NOT NULL);
CREATE INDEX idx_contact_phonenumber ON public.contact USING btree (phonenumber) WHERE (phonenumber IS NOT NULL);

CREATE OR REPLACE FUNCTION set_linked_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."linkprecedence" = 'primary' THEN
    NEW."linkedid" = NEW."id";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_linked_id
BEFORE INSERT OR UPDATE ON "contact"
FOR EACH ROW EXECUTE FUNCTION set_linked_id();

ALTER SEQUENCE contact_id_seq RESTART WITH 1;