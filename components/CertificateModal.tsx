'use client';

import { Award, CheckCircle, Download, Printer, ShieldCheck, X } from 'lucide-react';
import { useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  courseTitle: string;
  completionDate?: string;
  certificateId?: string;
}

export default function CertificateModal({
  isOpen,
  onClose,
  studentName = 'Alex Mercer',
  courseTitle = 'Full Stack Web Development & System Design Masterclass',
  completionDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  certificateId
}: CertificateModalProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const stableCertificateId = useRef(certificateId || `CERT-AUM-${Math.floor(100000 + Math.random() * 900000)}`).current;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-900 border-amber-500/30 shadow-2xl rounded-3xl glass-card">
        <div className="p-6 space-y-6">
          {/* Top Actions */}
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
              <Award className="w-5 h-5" /> Official Verified Certificate
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-mono rounded-xl transition-all"
              >
                <Printer className="w-4 h-4 mr-2" /> Print / PDF
              </Button>
            </div>
          </div>

          {/* Certificate Decorative Canvas Frame */}
          <div
            ref={certRef}
            className="certificate-canvas relative p-10 md:p-16 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-4 border-amber-500/40 text-center space-y-8 shadow-2xl overflow-hidden"
          >
            {/* Background Ambient Glows */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
            
            {/* Elegant corner accents */}
            <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-500/30 rounded-tl-xl pointer-events-none" />
            <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-500/30 rounded-tr-xl pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-500/30 rounded-bl-xl pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-500/30 rounded-br-xl pointer-events-none" />

            {/* Certificate Header Badge */}
            <div className="flex justify-center relative z-10">
              <div className="p-4 rounded-3xl bg-amber-500/5 border-2 border-amber-500/20 text-amber-400 shadow-xl shadow-amber-500/10 backdrop-blur-sm">
                <Award className="w-14 h-14" />
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              <h2 className="text-sm font-mono uppercase tracking-[0.3em] text-amber-400/90 font-bold">
                Certificate of Completion
              </h2>
              <p className="text-sm text-slate-400 uppercase tracking-widest">This is proudly presented to</p>
            </div>

            {/* Recipient Name */}
            <div className="py-4 border-b border-amber-500/20 max-w-2xl mx-auto relative z-10">
              <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 tracking-tight font-serif">
                {studentName}
              </h1>
            </div>

            {/* Course Title */}
            <div className="space-y-4 max-w-2xl mx-auto relative z-10">
              <p className="text-sm text-slate-400 leading-relaxed">
                for successfully mastering all curriculum requirements and hands-on code assessments in
              </p>
              <h3 className="text-xl md:text-2xl font-bold text-amber-500/90 uppercase tracking-wide">
                {courseTitle}
              </h3>
            </div>

            {/* Footer Metadata */}
            <div className="pt-8 grid grid-cols-2 gap-4 border-t border-slate-800/50 text-left text-xs font-mono relative z-10">
              <div>
                <span className="text-slate-500 text-[10px] block tracking-widest uppercase mb-1">Issued Date</span>
                <span className="text-slate-300 font-medium text-sm">{completionDate}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 text-[10px] block tracking-widest uppercase mb-1">Verification ID</span>
                <span className="text-amber-400 font-medium text-sm bg-amber-500/10 px-2 py-1 rounded">{stableCertificateId}</span>
              </div>
            </div>

            {/* Verified Signature Row */}
            <div className="pt-6 flex items-center justify-between text-xs relative z-10">
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 font-medium">
                <ShieldCheck className="w-4 h-4" /> Verified Academic Credential
              </div>
              <div className="font-serif italic text-slate-400/80 border-b border-slate-700/50 px-6 py-2 text-sm">
                AUMINDS Academic Board
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
