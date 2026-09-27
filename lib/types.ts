export type Trip = {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone: string | null;
  fromCity: string;
  toCity: string;
  acceptsPassengers: boolean;
  acceptsParcels: boolean;
  note: string | null;
  createdAt: number;
  expiresAt: number;
};

export type NewTripInput = {
  fromCity: string;
  toCity: string;
  acceptsPassengers: boolean;
  acceptsParcels: boolean;
  note: string | null;
  durationMinutes: 20 | 30;
};
