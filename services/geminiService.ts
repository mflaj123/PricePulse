import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY || ''; 
  // In a real app, we handle missing keys gracefully. 
  // For this demo, we assume the environment is set up as per instructions.
  return new GoogleGenAI({ apiKey });
};

export const generateDerivedTableSQL = async (
  projectId: string,
  datasetId: string,
  sourceTable: string,
  gtinCol: string,
  priceCol: string,
  salePriceCol: string,
  clientName: string
): Promise<string> => {
  try {
    const ai = getClient();
    const model = 'gemini-3-flash-preview';

    const prompt = `
      You are a BigQuery SQL Expert.
      
      I have a source product feed table: \`${projectId}.${datasetId}.${sourceTable}\`.
      I have a results table from a scrape: \`${projectId}.${clientName.toLowerCase().replace(/\s/g, '_')}_dataset.shopping_results\`.
      
      The source table has columns:
      - GTIN: ${gtinCol}
      - Price: ${priceCol}
      - Sale Price: ${salePriceCol}
      
      The shopping_results table has columns:
      - query (which matches the GTIN)
      - title
      - price
      - link
      - merchant_name
      - extraction_date
      
      Write a Standard SQL Data Definition Language (DDL) statement to CREATE OR REPLACE a derived table named \`${projectId}.${clientName.toLowerCase().replace(/\s/g, '_')}_dataset.price_comparison_daily\` that:
      1. Joins the source table with the shopping_results table on GTIN = query.
      2. Selects relevant columns from both to allow for a price comparison (Source Price vs Scraped Price).
      3. Adds a calculated column 'price_diff_percentage'.
      
      Return ONLY the SQL code within a markdown code block.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const text = response.text || '';
    // Extract SQL from code block if present
    const match = text.match(/```sql([\s\S]*?)```/);
    return match ? match[1].trim() : text.trim();

  } catch (error) {
    console.error("Gemini SQL Generation Failed:", error);
    return "-- Error generating SQL. Please verify API Key and inputs.";
  }
};