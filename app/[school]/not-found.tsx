import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SchoolNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center max-w-md px-4">
        <h1 className="text-4xl font-bold mb-4">School Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We don&apos;t have events for this school yet.
        </p>
        <Link href="/">
          <Button size="lg">
            Choose a School
          </Button>
        </Link>
      </div>
    </div>
  )
}

