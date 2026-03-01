import { Route } from '../api/routes';
import { FoodStop } from '../api/food';
import { Pandal, District } from '../api/pandals';

export interface IDataService {
    getRoutes(): Promise<Route[]>;
    getFoodStops(): Promise<FoodStop[]>;
    getPandals(params?: { lng?: number; lat?: number; radius?: number }): Promise<Pandal[]>;
    getDistricts(): Promise<District[]>;
}
