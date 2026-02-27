import { IDataService } from './interfaces';
import { routesApi, Route } from '../api/routes';
import { foodApi, FoodStop } from '../api/food';
import { pandalApi, Pandal, District } from '../api/pandals';

export class ApiDataService implements IDataService {
    async getRoutes(): Promise<Route[]> {
        return routesApi.listRoutes();
    }

    async getFoodStops(): Promise<FoodStop[]> {
        return foodApi.listFoodStops();
    }

    async getPandals(): Promise<Pandal[]> {
        return pandalApi.listApproved();
    }

    async getDistricts(): Promise<District[]> {
        return pandalApi.listDistricts();
    }
}
