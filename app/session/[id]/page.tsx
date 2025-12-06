import { getSessionEntries, getSessionById } from '@/lib/actions';
import InputClient from './input-client';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type Props = {
    params: Promise<{ id: string }>
}

export default async function SessionInputPage(props: Props) {
    const params = await props.params;
    const id = parseInt(params.id, 10);
    if (isNaN(id)) notFound();

    const session = await getSessionById(id);
    if (!session) notFound();

    // Parallel data fetching
    const entries = await getSessionEntries(id);

    return (
        <div className="container mx-auto max-w-md min-h-screen flex flex-col">
            <div className="p-4 pb-0">
                <div className="flex items-center gap-2 mb-4">
                    <Link href="/staff">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-bold text-lg leading-tight line-clamp-1">{session.title}</h1>
                        <p className="text-xs text-muted-foreground">Ketuk jumlah untuk mengedit. Disimpan otomatis.</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-4">
                <InputClient sessionId={id} initialData={entries} />
            </div>
        </div>
    );
}
