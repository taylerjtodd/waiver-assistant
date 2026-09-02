import React, { useState, useRef, useCallback } from 'react';
import { Upload, Sparkles, Download, AlertCircle } from 'lucide-react';
import { useRankings } from '../../context/RankingsContext';

interface CsvDropzoneProps {
  onSuccess?: () => void;
  compact?: boolean;
}

export const CsvDropzone: React.FC<CsvDropzoneProps> = ({ onSuccess, compact = false }) => {
  const { 
    uploadCsvFile, 
    loadSampleRankings, 
    downloadTemplate, 
    isLoading, 
    parseErrors, 
    parseWarnings 
  } = useRankings();

  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const processFile = useCallback(async (file: File) => {
    if (!file) return;
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      alert('Please upload a .csv or .txt file.');
      return;
    }
    const success = await uploadCsvFile(file);
    if (success && onSuccess) {
      onSuccess();
    }
  }, [uploadCsvFile, onSuccess]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  }, [processFile]);

  const handleFileInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
      // Reset input value
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [processFile]);

  const handleSampleClick = useCallback(() => {
    loadSampleRankings();
    if (onSuccess) onSuccess();
  }, [loadSampleRankings, onSuccess]);

  return (
    <div className="space-y-4">
      {/* Drop Zone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center text-center ${
          compact ? 'p-6' : 'p-8 sm:p-10'
        } ${
          isDragOver
            ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01] shadow-lg shadow-emerald-500/10'
            : 'border-slate-700/80 bg-slate-900/50 hover:border-emerald-500/50 hover:bg-slate-900/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
          <Upload className="w-7 h-7" />
        </div>

        <h3 className="text-base sm:text-lg font-semibold text-slate-100 mb-1">
          {isDragOver ? 'Drop CSV file to import' : 'Upload Rankings CSV'}
        </h3>
        
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-4">
          Drag and drop your fantasy rankings file here, or{' '}
          <span className="text-emerald-400 font-medium underline underline-offset-2">browse your computer</span>
        </p>

        {/* Expected Format Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-500 font-medium">Supported Columns:</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">RK</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">PLAYER NAME</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">POS</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">TEAM</span>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-slate-200">Parsing and matching rankings...</span>
          </div>
        )}
      </div>

      {/* Parse Errors */}
      {parseErrors.length > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>CSV Parsing Issue</span>
          </div>
          {parseErrors.map((err, i) => (
            <p key={i} className="pl-6 text-slate-300">{err}</p>
          ))}
        </div>
      )}

      {/* Parse Warnings */}
      {parseWarnings.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Parsing Notice:</span>
          </div>
          {parseWarnings.map((warn, i) => (
            <p key={i} className="pl-5 text-slate-300">{warn}</p>
          ))}
        </div>
      )}

      {/* Quick Shortcuts */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-xs">
        <button
          type="button"
          onClick={handleSampleClick}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Sample 2024 Consensus Rankings</span>
        </button>

        <button
          type="button"
          onClick={downloadTemplate}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium transition-all"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Download CSV Template</span>
        </button>
      </div>
    </div>
  );
};
