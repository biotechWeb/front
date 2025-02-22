"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Image from "next/image";

export default function Navbar() {
    const { user } = useAuth();
    console.log(user)
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/"); // Redirigir al home después de cerrar sesión
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold text-gray-900">
                            <Image src={'/images/logo.png'} alt='Logo Biotech' width={200}
                                   height={80}
                                   className="w-full h-[60px] object-cover"
                                   />
                        </Link>
                    </div>

                    {/* Menú principal */}
                    <div className="hidden md:flex space-x-6 items-center">
                        <Link href="/" className="text-gray-700 hover:text-gray-900">
                            Inicio
                        </Link>
                        <Link href="/contacto" className="text-gray-700 hover:text-gray-900">
                            Contacto
                        </Link>
                        <Link href="/nosotros" className="text-gray-700 hover:text-gray-900">
                            Nosotros
                        </Link>

                        {/* Si el usuario está autenticado, mostrar nombre y logout */}
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-gray-700 font-semibold">{user.firstName}</span>
                                <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                                    Cerrar Sesión
                                </button>
                            </div>
                        ) : (
                            /* Si no está autenticado, mostrar botón Zona Médicos */
                            <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                                Zona Médicos
                            </Link>
                        )}
                    </div>

                    {/* Botón Menú Mobile */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 focus:outline-none">
                            {isOpen ? "✖" : "☰"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Menú Mobile */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-200">
                    <div className="px-2 pt-2 pb-3 space-y-2">
                        <Link href="/" className="block text-gray-700 py-2 hover:text-gray-900">
                            Inicio
                        </Link>
                        <Link href="/contacto" className="block text-gray-700 py-2 hover:text-gray-900">
                            Contacto
                        </Link>
                        <Link href="/nosotros" className="block text-gray-700 py-2 hover:text-gray-900">
                            Nosotros
                        </Link>

                        {/* Si está autenticado, mostrar logout en móvil */}
                        {user ? (
                            <div className="mt-4">
                                <p className="text-center text-gray-700 font-semibold">{user.firstName}</p>
                                <button
                                    onClick={handleLogout}
                                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition mt-2"
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        ) : (
                            /* Si no está autenticado, mostrar botón Zona Médicos en móvil */
                            <Link href="/login" className="block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                                Zona Médicos
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
