import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { ScrapeSource, Frequency, BQTable } from '../types';
import { LOCATIONS, MOCK_BQ_TABLES } from '../constants';
import { UploadCloud, Database, Calendar, CheckCircle, ArrowRight, Terminal, Search } from 'lucide-react';
import { generateDerivedTableSQL } from '../services/geminiService';

interface NewScrapeProps {
  onCancel: () => void;
  onSubmit: (config: any) => void;
}

export const NewScrape: React.FC<NewScrapeProps> = ({ onCancel, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [clientName, setClientName] = useState('');
  const [sourceType, setSourceType] = useState<ScrapeSource>(ScrapeSource.CSV);
  const [file, setFile] = useState<File | null>(null);
  
  // BQ State
  const [selectedTable, setSelectedTable] = useState<BQTable | null>(null);
  const [gtinCol, setGtinCol] = useState('');
  const [priceCol, setPriceCol] = useState('');
  const [salePriceCol, setSalePriceCol] = useState('');
  const [generatedSQL, setGeneratedSQL] = useState('');
  const [isGeneratingSQL, setIsGeneratingSQL] = useState(false);

  // Scrape Config
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[1].value); // Default UK
  const [frequency, setFrequency] = useState<Frequency>(Frequency.WEEKLY);

  const currentLocation = LOCATIONS.find(l => l.value === selectedLocation) || LOCATIONS[0];

  useEffect(() => {
    if (step === 3 && sourceType === ScrapeSource.BIGQUERY && selectedTable && gtinCol && priceCol && clientName) {
      const fetchSQL = async () => {
        setIsGeneratingSQL(true);
        const sql = await generateDerivedTableSQL(
          selectedTable.projectId,
          selectedTable.datasetId,
          selectedTable.tableId,
          gtinCol,
          priceCol,
          salePriceCol || 'NULL',
          clientName
        );
        setGeneratedSQL(sql);
        setIsGeneratingSQL(false);
      };
      fetchSQL();
    }
  }, [step, sourceType, selectedTable, gtinCol, priceCol, salePriceCol, clientName]);

  const handleSubmit = async () => {
    const payload = {
      clientName,
      sourceType,
      fileName: file?.name,
      bqTable: selectedTable,
      domain: currentLocation.domain,
      location: currentLocation.label,
      language: currentLocation.hl,
      frequency,
      generatedSQL,
      // --- CRITICAL UPDATES HERE ---
      gtinCol, 
      priceCol, 
      salePriceCol
    };

    try {
      // IMPORTANT: Replace this URL with your actual Cloud Run URL
      const response = await fetch('https://shopping-backend-635452941137.europe-west2.run.app/setup_pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        alert('Pipeline Created! Dataset: ' + result.dataset);
        
        // Reminder for CSV uploads
        if (sourceType === ScrapeSource.CSV) { 
           alert(`IMPORTANT: Please upload ${file?.name} manually to the bucket: ${result.backend_bucket}`);
        }
        
        // Trigger the parent onSubmit to close modal or refresh list
        onSubmit(payload); 
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error(error);
      alert('Connection failed. Please check your Cloud Run URL.');
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-fadeIn max-w-lg">
      <div>
        <label className="block text-sm font-semibold text-brand-text mb-2">Project Name</label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="e.g. TPS - All Products"
          className="w-full bg-white border border-brand-border rounded-lg text-brand-text p-3 focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none transition-all placeholder-gray-400"
        />
        <p className="mt-2 text-xs text-brand-muted">
          This will create a new BigQuery dataset: <span className="font-mono text-brand-purple bg-purple-50 px-1 rounded">{clientName ? clientName.toLowerCase().replace(/\s/g, '_') + '_dataset' : '...'}</span>
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setSourceType(ScrapeSource.CSV)}
          className={`p-8 border-2 rounded-xl flex flex-col items-center justify-center space-y-4 transition-all ${
            sourceType === ScrapeSource.CSV 
              ? 'border-brand-purple bg-purple-50 text-brand-purple shadow-sm' 
              : 'border-brand-border bg-white text-brand-muted hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className={`p-4 rounded-full ${sourceType === ScrapeSource.CSV ? 'bg-white' : 'bg-gray-100'}`}>
            <UploadCloud className="w-8 h-8" />
          </div>
          <span className="font-bold tracking-tight">CSV Upload</span>
        </button>
        
        <button
          onClick={() => setSourceType(ScrapeSource.BIGQUERY)}
          className={`p-8 border-2 rounded-xl flex flex-col items-center justify-center space-y-4 transition-all ${
            sourceType === ScrapeSource.BIGQUERY 
              ? 'border-brand-purple bg-purple-50 text-brand-purple shadow-sm' 
              : 'border-brand-border bg-white text-brand-muted hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className={`p-4 rounded-full ${sourceType === ScrapeSource.BIGQUERY ? 'bg-white' : 'bg-gray-100'}`}>
            <Database className="w-8 h-8" />
          </div>
          <span className="font-bold tracking-tight">BigQuery Source</span>
        </button>
      </div>

      {sourceType === ScrapeSource.CSV ? (
        <div className="border-2 border-dashed border-brand-border rounded-xl p-12 flex flex-col items-center justify-center text-center bg-white">
          <input 
            type="file" 
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full max-w-xs text-sm text-brand-muted file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-purple file:text-white hover:file:bg-brand-purpleLight cursor-pointer"
          />
          <p className="mt-4 text-xs text-brand-muted">Support for .csv files with 'gtin' or 'ean' headers.</p>
        </div>
      ) : (
        <div className="space-y-4 bg-white p-6 rounded-xl border border-brand-border shadow-sm">
          <div>
            <label className="block text-sm font-semibold text-brand-text mb-2">Select Source Table</label>
            <div className="relative">
              <Database className="absolute left-3 top-3.5 w-4 h-4 text-brand-muted" />
              <select
                onChange={(e) => setSelectedTable(MOCK_BQ_TABLES.find(t => t.tableId === e.target.value) || null)}
                className="w-full bg-white border border-brand-border rounded-lg text-brand-text pl-10 p-3 focus:border-brand-purple outline-none appearance-none"
              >
                <option value="">-- Choose a table --</option>
                {MOCK_BQ_TABLES.map(t => (
                  <option key={t.tableId} value={t.tableId}>
                    {t.projectId}.{t.datasetId}.{t.tableId}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedTable && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-brand-border">
              <div>
                <label className="block text-xs uppercase font-bold text-brand-muted mb-1">GTIN Column *</label>
                <select 
                  className="w-full bg-gray-50 border border-brand-border rounded-lg text-brand-text p-2.5 text-sm outline-none focus:ring-1 focus:ring-brand-purple"
                  onChange={(e) => setGtinCol(e.target.value)}
                >
                  <option value="">Select...</option>
                  {selectedTable.schema.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-brand-muted mb-1">Price Column *</label>
                <select 
                  className="w-full bg-gray-50 border border-brand-border rounded-lg text-brand-text p-2.5 text-sm outline-none focus:ring-1 focus:ring-brand-purple"
                  onChange={(e) => setPriceCol(e.target.value)}
                >
                  <option value="">Select...</option>
                  {selectedTable.schema.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-brand-muted mb-1">Sale Price (Opt)</label>
                <select 
                  className="w-full bg-gray-50 border border-brand-border rounded-lg text-brand-text p-2.5 text-sm outline-none focus:ring-1 focus:ring-brand-purple"
                  onChange={(e) => setSalePriceCol(e.target.value)}
                >
                  <option value="">Select...</option>
                  {selectedTable.schema.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8 animate-fadeIn">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-brand-border shadow-sm">
            <label className="block text-sm font-semibold text-brand-text mb-4 flex items-center">
              <Search className="w-4 h-4 mr-2 text-brand-purple" />
              Target Market
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-gray-50 border border-brand-border rounded-lg text-brand-text p-3 focus:border-brand-purple outline-none"
            >
              {LOCATIONS.map(l => (
                <option key={l.value} value={l.value}>{l.label} ({l.domain})</option>
              ))}
            </select>
          </div>
          <div className="bg-white p-6 rounded-xl border border-brand-border shadow-sm">
            <label className="block text-sm font-semibold text-brand-text mb-4 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-brand-purple" />
              Update Frequency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[Frequency.DAILY, Frequency.WEEKLY, Frequency.MONTHLY].map((f) => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`py-2.5 text-sm font-medium border rounded-lg transition-colors ${
                    frequency === f 
                    ? 'border-brand-purple bg-purple-50 text-brand-purple ring-1 ring-brand-purple' 
                    : 'border-brand-border bg-white text-brand-muted hover:border-gray-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
       </div>

       <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl">
          <h3 className="text-blue-900 font-bold mb-4">
             Schedule Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-3 rounded-lg border border-blue-100">
               <span className="block text-xs text-blue-500 uppercase font-bold">Region</span>
               <span className="text-brand-text font-medium">{currentLocation.label} ({currentLocation.gl})</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100">
               <span className="block text-xs text-blue-500 uppercase font-bold">Language</span>
               <span className="text-brand-text font-medium">{currentLocation.hl}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100">
               <span className="block text-xs text-blue-500 uppercase font-bold">Schedule</span>
               <span className="text-brand-text font-medium">{frequency} (Cron: {frequency === Frequency.DAILY ? '0 9 * * *' : frequency === Frequency.WEEKLY ? '0 9 * * 1' : '0 9 1 * *'})</span>
            </div>
             <div className="bg-white p-3 rounded-lg border border-blue-100">
               <span className="block text-xs text-blue-500 uppercase font-bold">Domain</span>
               <span className="text-brand-text font-medium">{currentLocation.domain}</span>
            </div>
          </div>
       </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="animate-fadeIn space-y-6">
      <div className="bg-white p-8 rounded-xl border border-brand-border shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-brand-text">Ready to Launch</h3>
        <p className="text-brand-muted mt-2">We have generated the configuration for your new scrape pipeline.</p>
      </div>

      <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-brand-border">
            <h4 className="text-sm font-bold text-brand-text uppercase tracking-wider">Deployment Plan</h4>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-start">
            <div className="min-w-8 pt-0.5"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-purple text-white text-xs font-bold">1</span></div>
            <div>
              <p className="text-sm font-bold text-brand-text">Provision BigQuery Dataset</p>
              <p className="text-xs text-brand-muted font-mono mt-1 bg-gray-100 inline-block px-2 py-0.5 rounded border border-gray-200">{clientName.toLowerCase().replace(/\s/g, '_')}_dataset</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="min-w-8 pt-0.5"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-purple text-white text-xs font-bold">2</span></div>
            <div>
              <p className="text-sm font-bold text-brand-text">Configure SerpAPI Scraper</p>
              <p className="text-xs text-brand-muted mt-1">Source: {sourceType === ScrapeSource.BIGQUERY ? 'BigQuery Feed' : 'CSV Upload'}</p>
            </div>
          </div>

          {sourceType === ScrapeSource.BIGQUERY && (
             <div className="flex items-start">
               <div className="min-w-8 pt-0.5"><span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-purple text-white text-xs font-bold">3</span></div>
               <div className="w-full">
                 <p className="text-sm font-bold text-brand-text mb-3">Create Derived Analysis Table (SQL)</p>
                 <div className="bg-gray-900 p-4 rounded-lg border border-gray-800 relative shadow-inner">
                    <div className="absolute top-3 right-3 flex space-x-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    </div>
                    {isGeneratingSQL ? (
                      <div className="flex items-center text-brand-purpleLight text-xs font-mono animate-pulse py-2">
                        <Terminal className="w-3 h-3 mr-2" />
                        AI Agent Generating SQL...
                      </div>
                    ) : (
                      <pre className="text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap max-h-40 scrollbar-thin">
                        {generatedSQL}
                      </pre>
                    )}
                 </div>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-brand-text tracking-tight">Create New Project</h2>
        <div className="flex items-center space-x-2 mt-4 bg-gray-100 rounded-full h-1.5 overflow-hidden">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-full flex-1 transition-all duration-500 ${step >= s ? 'bg-brand-purple' : 'bg-transparent'}`} />
          ))}
        </div>
      </div>

      <div className="min-h-[400px]">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>

      <div className="flex justify-between mt-12 pt-6 border-t border-brand-border">
        <Button variant="secondary" onClick={() => step === 1 ? onCancel() : setStep(step - 1)}>
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>
        <Button 
          variant="primary" 
          onClick={() => step === 4 ? handleSubmit() : setStep(step + 1)}
          disabled={
            (step === 1 && !clientName) ||
            (step === 2 && sourceType === ScrapeSource.CSV && !file) ||
            (step === 2 && sourceType === ScrapeSource.BIGQUERY && (!selectedTable || !gtinCol || !priceCol))
          }
        >
          {step === 4 ? 'Launch Pipeline' : 'Next Step'}
          {step !== 4 && <ArrowRight className="ml-2 w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
};