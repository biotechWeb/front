// app/recuperar/page.jsx

"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("✅ Revisa tu correo para restablecer tu contraseña.");
        } catch (err) {
            setError("❌ Ocurrió un error. Verifica el correo ingresado.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#165185] via-[#389AD0] to-[#165185]">
            <div className="bg-white/50 backdrop-blur-lg p-10 rounded-3xl shadow-2xl max-w-md w-full">
                <h2 className="text-2xl font-bold text-white text-center mb-4">Recuperar Contraseña</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Correo electrónico"
                        required
                        className="input w-full"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Enviar enlace de recuperación
                    </button>
                    {message && <p className="text-green-200 text-sm text-center">{message}</p>}
                    {message && <a href={'/login'} className="text-white text-lg text-center flex justify-center hover:text-blue-500">Iniciar sesión</a>}
                    {error && <p className="text-red-300 text-sm text-center">{error}</p>}
                </form>
            </div>
        </div>
    );
}
