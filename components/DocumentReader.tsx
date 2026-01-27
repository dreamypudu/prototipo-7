import React, { useState } from 'react';
import { Document } from '../types';
import { useMechanicContext } from '../mechanics/MechanicContext';

interface DocumentReaderProps {
    documents: Document[];
    readDocuments: string[];
    onMarkAsRead: (documentId: string) => void;
}

const DocumentReader: React.FC<DocumentReaderProps> = ({ documents, readDocuments, onMarkAsRead }) => {
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const { engine, gameState } = useMechanicContext();

    const handleSelectDoc = (doc: Document) => {
        setSelectedDocId(doc.id);
        if (!readDocuments.includes(doc.id)) {
            engine.emitEvent('documents', 'read_document', {
                doc_id: doc.id,
                day: gameState.day,
                time_slot: gameState.timeSlot
            });
            engine.emitCanonicalAction(
                'documents',
                'read_document',
                `doc:${doc.id}`,
                {
                    doc_id: doc.id,
                    day: gameState.day,
                    time_slot: gameState.timeSlot,
                    read_at: Date.now()
                }
            );
            onMarkAsRead(doc.id);
        }
    };
    
    React.useEffect(() => {
        if (!selectedDocId) {
            const firstUnread = documents.find(d => !readDocuments.includes(d.id));
            const firstDoc = documents[0];
            if(firstUnread) {
                handleSelectDoc(firstUnread);
            } else if (firstDoc) {
                setSelectedDocId(firstDoc.id)
            }
        }
    }, [documents, readDocuments, selectedDocId]);


    const selectedDoc = documents.find(d => d.id === selectedDocId);

    return (
        <div className="bg-slate-950/70 p-6 rounded-xl border border-slate-800 animate-fade-in h-[75vh] flex flex-col shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
                <div className="px-3 py-1 rounded-md bg-amber-200/20 border border-amber-300/40 text-amber-100 text-xs font-semibold tracking-wide uppercase">Archivo</div>
                <h2 className="text-3xl font-black text-white drop-shadow-sm">Centro de Documentos</h2>
            </div>

            <div className="flex-grow flex gap-5 overflow-hidden">
                {/* Document List */}
                <div className="w-1/3 flex-shrink-0 bg-slate-900/70 p-3 rounded-lg border border-slate-800/80 overflow-y-auto shadow-inner">
                    <ul className="space-y-2">
                        {documents.map(doc => {
                            const isRead = readDocuments.includes(doc.id);
                            const isSelected = selectedDocId === doc.id;
                            return (
                                <li key={doc.id}>
                                    <button
                                        onClick={() => handleSelectDoc(doc)}
                                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-start gap-3 ${
                                            isSelected
                                                ? 'bg-amber-200/15 border border-amber-300/50 shadow-[0_8px_18px_rgba(0,0,0,0.25)]'
                                                : 'bg-slate-800/60 border border-slate-700 hover:border-amber-300/40 hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-semibold truncate ${!isRead ? 'text-white' : 'text-slate-200'}`}>{doc.title}</p>
                                            <span className="text-[11px] text-slate-400 uppercase tracking-wide">folio #{doc.id.slice(0, 6)}</span>
                                        </div>
                                        {!isRead && <div className="mt-1 w-2.5 h-2.5 bg-amber-400 rounded-full flex-shrink-0"></div>}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Document Detail View */}
                <div className="w-2/3 flex-grow overflow-y-auto">
                    {selectedDoc ? (
                        <div className="relative bg-[#f7f3e9] text-slate-900 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-[#e6decf] overflow-hidden">
                            {/* perforación lateral */}
                            <div className="absolute left-0 top-0 h-full w-3 bg-gradient-to-b from-slate-200 to-slate-300 border-r border-slate-300"></div>
                            {/* pestaña */}
                            <div className="absolute top-2 left-5 px-3 py-1 rounded-lg bg-slate-800 text-white text-xs font-semibold tracking-wide shadow">
                                Documento
                            </div>
                            {/* clip decorativo */}
                            <div className="absolute right-6 top-4 text-slate-400 rotate-6 select-none">📎</div>

                            <div className="pl-6 pr-6 pb-6 pt-10">
                                <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 leading-tight">{selectedDoc.title}</h3>
                                        <p className="text-xs uppercase tracking-[0.12em] text-slate-500 mt-1">Interno · Confidencial</p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-amber-200 text-amber-900 text-xs font-semibold border border-amber-300 shadow-sm">
                                        Folio #{selectedDoc.id.slice(0, 6)}
                                    </span>
                                </div>

                                <div className="bg-white/90 rounded-lg border border-slate-200 p-5 shadow-inner">
                                    <p className="text-[15px] leading-7 text-slate-800 whitespace-pre-wrap font-sans" style={{ fontFamily: 'Arial, sans-serif' }}>
                                        {selectedDoc.content}
                                    </p>
                                </div>

                                <div className="mt-6 text-[11px] text-slate-500 flex justify-end">
                                    Página 1 · Archivo Clínico / Gestión
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full rounded-xl border border-dashed border-slate-700 text-slate-400">
                            Seleccione un documento para leer.
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.5s ease-in forwards; }
            `}</style>
        </div>
    );
};

export default DocumentReader;
