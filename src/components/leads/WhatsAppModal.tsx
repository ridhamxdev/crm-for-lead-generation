'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle,
  FileText,
  RefreshCw,
  ExternalLink,
  Phone,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatPhoneForWhatsApp, formatCurrency } from '@/lib/utils';
import { STATUS_LABELS } from '@/types';
import type { Lead } from '@/types';

// ─── Template Generator ───────────────────────────────────────────────────────

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

  return map[status] ?? [
    `Hi ${name},\n\nThank you for your interest in Vision Glass Interiors. Please let us know how we can assist you.${sign}`,
    `Hello ${name},\n\nWe're here to help! Feel free to reach out with any questions about our glass solutions.${sign}`,
  ];
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  lead: Lead;
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function WhatsAppModal({ lead, onClose }: Props) {
  const [tab, setTab] = useState<'template' | 'ai'>('template');

  // Template tab state
  const [selectedOption, setSelectedOption] = useState<0 | 1>(0);
  const templates = getTemplates(lead.name, lead.status, lead.order_value);
  const [editedTemplate, setEditedTemplate] = useState(templates[0]);
  const [templateSent, setTemplateSent] = useState(false);

  // AI tab state
  const [userPrompt, setUserPrompt] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiSent, setAiSent] = useState(false);

  // Sync template text when option changes
  useEffect(() => {
    setEditedTemplate(templates[selectedOption]);
    setTemplateSent(false);
  }, [selectedOption]);

  // Reset AI tab when switching to it
  useEffect(() => {
    if (tab === 'ai') {
      setAiMessage('');
      setAiError('');
      setAiSent(false);
    }
    if (tab === 'template') {
      setTemplateSent(false);
    }
  }, [tab]);

  const phone = formatPhoneForWhatsApp(lead.phone);

  function openWhatsApp(message: string) {
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function handleTemplateSend() {
    openWhatsApp(editedTemplate);
    setTemplateSent(true);
  }

  async function handleGenerate() {
    if (!userPrompt.trim()) return;
    setIsGenerating(true);
    setAiError('');
    setAiMessage('');
    setAiSent(false);

    try {
      const res = await fetch('/api/ai/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadName: lead.name,
          leadStatus: lead.status,
          orderValue: lead.order_value,
          userPrompt: userPrompt.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        setAiError(json.error ?? 'Failed to generate message. Try using a template instead.');
      } else {
        setAiMessage(json.data.message);
      }
    } catch {
      setAiError('Could not reach the AI service. Please use a template instead.');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleAiSend() {
    if (!aiMessage.trim()) return;
    openWhatsApp(aiMessage);
    setAiSent(true);
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Send WhatsApp Message"
      maxWidth="max-w-lg"
    >
      {/* Lead Info */}
      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-4 border border-slate-100">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <Phone className="w-5 h-5 text-green-600" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 truncate">{lead.name}</p>
          <p className="text-sm text-slate-500">{lead.phone}</p>
        </div>
        <div className="ml-auto shrink-0">
          <StatusBadge status={lead.status} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => setTab('template')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            tab === 'template'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Templates</span>
          <span className="hidden sm:inline bg-green-100 text-green-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
            INSTANT
          </span>
        </button>
        <button
          onClick={() => setTab('ai')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            tab === 'ai'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Generate</span>
          <span className="hidden sm:inline bg-purple-100 text-purple-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
            FREE
          </span>
        </button>
      </div>

      {/* ── Template Tab ─────────────────────────────────────────── */}
      {tab === 'template' && (
        <div className="space-y-4">
          {/* Option selector */}
          <div className="flex gap-2">
            {([0, 1] as const).map((i) => (
              <button
                key={i}
                onClick={() => setSelectedOption(i)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  selectedOption === i
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                Option {i + 1}
              </button>
            ))}
          </div>

          {/* Editable textarea */}
          <div>
            <label className="form-label">Message (editable)</label>
            <textarea
              value={editedTemplate}
              onChange={(e) => {
                setEditedTemplate(e.target.value);
                setTemplateSent(false);
              }}
              rows={7}
              className="form-input resize-none text-sm leading-relaxed"
            />
          </div>

          {/* Send button */}
          {templateSent ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>WhatsApp opened! Message is ready to send.</span>
            </div>
          ) : (
            <button
              onClick={handleTemplateSend}
              className="w-full btn-whatsapp flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open WhatsApp &amp; Send
            </button>
          )}

          {templateSent && (
            <button
              onClick={onClose}
              className="w-full btn btn-secondary text-sm"
            >
              Done
            </button>
          )}
        </div>
      )}

      {/* ── AI Tab ───────────────────────────────────────────────── */}
      {tab === 'ai' && (
        <div className="space-y-4">
          {/* Info banner */}
          <div className="flex items-start gap-2 p-3 bg-purple-50 text-purple-700 rounded-xl text-xs">
            <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Powered by free community LLM servers (llama3.2). No API key or quota limits.
              Response may take up to 15 seconds.
            </span>
          </div>

          {/* Prompt input */}
          <div>
            <label className="form-label">
              What context should AI know? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder={`e.g. "Customer was interested in glass partitions for their office, asked about pricing last week."`}
              rows={3}
              className="form-input resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate();
              }}
            />
            <p className="text-[10px] text-slate-400 mt-1">Press Ctrl+Enter to generate</p>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !userPrompt.trim()}
            className="w-full btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <span className="spinner" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Message
              </>
            )}
          </button>

          {/* Error */}
          {aiError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl">
              <p className="font-medium mb-1">Failed to generate</p>
              <p className="text-xs">{aiError}</p>
              <button
                onClick={() => setTab('template')}
                className="mt-2 text-xs underline font-medium"
              >
                Switch to Templates instead →
              </button>
            </div>
          )}

          {/* Generated message */}
          {aiMessage && !aiError && (
            <div className="space-y-3">
              <div>
                <label className="form-label flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  Generated Message (editable)
                </label>
                <textarea
                  value={aiMessage}
                  onChange={(e) => {
                    setAiMessage(e.target.value);
                    setAiSent(false);
                  }}
                  rows={7}
                  className="form-input resize-none text-sm leading-relaxed"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAiMessage('');
                    setAiSent(false);
                  }}
                  className="btn btn-secondary flex items-center gap-1.5 text-sm px-3"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate
                </button>

                {aiSent ? (
                  <div className="flex-1 flex items-center gap-2 p-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    WhatsApp opened!
                  </div>
                ) : (
                  <button
                    onClick={handleAiSend}
                    className="flex-1 btn-whatsapp flex items-center justify-center gap-2 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open WhatsApp &amp; Send
                  </button>
                )}
              </div>

              {aiSent && (
                <button onClick={onClose} className="w-full btn btn-secondary text-sm">
                  Done
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
