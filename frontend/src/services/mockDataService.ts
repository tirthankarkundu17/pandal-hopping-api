import { IDataService } from './interfaces';
import { Route } from '../api/routes';
import { FoodStop } from '../api/food';
import { Pandal, District } from '../api/pandals';
import { MOCK_ROUTES, MOCK_FOOD_STOPS, MOCK_PANDALS, MOCK_DISTRICTS } from './mockData';

export class MockDataService implements IDataService {
    async getRoutes(): Promise<Route[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_ROUTES), 500); // Simulate network delay
        });
    }

    async getFoodStops(): Promise<FoodStop[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_FOOD_STOPS), 500);
        });
    }

    async getPandals(): Promise<Pandal[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_PANDALS), 500);
        });
    }

    async getDistricts(): Promise<District[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_DISTRICTS), 500);
        });
    }
}
