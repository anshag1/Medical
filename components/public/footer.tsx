import Link from 'next/link'
import { Pill } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <Pill className="h-5 w-5" />
            <span>{process.env.NEXT_PUBLIC_SITE_NAME ?? 'MediCatalogue'}</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            This catalogue is for informational purposes only. Always consult a licensed healthcare
            professional before using any medicine.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/catalogue" className="hover:text-foreground transition-colors">
              Catalogue
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
