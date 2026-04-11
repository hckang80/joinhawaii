import type { ReservationResponse } from '@/types';
import React from 'react';

type ReservationConfirmationPreviewProps = {
  data: ReservationResponse;
  divRef?: React.Ref<HTMLDivElement>;
};

export function ReservationConfirmationPreview({
  data,
  divRef
}: ReservationConfirmationPreviewProps) {
  return (
    <div ref={divRef} style={{ background: '#fff', color: '#000', padding: 24, width: 600 }}>
      <h2>Reservation Confirmation</h2>
      <p>예약자: {data.main_client_name}</p>
    </div>
  );
}
