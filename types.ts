export enum ScrapeSource {
  CSV = 'CSV',
  BIGQUERY = 'BIGQUERY'
}

export enum Frequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

export interface BQProject {
  projectId: string;
  friendlyName: string;
}

export interface BQDataset {
  datasetId: string;
  projectId: string;
}

export interface BQTable {
  projectId: string;
  datasetId: string;
  tableId: string;
  schema: string[]; // Column names
  type?: string; // TABLE, VIEW, etc.
}

export interface ScrapeConfig {
  id: string;
  clientName: string;
  sourceType: ScrapeSource;
  // File source
  fileName?: string;
  // BQ Source
  bqTable?: BQTable;
  bqGtinColumn?: string;
  bqPriceColumn?: string;
  bqSalePriceColumn?: string;
  // SerpAPI Config
  domain: string; // e.g., google.com
  location: string; // e.g., United Kingdom
  language: string; // e.g., en
  frequency: Frequency;
  // Metadata
  createdAt: string;
  status: 'active' | 'paused' | 'pending';
  lastRun?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface LocationOption {
  value: string;
  label: string;
  domain: string;
  gl: string; // Country code
  hl: string; // Language code
}