import { LocationOption, BQTable } from './types';

export const LOCATIONS: LocationOption[] = [
  { value: 'us', label: 'United States', domain: 'google.com', gl: 'us', hl: 'en' },
  { value: 'uk', label: 'United Kingdom', domain: 'google.co.uk', gl: 'gb', hl: 'en' },
  { value: 'de', label: 'Germany', domain: 'google.de', gl: 'de', hl: 'de' },
  { value: 'fr', label: 'France', domain: 'google.fr', gl: 'fr', hl: 'fr' },
  { value: 'jp', label: 'Japan', domain: 'google.co.jp', gl: 'jp', hl: 'ja' },
  { value: 'au', label: 'Australia', domain: 'google.com.au', gl: 'au', hl: 'en' },
];

export const MOCK_BQ_TABLES: BQTable[] = [
  {
    projectId: 'retail-data-warehouse',
    datasetId: 'product_feeds',
    tableId: 'master_catalog_v2',
    schema: ['product_id', 'gtin_13', 'title', 'base_price', 'sale_price', 'currency', 'stock_level']
  },
  {
    projectId: 'retail-data-warehouse',
    datasetId: 'competitor_tracking',
    tableId: 'target_list_q3',
    schema: ['sku', 'ean', 'competitor_url', 'target_price']
  }
];

export const MOCK_USER = {
  id: 'u1',
  name: 'Alex Mercer',
  email: 'alex.m@agency.com',
  avatar: 'https://picsum.photos/100/100'
};