import React, { useState } from 'react';
import { InboxEmail } from '../types';
import { EMAIL_TEMPLATES } from '../data/emails';
import { useMechanicContext } from '../mechanics/MechanicContext';

interface EmailClientProps {
    inbox: InboxEmail[];
    onMarkAsRead: (emailId: string) => void;
}

const EmailClient: React.FC<EmailClientProps> = ({ inbox, onMarkAsRead }) => {
    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
    const { engine, gameState } = useMechanicContext();

    const handleSelectEmail = (email: InboxEmail) => {
        setSelectedEmailId(email.email_id);
        if (!email.isRead) {
            engine.emitEvent('inbox', 'read_email', {
                email_id: email.email_id,
                day: gameState.day,
                time_slot: gameState.timeSlot
            });
            engine.emitCanonicalAction(
                'inbox',
                'read_email',
                `email:${email.email_id}`,
                {
                    email_id: email.email_id,
                    day: gameState.day,
                    time_slot: gameState.timeSlot,
                    read_at: Date.now()
                }
            );
            onMarkAsRead(email.email_id);
        }
    };

    const sortedInbox = [...inbox].sort((a, b) => b.dayReceived - a.dayReceived);
    const selectedEmailTemplate = EMAIL_TEMPLATES.find(e => e.email_id === selectedEmailId);

    return (
        <div className="bg-slate-950/70 p-6 rounded-xl border border-slate-800 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-md animate-fade-in h-[70vh] flex flex-col">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Correo interno</p>
                    <h2 className="text-3xl font-black text-white drop-shadow-sm">Bandeja de entrada</h2>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-200/15 border border-emerald-300/40 text-emerald-100 text-xs font-semibold">
                    {sortedInbox.filter(e => !e.isRead).length} sin leer
                </div>
            </div>

            <div className="flex-grow flex gap-5 overflow-hidden">
                {/* Inbox List */}
                <div className="w-1/3 flex-shrink-0 bg-slate-900/70 p-3 rounded-lg border border-slate-800/80 overflow-y-auto shadow-inner">
                    <ul className="space-y-2">
                        {sortedInbox.map(inboxEmail => {
                            const template = EMAIL_TEMPLATES.find(t => t.email_id === inboxEmail.email_id);
                            if (!template) return null;
                            const isSelected = selectedEmailId === inboxEmail.email_id;
                            return (
                                <li key={inboxEmail.email_id}>
                                    <button
                                        onClick={() => handleSelectEmail(inboxEmail)}
                                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex flex-col gap-1 ${
                                            isSelected
                                                ? 'bg-white/10 border border-white/30 shadow-[0_12px_30px_rgba(0,0,0,0.25)]'
                                                : 'bg-slate-800/60 border border-slate-700 hover:border-emerald-200/40 hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className={`font-semibold truncate ${!inboxEmail.isRead ? 'text-white' : 'text-slate-200'}`}>{template.from}</p>
                                                <p className={`truncate text-sm ${!inboxEmail.isRead ? 'text-emerald-200' : 'text-slate-400'}`}>{template.subject}</p>
                                            </div>
                                            {!inboxEmail.isRead && <div className="mt-1 w-2.5 h-2.5 bg-emerald-400 rounded-full flex-shrink-0"></div>}
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-wide">
                                            <span>Día {inboxEmail.dayReceived}</span>
                                            <span className="flex items-center gap-1 text-slate-500">
                                                <span className="w-1 h-1 rounded-full bg-slate-500"></span> Interno
                                            </span>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Email Detail View */}
                <div className="w-2/3 flex-grow overflow-y-auto">
                    {selectedEmailTemplate ? (
                        <div className="relative bg-[#f5f2ed] text-slate-900 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.32)] border border-[#e3dbcc] overflow-hidden">
                            <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-emerald-300 to-sky-400" />
                            <div className="absolute right-6 top-4 text-slate-400 rotate-6 select-none">📎</div>

                            <div className="p-6 pt-8">
                                <div className="border-b border-slate-300 pb-3 mb-4 flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Mensaje interno</p>
                                        <h3 className="text-2xl font-black text-slate-900 leading-tight">{selectedEmailTemplate.subject}</h3>
                                        <p className="text-sm text-slate-600 mt-1">
                                            <span className="font-semibold">De:</span> {selectedEmailTemplate.from}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            <span className="font-semibold">Fecha:</span> Día {inbox.find(e => e.email_id === selectedEmailId)?.dayReceived}
                                        </p>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 shadow-sm">
                                        Prioridad: Normal
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-inner">
                                    <div
                                      className="text-[15px] leading-7 text-slate-800 whitespace-pre-wrap"
                                      style={{ fontFamily: 'Calibri, "Segoe UI", sans-serif' }}
                                    >
                                        {selectedEmailTemplate.body}
                                    </div>
                                </div>

                                <div className="mt-4 text-[11px] text-slate-500 flex justify-end">
                                    Archivo · Correspondencia interna
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full rounded-xl border border-dashed border-slate-700 text-slate-400">
                            Selecciona un correo para leer.
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

export default EmailClient;
