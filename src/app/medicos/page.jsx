"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MedicosPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [courses, setCourses] = useState([]);
    console.log(courses)
    const [error, setError] = useState("");

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "courses"));
                const coursesData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setCourses(coursesData.reverse());
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
