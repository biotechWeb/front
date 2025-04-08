"use client";
import { useState } from "react";
import { auth, db } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Autenticar usuario en Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
            const user = userCredential.user;

            // Obtener datos del usuario en Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists() || !userDoc.data().approved) {
                throw new Error("Tu cuenta aún no ha sido aprobada.");
            }

            alert("Inicio de sesión exitoso.");
            router.push("/"); // Redirigir al dashboard
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#165185] via-[#389AD0] to-[#165185]">
            <div className="w-full my-[24px] max-w-[95%] md:max-w-[50%] bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden p-10">
                <h2 className="text-4xl font-extrabold text-center text-white">Iniciar Sesión</h2>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <input
                        type="email"
                        name="email"
                        placeholder="Correo Electrónico"
                        className="input"
                        onChange={handleChange}
                        required
                    />

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Contraseña"
                            className="input pr-10"
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-3 text-gray-500"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeSlashIcon className="h-6 w-6"/> : <EyeIcon className="h-6 w-6"/>}
                        </button>
                    </div>

                    <div className="flex justify-center mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-[250px] md:w-[400px] bg-green-600 text-white p-3 rounded-xl hover:bg-green-400 transition text-lg font-semibold"
                        >
                            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                        </button>
                    </div>
                    <p className="text-sm text-center text-blue-200 mt-4">
                        <a href="/recuperacion" className="hover:underline">¿Olvidaste tu contraseña?</a>
                    </p>
                </form>

                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => router.push("/registro")}
                        className="w-[250px] md:w-[400px] bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-700 transition text-lg font-semibold"
                    >
                        Registrarse
                    </button>
                </div>
            </div>
        </div>
    );
}
