'use client';

import { useState } from 'react';
import {
  ExternalLink,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatPhoneForWhatsApp, formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Lead } from '@/types';

// ─── Template Generator (mirrors WhatsAppModal) ───────────────────────────────

function getTemplates(name: string, status: string, orderValue: number | null): [string, string] {
  const order = orderValue ? ` (order value ${formatCurrency(orderValue)})` : '';
  const sign = '\n\n— Team Vision Glass Interiors';

  const map: Record<string, [string, string]> = {
    new: [
      `Hi ${name}! 👋\n\nThank you for reaching out to Vision Glass Interiors. We'd love to help you transform your space with premium glass solutions.\n\nCould we schedule a quick call or a showroom visit at your convenience?${sign}`,
      `Hello ${name},\n\nWelcome! We specialize in custom glass décor — partitions, railings, skylights, and more (visionglassinteriors.in).\n\nWhen would be a good time to discuss your requirements?${sign}`,
    ],
    follow_up: [
      `Hi ${name}! 😊\n\nJust checking in after our earlier conversation. Do you have any questions about our glass solutions that I can help answer?\n\nWe're here whenever you're ready to take the next step!${sign}`,
      `Hello ${name},\n\nHope you're doing well! I wanted to follow up on your inquiry. Have you had a chance to think about the options we discussed?\n\nFeel free to reach out — happy to help!${sign}`,
    ],
    orders_convert: [
      `Hi ${name}! 🏠\n\nGreat news — we're all set to move forward with your order${order}. Could you confirm your preferred design and timeline so we can get started?\n\nLooking forward to working with you!${sign}`,
      `Hello ${name},\n\nWe're excited to bring your vision to life! To confirm your order${order}, we just need a few final details from you.\n\nShall we schedule a call to finalize everything?${sign}`,
    ],
    design_phase: [
      `Hi ${name}! 🎨\n\nYour project is in the design/measurement phase. Our team will be in touch shortly to finalize the details.\n\nHave any specific design preferences or changes you'd like to share?${sign}`,
      `Hello ${name},\n\nDesign work is underway for your project${order}! 🙌 We want to make sure everything is perfect.\n\nDo you have any feedback or new ideas you'd like us to incorporate?${sign}`,
    ],
    hold_order: [
      `Hi ${name},\n\nNo rush at all! Your project details are safely saved with us. Whenever you're ready to resume, just let us know and we'll pick up right where we left off. 😊${sign}`,
      `Hello ${name},\n\nWanted to check in and let you know we're here whenever you're ready to move forward with your project${order}.\n\nTake your time — we'll be happy to assist when the time is right!${sign}`,
    ],
    payment_50: [
      `Hi ${name}! ✅\n\nThank you for your advance payment${order}! Your project is now confirmed and our team has begun working on it.\n\nWe'll keep you updated on the progress. Exciting times ahead!${sign}`,
      `Hello ${name},\n\nWe've received your 50% advance — thank you! 🎉 Your glass project is officially in production.\n\nWe'll reach out with updates and notify you when it's ready for installation.${sign}`,
    ],
    order_complete: [
      `Hi ${name}! 🏆\n\nGreat news — your project is complete! We hope you're absolutely thrilled with your new glass installation.\n\nWould you mind sharing a quick review? It means the world to us! ⭐${sign}`,
      `Hello ${name},\n\nYour Vision Glass Interiors project is all done! 🎉 It was a pleasure working with you.\n\nIf you're happy with the results, we'd love a Google review at your convenience!${sign}`,
    ],
    closed: [
      `Hi ${name}! 😊\n\nThank you for choosing Vision Glass Interiors. It was a pleasure serving you!\n\nIf you ever need any glass solutions in the future, or know someone who does, we'd be honored to help.${sign}`,
      `Hello ${name},\n\nJust wanted to reach out and say thank you for your trust and business. Hope you're enjoying your new glass installation! 🌟\n\nDon't hesitate to refer us to friends & family — we'd love to help them too.${sign}`,
    ],
    rejected: [
      `Hi ${name},\n\nThank you for considering Vision Glass Interiors. We completely understand if the timing isn't right.\n\nWhenever you're ready in the future, we'd love to assist you. Wishing you all the best! 🙏${sign}`,
      `Hello ${name},\n\nNo worries at all! We hope we get a chance to work together someday.\n\nFeel free to reach out anytime — our team will always be happy to help with your glass needs.${sign}`,
    ],
  };

  return (
    map[status] ?? [
      `Hi ${name},\n\nThank you for your interest in Vision Glass Interiors. Please let us know how we can assist you.${sign}`,
      `Hello ${name},\n\nWe're here to help! Feel free to reach out with any questions about our glass solutions.${sign}`,
    ]
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface MessageState {
  option: 0 | 1;
  text: string;
  sent: boolean;
}

interface Props {
  leads: Lead[];
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BulkWhatsAppModal({ leads, onClose }: Props) {
  // Pre-generate all messages on mount
  const [messages, setMessages] = useState<Record<number, MessageState>>(() => {
    const init: Record<number, MessageState> = {};
    leads.forEach((lead) => {
      const [t0] = getTemplates(lead.name, lead.status, lead.order_value);
      init[lead.id] = { option: 0, text: t0, sent: false };
    });
    return init;
  });

  const [expandedId, setExpandedId] = useState<number | null>(null);
  // Sequential send flow: null = idle, number = index of the lead being sent next
  const [seqIndex, setSeqIndex] = useState<number | null>(null);

  const sentCount = Object.values(messages).filter((m) => m.sent).length;
  const allDone = sentCount === leads.length;

  function openWhatsApp(lead: Lead, text: string) {
    const phone = formatPhoneForWhatsApp(lead.phone);
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer',
    );
  }

  function markSent(id: number) {
    setMessages((prev) => ({ ...prev, [id]: { ...prev[id], sent: true } }));
  }

  // Send a single lead individually
  function handleSendOne(lead: Lead) {
    openWhatsApp(lead, messages[lead.id].text);
    markSent(lead.id);
  }

  // Change template option for a lead
  function handleOptionChange(lead: Lead, opt: 0 | 1) {
    const [t0, t1] = getTemplates(lead.name, lead.status, lead.order_value);
    setMessages((prev) => ({
      ...prev,
      [lead.id]: { option: opt, text: opt === 0 ? t0 : t1, sent: false },
    }));
  }

  // Edit message text
  function handleEdit(id: number, text: string) {
    setMessages((prev) => ({ ...prev, [id]: { ...prev[id], text, sent: false } }));
  }

  // Start sequential send flow
  function startSequential() {
    const firstIdx = leads.findIndex((l) => !messages[l.id].sent);
    if (firstIdx >= 0) setSeqIndex(firstIdx);
  }

  // Advance sequential flow: open WhatsApp for current lead, find next
  function seqOpenAndNext() {
    if (seqIndex === null) return;
    const lead = leads[seqIndex];
    openWhatsApp(lead, messages[lead.id].text);
    markSent(lead.id);
    const nextIdx = leads.findIndex((l, i) => i > seqIndex && !messages[l.id].sent);
    setSeqIndex(nextIdx >= 0 ? nextIdx : null);
  }

  return (
    <Modal isOpen onClose={onClose} title={`Bulk Follow-up — ${leads.length} Leads`} size="lg">
      {/* Progress bar + Send All action */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
            <span>Sent</span>
            <span>
              {sentCount} / {leads.length}
            </span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${leads.length > 0 ? (sentCount / leads.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {seqIndex !== null ? (
          /* Sequential mode: "Open & Next" CTA */
          <button
            onClick={seqOpenAndNext}
            className="btn-whatsapp text-sm px-4 py-2 flex items-center gap-2 shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
            Open &amp; Next
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          /* Idle: "Send All" to start sequential flow */
          <button
            onClick={startSequential}
            disabled={allDone}
            className="btn-whatsapp text-sm px-4 py-2 flex items-center gap-2 shrink-0 disabled:opacity-40"
          >
            <MessageCircle className="w-4 h-4" />
            {allDone ? 'All Sent' : 'Send All'}
          </button>
        )}
      </div>

      {/* Sequential mode hint */}
      {seqIndex !== null && (
        <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-medium">
          Sending {seqIndex + 1} of {leads.length} — click &quot;Open &amp; Next&quot; to send
          each message and move to the next lead.
        </div>
      )}

      {/* Lead list */}
      <div className="space-y-2 max-h-[56vh] overflow-y-auto pr-0.5">
        {leads.map((lead, idx) => {
          const state = messages[lead.id];
          const isExpanded = expandedId === lead.id;
          const isCurrentSeq = seqIndex === idx;

          return (
            <div
              key={lead.id}
              className={cn(
                'border rounded-xl overflow-hidden transition-all',
                state.sent
                  ? 'border-green-200 bg-green-50/40'
                  : isCurrentSeq
                    ? 'border-green-400 bg-white ring-2 ring-green-100'
                    : 'border-slate-200 bg-white',
              )}
            >
              {/* Lead summary row */}
              <div className="flex items-center gap-3 p-3">
                {state.sent ? (
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800 truncate">{lead.name}</p>
                  <p className="text-xs text-slate-400">{lead.phone}</p>
                </div>

                <StatusBadge status={lead.status} />

                {/* Individual send — hidden when this lead is the seq target */}
                {!state.sent && !isCurrentSeq && (
                  <button
                    onClick={() => handleSendOne(lead)}
                    className="btn-whatsapp text-xs px-2.5 py-1.5 flex items-center gap-1 shrink-0"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Send
                  </button>
                )}

                {/* Expand / collapse */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                  className="btn-icon text-slate-400 hover:text-slate-700 shrink-0 w-7 h-7"
                >
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {/* Expanded message editor */}
              {isExpanded && (
                <div className="border-t border-slate-100 p-3 space-y-3 bg-slate-50/50">
                  {/* Template option selector */}
                  <div className="flex gap-2">
                    {([0, 1] as const).map((i) => (
                      <button
                        key={i}
                        onClick={() => handleOptionChange(lead, i)}
                        className={cn(
                          'flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all',
                          state.option === i
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300',
                        )}
                      >
                        Option {i + 1}
                      </button>
                    ))}
                  </div>

                  {/* Editable message */}
                  <textarea
                    value={state.text}
                    onChange={(e) => handleEdit(lead.id, e.target.value)}
                    rows={5}
                    className="form-input resize-none text-xs leading-relaxed"
                  />

                  {/* Re-open WhatsApp for already-sent leads */}
                  {state.sent && (
                    <button
                      onClick={() => openWhatsApp(lead, state.text)}
                      className="w-full btn-whatsapp text-xs flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open WhatsApp Again
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* All-done banner */}
      {allDone && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-200">
            <CheckCircle className="w-5 h-5 shrink-0" />
            All {leads.length} follow-ups opened in WhatsApp!
          </div>
          <button onClick={onClose} className="w-full btn btn-secondary text-sm">
            Done
          </button>
        </div>
      )}
    </Modal>
  );
}
