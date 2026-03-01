import { IDataService } from './interfaces';
import { MockDataService } from './mockDataService';
import { ApiDataService } from './apiDataService';

// Set this to true to use static JSON data and avoid real API calls.
// Set to false when your backend APIs are ready and running.
export const USE_MOCK_DATA = true;

const dataService: IDataService = USE_MOCK_DATA ? new MockDataService() : new ApiDataService();

export default dataService;
