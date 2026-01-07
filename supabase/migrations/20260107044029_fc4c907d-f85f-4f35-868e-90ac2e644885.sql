-- Create validation function for contact messages
CREATE OR REPLACE FUNCTION public.validate_contact_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate name (1-100 chars)
  IF LENGTH(TRIM(NEW.name)) < 1 OR LENGTH(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Invalid name: must be 1-100 characters';
  END IF;
  
  -- Validate email format
  IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Validate email length
  IF LENGTH(NEW.email) > 255 THEN
    RAISE EXCEPTION 'Email too long: maximum 255 characters';
  END IF;
  
  -- Validate message length (1-2000 chars)
  IF LENGTH(TRIM(NEW.message)) < 1 OR LENGTH(NEW.message) > 2000 THEN
    RAISE EXCEPTION 'Invalid message: must be 1-2000 characters';
  END IF;
  
  -- Trim whitespace and normalize email
  NEW.name := TRIM(NEW.name);
  NEW.email := TRIM(LOWER(NEW.email));
  NEW.message := TRIM(NEW.message);
  
  RETURN NEW;
END;
$$;

-- Create trigger for contact message validation
CREATE TRIGGER validate_contact_message_trigger
  BEFORE INSERT ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_contact_message();