import { getSessionEntries, getSessionById } from '@/lib/actions';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { ArrowLeft, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Props = {
    params: Promise<{ id: string }>
}

export default async function SessionReportPage(props: Props) {
    const params = await props.params;
    const id = parseInt(params.id, 10);
    if (isNaN(id)) notFound();

    const session = await getSessionById(id);
    if (!session) notFound();

    const entries = await getSessionEntries(id);

    // Calculate stats
    let matchCount = 0;
    let mismatchCount = 0;
    let unscannedCount = 0;

    entries.forEach(({ product, entry }) => {
        if (!entry) {
            unscannedCount++;
        } else {
            if (entry.qty_actual === product.system_stock) {
                matchCount++;
            } else {
                mismatchCount++;
            }
        }
    });

    const statusLabel = {
        OPEN: 'BUKA',
        LOCKED: 'TERKUNCI',
        COMPLETED: 'SELESAI',
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Link href="/session">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Laporan Rekonsiliasi</h1>
                        <p className="text-muted-foreground">
                            {session.title} — <span className="font-semibold">{statusLabel[session.status as keyof typeof statusLabel] || session.status}</span>
                        </p>
                    </div>
                </div>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Ekspor CSV
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <Card className="bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">Cocok</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-700 dark:text-green-400">{matchCount}</div>
                        <p className="text-xs text-green-600/80">Item sesuai</p>
                    </CardContent>
                </Card>
                <Card className="bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">Selisih</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-700 dark:text-red-400">{mismatchCount}</div>
                        <p className="text-xs text-red-600/80">Varian terdeteksi</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-50 dark:bg-gray-800/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Belum Dihitung</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-muted-foreground">{unscannedCount}</div>
                        <p className="text-xs text-muted-foreground">Belum diinput</p>
                    </CardContent>
                </Card>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Produk / SKU</TableHead>
                            <TableHead className="text-right">Stok Sistem</TableHead>
                            <TableHead className="text-right">Hitungan Fisik</TableHead>
                            <TableHead className="text-right">Selisih</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entries.map(({ product, entry }) => {
                            const actual = entry?.qty_actual ?? null;
                            const system = product.system_stock;
                            const diff = actual !== null ? actual - system : null;

                            let statusColor = "text-muted-foreground";
                            let rowClass = "";

                            if (actual === null) {
                                rowClass = "bg-muted/10";
                            } else if (diff === 0) {
                                statusColor = "text-green-600 font-medium";
                            } else {
                                statusColor = "text-red-600 font-bold";
                                rowClass = "bg-red-50/50 dark:bg-red-900/5";
                            }

                            return (
                                <TableRow key={product.id} className={rowClass}>
                                    <TableCell>
                                        <div className="font-medium">{product.name}</div>
                                        <div className="text-xs text-muted-foreground font-mono">{product.sku}</div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{system}</TableCell>
                                    <TableCell className="text-right font-mono font-bold">
                                        {actual !== null ? actual : '-'}
                                    </TableCell>
                                    <TableCell className={cn("text-right font-mono", diff && diff !== 0 ? "text-red-600 font-bold" : "")}>
                                        {diff !== null ? (diff > 0 ? `+${diff}` : diff) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {actual === null ? (
                                            <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">Menunggu</Badge>
                                        ) : diff === 0 ? (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Pas</Badge>
                                        ) : (
                                            <Badge variant="destructive">Selisih</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
