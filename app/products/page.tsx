import Link from 'next/link';
import { getProducts, createProduct, deleteProduct } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default async function ProductsPage() {
    const products = await getProducts();

    async function handleCreate(formData: FormData) {
        'use server';
        const sku = formData.get('sku') as string;
        const name = formData.get('name') as string;
        const stock = parseInt(formData.get('stock') as string, 10);

        if (sku && name && !isNaN(stock)) {
            await createProduct(sku, name, stock);
        }
    }

    async function handleDelete(id: number) {
        'use server';
        await deleteProduct(id);
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Link href="/">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Manajemen Produk</h1>
                        <p className="text-muted-foreground">Tambah dan kelola data master produk.</p>
                    </div>
                </div>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Tambah Produk Baru</CardTitle>
                    <CardDescription>Masukkan detail produk baru.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="grid w-full items-center gap-1.5">
                            <label htmlFor="sku" className="text-sm font-medium">SKU / Kode</label>
                            <Input id="sku" name="sku" placeholder="cth. BB-010" required />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <label htmlFor="name" className="text-sm font-medium">Nama Produk</label>
                            <Input id="name" name="name" placeholder="cth. Kopi Gayo" required />
                        </div>
                        <div className="grid w-full items-center gap-1.5 md:w-32">
                            <label htmlFor="stock" className="text-sm font-medium">Stok Sistem</label>
                            <Input id="stock" name="stock" type="number" placeholder="0" required />
                        </div>
                        <Button type="submit">Tambah</Button>
                    </form>
                </CardContent>
            </Card>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>SKU</TableHead>
                            <TableHead>Nama Produk</TableHead>
                            <TableHead className="text-right">Stok Sistem</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                    Belum ada data produk.
                                </TableCell>
                            </TableRow>
                        )}
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell className="font-mono">{product.sku}</TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell className="text-right">{product.system_stock}</TableCell>
                                <TableCell>
                                    <form action={handleDelete.bind(null, product.id)}>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
