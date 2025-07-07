"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MedicosPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const coursesData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setCourses(coursesData);
            } catch (err) {
                setError("Error cargando los cursos");
            }
        };

        fetchCourses();
    }, []);

    if (loading) return <p className="text-center">Cargando...</p>;
    if (!user) return null;

    return (
        <div className="min-h-screen p-10 bg-gray-100">
            <h1 className="text-3xl font-bold mb-6">Biotech Charlas</h1>

            {error && <p className="text-red-500">{error}</p>}

            {user?.isAdmin && (
                <div className="mb-6">
                    <Link
                        href="/admin"
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        Ir al Panel de Administración
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <Link key={course.id} href={`/medicos/${course.id}`} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer">
                        <h2 className="text-xl font-semibold">{course.title}</h2>
                        <p className="text-gray-600">{course.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
