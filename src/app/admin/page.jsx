// app/admin/page.jsx

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { EyeIcon } from "@heroicons/react/24/outline";

export default function AdminPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if (!loading && (!user || user.role !== "admin")) {
            router.push("/");
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user?.role === "admin") {
            fetchUsers();
        }
    }, [user]);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const usersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setUsers(usersData);
            setFilteredUsers(usersData);
        } catch (err) {
            setError("Error cargando usuarios.");
        }
    };

    const toggleApproval = async (userId, currentStatus) => {
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, { approved: !currentStatus });
            fetchUsers();
        } catch (err) {
            alert("Error actualizando el estado de aprobación.");
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        setFilteredUsers(
            users.filter((u) => u.documentNumber?.toLowerCase().includes(value.toLowerCase()))
        );
    };

    const translateKey = (key) => {
        const translations = {
            firstName: "Nombre",
            lastName: "Apellido",
            documentType: "Tipo de documento",
            documentNumber: "Número de documento",
            phone: "Teléfono",
            country: "País",
            department: "Departamento",
            city: "Ciudad",
            address: "Dirección",
            specialty: "Especialidad",
            professionalCard: "Tarjeta profesional",
            email: "Correo electrónico",
            approved: "Aprobado",
            createdAt: "Fecha de registro",
            howDidYouKnow: "¿Cómo se enteró?",
            isHealthProfessional: "Profesional de la salud",
            uid: "UID"
        };
        return translations[key] || key;
    };

    if (loading) return <p className="text-center">Cargando...</p>;

    return (
        <div className="min-h-screen p-10 bg-gray-50">
            <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>

            {error && <p className="text-red-500">{error}</p>}

            <input
                type="text"
                placeholder="Buscar por número de documento"
                value={search}
                onChange={handleSearch}
                className="mb-4 p-2 border border-gray-300 rounded w-full max-w-md"
            />

            <table className="w-full bg-white shadow-md rounded-xl overflow-hidden">
                <thead className="bg-gray-200">
                <tr>
                    <th className="py-2 px-4 text-left">Nombre</th>
                    <th className="py-2 px-4 text-left">Documento</th>
                    <th className="py-2 px-4 text-left">Tarjeta Profesional</th>
                    <th className="py-2 px-4 text-left">Aprobado</th>
                    <th className="py-2 px-4 text-left">Acciones</th>
                </tr>
                </thead>
                <tbody>
                {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b">
                        <td className="py-2 px-4">{u.firstName} {u.lastName}</td>
                        <td className="py-2 px-4">{u.documentNumber}</td>
                        <td className="py-2 px-4">{u.professionalCard}</td>
                        <td className="py-2 px-4">{u.approved ? "Sí" : "No"}</td>
                        <td className="py-2 px-4 flex items-center gap-2">
                            <button
                                onClick={() => setSelectedUser(u)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Ver detalles"
                            >
                                <EyeIcon className="h-5 w-5" />
                            </button>
                            <button
                                className={`px-3 py-1 rounded text-white ${u.approved ? "bg-red-500" : "bg-green-500"}`}
                                onClick={() => toggleApproval(u.id, u.approved)}
                            >
                                {u.approved ? "Rechazar" : "Aprobar"}
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full">
                        <h2 className="text-2xl font-semibold mb-4">Detalles del Usuario</h2>
                        <ul className="space-y-2">
                            {Object.entries(selectedUser).map(([key, value]) => (
                                <li key={key}>
                                    <strong>{translateKey(key)}:</strong> {String(value)}
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-end mt-6">
                            <button
                                className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-900"
                                onClick={() => setSelectedUser(null)}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
