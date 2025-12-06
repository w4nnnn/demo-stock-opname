import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, PackageSearch, ShieldCheck, Users } from 'lucide-react';
import { getSessions, getOpenSessions } from '@/lib/actions';

export default async function Home() {
  const sessions = await getSessions();
  const openSessions = await getOpenSessions();

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <header className="mb-8 text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Sistem Stock Opname
        </h1>
        <p className="text-muted-foreground text-lg">
          Manajemen stok fisik yang cepat, akurat, dan digital.
        </p>
      </header>

      {/* Executive Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-10">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sesi</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">Riwayat keseluruhan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif (Buka)</CardTitle>
            <PackageSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openSessions.length}</div>
            <p className="text-xs text-muted-foreground">Sedang berlangsung</p>
          </CardContent>
        </Card>
        {/* Placeholder stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            <PackageSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15+</div>
            <p className="text-xs text-muted-foreground">Item data master</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Admin Portal */}
        <Card className="hover:shadow-lg transition-shadow border-primary/20 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">Portal Admin</CardTitle>
            </div>
            <CardDescription>
              Buat sesi baru, kelola status sesi, dan lihat laporan rekonsiliasi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/session">
              <Button size="lg" className="w-full">
                Kelola Sesi
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Product Management */}
        <Card className="hover:shadow-lg transition-shadow border-blue-200 dark:border-blue-800 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <PackageSearch className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-2xl">Produk</CardTitle>
            </div>
            <CardDescription>
              Kelola data master produk, tambah item baru, atau hapus item lama.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/products">
              <Button size="lg" variant="outline" className="w-full border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950">
                Kelola Produk
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Staff Portal */}
        <Card className="hover:shadow-lg transition-shadow border-secondary/50 bg-secondary/10 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-8 w-8 text-secondary-foreground" />
              <CardTitle className="text-2xl">Portal Staf</CardTitle>
            </div>
            <CardDescription>
              Input hitungan fisik untuk sesi opname yang sedang berjalan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/staff">
              <Button size="lg" variant="secondary" className="w-full">
                Mulai Input Data
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
