import { Dialog, DialogTrigger, Button as AriaButton } from 'react-aria-components';
import { Menu, X } from 'lucide-react';
import { mobileMenuOpen } from '@/lib/stores';
import { useStore } from '@nanostores/react';

interface MenuItem {
    label: string;
    href: string;
}

interface Props {
    items: MenuItem[];
}

export function MobileMenu({ items }: Props) {
    const isOpen = useStore(mobileMenuOpen);

    return (
        <DialogTrigger>
            <AriaButton
                className="lg:hidden p-2 text-white hover:text-active transition-colors"
                onPress={() => mobileMenuOpen.set(!isOpen)}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </AriaButton>

            {isOpen && (
                <Dialog className="fixed inset-0 z-50 clinical-glass p-6 lg:hidden">
                    <nav className="flex flex-col gap-6 mt-16">
                        {items.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="text-2xl font-display text-white hover:text-active transition-colors"
                                onClick={() => mobileMenuOpen.set(false)}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                </Dialog>
            )}
        </DialogTrigger>
    );
}
