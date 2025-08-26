CREATE OR REPLACE FUNCTION create_reservation(
    p_reservation_id TEXT,
    p_clients JSONB,
    p_main_client_name TEXT,
    p_flights JSONB DEFAULT '[]'::jsonb,
    p_hotels JSONB DEFAULT '[]'::jsonb,
    p_tours JSONB DEFAULT '[]'::jsonb,
    p_cars JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id BIGINT;
    v_total_amount INTEGER := 0;
BEGIN
    -- 예약 생성
    INSERT INTO reservations (
        reservation_id,
        status,
        created_at,
        main_client_name
    )
    VALUES (
        p_reservation_id,
        'pending',
        NOW(),
        p_main_client_name
    )
    RETURNING id INTO v_id;

    -- 예약자 정보 입력
    INSERT INTO clients (
        reservation_id,
        korean_name,
        english_name,
        gender,
        resident_id,
        phone_number,
        email,
        notes
    )
    SELECT 
        p_reservation_id,
        (value->>'korean_name')::TEXT,
        (value->>'english_name')::TEXT,
        (value->>'gender')::TEXT,
        (value->>'resident_id')::TEXT,
        (value->>'phone_number')::TEXT,
        (value->>'email')::TEXT,
        (value->>'notes')::TEXT
    FROM jsonb_array_elements(p_clients);

    -- 항공권 정보 입력
    IF jsonb_array_length(p_flights) > 0 THEN
        INSERT INTO flights (
            reservation_id,
            flight_number,
            departure_datetime,
            departure_city,
            arrival_datetime,
            arrival_city,
            adult_count,
            children_count,
            adult_price,
            children_price,
            adult_cost,
            children_cost,
            total_amount,
            total_cost,
            additional_item_name,
            additional_item_cost,
            additional_item_price,
            notes
        )
        SELECT 
            p_reservation_id,
            (value->>'flight_number')::TEXT,
            (value->>'departure_datetime')::TIMESTAMPTZ,
            (value->>'departure_city')::TEXT,
            (value->>'arrival_datetime')::TIMESTAMPTZ,
            (value->>'arrival_city')::TEXT,
            (value->>'adult_count')::INTEGER,
            (value->>'children_count')::INTEGER,
            (value->>'adult_price')::INTEGER,
            (value->>'children_price')::INTEGER,
            (value->>'adult_cost')::INTEGER,
            (value->>'children_cost')::INTEGER,
            (value->>'total_amount')::INTEGER,
            (value->>'total_cost')::INTEGER,
            (value->>'additional_item_name')::TEXT,
            (value->>'additional_item_cost')::INTEGER,
            (value->>'additional_item_price')::INTEGER,
            (value->>'notes')::TEXT
        FROM jsonb_array_elements(p_flights);
    END IF;

    -- 호텔 정보 입력
    IF jsonb_array_length(p_hotels) > 0 THEN
        INSERT INTO hotels (
            reservation_id,
            region,
            check_in_date,
            check_out_date,
            hotel_name,
            room_type,
            is_breakfast_included,
            is_resort_fee,
            nights,
            nightly_rate,
            total_amount,
            cost,
            total_cost,
            additional_item_name,
            additional_item_cost,
            additional_item_price,
            notes
        )
        SELECT 
            p_reservation_id,
            (value->>'region')::TEXT,
            (value->>'check_in_date')::DATE,
            (value->>'check_out_date')::DATE,
            (value->>'hotel_name')::TEXT,
            (value->>'room_type')::TEXT,
            (value->>'is_breakfast_included')::BOOLEAN,
            (value->>'is_resort_fee')::BOOLEAN,
            (value->>'nights')::INTEGER,
            (value->>'nightly_rate')::INTEGER,
            (value->>'total_amount')::INTEGER,
            (value->>'cost')::INTEGER,
            (value->>'total_cost')::INTEGER,
            (value->>'additional_item_name')::TEXT,
            (value->>'additional_item_cost')::INTEGER,
            (value->>'additional_item_price')::INTEGER,
            (value->>'notes')::TEXT
        FROM jsonb_array_elements(p_hotels);
    END IF;

    -- 투어 정보 입력
    IF jsonb_array_length(p_tours) > 0 THEN
        INSERT INTO tours (
            reservation_id,
            region,
            name,
            start_date,
            end_date,
            adult_count,
            children_count,
            adult_price,
            children_price,
            adult_cost,
            children_cost,
            total_amount,
            total_cost,
            additional_item_name,
            additional_item_cost,
            additional_item_price,
            notes
        )
        SELECT 
            p_reservation_id,
            (value->>'region')::TEXT,
            (value->>'name')::TEXT,
            (value->>'start_date')::TIMESTAMPTZ,
            (value->>'end_date')::TIMESTAMPTZ,
            (value->>'adult_count')::INTEGER,
            (value->>'children_count')::INTEGER,
            (value->>'adult_price')::INTEGER,
            (value->>'children_price')::INTEGER,
            (value->>'adult_cost')::INTEGER,
            (value->>'children_cost')::INTEGER,
            (value->>'total_amount')::INTEGER,
            (value->>'total_cost')::INTEGER,
            (value->>'additional_item_name')::TEXT,
            (value->>'additional_item_cost')::INTEGER,
            (value->>'additional_item_price')::INTEGER,
            (value->>'notes')::TEXT
        FROM jsonb_array_elements(p_tours);
    END IF;

    -- 렌터카 정보 입력
    IF jsonb_array_length(p_cars) > 0 THEN
        INSERT INTO rental_cars (
            reservation_id,
            region,
            pickup_date,
            return_date,
            model,
            options,
            driver,
            pickup_location,
            pickup_time,
            rental_days,
            daily_rate,
            total_amount,
            cost,
            total_cost,
            additional_item_name,
            additional_item_cost,
            additional_item_price,
            notes
        )
        SELECT 
            p_reservation_id,
            (value->>'region')::TEXT,
            (value->>'pickup_date')::DATE,
            (value->>'return_date')::DATE,
            (value->>'model')::TEXT,
            (value->>'options')::TEXT,
            (value->>'driver')::TEXT,
            (value->>'pickup_location')::TEXT,
            (value->>'pickup_time')::TIME,
            (value->>'rental_days')::INTEGER,
            (value->>'daily_rate')::INTEGER,
            (value->>'total_amount')::INTEGER,
            (value->>'cost')::INTEGER,
            (value->>'total_amount')::INTEGER,
            (value->>'additional_item_name')::TEXT,
            (value->>'additional_item_cost')::INTEGER,
            (value->>'additional_item_price')::INTEGER,
            (value->>'notes')::TEXT
        FROM jsonb_array_elements(p_cars);
    END IF;
    
    -- 항공권 합계
    SELECT COALESCE(SUM(f.total_amount), 0)
    INTO v_total_amount
    FROM flights f
    WHERE f.reservation_id = p_reservation_id;

    -- 호텔 합계 추가
    SELECT v_total_amount + COALESCE(SUM(h.total_amount), 0)
    INTO v_total_amount
    FROM hotels h
    WHERE h.reservation_id = p_reservation_id;

    -- 투어 합계 추가
    SELECT v_total_amount + COALESCE(SUM(t.total_amount), 0)
    INTO v_total_amount
    FROM tours t
    WHERE t.reservation_id = p_reservation_id;

    -- 렌터카 합계 추가
    SELECT v_total_amount + COALESCE(SUM(c.total_amount), 0)
    INTO v_total_amount
    FROM rental_cars c
    WHERE c.reservation_id = p_reservation_id;

    -- 예약 총액 업데이트
    UPDATE reservations 
    SET total_amount = v_total_amount
    WHERE reservation_id = p_reservation_id;

    RETURN jsonb_build_object(
        'id', v_id,
        'reservation_id', p_reservation_id,
        'total_amount', v_total_amount,
        'created_at', NOW()
    );
END;
$$;