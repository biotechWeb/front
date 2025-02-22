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
                const docSnap = await getDoc(docRef, { source: "cache" }); // 🔥 Intenta leer desde la caché

                if (!docSnap.exists()) {
                    // Si no está en caché, intenta obtenerlo desde el servidor
                    const docSnapServer = await getDoc(docRef, { source: "server" });
                    if (docSnapServer.exists()) {
                        console.log('encuentra cache')
                        setSession(docSnapServer.data());
                    } else {
                        setError("Sesión no encontrada.");
                    }
                } else {
                    setSession(docSnap.data());
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
        <div className="min-h-screen p-10 bg-gray-100">
            {error && <p className="text-red-500">{error}</p>}

            {session && (
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h1 className="text-3xl font-bold">{session.title}</h1>
                    <p className="text-gray-600">{session.description}</p>

                    {/* Sección de Video */}
                    {session.videos && session.videos.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-xl font-semibold">Video de la Sesión</h2>
                            <div className="mt-3">
                                <iframe
                                    width="70%"
                                    height="400"
                                    src={session.videos[0]} // Toma el primer video de la lista
                                    title="Video de la sesión"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    )}

                    {/* Sección de Material Médico */}
                    {session.materialMedico && session.materialMedico.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-xl font-semibold">Material Médico</h2>
                            <ul className="mt-3 space-y-2">
                                {session.materialMedico.map((doc, index) => (
                                    <li key={index}>
                                        <a href={doc} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            📄 Descargar Documento {index + 1}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Sección de Documentos Adicionales */}
                    {session.documentos && (
                        <div className="mt-6">
                            <h2 className="text-xl font-semibold">Documentos Adicionales</h2>
                            <ul className="mt-3 space-y-2">
                                {session.documentos.presentaciones &&
                                    session.documentos.presentaciones.map((doc, index) => (
                                        <li key={index}>
                                            <a href={doc} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                📊 Presentación {index + 1}
                                            </a>
                                        </li>
                                    ))}
                                {session.documentos.invitacion && (
                                    <li>
                                        <a href={session.documentos.invitacion} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            📩 Invitación
                                        </a>
                                    </li>
                                )}
                                {session.documentos.agardecimiento && (
                                    <li>
                                        <a href={session.documentos.agardecimiento} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            🙏 Agradecimiento
                                        </a>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
