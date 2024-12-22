import Link from 'next/link'
import Layout from '@/layouts/Layout'

export default function About() {
  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-4">About Us</h1>
        <p className="text-gray-600 mb-4">
          We specialize in processing Excel files efficiently and securely.
        </p>
        <Link 
          href="/" 
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Back to Home
        </Link>
      </div>
    </Layout>
  )
} 