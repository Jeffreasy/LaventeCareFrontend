import { useForm, getFormProps, getInputProps } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { z } from 'zod';
import { useState } from 'react';

// Newsletter subscription schema
const newsletterSchema = z.object({
    email: z.string().email('Ongeldig e-mailadres'),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

interface Props {
    placeholder?: string;
    buttonText?: string;
    onSuccess?: (email: string) => void;
}

export function NewsletterForm({
    placeholder = 'je@email.com',
    buttonText = 'Aanmelden',
    onSuccess
}: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const [form, fields] = useForm({
        onValidate({ formData }) {
            return parseWithZod(formData, { schema: newsletterSchema });
        },

        async onSubmit(event, { formData }) {
            event.preventDefault();
            setIsSubmitting(true);
            setSubmitStatus('idle');

            try {
                const data = Object.fromEntries(formData) as NewsletterFormData;
                const validated = newsletterSchema.parse(data);

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 800));

                console.log('Newsletter signup:', validated.email);
                setSubmitStatus('success');

                if (onSuccess) {
                    onSuccess(validated.email);
                }

                event.currentTarget.reset();
            } catch (error) {
                console.error('Newsletter signup error:', error);
                setSubmitStatus('error');
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    return (
        <div className="w-full max-w-md">
            <form {...getFormProps(form)} className="space-y-3">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <input
                            {...getInputProps(fields.email, { type: 'email' })}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-active focus:border-active/50 backdrop-blur-sm transition-all duration-200"
                            placeholder={placeholder}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary whitespace-nowrap disabled:opacity-50"
                    >
                        {isSubmitting ? '...' : buttonText}
                    </button>
                </div>

                {fields.email.errors && (
                    <p className="text-sm text-red-400">{fields.email.errors}</p>
                )}

                {submitStatus === 'success' && (
                    <p className="text-sm text-success">
                        ✓ Je bent aangemeld voor de nieuwsbrief!
                    </p>
                )}

                {submitStatus === 'error' && (
                    <p className="text-sm text-error">
                        ✗ Er ging iets mis. Probeer het opnieuw.
                    </p>
                )}
            </form>
        </div>
    );
}
