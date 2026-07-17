import { useEffect, useRef, useState } from 'react';
import { submitContactForm } from '@/lib/api/publicApi';
import { contactFormCopy, type ContactLocale } from '@/lib/contact-form-copy';

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
  locale?: ContactLocale;
  source: string;
  initialType?: string | null;
  onSuccess?: (data: FormData) => void;
}

const MAX_GOAL_LENGTH = 1500;
const MAX_COMPANY_LENGTH = 100;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 50;

const EMPTY_DATA: FormData = {
  projectType: '',
  goal: '',
  companyName: '',
  budget: '',
  timeline: '',
  name: '',
  email: '',
  phone: '',
};

function newRequestID(): string {
  const random =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return 'lcw_' + random;
}

export function ContactForm({ locale = 'nl', source, initialType, onSuccess }: Props) {
  const copy = contactFormCopy[locale];
  const defaultType =
    initialType === 'advies'
      ? copy.projectTypes[0]
      : initialType === 'discovery'
        ? copy.projectTypes[2]
        : copy.projectTypes.find((type) =>
            initialType ? type.toLowerCase().includes(initialType.toLowerCase()) : false
          ) || '';

  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>({ ...EMPTY_DATA, projectType: defaultType });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const requestID = useRef('');
  const previousStep = useRef(step);
  const stepAnnouncement =
    locale === 'nl'
      ? `Stap ${step} van 3: ${copy.progress[step - 1]}`
      : `Step ${step} of 3: ${copy.progress[step - 1]}`;

  useEffect(() => {
    if (previousStep.current !== step) {
      document.getElementById('contact-step-heading')?.focus();
      previousStep.current = step;
    }
  }, [step]);

  const update = (fields: Partial<FormData>) => {
    const changed = Object.entries(fields).some(
      ([key, value]) => data[key as keyof FormData] !== value
    );
    if (!changed) return;
    if (status === 'error') {
      requestID.current = '';
      setStatus('idle');
    }
    setData((current) => ({ ...current, ...fields }));
  };
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
  const stepValid =
    step === 1
      ? data.projectType !== '' && data.goal.trim() !== ''
      : step === 2
        ? data.companyName.trim() !== '' && data.budget !== '' && data.timeline !== ''
        : data.name.trim() !== '' && emailValid;

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stepValid || isSubmitting) return;
    setIsSubmitting(true);
    setStatus('idle');
    if (!requestID.current) requestID.current = newRequestID();

    try {
      const details = [
        'Project: ' + data.projectType,
        'Company: ' + data.companyName,
        'Budget: ' + data.budget,
        'Timeline: ' + data.timeline,
        '',
        data.goal,
      ].join('\n');

      await submitContactForm({
        requestId: requestID.current,
        name: data.name.trim(),
        email: data.email.trim(),
        message: details,
        dienst: data.projectType,
        bedrijf: data.companyName.trim(),
        telefoon: data.phone.trim() || undefined,
        budget: data.budget,
        timing: data.timeline,
        goal: data.goal.trim(),
        source,
        pageUrl: window.location.href,
      });
      setStatus('success');
      onSuccess?.(data);
    } catch {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status === 'success') {
    return (
      <div className="w-full text-center py-10" role="status" aria-live="polite">
        <div
          className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-success/30"
          aria-hidden="true"
        >
          <span className="text-success text-3xl">✓</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 font-display">{copy.successTitle}</h2>
        <p className="text-white/70 font-ui max-w-sm mx-auto">{copy.successBody}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <div
          className="flex justify-between text-xs font-bold text-white/50 mb-2 font-display uppercase tracking-wider"
          aria-hidden="true"
        >
          {copy.progress.map((label, index) => (
            <span key={label} className={step >= index + 1 ? 'text-active' : ''}>
              {label}
            </span>
          ))}
        </div>
        <div
          className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"
          role="progressbar"
          aria-label={stepAnnouncement}
          aria-valuemin={1}
          aria-valuemax={3}
          aria-valuenow={step}
        >
          <div
            className="h-full bg-active transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <h2 id="contact-step-heading" tabIndex={-1} className="sr-only">
          {stepAnnouncement}
        </h2>
        {step === 1 && (
          <>
            <fieldset>
              <legend className="block text-sm font-bold text-white mb-3 font-display">
                {copy.projectLegend} <span aria-hidden="true">*</span>
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {copy.projectTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={data.projectType === type}
                    onClick={() => update({ projectType: type })}
                    className={`px-4 py-3 rounded-xl border text-left text-sm focus:ring-2 focus:ring-active ${data.projectType === type ? 'bg-active/10 border-active text-white' : 'bg-white/5 border-white/10 text-white/70'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </fieldset>
            <div>
              <label
                htmlFor="contact-goal"
                className="block text-sm font-bold text-white mb-2 font-display"
              >
                {copy.goalLabel} <span aria-hidden="true">*</span>
              </label>
              <p id="contact-goal-help" className="text-xs text-white/50 mb-3 font-ui">
                {copy.goalHelp} {copy.goalLimit} ({data.goal.length}/{MAX_GOAL_LENGTH})
              </p>
              <textarea
                id="contact-goal"
                required
                aria-describedby="contact-goal-help"
                value={data.goal}
                onChange={(event) => update({ goal: event.target.value })}
                rows={4}
                maxLength={MAX_GOAL_LENGTH}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-active resize-none"
                placeholder={copy.goalPlaceholder}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label htmlFor="contact-company" className="block text-sm font-bold text-white mb-2">
                {copy.companyLabel} *
              </label>
              <input
                id="contact-company"
                required
                maxLength={MAX_COMPANY_LENGTH}
                value={data.companyName}
                onChange={(event) => update({ companyName: event.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-active"
                placeholder={copy.companyPlaceholder}
              />
            </div>
            <div>
              <label htmlFor="contact-budget" className="block text-sm font-bold text-white mb-2">
                {copy.budgetLabel} *
              </label>
              <select
                id="contact-budget"
                required
                value={data.budget}
                onChange={(event) => update({ budget: event.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-active"
              >
                <option value="" disabled className="text-gray-900">
                  {copy.budgetPlaceholder}
                </option>
                {copy.budgets.map((budget) => (
                  <option key={budget} value={budget} className="text-gray-900">
                    {budget}
                  </option>
                ))}
              </select>
            </div>
            <fieldset>
              <legend className="block text-sm font-bold text-white mb-2">
                {copy.timelineLegend} *
              </legend>
              <div className="flex flex-wrap gap-3">
                {copy.timelines.map((timeline) => (
                  <button
                    key={timeline}
                    type="button"
                    aria-pressed={data.timeline === timeline}
                    onClick={() => update({ timeline })}
                    className={`px-4 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-active ${data.timeline === timeline ? 'bg-active/10 border-active text-white' : 'bg-white/5 border-white/10 text-white/70'}`}
                  >
                    {timeline}
                  </button>
                ))}
              </div>
            </fieldset>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-sm text-white/80 bg-active/10 border border-active/20 rounded-xl p-4">
              {copy.privacy}
            </p>
            <div>
              <label htmlFor="contact-name" className="block text-sm font-bold text-white mb-2">
                {copy.nameLabel} *
              </label>
              <input
                id="contact-name"
                name="name"
                autoComplete="name"
                required
                maxLength={MAX_NAME_LENGTH}
                aria-describedby="contact-name-help"
                value={data.name}
                onChange={(event) => update({ name: event.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-active"
                placeholder={copy.namePlaceholder}
              />
              <p id="contact-name-help" className="mt-1 text-xs text-white/50">
                {copy.nameLimit}
              </p>
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-bold text-white mb-2">
                {copy.emailLabel} *
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={MAX_EMAIL_LENGTH}
                value={data.email}
                onChange={(event) => update({ email: event.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-active"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="contact-phone" className="block text-sm font-bold text-white mb-2">
                {copy.phoneLabel}
              </label>
              <input
                id="contact-phone"
                name="tel"
                type="tel"
                autoComplete="tel"
                maxLength={MAX_PHONE_LENGTH}
                value={data.phone}
                onChange={(event) => update({ phone: event.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-active"
                placeholder={copy.phonePlaceholder}
              />
            </div>
          </>
        )}

        <div aria-live="polite">
          {status === 'error' && (
            <p
              className="p-4 rounded-xl bg-error/20 border border-error/30 text-white"
              role="alert"
            >
              {copy.error}
            </p>
          )}
        </div>

        <div className="pt-6 flex items-center justify-between border-t border-white/10">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((value) => value - 1)}
              disabled={isSubmitting}
              className="text-white/60 hover:text-white py-2 px-4"
            >
              ← {copy.back}
            </button>
          ) : (
            <span />
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => stepValid && setStep((value) => value + 1)}
              disabled={!stepValid}
              className="btn-primary py-2.5 px-8 disabled:opacity-50"
            >
              {copy.next}
            </button>
          ) : (
            <button
              type="submit"
              disabled={!stepValid || isSubmitting}
              className="bg-active text-white font-bold py-2.5 px-8 rounded-full disabled:opacity-50"
            >
              {isSubmitting ? copy.submitting : copy.submit}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
