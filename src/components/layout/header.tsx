import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home, Landmark, ArrowRightLeft, Settings, UserPlus, ShieldCheck } from "lucide-react";
import { UserNav } from "./user-nav";
import { Logo } from "../logo";
import { getUserData } from "@/lib/data";

const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/transactions', icon: Landmark, label: 'Transactions' },
    { href: '/transfer', icon: ArrowRightLeft, label: 'Transfer' },
    { href: '/settings', icon: Settings, label: 'Settings' },
    { href: '/admin', icon: ShieldCheck, label: 'Admin' },
    { href: '/register', icon: UserPlus, label: 'Register' },
];

export async function Header() {
    const user = await getUserData();

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
            <nav className="flex-1 md:hidden">
                 <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="shrink-0">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0">
                        <div className="flex h-full max-h-screen flex-col gap-2">
                            <div className="flex h-16 items-center border-b px-6">
                                <Logo />
                            </div>
                            <div className="flex-1 overflow-y-auto py-2">
                               <nav className="grid items-start px-4 text-sm font-medium">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </nav>
            <div className="flex w-full items-center justify-end gap-4">
                <UserNav user={user} />
            </div>
        </header>
    );
}
