import React from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold hover:text-blue-100">
            しおり
          </Link>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/" className="hover:text-blue-100">
                  ホーム
                </Link>
              </li>
              <li>
                <Link href="/create" className="hover:text-blue-100">
                  新規作成
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
      <footer className="bg-gray-100 p-4 border-t">
        <div className="container mx-auto text-center text-gray-600">
          <p>© {new Date().getFullYear()} しおり - 旅のしおりを作るアプリ</p>
        </div>
      </footer>
    </div>
  );
}
