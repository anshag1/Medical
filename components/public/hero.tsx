import Link from 'next/link'
import { Search, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            Your Trusted{' '}
            <span className="text-primary">Medical Catalogue</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse thousands of medicines with detailed information on composition, indications,
            dosage, and storage.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link href="/catalogue">
              <Search className="mr-2 h-5 w-5" />
              Browse Catalogue
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/catalogue">
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
