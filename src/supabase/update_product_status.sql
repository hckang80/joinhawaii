CREATE OR REPLACE FUNCTION update_product_status(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_record JSONB;
BEGIN
    CASE (payload->>'product_type')
        WHEN 'flight' THEN
            UPDATE flights 
            SET status = (payload->>'status')::product_status,
                updated_at = NOW()
            WHERE id = (payload->>'product_id')::BIGINT 
            AND reservation_id = (payload->>'reservation_id')::TEXT
            RETURNING to_jsonb(flights.*) INTO v_updated_record;
            
        WHEN 'hotel' THEN
            UPDATE hotels 
            SET status = (payload->>'status')::product_status,
                updated_at = NOW()
            WHERE id = (payload->>'product_id')::BIGINT 
            AND reservation_id = (payload->>'reservation_id')::TEXT
            RETURNING to_jsonb(hotels.*) INTO v_updated_record;
            
        WHEN 'tour' THEN
            UPDATE tours 
            SET status = (payload->>'status')::product_status,
                updated_at = NOW()
            WHERE id = (payload->>'product_id')::BIGINT 
            AND reservation_id = (payload->>'reservation_id')::TEXT
            RETURNING to_jsonb(tours.*) INTO v_updated_record;
            
        WHEN 'rental_car' THEN
            UPDATE rental_cars 
            SET status = (payload->>'status')::product_status,
                updated_at = NOW()
            WHERE id = (payload->>'product_id')::BIGINT 
            AND reservation_id = (payload->>'reservation_id')::TEXT
            RETURNING to_jsonb(rental_cars.*) INTO v_updated_record;
            
        WHEN 'insurance' THEN
            UPDATE insurances 
            SET status = (payload->>'status')::product_status,
                updated_at = NOW()
            WHERE id = (payload->>'product_id')::BIGINT 
            AND reservation_id = (payload->>'reservation_id')::TEXT
            RETURNING to_jsonb(insurances.*) INTO v_updated_record;
            
        ELSE
            RAISE EXCEPTION 'Invalid product type: %', (payload->>'product_type');
    END CASE;

    IF v_updated_record IS NULL THEN
        RAISE EXCEPTION 'Product not found or update failed';
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'data', v_updated_record
    );
END;
$$;