import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, FileText, Download, CheckCircle, RefreshCw
} from 'lucide-react';
import { ExtractedData, Tab, ExportFormat } from '../types';
import { ExtractionEngine, ValidationSystem } from '../services/extractionService';
import { DocumentProcessor } from '../services/documentProcessor';
import { convertToCSV, convertToXML } from '../utils/converters';
import UploadTab from './tabs/UploadTab';
import ResultsTab from './tabs/ResultsTab';
import ValidationTab from './tabs/ValidationTab';
import ExportTab from './tabs/ExportTab';

const OCExtractorSystem: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (fileToProcess: File) => {
    // Rigorous state reset
    setProcessing(true);
    setErrors([]);
    setWarnings([]);
    setExtractedData(null);
    setConfidence(0);
    setActiveTab('upload');

    try {
      const docProcessor = new DocumentProcessor();
      const fileContent = await docProcessor.fileToText(fileToProcess);
      
      const engine = new ExtractionEngine();
      const validator = new ValidationSystem();
      
      const extracted = engine.extract(fileContent, fileToProcess.name);
      const validation = validator.validate(extracted);
      
      setExtractedData(extracted);
      setErrors(validation.errors);
      setWarnings(validation.warnings);
      setConfidence(extracted.metadata.confidence);
      setActiveTab('results');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setErrors([`Erro ao processar: ${errorMessage}`]);
      setExtractedData(null); // Ensure data is cleared on error
      setActiveTab('upload');
    } finally {
      setProcessing(false);
    }
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    processFile(uploadedFile);

  }, [processFile]);
  
  const handleExport = () => {
    if (!extractedData) return;
    
    let content: string, filename: string, mimeType: string;
    
    switch(exportFormat) {
      case 'json':
        content = JSON.stringify(extractedData, null, 2);
        filename = `OC_${extractedData.orderNumber}.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        content = convertToCSV(extractedData);
        filename = `OC_${extractedData.orderNumber}.csv`;
        mimeType = 'text/csv;charset=utf-8;';
        break;
      case 'xml':
        content = convertToXML(extractedData);
        filename = `OC_${extractedData.orderNumber}.xml`;
        mimeType = 'application/xml';
        break;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleNewExtraction = () => {
    setFile(null);
    setExtractedData(null);
    setErrors([]);
    setWarnings([]);
    setConfidence(0);
    setActiveTab('upload');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const TABS: { id: Tab, label: string, icon: React.ReactNode }[] = [
    { id: 'upload', label: 'Upload', icon: <Upload size={16} /> },
    { id: 'results', label: 'Resultados', icon: <FileText size={16} /> },
    { id: 'validation', label: 'Validação', icon: <CheckCircle size={16} /> },
    { id: 'export', label: 'Exportar', icon: <Download size={16} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <header className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8 rounded-xl mb-8 shadow-lg">
        <h1 className="text-3xl font-bold">📄 Sistema de Extração de OC</h1>
        <p className="mt-2 opacity-90">Análise local de arquivos PDF e Imagens (JPG, PNG)</p>
      </header>

      <nav className="flex gap-2 border-b-2 border-slate-200 mb-6">
        {TABS.map(tab => {
          const isDisabled = !extractedData && tab.id !== 'upload';
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-semibold rounded-t-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-indigo-500 text-white'
                  : 'bg-transparent text-slate-600 hover:bg-slate-200'
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              disabled={isDisabled}
            >
              {tab.icon}
              <span className="capitalize">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <main className="bg-white p-6 rounded-xl shadow-md min-h-[400px]">
        {activeTab === 'upload' && (
          <UploadTab 
            file={file} 
            processing={processing} 
            handleFileUpload={handleFileUpload} 
            fileInputRef={fileInputRef}
            errors={errors} 
          />
        )}
        {activeTab === 'results' && extractedData && <ResultsTab data={extractedData} />}
        {activeTab === 'validation' && extractedData && (
          <ValidationTab 
            errors={errors} 
            warnings={warnings} 
            confidence={confidence} 
            data={extractedData} 
          />
        )}
        {activeTab === 'export' && extractedData && (
          <ExportTab
            data={extractedData}
            exportFormat={exportFormat}
            setExportFormat={setExportFormat}
            handleExport={handleExport}
            handleNewExtraction={handleNewExtraction}
          />
        )}
      </main>

      <footer className="text-center text-slate-500 mt-8 text-sm">
        <p className="mb-2">Sistema de extração <strong>100% local e privado</strong></p>
        <div className="flex justify-center items-center gap-6 text-xs">
          <span>✔️ Análise de PDF</span>
          <span>✔️ OCR de Imagens</span>
          <span>✔️ Processamento Rápido</span>
        </div>
      </footer>
    </div>
  );
};

export default OCExtractorSystem;
