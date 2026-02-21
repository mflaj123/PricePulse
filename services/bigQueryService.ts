import { BQTable, BQProject, BQDataset } from '../types';

const BACKEND_URL = 'https://shopping-backend-635452941137.europe-west2.run.app';

export const listProjects = async (): Promise<BQProject[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/list_projects`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`Error fetching projects: ${response.statusText}`);
    const data = await response.json();
    return data.projects || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw error; // Propagate error to UI
  }
};

export const listDatasets = async (projectId: string): Promise<BQDataset[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/list_datasets?projectId=${projectId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`Error fetching datasets: ${response.statusText}`);
    const data = await response.json();
    return data.datasets || [];
  } catch (error) {
    console.error('Failed to fetch datasets:', error);
    throw error;
  }
};

export const listTablesInDataset = async (projectId: string, datasetId: string): Promise<BQTable[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/list_tables_in_dataset?projectId=${projectId}&datasetId=${datasetId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`Error fetching tables: ${response.statusText}`);
    const data = await response.json();
    // Map backend response to BQTable
    return (data.tables || []).map((t: any) => ({
      projectId,
      datasetId,
      tableId: t.tableId,
      schema: [], // Schema is fetched separately now
      type: t.type
    }));
  } catch (error) {
    console.error('Failed to fetch tables:', error);
    throw error;
  }
};

export const getTableSchema = async (projectId: string, datasetId: string, tableId: string): Promise<string[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/get_table_schema?projectId=${projectId}&datasetId=${datasetId}&tableId=${tableId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error(`Error fetching schema: ${response.statusText}`);
    const data = await response.json();
    return data.schema || [];
  } catch (error) {
    console.error('Failed to fetch schema:', error);
    throw error;
  }
};

export const searchBigQueryTables = async (query: string = ''): Promise<BQTable[]> => {
  try {
    // We'll assume the backend has a /list_tables endpoint
    // that returns { tables: BQTable[] }
    // We include credentials to pass the session cookie
    const response = await fetch(`${BACKEND_URL}/list_tables?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', 
    });

    if (!response.ok) {
      throw new Error(`Error fetching tables: ${response.statusText}`);
    }

    const data = await response.json();
    return data.tables || []; 
  } catch (error) {
    console.error('Failed to fetch BigQuery tables:', error);
    return [];
  }
};
