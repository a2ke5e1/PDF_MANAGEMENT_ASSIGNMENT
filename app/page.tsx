import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Shield, Share2, Users, MessageSquare } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <span className="text-xl font-bold">SecurePDF</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:underline">
              Login
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Secure PDF Storage and Sharing</h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Store your PDFs securely, share them with others, and collaborate with comments. All in one place.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button size="lg">Get Started</Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline">
                      Login
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:order-last">
                <img
                  src="/placeholder.svg?height=400&width=400"
                  alt="SecurePDF Dashboard Preview"
                  className="rounded-lg object-cover shadow-lg"
                  width={400}
                  height={400}
                />
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center space-y-2 p-4 text-center">
                <Shield className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Secure Storage</h3>
                <p className="text-gray-500">Your PDFs are stored securely with enterprise-grade encryption</p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 text-center">
                <Share2 className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Easy Sharing</h3>
                <p className="text-gray-500">Share your PDFs with unique links or directly with other users</p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 text-center">
                <Users className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">User Management</h3>
                <p className="text-gray-500">Control who has access to your documents with fine-grained permissions</p>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 text-center">
                <MessageSquare className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold">Comments</h3>
                <p className="text-gray-500">Collaborate with others by adding comments to your PDFs</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-500">© 2025 SecurePDF. All rights reserved.</p>
          <nav className="flex gap-4 text-sm text-gray-500">
            <Link href="#" className="hover:underline">
              Terms
            </Link>
            <Link href="#" className="hover:underline">
              Privacy
            </Link>
            <Link href="#" className="hover:underline">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
