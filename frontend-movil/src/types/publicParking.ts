export type PublicParkingStatus = 'OPEN' | 'FULL' | 'CLOSED';

export interface ParkingBbox {
    minLng: number;
    minLat: number;
    maxLng: number;
    maxLat: number;
}

export interface PublicParkingSummary {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    total_spaces: number;
    available_spaces: number;
    status: PublicParkingStatus;
    updated_at: string;
}

export interface PublicRate {
    code: string;
    name: string;
    price_per_hour: string;
}

export interface PublicSchedule {
    day: string;
    opens_at: string;
    closes_at: string;
}

export interface PublicParkingDetail extends PublicParkingSummary {
    description: string;
    rates: PublicRate[];
    schedules: PublicSchedule[];
}

export interface PublicParkingList {
    updated_at: string;
    results: PublicParkingSummary[];
}
