export const defaultClientValues = {
  korean_name: '',
  english_name: '',
  gender: '',
  resident_id: '',
  phone_number: '',
  email: '',
  notes: ''
};

export const defaultFlightValues = {
  flight_number: '',
  departure_datetime: '',
  departure_city: '',
  arrival_datetime: '',
  arrival_city: '',
  capacity: {
    adult: 1,
    children: 0
  },
  price: {
    adult: 0,
    children: 0,
    deposit: 0,
    balance: 0,
    total: 0
  }
};

export const defaultHotelValues = {
  region: '',
  check_in_date: '',
  check_out_date: '',
  name: '',
  room_type: '',
  is_breakfast_included: false,
  is_resort_fee: false,
  nights: 1,
  price: {
    nightly: 0,
    deposit: 0,
    balance: 0,
    total: 0
  }
};

export const defaultTourValues = {
  region: '',
  start_date: '',
  end_date: '',
  name: '',
  participant: {
    adult: 1,
    children: 0
  },
  price: {
    adult: 0,
    children: 0,
    deposit: 0,
    balance: 0,
    total: 0
  }
};

export const defaultCarValues = {
  region: '',
  pickup_date: '',
  return_date: '',
  model: '',
  options: '',
  driver: '',
  pickup_location: '',
  pickup_time: '',
  rental_days: 1,
  price: {
    nightly: 0,
    deposit: 0,
    balance: 0,
    total: 0
  }
};
