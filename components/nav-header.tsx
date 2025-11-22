import Link from "next/link";

export function NavHeader() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-800">
              🐔
            </div>
            <span className="text-lg font-semibold text-gray-900">
              Gestión Granja Avícola
            </span>
          </Link>
          <div className="flex gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <Link
              href="/jaulas"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Jaulas
            </Link>
            <Link
              href="/aves"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Aves
            </Link>
            <Link
              href="/postura"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Postura
            </Link>
            <Link
              href="/ventas"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Ventas
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
