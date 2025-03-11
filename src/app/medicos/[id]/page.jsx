"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";

export default function SessionPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const [session, setSession] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (!params.id) return;

        const fetchSession = async () => {
            try {
                const docRef = doc(db, "courses", params.id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setSession(docSnap.data());
                } else {
                    setError("Sesión no encontrada.");
                }
            } catch (err) {
                setError("Error cargando la sesión.");
            }
        };

        fetchSession();
    }, [params.id]);

    if (loading) return <p className="text-center">Cargando...</p>;
    if (!user) return null;

    return (
        <div className="min-h-screen p-10 bg-gray-100 flex flex-col items-center">
            {error && <p className="text-red-500">{error}</p>}

            {session && (
                <div className="w-full max-w-7xl bg-white p-8 rounded-xl shadow-lg">
                    {/* Título */}
                    <h1 className="text-4xl font-bold text-center mb-4 text-gray-800">{session.title}</h1>
                    <p className="text-center text-gray-600 mb-6">{session.description}</p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                        {/* Video de la Sesión */}
                        {session.videos && session.videos.length > 0 && (
                            <div className="w-full">
                                <iframe
                                    className="w-full h-80 rounded-xl shadow-md"
                                    src={`${session.videos[0]}?nocache=${Date.now()}`}
                                    title="Video de la sesión"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        )}

                        {/* Material de Apoyo */}
                        {session.materialMedico && session.materialMedico.length > 0 && (
                            <div className="w-full">
                                <h2 className="text-2xl font-semibold text-gray-700 mb-3">Material de Apoyo 📚</h2>
                                <div className="space-y-4">
                                    {session.materialMedico.map((doc, index) => (
                                        <a
                                            key={index}
                                            href={doc}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block p-4 bg-gray-50 border border-gray-200 rounded-lg shadow hover:bg-gray-100 transition"
                                        >
                                            📄 Documento {index + 1}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
