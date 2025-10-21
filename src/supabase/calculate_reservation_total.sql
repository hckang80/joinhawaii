CREATE OR REPLACE FUNCTION calculate_reservation_total(p_reservation_id TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_amount INTEGER := 0;
    v_total_cost INTEGER := 0;
BEGIN
    -- 항공권 합계
    SELECT COALESCE(SUM(total_amount), 0)
    INTO v_total_amount
    FROM flights
    WHERE reservation_id = p_reservation_id;

    SELECT COALESCE(SUM(total_cost), 0)
    INTO v_total_cost
    FROM flights
    WHERE reservation_id = p_reservation_id;

    -- 호텔 합계
    SELECT v_total_amount + COALESCE(SUM(total_amount), 0)
    INTO v_total_amount
    FROM hotels
    WHERE reservation_id = p_reservation_id;

    SELECT v_total_cost + COALESCE(SUM(total_cost), 0)
    INTO v_total_cost
    FROM hotels
    WHERE reservation_id = p_reservation_id;

    -- 투어 합계
    SELECT v_total_amount + COALESCE(SUM(total_amount), 0)
    INTO v_total_amount
    FROM tours
    WHERE reservation_id = p_reservation_id;

    SELECT v_total_cost + COALESCE(SUM(total_cost), 0)
    INTO v_total_cost
    FROM tours
    WHERE reservation_id = p_reservation_id;

    -- 렌터카 합계
    SELECT v_total_amount + COALESCE(SUM(total_amount), 0)
    INTO v_total_amount
    FROM rental_cars
    WHERE reservation_id = p_reservation_id;

    SELECT v_total_cost + COALESCE(SUM(total_cost), 0)
    INTO v_total_cost
    FROM rental_cars
    WHERE reservation_id = p_reservation_id;

    -- 보험 합계
    SELECT v_total_amount + COALESCE(SUM(total_amount), 0)
    INTO v_total_amount
    FROM insurances
    WHERE reservation_id = p_reservation_id;

    SELECT v_total_cost + COALESCE(SUM(total_cost), 0)
    INTO v_total_cost
    FROM insurances
    WHERE reservation_id = p_reservation_id;

    RETURN jsonb_build_object(
        'total_amount', v_total_amount,
        'total_cost', v_total_cost
    );
END;
$$;