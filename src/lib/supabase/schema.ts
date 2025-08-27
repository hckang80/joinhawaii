export const RESERVATION_SELECT_QUERY = `
  id,
  reservation_id,
  status,
  created_at,
  main_client_name,
  booking_platform,
  total_amount,
  clients!clients_reservation_id_fkey (
    id,
    korean_name,
    english_name,
    gender,
    resident_id,
    phone_number,
    email,
    notes
  ),
  flights!flights_reservation_id_fkey (*),
  hotels!hotels_reservation_id_fkey (*),
  tours!tours_reservation_id_fkey (*),
  rental_cars!rental_cars_reservation_id_fkey (*)
`;
