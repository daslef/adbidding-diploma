import React from "react";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-10">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ЭрикTech
            </h3>
            <p className="text-gray-600">
              Платформа для электронных аукционов нового поколения.
            </p>
            <p className="mt-4">
              &copy; {new Date().getFullYear()} AdTech Platform. Все права
              защищены.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">Навигация</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/marketplace"
                  className="text-gray-600 hover:text-blue-600"
                >
                  Аукционы
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-blue-600"
                >
                  Дэшборд
                </Link>
              </li>
              <li>
                <Link
                  href="/analytics"
                  className="text-gray-600 hover:text-blue-600"
                >
                  Аналитика
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
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
          </div>
        </div>
      </div>
    </footer>
  );
};
