import React from 'react';
import { ScrapeConfig } from '../types';
import { PlayCircle, PauseCircle, Clock, Database, FileText, ArrowUpRight, MoreVertical, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';

interface DashboardProps {
  scrapes: ScrapeConfig[];
}

export const Dashboard: React.FC<DashboardProps> = ({ scrapes }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-brand-text tracking-tight mb-1">Project Dashboard</h2>
          <div className="flex space-x-4 text-sm mt-4">
             <button className="px-4 py-2 bg-purple-50 text-brand-purple font-semibold rounded-lg flex items-center">
                <Database className="w-4 h-4 mr-2" />
                Active Projects ({scrapes.length})
             </button>
          </div>
        </div>
        <div className="flex space-x-3">
          {/* Actions removed as requested */}
        </div>
      </div>

      {scrapes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-brand-border p-16 text-center">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-brand-purple" />
          </div>
          <h3 className="text-lg font-bold text-brand-text">No Projects Found</h3>
          <p className="text-brand-muted mt-2 max-w-sm mx-auto">Start a new price comparison project by connecting your data source.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">
            <div className="col-span-4">Name</div>
            <div className="col-span-2">Source</div>
            <div className="col-span-2">Frequency</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          
          {scrapes.map((scrape) => (
            <div key={scrape.id} className="bg-white rounded-xl shadow-sm border border-brand-border hover:shadow-md transition-shadow p-6 group">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${scrape.sourceType === 'BIGQUERY' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                       {scrape.sourceType === 'BIGQUERY' ? <Database className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-brand-text group-hover:text-brand-purple transition-colors">{scrape.clientName}</h3>
                        <p className="text-xs text-brand-muted font-mono mt-0.5">{scrape.id}</p>
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                   <div className="text-sm font-medium text-brand-text">
                      {scrape.sourceType === 'BIGQUERY' ? 'BigQuery Feed' : 'CSV Upload'}
                   </div>
                   <div className="text-xs text-brand-muted truncate max-w-[120px]">
                      {scrape.sourceType === 'BIGQUERY' ? scrape.bqTable?.tableId : scrape.fileName}
                   </div>
                </div>

                <div className="col-span-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {scrape.frequency}
                    </span>
                    <div className="text-xs text-brand-muted mt-1">
                       {scrape.location}
                    </div>
                </div>

                <div className="col-span-2">
                   {scrape.status === 'active' ? (
                     <div className="flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                        <div>
                           <p className="text-sm font-bold text-green-600">Live</p>
                           <p className="text-xs text-brand-muted">Running</p>
                        </div>
                     </div>
                   ) : (
                     <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                        <div>
                           <p className="text-sm font-bold text-yellow-600">Paused</p>
                        </div>
                     </div>
                   )}
                </div>

                <div className="col-span-2 flex justify-end">
                   <button className="p-2 hover:bg-gray-50 rounded-full transition-colors text-brand-muted hover:text-brand-text">
                      <MoreVertical className="w-5 h-5" />
                   </button>
                </div>
              </div>
              
              {/* Expandable-like footer details */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                 <div className="flex space-x-6 text-sm">
                    <div className="flex flex-col">
                       <span className="text-xs text-brand-muted uppercase">Target Market</span>
                       <span className="font-semibold text-brand-text">{scrape.location}</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-xs text-brand-muted uppercase">Dataset</span>
                       <span className="font-semibold text-brand-text">{scrape.clientName.toLowerCase().replace(/\s/g, '_')}_dataset</span>
                    </div>
                 </div>
                 <Button variant="outline" className="text-xs h-8 px-4 py-0">View Report</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};