import { Route } from '../api/routes';
import { FoodStop } from '../api/food';
import { Pandal, District } from '../api/pandals';

export const MOCK_ROUTES: Route[] = [
    {
        id: '1',
        title: 'Lights of the City of Joy',
        description: 'Chase the glow of Kolkata\'s most dazzling pandals as the city comes alive after dark…',
        duration: '~4-5 Hours',
        stopCount: 20,
        stops: [],
        createdAt: new Date().toISOString(),
    },
    {
        id: '2',
        title: 'Heritage & Grandeur Trail',
        description: 'Walk through decades of tradition across the oldest and grandest community pujas…',
        duration: '~3-5 Hours',
        stopCount: 24,
        stops: [],
        createdAt: new Date().toISOString(),
    },
    {
        id: '3',
        title: 'The Artisan\'s Circuit',
        description: 'A curated path through pandals celebrated for their breathtaking themes and craftsmanship…',
        duration: '~2-3 Hours',
        stopCount: 14,
        stops: [],
        createdAt: new Date().toISOString(),
    },
];

export const MOCK_FOOD_STOPS: FoodStop[] = [
    {
        id: '1',
        name: 'The Gazeboo',
        type: 'Restaurant',
        image: 'https://lh3.googleusercontent.com/p/AF1QipOTRXftYnkyVJW6ukQPaxSMCrQjG0HbyiJ04KV7=s680-w680-h510-rw',
        location: { type: 'Point', coordinates: [0, 0] },
        area: 'Bidhannagar',
        district: 'Kolkata',
    },
    {
        id: '2',
        name: 'Mocambo Restaurant and Bar',
        type: 'Restaurant',
        image: 'https://lh3.googleusercontent.com/gps-cs-s/AHVAweq4PcHFxmGW6h9MNGcS_f-tROrNYauUqOs1jC_qvHRyx-0_FtYC1_NoC9zmAbVL3Tge4D0WNGBxL65uy0vvbs9AxWFeGPwq-IR9bNspyIOy_fdjQy8kC4cMFkSLlULR-n0LbkMh9Q=s680-w680-h510-rw',
        location: { type: 'Point', coordinates: [0, 0] },
        area: 'Park Street',
        district: 'Kolkata',
    },
    {
        id: '3',
        name: 'Oh! Calcutta',
        type: 'Fine Dining',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
        location: { type: 'Point', coordinates: [0, 0] },
        area: 'Salt Lake',
        district: 'Kolkata',
    },
];

export const MOCK_PANDALS: Pandal[] = [
    {
        id: '1',
        name: 'Sreebhumi Sporting Club',
        description: 'Known for its extravagant themes, this year featuring a majestic palace replica.',
        area: 'Lake Town',
        district: 'Kolkata',
        state: 'West Bengal',
        country: 'India',
        theme: 'Vatican City',
        tags: ['award-winning', 'popular'],
        location: { type: 'Point', coordinates: [88.3973, 22.5976] },
        images: ['https://example.com/sreebhumi.jpg'],
        ratingAvg: 4.8,
        ratingCount: 1205,
        status: 'approved',
        approvalCount: 5,
        approvedBy: ['admin1'],
        createdBy: 'admin1',
        createdAt: new Date().toISOString(),
    },
    {
        id: '2',
        name: 'Suruchi Sangha',
        description: 'Award winning puja featuring traditional art forms.',
        area: 'New Alipore',
        district: 'Kolkata',
        state: 'West Bengal',
        country: 'India',
        theme: 'Bengal Traditional Art',
        tags: ['award-winning', 'traditional'],
        location: { type: 'Point', coordinates: [88.3308, 22.5186] },
        images: ['https://example.com/suruchi.jpg'],
        ratingAvg: 4.6,
        ratingCount: 890,
        status: 'approved',
        approvalCount: 5,
        approvedBy: ['admin1'],
        createdBy: 'admin1',
        createdAt: new Date().toISOString(),
    }
];

export const MOCK_DISTRICTS: District[] = [
    {
        id: '1',
        name: 'Kolkata',
        pandalCount: 450,
        image: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Kolkata_maidan.jpg'
    },
    {
        id: '2',
        name: 'Howrah',
        pandalCount: 120,
        image: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Belur_Math_-_Ramakrishna_Math_and_around%2C_Howrah%2C_Kolkata-_IRCTC_2017_%2820%29.jpg'
    },
    {
        id: '3',
        name: '24 Parganas (N)',
        pandalCount: 300,
        image: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Mangal_Pandey_Park%2C_Barrackpore.jpg'
    },
];
