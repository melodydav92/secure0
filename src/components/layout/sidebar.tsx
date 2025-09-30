'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Landmark, ArrowRightLeft, Settings, ShieldCheck, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "../logo";

const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/transactions', icon: Landmark, label: 'Transactions' },
    { href: '/transfer', icon: ArrowRightLeft, label: 'Transfer' },
    { href: '/convert', icon: Scale, label: 'Convert' },
    { href: '/settings', icon: Settings, label: 'Settings' },
    // Admin link can be dynamically added based on user role if needed
];


export function Sidebar() {
    const pathname = usePathname();
    // In a real app, you'd get user role from a context or hook.
    // For this mock, we assume we can conditionally add admin link.
    // This example keeps it simple and doesn't show admin link by default.
    // To show it, you'd fetch user data and add it to the array.
    const finalNavItems = [...navItems];
     if (pathname.includes('/admin')) {
         const adminExists = finalNavItems.some(item => item.href === '/admin');
         if (!adminExists) {
             finalNavItems.push({ href: '/admin', icon: ShieldCheck, label: 'Admin' });
         }
    }


    return (
        <aside className="hidden w-64 flex-col border-r bg-card md:flex">
            <div className="flex h-16 items-center border-b px-6">
                <Logo />
            </div>
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {finalNavItems.map((item) => (
                        <li key={item.href}>
                            <Link href={item.href}>
                                <div
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                                        pathname.startsWith(item.href) && item.href !== '/' && "bg-muted text-primary font-semibold",
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
