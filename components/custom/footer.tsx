export default function Footer() {
  return (
    <footer className='bg-blue-100 py-12'>
      <div className='container mx-auto px-4 text-center text-gray-600'>
        <p>&copy; {new Date().getFullYear()} TechnoDevLabs. All rights reserved.</p>
      </div>
    </footer>
  )
}
