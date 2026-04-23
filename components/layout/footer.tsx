export default function Footer() {
  return (
    <footer className="border-t border-brand-100 py-10 px-6 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-gray-500">© 2026 Culiner Yuk. All rights reserved.</p>
        <div className="flex gap-4 text-sm text-gray-600">
          <a href="#" className="hover:text-brand-500">Syarat</a>
          <a href="#" className="hover:text-brand-500">Privasi</a>
          <a href="#" className="hover:text-brand-500">Kontak</a>
        </div>
      </div>
    </footer>
  );
}