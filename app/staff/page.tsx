import Link from 'next/link';
import { getOpenSessions } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

export default async function StaffPage() {
    const openSessions = await getOpenSessions();

    return (
        <div className="container mx-auto p-6 max-w-md">
            <div className="mb-6">
                <Link href="/">
                    <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                        ← Kembali ke Beranda
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Portal Staf</h1>
                <p className="text-muted-foreground">Pilih sesi aktif untuk mulai menghitung.</p>
            </div>

            <div className="space-y-4">
                {openSessions.length === 0 && (
                    <div className="text-center py-10 border rounded-lg bg-muted/20">
                        <p className="text-muted-foreground">Tidak ada sesi aktif.</p>
                        <p className="text-xs text-muted-foreground mt-1">Minta manajer Anda untuk membuatnya.</p>
                    </div>
                )}

                {openSessions.map((session) => (
                    <Link href={`/session/${session.id}`} key={session.id} className="block group">
                        <Card className="group-hover:border-primary transition-colors">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                        {session.title}
                                    </CardTitle>
                                    <Badge>AKTIF</Badge>
                                </div>
                                <CardDescription>
                                    Dimulai {session.created_at.toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm text-primary font-medium">
                                    Mulai Input <ArrowRight className="ml-2 h-4 w-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
