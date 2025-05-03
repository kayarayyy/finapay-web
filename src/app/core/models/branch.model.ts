import { User } from "./user.model";

export interface Branch {
    id: string;
    name: string;
    city: string;
    latitude: number;
    longitude: number;
    branchManager: User | null;
    marketing: User[];
}