"use client";
import { useState } from "react";
import { auth, db } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-center text-gray-800">Login</h2>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <input type="email" name="email" placeholder="Email" className="input" onChange={handleChange}
                           required/>
                    <input type="password" name="password" placeholder="Password" className="input"
                           onChange={handleChange} required/>

                    <button type="submit" disabled={loading}
                            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-700 transition">
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>
                <button onClick={() => {
                    router.push("/registro");
                }} className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-700 transition mt-5">
                    Registrate
                </button>
            </div>
        </div>
    );
}
