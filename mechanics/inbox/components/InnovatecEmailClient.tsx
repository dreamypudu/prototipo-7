import React, { useCallback, useEffect, useRef, useState } from 'react';
import { EmailTemplate, InboxEmail } from '../../../types';
import { EMAIL_TEMPLATES } from '../../../data/versions/innovatec/emails';
import { useMechanicContext } from '../../MechanicContext';
import { buildEmailReadValueFinal } from '../services/emailActionExport';

interface EmailClientProps {
    inbox: InboxEmail[];
    onMarkAsRead: (emailId: string) => void;
}

const EmailClient: React.FC<EmailClientProps> = ({ inbox, onMarkAsRead }) => {
    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
    const { engine, gameState } = useMechanicContext();
    const openedCountsRef = useRef<Record<string, number>>({});
    const activeViewRef = useRef<{
        email: InboxEmail;
        template?: EmailTemplate;
        openedAtMs: number;
        openedCount: number;
        reopened: boolean;
        committedDay: number;
        committedTimeSlot: typeof gameState.timeSlot;
    } | null>(null);

    const finishActiveEmailView = useCallback(() => {
        const active = activeViewRef.current;
        if (!active) return;

        const closedAtMs = Date.now();
        engine.emitCanonicalAction(
            'inbox',
            'read_email',
            `email:${active.email.email_id}`,
            buildEmailReadValueFinal({
                email: active.email,
                template: active.template,
                openedAtMs: active.openedAtMs,
                closedAtMs,
                openedCount: active.openedCount,
                reopened: active.reopened,
                committedDay: active.committedDay,
                committedTimeSlot: active.committedTimeSlot,
            })
        );
        activeViewRef.current = null;
    }, [engine]);

    useEffect(() => () => {
        finishActiveEmailView();
    }, [finishActiveEmailView]);

    const handleSelectEmail = (email: InboxEmail) => {
        if (activeViewRef.current?.email.email_id === email.email_id) return;

        finishActiveEmailView();
        setSelectedEmailId(email.email_id);
        const template = EMAIL_TEMPLATES.find(t => t.email_id === email.email_id);
        const openedAtMs = Date.now();
        const previousOpenEvents = gameState.mechanicEvents.filter(
            event => event.mechanic_id === 'inbox' && event.event_type === 'open_email' && event.payload?.email_id === email.email_id
        ).length;
        const openedCount = Math.max(openedCountsRef.current[email.email_id] ?? 0, previousOpenEvents) + 1;
        openedCountsRef.current[email.email_id] = openedCount;
        const reopened = openedCount > 1 || email.isRead;

        activeViewRef.current = {
            email,
            template,
            openedAtMs,
            openedCount,
            reopened,
            committedDay: gameState.day,
            committedTimeSlot: gameState.timeSlot,
        };

        engine.emitEvent('inbox', 'open_email', {
            email_id: email.email_id,
            email_subject: template?.subject ?? null,
            email_from: template?.from ?? null,
            opened_count: openedCount,
            reopened,
            day: gameState.day,
            time_slot: gameState.timeSlot,
            opened_at_ms: openedAtMs
        });

        if (!email.isRead) {
            onMarkAsRead(email.email_id);
        }
    };

    const sortedInbox = [...inbox].sort((a, b) => b.dayReceived - a.dayReceived);
    const selectedEmailTemplate = EMAIL_TEMPLATES.find(e => e.email_id === selectedEmailId);

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 animate-fade-in h-[75vh] flex flex-col">
            <h2 className="text-3xl font-bold mb-6 text-blue-300 border-b-2 border-blue-500/30 pb-3 flex-shrink-0">Bandeja de Entrada</h2>
            <div className="flex-grow flex gap-6 overflow-hidden">
                {/* Inbox List */}
                <div className="w-1/3 flex-shrink-0 bg-gray-900/50 p-3 rounded-lg border border-gray-700 overflow-y-auto">
                    <ul className="space-y-2">
                        {sortedInbox.map(inboxEmail => {
                            const template = EMAIL_TEMPLATES.find(t => t.email_id === inboxEmail.email_id);
                            if (!template) return null;

                            return (
                                <li key={inboxEmail.email_id}>
                                    <button
                                        onClick={() => handleSelectEmail(inboxEmail)}
                                        className={`w-full text-left p-3 rounded-md transition-colors duration-200 ${selectedEmailId === inboxEmail.email_id ? 'bg-blue-800/50' : 'hover:bg-gray-700/50'}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-grow overflow-hidden">
                                                <p className={`font-semibold truncate ${!inboxEmail.isRead ? 'text-white' : 'text-gray-300'}`}>{template.from}</p>
                                                <p className={`truncate text-sm ${!inboxEmail.isRead ? 'text-blue-300' : 'text-gray-400'}`}>{template.subject}</p>
                                            </div>
                                            {!inboxEmail.isRead && <div className="mt-1 w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Día {inboxEmail.dayReceived}</p>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Email Detail View */}
                <div className="w-2/3 flex-grow bg-gray-900/50 p-5 rounded-lg border border-gray-700 overflow-y-auto">
                    {selectedEmailTemplate ? (
                        <div>
                            <div className="border-b border-gray-700 pb-4 mb-4">
                                <h3 className="text-2xl font-bold text-white">{selectedEmailTemplate.subject}</h3>
                                <p className="text-sm text-gray-400 mt-2">
                                    <span className="font-semibold">De:</span> {selectedEmailTemplate.from}
                                </p>
                                 <p className="text-sm text-gray-400">
                                    <span className="font-semibold">Fecha:</span> Día {inbox.find(e => e.email_id === selectedEmailId)?.dayReceived}
                                </p>
                            </div>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-serif">
                                {selectedEmailTemplate.body}
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Seleccione un correo para leer.</p>
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
