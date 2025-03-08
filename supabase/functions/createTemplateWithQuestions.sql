
-- Create a function that creates a template and its questions in a single transaction
CREATE OR REPLACE FUNCTION create_template_with_questions(
  template_title TEXT,
  template_description TEXT,
  questions_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_template_id UUID;
  template_record JSONB;
  questions_records JSONB = '[]'::JSONB;
  q JSONB;
  current_user_id UUID;
BEGIN
  -- Get the current user ID from the auth context
  current_user_id := auth.uid();
  
  -- Create the template
  INSERT INTO templates (title, description, user_id)
  VALUES (template_title, template_description, current_user_id)
  RETURNING id INTO new_template_id;
  
  -- Get the template record
  SELECT to_jsonb(t) INTO template_record
  FROM templates t
  WHERE id = new_template_id;
  
  -- Create each question
  FOR q IN SELECT * FROM jsonb_array_elements(questions_data)
  LOOP
    WITH inserted_question AS (
      INSERT INTO questions (
        template_id,
        text,
        type,
        required,
        options,
        order_index
      )
      VALUES (
        new_template_id,
        q->>'text',
        q->>'type',
        (q->>'required')::boolean,
        q->'options',
        (q->>'order_index')::integer
      )
      RETURNING *
    )
    SELECT questions_records || to_jsonb(iq)
    INTO questions_records
    FROM inserted_question iq;
  END LOOP;
  
  -- Return the template with questions
  RETURN jsonb_build_object(
    'id', template_record->>'id',
    'title', template_record->>'title',
    'description', template_record->>'description',
    'created_at', template_record->>'created_at',
    'updated_at', template_record->>'updated_at',
    'user_id', template_record->>'user_id',
    'questions', questions_records
  );
END;
$$;
