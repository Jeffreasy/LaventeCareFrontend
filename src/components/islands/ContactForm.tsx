import { useForm, getFormProps, getInputProps, getTextareaProps } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { z } from 'zod';
import { useState } from 'react';

// Contact form validation schema
const contactSchema = z.object({
    name: z.string().min(2, 'Naam moet minimaal 2 karakters zijn'),
    email: z.string().email('Ongeldig e-mailadres'),
    subject: z.string().min(5, 'Onderwerp moet minimaal 5 karakters zijn'),
    message: z.string().min(10, 'Bericht moet minimaal 10 karakters zijn'),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface Props {
    onSuccess?: (data: ContactFormData) => void;
}

export function ContactForm({ onSuccess }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const [form, fields] = useForm({
        onValidate({ formData }) {
            return parseWithZod(formData, { schema: contactSchema });
        },

        async onSubmit(event, { formData }) {
            event.preventDefault();
            setIsSubmitting(true);
            setSubmitStatus('idle');

            try {
                // Parse and validate form data
                const data = Object.fromEntries(formData) as ContactFormData;
                const validated = contactSchema.parse(data);

                // Backend accepts {name, email, message} — prepend subject to message
                const response = await fetch('/api/v1/public/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: validated.name,
                        email: validated.email,
                        message: `[${validated.subject}]\n\n${validated.message}`,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`);
                }

                if (import.meta.env.DEV) console.log('Form submitted:', validated);
                setSubmitStatus('success');

                if (onSuccess) {
                    onSuccess(validated);
                }

                // Reset form after successful submission
                event.currentTarget.reset();
            } catch (error) {
                if (import.meta.env.DEV) console.error('Form submission error:', error);
                setSubmitStatus('error');
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    return (
        <div className="w-full max-w-2xl mx-auto">
            <form {...getFormProps(form)} className="space-y-6">
                {/* Name Field */}
                <div>
                    <label
                        htmlFor={fields.name.id}
                        className="block text-sm font-medium text-white/90 mb-2"
                    >
                        Naam *
                    </label>
                    <input
                        {...getInputProps(fields.name, { type: 'text' })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-active focus:border-active/50 backdrop-blur-sm transition-all duration-200"
                        placeholder="Je naam"
                    />
                    {fields.name.errors && (
                        <p className="mt-1 text-sm text-red-400">{fields.name.errors}</p>
                    )}
                </div>

                {/* Email Field */}
                <div>
                    <label
                        htmlFor={fields.email.id}
                        className="block text-sm font-medium text-white/90 mb-2"
                    >
                        E-mail *
                    </label>
                    <input
                        {...getInputProps(fields.email, { type: 'email' })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-active focus:border-active/50 backdrop-blur-sm transition-all duration-200"
                        placeholder="je@email.com"
                    />
                    {fields.email.errors && (
                        <p className="mt-1 text-sm text-red-400">{fields.email.errors}</p>
                    )}
                </div>

                {/* Subject Field */}
                <div>
                    <label
                        htmlFor={fields.subject.id}
                        className="block text-sm font-medium text-white/90 mb-2"
                    >
                        Onderwerp *
                    </label>
                    <input
                        {...getInputProps(fields.subject, { type: 'text' })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-active focus:border-active/50 backdrop-blur-sm transition-all duration-200"
                        placeholder="Waarover wil je contact?"
                    />
                    {fields.subject.errors && (
                        <p className="mt-1 text-sm text-red-400">{fields.subject.errors}</p>
                    )}
                </div>

                {/* Message Field */}
                <div>
                    <label
                        htmlFor={fields.message.id}
                        className="block text-sm font-medium text-white/90 mb-2"
                    >
                        Bericht *
                    </label>
                    <textarea
                        {...getTextareaProps(fields.message)}
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-active focus:border-active/50 backdrop-blur-sm transition-all duration-200 resize-none"
                        placeholder="Je bericht..."
                    />
                    {fields.message.errors && (
                        <p className="mt-1 text-sm text-red-400">{fields.message.errors}</p>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Versturen...' : 'Verstuur bericht'}
                </button>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                    <div className="p-4 rounded-xl bg-success/20 border border-success/30 text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Bericht succesvol verzonden!
                    </div>
                )}

                {submitStatus === 'error' && (
                    <div className="p-4 rounded-xl bg-error/20 border border-error/30 text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-error shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        Er is iets misgegaan. Probeer het opnieuw.
                    </div>
                )}
            </form>
        </div>
    );
}
