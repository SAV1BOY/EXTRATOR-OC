import React, { useRef } from 'react';
import { Upload, Loader, AlertCircle } from 'lucide-react';

interface UploadTabProps {
  file: File | null;
  processing: boolean;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  errors: string[];
}

const UploadTab: React.FC<UploadTabProps> = ({ file, processing, handleFileUpload, fileInputRef, errors }) => {
  const dragAreaRef = useRef<HTMLDivElement>(null);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if(dragAreaRef.current) dragAreaRef.current.classList.add('border-indigo-500', 'bg-indigo-50');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if(dragAreaRef.current) dragAreaRef.current.classList.remove('border-indigo-500', 'bg-indigo-50');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if(dragAreaRef.current) dragAreaRef.current.classList.remove('border-indigo-500', 'bg-indigo-50');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
        handleFileUpload({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
      }
      e.dataTransfer.clearData();
    }
  };

  return (
    <div>
      <div
        ref={dragAreaRef}
        className={`border-2 border-dashed rounded-xl p-10 md:p-16 text-center transition-all duration-300 ${processing ? 'border-slate-300 bg-slate-100' : 'border-slate-300 bg-slate-50 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50'}`}
        onClick={() => !processing && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload size={48} className="text-indigo-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-800">
          {processing ? 'Analisando...' : file ? file.name : 'Arraste e solte ou clique para enviar'}
        </h3>
        <p className="text-slate-500 mt-1">
          Suporta Ordem de Compra em PDF, HTML, JPG, PNG e TXT
        </p>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          accept=".pdf,.html,.htm,.png,.jpg,.jpeg,.txt"
          className="hidden"
          disabled={processing}
        />
      </div>
      
      {processing && (
        <div className="mt-6 text-center p-4 bg-slate-100 rounded-lg">
          <Loader className="animate-spin inline-block text-indigo-500 mb-2" size={32} />
          <p className="text-slate-700">
            Processando localmente... (O OCR de imagens pode levar um momento)
          </p>
        </div>
      )}
      
      {errors.length > 0 && !processing && (
        <div className="mt-6 p-4 bg-red-100 border border-red-200 text-red-800 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle />
            <div className="text-sm">
              <strong className="font-semibold">Falha na Extração</strong>
              <p>{errors[0]}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadTab;