import { useState } from 'react';
import { submitContactForm } from '@/lib/api/publicApi';

interface FormData {
    projectType: string;
    goal: string;
    companyName: string;
    budget: string;
    timeline: string;
    name: string;
    email: string;
}

const initialData: FormData = {
    projectType: '',
    goal: '',
    companyName: '',
    budget: '',
    timeline: '',
    name: '',
    email: '',
};

interface Props {
    onSuccess?: (data: FormData) => void;
}

const PROJECT_TYPES = [
    'AI & Automatisering',
    'Maatwerk Platform / App',
    'IoT & Monitoring',
    'Anders'
];

const BUDGET_OPTIONS = [
    '< €3.000 (Oriënterend / Low-code)',
    '€3.000 – €5.000',
    '€5.000 – €10.000',
    '€10.000+'
];

export function ContactForm({ onSuccess }: Props) {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<FormData>(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Validation per step
    const canGoToNext = () => {
        if (step === 1) return data.projectType !== '' && data.goal.trim() !== '';
        if (step === 2) return data.companyName.trim() !== '' && data.budget !== '' && data.timeline !== '';
        if (step === 3) {
            const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
            return data.name.trim() !== '' && emailValid;
        }
        return false;
    };

    const nextStep = () => {
        if (canGoToNext()) setStep((s) => s + 1);
    };

    const prevStep = () => {
        setStep((s) => s - 1);
    };

    const updateData = (fields: Partial<FormData>) => {
        setData((prev) => ({ ...prev, ...fields }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canGoToNext()) return;
        
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const formattedSubject = `Intake: ${data.projectType} - ${data.companyName}`;
            const formattedMessage = `
--- Intake Details ---
Projecttype: ${data.projectType}
Bedrijf: ${data.companyName}
Budget: ${data.budget}
Tijdlijn: ${data.timeline}

--- Doelstelling ---
${data.goal}
            `.trim();

            await submitContactForm({
                name: data.name,
                email: data.email,
                message: `[${formattedSubject}]\n\n${formattedMessage}`,
            });

            setSubmitStatus('success');
            if (onSuccess) onSuccess(data);
            
            // Do not naturally reset data to keep the success message clean, 
            // but we could if we wanted to allow multiple submits.
        } catch (error) {
            console.error('Form submission error:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitStatus === 'success') {
        return (
            <div className="w-full text-center py-10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-success/30">
                    <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 font-display">Aanvraag Ontvangen</h3>
                <p className="text-white/70 font-ui max-w-sm mx-auto">
                    Bedankt voor de details. Ik heb een helder beeld van uw situatie en neem binnen 24 uur (op werkdagen) contact met u op.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-xs font-bold text-white/50 mb-2 font-display uppercase tracking-wider">
                    <span className={step >= 1 ? 'text-active' : ''}>Behoefte</span>
                    <span className={step >= 2 ? 'text-active' : ''}>Context</span>
                    <span className={step >= 3 ? 'text-active' : ''}>Gegevens</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                    <div className="h-full bg-active transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
                </div>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                
                {/* STEP 1 */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationFillMode: 'both', animationDelay: '0ms' }}>
                            <label className="block text-sm font-bold text-white mb-3 font-display">1. Wat wilt u realiseren? *</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {PROJECT_TYPES.map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        aria-pressed={data.projectType === type}
                                        onClick={() => updateData({ projectType: type })}
                                        className={`px-4 py-3 rounded-xl border text-left text-sm transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-active focus:border-active ${data.projectType === type ? 'bg-active/10 border-active text-white' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationFillMode: 'both', animationDelay: '100ms' }}>
                            <label className="block text-sm font-bold text-white mb-2 font-display">2. Wat is de belangrijkste uitkomst? *</label>
                            <p className="text-xs text-white/50 mb-3 font-ui">Wat is de grootste bottleneck op dit moment, of wat is het concrete doel?</p>
                            <textarea
                                value={data.goal}
                                onChange={(e) => updateData({ goal: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-active focus:border-active/50 transition-all duration-200 resize-none font-ui"
                                placeholder="Beschrijf uw uitdaging..."
                            />
                        </div>
                    </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationFillMode: 'both', animationDelay: '0ms' }}>
                            <label className="block text-sm font-bold text-white mb-2 font-display">Bedrijfsnaam *</label>
                            <input
                                type="text"
                                value={data.companyName}
                                onChange={(e) => updateData({ companyName: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-active transition-all duration-200 font-ui"
                                placeholder="Uw organisatie"
                            />
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationFillMode: 'both', animationDelay: '100ms' }}>
                            <label className="block text-sm font-bold text-white mb-2 font-display">Beschikbaar budget *</label>
                            <p className="text-xs text-active/80 mb-3 font-ui font-medium">Maatwerktrajecten en optimalisaties starten doorgaans vanaf €3.000 om ROI en zekerheid te waarborgen.</p>
                            <select
                                value={data.budget}
                                onChange={(e) => updateData({ budget: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-active transition-all duration-200 font-ui appearance-none"
                            >
                                <option value="" disabled className="text-gray-900">Selecteer budget indicatie</option>
                                {BUDGET_OPTIONS.map(opt => (
                                    <option key={opt} value={opt} className="text-gray-900">{opt}</option>
                                ))}
                            </select>
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationFillMode: 'both', animationDelay: '200ms' }}>
                            <label className="block text-sm font-bold text-white mb-2 font-display">Gewenste tijdlijn *</label>
                            <div className="flex flex-wrap gap-3">
                                {['Zo snel mogelijk', 'Binnen 3 maanden', 'Oriënterend (lange termijn)'].map(timing => (
                                    <button
                                        key={timing}
                                        type="button"
                                        aria-pressed={data.timeline === timing}
                                        onClick={() => updateData({ timeline: timing })}
                                        className={`px-4 py-2 rounded-xl border text-sm transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-active focus:border-active ${data.timeline === timing ? 'bg-active/10 border-active text-white' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}
                                    >
                                        {timing}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationFillMode: 'both', animationDelay: '0ms' }}>
                            <div className="bg-active/10 border border-active/20 rounded-xl p-4 mb-6">
                                <p className="text-sm text-white/80 font-ui">Laatste stap: Ik gebruik deze gegevens alleen om contact met u op te nemen voor de intake.</p>
                            </div>
                        </div>
                        
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationFillMode: 'both', animationDelay: '100ms' }}>
                            <label className="block text-sm font-bold text-white mb-2 font-display">Uw naam *</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => updateData({ name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-active transition-all duration-200 font-ui"
                                placeholder="Hoe mag ik u noemen?"
                            />
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationFillMode: 'both', animationDelay: '200ms' }}>
                            <label className="block text-sm font-bold text-white mb-2 font-display">E-mailadres *</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => updateData({ email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-active transition-all duration-200 font-ui"
                                placeholder="je@email.com"
                            />
                        </div>

                        {submitStatus === 'error' && (
                            <div className="p-4 rounded-xl bg-error/20 border border-error/30 text-white flex items-center gap-2">
                                <svg className="w-5 h-5 text-error shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                Er is iets misgegaan met de server. Probeer het later opnieuw.
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="pt-6 flex items-center justify-between border-t border-white/10 mt-8">
                    {step > 1 ? (
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={isSubmitting}
                            className="text-white/60 hover:text-white font-ui text-sm transition-colors py-2 px-4"
                        >
                            ← Terug
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            disabled={!canGoToNext()}
                            className="btn-primary py-2.5 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Volgende stap
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!canGoToNext() || isSubmitting}
                            className="bg-active hover:bg-primary-hover text-white font-bold py-2.5 px-8 rounded-full transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-ui"
                        >
                            {isSubmitting ? 'Verzenden...' : 'Aanvraag Versturen'}
                            {!isSubmitting && <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
