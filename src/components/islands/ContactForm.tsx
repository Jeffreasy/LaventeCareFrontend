import { useState, type SyntheticEvent } from 'react';
import { submitContactForm } from '@/lib/api/publicApi';

interface FormData {
  projectType: string;
  goal: string;
  companyName: string;
  budget: string;
  timeline: string;
  name: string;
  email: string;
  phone: string;
}

interface Props {
  onSuccess?: (data: FormData) => void;
  initialType?: string | null;
  locale?: 'nl' | 'en';
}

const initialData: FormData = {
  projectType: '',
  goal: '',
  companyName: '',
  budget: '',
  timeline: '',
  name: '',
  email: '',
  phone: '',
};

const COPY = {
  nl: {
    steps: ['Behoefte', 'Context', 'Gegevens'],
    projectLegend: '1. Wat wilt u realiseren? *',
    projects: [
      'Professionele Website',
      'IT Advies & Consultancy',
      'AI & Automatisering',
      'Maatwerk Platform / App',
      'IoT & Monitoring',
      'Klanten werven',
      'Beveiliging & Toegang',
      'Anders',
    ],
    goalLabel: '2. Wat is de belangrijkste uitkomst? *',
    goalHelp: 'Wat is de grootste bottleneck op dit moment, of wat is het concrete doel?',
    goalPlaceholder: 'Beschrijf uw uitdaging…',
    company: 'Bedrijfsnaam *',
    companyPlaceholder: 'Uw organisatie',
    budget: 'Beschikbaar budget *',
    websiteBudgetHelp:
      'Vaste websitepakketten starten bij €750. Uitbreidingen worden vooraf apart geprijsd.',
    selectedPackage: 'Geselecteerde route',
    packageNames: {
      'website-start': 'Website Start — €750 eenmalig · Care €29/maand',
      'website-business': 'Website Business — €1.000 eenmalig · Care €49/maand',
      'website-maatwerk': 'Website Maatwerk — vanaf €1.500 · Care vanaf €75/maand',
      'website-custom': 'Website Maatwerk — vanaf €1.500 · Care vanaf €75/maand',
      'website-care': 'Website Care — beheer vanaf €29/maand',
    },
    projectBudgetHelp:
      'Maatwerktrajecten en optimalisaties starten doorgaans vanaf €3.000 om kwaliteit en zekerheid te waarborgen.',
    budgetPlaceholder: 'Selecteer budgetindicatie',
    budgets: ['< €1.000', '€1.000 – €2.500', '€2.500 – €5.000', '€5.000 – €10.000', '€10.000+'],
    timeline: 'Gewenste tijdlijn *',
    timelines: ['Zo snel mogelijk', 'Binnen 3 maanden', 'Oriënterend (lange termijn)'],
    privacy: 'Laatste stap: ik gebruik deze gegevens om uw aanvraag te behandelen.',
    privacyLink: 'Lees hoe LaventeCare met uw gegevens omgaat.',
    name: 'Uw naam *',
    namePlaceholder: 'Hoe mag ik u noemen?',
    email: 'E-mailadres *',
    phone: 'Telefoonnummer',
    optional: 'Optioneel',
    back: '← Terug',
    next: 'Volgende stap',
    send: 'Aanvraag versturen',
    sending: 'Verzenden…',
    error: 'Er is iets misgegaan. Probeer het later opnieuw.',
    successTitle: 'Aanvraag ontvangen',
    successBody: 'Bedankt voor de details. Ik neem binnen 24 uur op werkdagen contact met u op.',
    progress: (step: number) => `Stap ${step} van 3`,
  },
  en: {
    steps: ['Needs', 'Context', 'Details'],
    projectLegend: '1. What would you like to achieve? *',
    projects: [
      'Professional Website',
      'IT Advice & Consulting',
      'AI & Automation',
      'Custom Platform / App',
      'IoT & Monitoring',
      'Win customers',
      'Security & Access',
      'Other',
    ],
    goalLabel: '2. What is the most important outcome? *',
    goalHelp: 'What is your main bottleneck right now, or what concrete goal do you have?',
    goalPlaceholder: 'Describe your challenge…',
    company: 'Company name *',
    companyPlaceholder: 'Your organisation',
    budget: 'Available budget *',
    websiteBudgetHelp:
      'Fixed website packages start at €750. Extensions are priced separately before work starts.',
    selectedPackage: 'Selected route',
    packageNames: {
      'website-start': 'Website Start — €750 one-off · Care €29/month',
      'website-business': 'Website Business — €1,000 one-off · Care €49/month',
      'website-maatwerk': 'Custom Website — from €1,500 · Care from €75/month',
      'website-custom': 'Custom Website — from €1,500 · Care from €75/month',
      'website-care': 'Website Care — management from €29/month',
    },
    projectBudgetHelp:
      'Custom development and optimisation projects generally start at €3,000 to ensure delivery quality.',
    budgetPlaceholder: 'Select a budget range',
    budgets: ['< €1,000', '€1,000 – €2,500', '€2,500 – €5,000', '€5,000 – €10,000', '€10,000+'],
    timeline: 'Preferred timeline *',
    timelines: ['As soon as possible', 'Within 3 months', 'Exploratory (long term)'],
    privacy: 'Final step: I use these details to handle your request.',
    privacyLink: 'Read how LaventeCare handles your data.',
    name: 'Your name *',
    namePlaceholder: 'How may I address you?',
    email: 'Email address *',
    phone: 'Phone number',
    optional: 'Optional',
    back: '← Back',
    next: 'Next step',
    send: 'Send request',
    sending: 'Sending…',
    error: 'Something went wrong. Please try again later.',
    successTitle: 'Request received',
    successBody: 'Thank you for the details. I will contact you within one business day.',
    progress: (step: number) => `Step ${step} of 3`,
  },
} as const;

export function ContactForm({ onSuccess, initialType, locale = 'nl' }: Props) {
  const copy = COPY[locale];
  const requestedType = initialType?.toLowerCase() || '';
  const packageInterest = copy.packageNames[requestedType as keyof typeof copy.packageNames] || '';
  const defaultType = requestedType.startsWith('website')
    ? copy.projects[0]
    : requestedType === 'advies'
      ? copy.projects[1]
      : ['ai', 'automation', 'automatisering'].some((term) => requestedType.includes(term))
        ? copy.projects[2]
        : ['discovery', 'project', 'platform', 'event', 'evenement'].some((term) =>
              requestedType.includes(term)
            )
          ? copy.projects[3]
          : requestedType.includes('iot')
            ? copy.projects[4]
            : ['leadgen', 'klanten', 'customers'].some((term) => requestedType.includes(term))
              ? copy.projects[5]
              : requestedType.includes('security')
                ? copy.projects[6]
                : initialType
                  ? copy.projects.find((type) =>
                      type.toLowerCase().includes(initialType.toLowerCase())
                    ) || ''
                  : '';

  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>({ ...initialData, projectType: defaultType });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const updateData = (fields: Partial<FormData>) =>
    setData((previous) => ({ ...previous, ...fields }));

  const canContinue =
    step === 1
      ? Boolean(data.projectType && data.goal.trim())
      : step === 2
        ? Boolean(data.companyName.trim() && data.budget && data.timeline)
        : Boolean(data.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email));

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 3) {
      if (canContinue) setStep((current) => current + 1);
      return;
    }
    if (!canContinue || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      const selectedPackage =
        packageInterest && data.projectType === copy.projects[0] ? packageInterest : '';
      const subject = `Intake: ${selectedPackage || data.projectType} - ${data.companyName}`;
      const packageLabel = locale === 'en' ? 'Selected package' : 'Pakketvoorkeur';
      const message = `[${subject}]

Project: ${data.projectType}
${selectedPackage ? `${packageLabel}: ${selectedPackage}\n` : ''}Company: ${data.companyName}
Budget: ${data.budget}
Timeline: ${data.timeline}

Goal:
${data.goal}`;

      await submitContactForm({
        name: data.name,
        email: data.email,
        message,
        dienst: data.projectType,
        bedrijf: data.companyName,
        telefoon: data.phone || undefined,
        budget: data.budget,
        timing: data.timeline,
        goal: data.goal,
        source: locale === 'en' ? 'laventecare.com' : 'laventecare.nl',
        pageUrl: window.location.href,
      });
      setSubmitStatus('success');
      onSuccess?.(data);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitStatus === 'success') {
    return (
      <div className="w-full py-10 text-center" role="status" aria-live="polite">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-success/30 bg-success/20">
          <svg
            className="h-8 w-8 text-success"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mb-2 font-display text-2xl font-bold text-white">{copy.successTitle}</h3>
        <p className="mx-auto max-w-sm font-ui text-white/70">{copy.successBody}</p>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-ui text-white transition focus:border-active focus:outline-none focus:ring-2 focus:ring-active';
  const choiceClass = (selected: boolean) =>
    `cursor-pointer rounded-xl border px-4 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-active ${
      selected
        ? 'border-active bg-active/10 text-white'
        : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
    }`;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-8" aria-label={copy.progress(step)}>
        <div className="mb-2 flex justify-between font-display text-xs font-bold uppercase tracking-wider text-white/50">
          {copy.steps.map((label, index) => (
            <span key={label} className={step >= index + 1 ? 'text-active' : ''}>
              {label}
            </span>
          ))}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full bg-active transition-all"
            style={{ width: `${(step / 3) * 100}%` }}
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={3}
            aria-valuenow={step}
            aria-valuetext={copy.progress(step)}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {step === 1 && (
          <div className="space-y-6">
            {packageInterest && data.projectType === copy.projects[0] && (
              <div className="rounded-xl border border-active/25 bg-active/10 p-4">
                <p className="font-display text-xs font-bold uppercase tracking-wider text-active">
                  {copy.selectedPackage}
                </p>
                <p className="mt-1 font-ui text-sm font-semibold text-white">{packageInterest}</p>
              </div>
            )}
            <fieldset>
              <legend className="mb-3 block font-display text-sm font-bold text-white">
                {copy.projectLegend}
              </legend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {copy.projects.map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={data.projectType === type}
                    onClick={() => updateData({ projectType: type })}
                    className={choiceClass(data.projectType === type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </fieldset>
            <div>
              <label
                htmlFor="contact-goal"
                className="mb-2 block font-display text-sm font-bold text-white"
              >
                {copy.goalLabel}
              </label>
              <p id="contact-goal-help" className="mb-3 font-ui text-xs text-white/50">
                {copy.goalHelp}
              </p>
              <textarea
                id="contact-goal"
                name="goal"
                value={data.goal}
                onChange={(event) => updateData({ goal: event.target.value })}
                rows={4}
                maxLength={3000}
                required
                aria-describedby="contact-goal-help"
                className={`${inputClass} resize-none`}
                placeholder={copy.goalPlaceholder}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="contact-company"
                className="mb-2 block font-display text-sm font-bold text-white"
              >
                {copy.company}
              </label>
              <input
                id="contact-company"
                name="company"
                type="text"
                autoComplete="organization"
                maxLength={200}
                required
                value={data.companyName}
                onChange={(event) => updateData({ companyName: event.target.value })}
                className={inputClass}
                placeholder={copy.companyPlaceholder}
              />
            </div>
            <div>
              <label
                htmlFor="contact-budget"
                className="mb-2 block font-display text-sm font-bold text-white"
              >
                {copy.budget}
              </label>
              <p
                id="contact-budget-help"
                className="mb-3 font-ui text-xs font-medium text-active/80"
              >
                {data.projectType === copy.projects[0]
                  ? copy.websiteBudgetHelp
                  : copy.projectBudgetHelp}
              </p>
              <select
                id="contact-budget"
                name="budget"
                required
                value={data.budget}
                onChange={(event) => updateData({ budget: event.target.value })}
                aria-describedby="contact-budget-help"
                className={`${inputClass} appearance-none`}
              >
                <option value="" disabled className="text-gray-900">
                  {copy.budgetPlaceholder}
                </option>
                {copy.budgets.map((option) => (
                  <option key={option} value={option} className="text-gray-900">
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <fieldset>
              <legend className="mb-3 block font-display text-sm font-bold text-white">
                {copy.timeline}
              </legend>
              <div className="flex flex-wrap gap-3">
                {copy.timelines.map((timing) => (
                  <button
                    key={timing}
                    type="button"
                    aria-pressed={data.timeline === timing}
                    onClick={() => updateData({ timeline: timing })}
                    className={choiceClass(data.timeline === timing)}
                  >
                    {timing}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-active/20 bg-active/10 p-4 font-ui text-sm text-white/80">
              <p>{copy.privacy}</p>
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex font-semibold text-active underline underline-offset-4"
              >
                {copy.privacyLink}
              </a>
            </div>
            <div>
              <label
                htmlFor="contact-name"
                className="mb-2 block font-display text-sm font-bold text-white"
              >
                {copy.name}
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                maxLength={200}
                required
                value={data.name}
                onChange={(event) => updateData({ name: event.target.value })}
                className={inputClass}
                placeholder={copy.namePlaceholder}
              />
            </div>
            <div>
              <label
                htmlFor="contact-email"
                className="mb-2 block font-display text-sm font-bold text-white"
              >
                {copy.email}
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                maxLength={320}
                required
                value={data.email}
                onChange={(event) => updateData({ email: event.target.value })}
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="contact-phone"
                className="mb-2 block font-display text-sm font-bold text-white"
              >
                {copy.phone}
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={50}
                value={data.phone}
                onChange={(event) => updateData({ phone: event.target.value })}
                className={inputClass}
                placeholder={copy.optional}
              />
            </div>
            {submitStatus === 'error' && (
              <p
                className="rounded-xl border border-error/30 bg-error/20 p-4 text-white"
                role="alert"
              >
                {copy.error}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((current) => current - 1)}
              disabled={isSubmitting}
              className="px-4 py-2 font-ui text-sm text-white/60 transition hover:text-white"
            >
              {copy.back}
            </button>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={!canContinue || isSubmitting}
            className="btn-primary px-8 py-2.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {step < 3 ? copy.next : isSubmitting ? copy.sending : copy.send}
          </button>
        </div>
      </form>
    </div>
  );
}
