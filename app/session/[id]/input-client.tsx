'use client';

import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { submitOpnameEntry } from '@/lib/actions';
import { Search, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Product = {
    id: number;
    sku: string;
    name: string;
    system_stock: number;
};

type Entry = {
    id: number;
    product_id: number;
    qty_actual: number;
    notes: string | null;
} | null;

type Props = {
    sessionId: number;
    initialData: {
        product: Product;
        entry: Entry;
    }[];
};

export default function InputClient({ sessionId, initialData }: Props) {
    const [search, setSearch] = useState('');
    const [data, setData] = useState(initialData);
    const [pendingId, setPendingId] = useState<number | null>(null);
    const [isPending, startTransition] = useTransition();

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{ product: Product; entry: Entry } | null>(null);
    const [inputQty, setInputQty] = useState('');
    const [inputNotes, setInputNotes] = useState('');

    // Filter logic
    const filteredData = data.filter((item) => {
        const term = search.toLowerCase();
        return (
            item.product.name.toLowerCase().includes(term) ||
            item.product.sku.toLowerCase().includes(term)
        );
    });

    const openDialog = (item: { product: Product; entry: Entry }) => {
        setSelectedItem(item);
        setInputQty(item.entry?.qty_actual.toString() || '');
        setInputNotes(item.entry?.notes || '');
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;

        const productId = selectedItem.product.id;
        const qty = parseInt(inputQty, 10);

        if (isNaN(qty)) {
            toast.error('Jumlah harus berupa angka');
            return;
        }

        setPendingId(productId);
        setIsDialogOpen(false); // Close immediately for better UX

        // Optimistic Update locally
        setData((prev) =>
            prev.map((item) => {
                if (item.product.id === productId) {
                    return {
                        ...item,
                        entry: {
                            ...(item.entry || { id: 0, session_id: sessionId, product_id: productId }),
                            qty_actual: qty,
                            notes: inputNotes,
                            updated_at: new Date()
                        } as any
                    };
                }
                return item;
            })
        );

        startTransition(async () => {
            try {
                await submitOpnameEntry(sessionId, productId, qty, inputNotes);
                setPendingId(null);
                toast.success('Disimpan');
            } catch (e) {
                toast.error('Gagal menyimpan');
                setPendingId(null);
            }
        });
    };

    return (
        <div>
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b mb-4">
                <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Cari nama produk atau SKU..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Product List */}
            <div className="space-y-2 pb-20">
                {filteredData.map((item) => {
                    const { product, entry } = item;
                    const isSaving = pendingId === product.id;
                    const hasEntry = entry !== null;

                    return (
                        <div
                            key={product.id}
                            onClick={() => openDialog(item)}
                            className={cn(
                                "p-4 rounded-lg border transition-colors cursor-pointer active:scale-[0.98] transition-all",
                                hasEntry ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900" : "bg-card hover:bg-muted/50"
                            )}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-semibold text-lg leading-tight">{product.name}</div>
                                    <div className="text-xs text-muted-foreground font-mono mt-1">{product.sku}</div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {hasEntry ? (
                                        <div className="text-right">
                                            <div className="text-2xl font-bold font-mono">{entry.qty_actual}</div>
                                            <div className="text-[10px] text-muted-foreground">Fisik</div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground italic">Input</div>
                                    )}

                                    {isSaving ? (
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    ) : hasEntry && (
                                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    )}
                                </div>
                            </div>

                            {hasEntry && entry.notes && (
                                <div className="mt-2 text-xs text-muted-foreground bg-background/50 p-1.5 rounded inline-block">
                                    📝 {entry.notes}
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredData.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        Tidak ada produk yang cocok dengan "{search}"
                    </div>
                )}
            </div>

            {/* Input Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md top-[20%] translate-y-0">
                    <DialogHeader>
                        <DialogTitle>{selectedItem?.product.name}</DialogTitle>
                        <DialogDescription>
                            SKU: {selectedItem?.product.sku}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSave} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="qty">Jumlah Fisik</Label>
                            <Input
                                id="qty"
                                type="number"
                                inputMode="numeric"
                                className="text-3xl font-bold h-16 text-center"
                                placeholder="0"
                                value={inputQty}
                                onChange={(e) => setInputQty(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Catatan (Opsional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Cth. Kemasan rusak, Expired dekat..."
                                value={inputNotes}
                                onChange={(e) => setInputNotes(e.target.value)}
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
