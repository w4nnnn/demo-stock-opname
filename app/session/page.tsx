import Link from 'next/link';
import { getSessions, createSession, finalizeSession, deleteSession } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default async function SessionPage() {
    const sessions = await getSessions();

    async function handleCreate(formData: FormData) {
        'use server';
        const title = formData.get('title') as string;
        if (title) {
            await createSession(title);
            redirect('/session');
        }
    }

    const statusLabel = {
        OPEN: 'BUKA',
        LOCKED: 'TERKUNCI',
        COMPLETED: 'SELESAI',
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manajemen Sesi</h1>
                    <p className="text-muted-foreground">Buat dan kelola sesi stock opname.</p>
                </div>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Buat Sesi Baru</CardTitle>
                    <CardDescription>Mulai periode stok opname baru.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleCreate} className="flex gap-4 items-end">
                        <div className="grid w-full items-center gap-1.5">
                            <label htmlFor="title" className="text-sm font-medium">Judul Sesi</label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="cth. Opname Q1 2025"
                                required
                            />
                        </div>
                        <Button type="submit">Buat Sesi</Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Riwayat</h2>
                {sessions.length === 0 && (
                    <p className="text-muted-foreground text-sm">Tidak ada sesi ditemukan.</p>
                )}

                {sessions.map((session) => (
                    <Card key={session.id}>
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-lg">{session.title}</span>
                                    <Badge variant={session.status === 'OPEN' ? 'default' : 'secondary'}>
                                        {statusLabel[session.status as keyof typeof statusLabel] || session.status}
                                    </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Dibuat: {session.created_at.toLocaleDateString('id-ID')}
                                    {session.completed_at && ` • Selesai: ${session.completed_at.toLocaleDateString('id-ID')}`}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Link href={`/session/${session.id}/report`}>
                                    <Button variant="outline" size="sm">Laporan</Button>
                                </Link>



                                {session.status === 'OPEN' && (
                                    <form action={async () => {
                                        'use server';
                                        await finalizeSession(session.id);
                                    }}>
                                        <Button type="submit" variant="destructive" size="sm">Selesaikan</Button>
                                    </form>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
