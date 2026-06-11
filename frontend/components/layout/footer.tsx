import React from "react";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-10">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ЭрикTech
            </h3>
            <p className="text-gray-600">
              Платформа для электронных аукционов нового поколения.
            </p>
          </div>

          <div className="mt-8 flex flex-col justify-around items-start">
            <Link
              href="/terms"
              className="text-gray-600 hover:text-blue-600 text-sm"
            >
              Соглашение об обработке данных
            </Link>
            <Link
              href="/privacy"
              className="text-gray-600 hover:text-blue-600 text-sm"
            >
              Правила сервиса
            </Link>

            <p className="mt-4">
              &copy; {new Date().getFullYear()} AdTech Platform. Все права
              защищены.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
