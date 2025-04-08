"use client";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
    const { user } = useAuth();

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center text-center">
            {/* Imagen de fondo */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://firebasestorage.googleapis.com/v0/b/biotech-561f7.firebasestorage.app/o/assets%2Fhero.jpg?alt=media&token=dcab12c7-a76b-4f63-b99f-2d191b4760ac"
                    alt="Hero"
                    className="w-full h-full object-cover"
                />
                {/* Overlay oscuro sutil */}
                <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* Contenido encima de la imagen */}
            <div className="relative z-10 px-6 text-white">
                <h1 className="text-4xl md:text-8xl font-extrabold mb-4 drop-shadow-lg">
                    Bienvenido a Biotech Pharma
                </h1>
                <p className="text-lg md:text-3xl max-w-2xl mx-auto mb-8 drop-shadow">
                    Salud que conecta, calidad que inspira.
                </p>

                {user && (
                    <a
                        href="/medicos"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Acceder a Zona Médicos
                    </a>
                )}
            </div>
        </div>
    );
}
