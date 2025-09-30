'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Banknote, Home, Landmark, ArrowRightLeft, User, Settings, UserPlus, ShieldCheck, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "../logo";

const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/transactions', icon: Landmark, label: 'Transactions' },
    { href: '/transfer', icon: ArrowRightLeft, label: 'Transfer' },
    { href: '/convert', icon: Scale, label: 'Convert' },
    { href: '/settings', icon: Settings, label: 'Settings' },
    { href: '/admin', icon: ShieldCheck, label: 'Admin' },
    { href: '/register', icon: UserPlus, label: 'Register' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden w-64 flex-col border-r bg-card md:flex">
            <div className="flex h-16 items-center border-b px-6">
                <Logo />
            </div>
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <Link href={item.href}>
                                <div
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                                        pathname === item.href && "bg-muted text-primary font-semibold"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.label}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
