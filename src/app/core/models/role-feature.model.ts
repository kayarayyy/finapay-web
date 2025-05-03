import { Feature } from "./feature.model";

export interface RoleFeature {
    id: string;
    name: string;
    listFeatures: Feature[];
}