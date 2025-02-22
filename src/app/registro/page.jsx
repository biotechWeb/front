"use client";
import { useState } from "react";
import { auth, db } from "../../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                approved: false,
                createdAt: new Date().toISOString(),
            });

            alert("Registro exitoso. Espera aprobación del administrador.")
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col lg:flex-row">

                {/* Sección Izquierda: Video (Solo en desktop) */}
                <div className="hidden lg:block lg:w-1/2 relative">
                    <video autoPlay loop muted className="absolute inset-0 w-full h-full object-cover rounded-l-3xl">
                        <source src="/videos/registry2.webm" type="video/mp4" />
                        Tu navegador no soporta videos.
                    </video>
                </div>

                {/* Sección Derecha: Formulario */}
                <div className="w-full lg:w-1/2 p-8">
                    <h2 className="text-3xl font-bold text-center text-gray-800">Crear Cuenta</h2>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <input type="text" name="firstName" placeholder="Nombre" className="input" onChange={handleChange} required />
                        <input type="text" name="lastName" placeholder="Apellido" className="input" onChange={handleChange} required />
                        <input type="email" name="email" placeholder="Correo Electronico" className="input" onChange={handleChange} required />
                        <input type="password" name="password" placeholder="Contraseña" className="input" onChange={handleChange} required />

                        <div className="flex items-center space-x-2">
                            <input type="checkbox" required />
                            <span className="text-sm text-gray-600">Acepto todos los términos y la Política de Privacidad</span>
                        </div>

                        <button type="submit" className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-800 transition">
                            Registrarse
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
