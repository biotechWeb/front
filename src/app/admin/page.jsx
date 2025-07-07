"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { EyeIcon, TrashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function AdminPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [showOnlyUnapproved, setShowOnlyUnapproved] = useState(false);
    const [approvalStatus, setApprovalStatus] = useState("all"); // "all", "approved", "unapproved"
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // Toast state and function
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type }), 3000);
    };

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
            applyFilters(usersData, search, showOnlyUnapproved, approvalStatus, dateFrom, dateTo);
        } catch (err) {
            setError("Error cargando usuarios.");
        }
    };

    const toggleApproval = async (userId, currentStatus) => {
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, { approved: !currentStatus });
            fetchUsers();
            if (currentStatus) {
                // Desaprobado
                showToast("Usuario desaprobado.", "error");
            } else {
                // Aprobado
                showToast("Usuario aprobado.", "success");
            }
        } catch (err) {
            showToast("Error actualizando el estado de aprobación.", "error");
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        applyFilters(users, value, showOnlyUnapproved, approvalStatus, dateFrom, dateTo);
    };

    const applyFilters = (
        data,
        searchValue,
        onlyUnapproved,
        approvalStatusValue = approvalStatus,
        dateFromValue = dateFrom,
        dateToValue = dateTo
    ) => {
        let filtered = data;

        if (searchValue) {
            filtered = filtered.filter((u) =>
                u.documentNumber?.toLowerCase().includes(searchValue.toLowerCase())
            );
        }

        // Estado de aprobación
        if (approvalStatusValue === "approved") {
            filtered = filtered.filter((u) => u.approved);
        } else if (approvalStatusValue === "unapproved") {
            filtered = filtered.filter((u) => !u.approved);
        }

        // Filtro por fecha
        if (dateFromValue) {
            filtered = filtered.filter((u) => u.createdAt && new Date(u.createdAt) >= new Date(dateFromValue));
        }
        if (dateToValue) {
            filtered = filtered.filter((u) => u.createdAt && new Date(u.createdAt) <= new Date(dateToValue));
        }

        // Filtro legacy (solo no aprobados)
        if (onlyUnapproved) {
            filtered = filtered.filter((u) => !u.approved);
        }

        setFilteredUsers(filtered);
    };

    useEffect(() => {
        applyFilters(users, search, showOnlyUnapproved, approvalStatus, dateFrom, dateTo);
    }, [showOnlyUnapproved, approvalStatus, dateFrom, dateTo]);

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
            howDidYouKnow: "¿Cómo se enteró?",
            isHealthProfessional: "Profesional de la salud",
            uid: "UID"
        };
        return translations[key] || key;
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.")) return;
        try {
            await deleteDoc(doc(db, "users", userId));
            fetchUsers();
            showToast("Usuario eliminado correctamente.", "success");
        } catch (err) {
            showToast("Error eliminando el usuario.", "error");
        }
    };

    const exportToCSV = () => {
        if (!filteredUsers.length) {
            showToast("No hay usuarios para exportar.", "error");
            return;
        }

        // Define los campos que quieres exportar y su orden
        const fields = [
            { key: "firstName", label: "Nombre" },
            { key: "lastName", label: "Apellido" },
            { key: "documentNumber", label: "Documento" },
            { key: "professionalCard", label: "Tarjeta Profesional" },
            { key: "createdAt", label: "Fecha de creación" },
            { key: "approved", label: "Aprobado" },
            { key: "email", label: "Correo electrónico" }
            // Agrega más campos si lo deseas
        ];

        // Encabezados
        const header = fields.map(f => f.label).join(",") + "\n";

        // Filas
        const rows = filteredUsers.map(user =>
            fields.map(f => {
                let value = user[f.key];
                if (f.key === "createdAt" && value) {
                    value = new Date(value).toLocaleString();
                }
                if (f.key === "approved") {
                    value = value ? "Sí" : "No";
                }
                // Escapa comillas y comas
                if (typeof value === "string") {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
                return value ?? "";
            }).join(",")
        ).join("\n");

        // Crea el archivo y dispara la descarga
        const csvContent = header + rows;
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "usuarios.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast("Usuarios exportados correctamente.", "success");
    };

    // Handlers para los nuevos filtros
    const handleApprovalStatusChange = (e) => {
        setApprovalStatus(e.target.value);
        applyFilters(users, search, showOnlyUnapproved, e.target.value, dateFrom, dateTo);
    };

    const handleDateFromChange = (e) => {
        setDateFrom(e.target.value);
        applyFilters(users, search, showOnlyUnapproved, approvalStatus, e.target.value, dateTo);
    };

    const handleDateToChange = (e) => {
        setDateTo(e.target.value);
        applyFilters(users, search, showOnlyUnapproved, approvalStatus, dateFrom, e.target.value);
    };

    if (loading) return <p className="text-center">Cargando...</p>;

    return (
        <div className="min-h-screen p-10 bg-gray-50">
            <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
            {error && <p className="text-red-500">{error}</p>}
            {user?.role === "admin" && (
                <div className="flex justify-end mb-4">
                    <a
                        href="/admin/cursos"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                    >
                        Ir a Admin Cursos
                    </a>
                </div>
            )}
            <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-4 items-end">
                <input
                    type="text"
                    placeholder="Buscar por número de documento"
                    value={search}
                    onChange={handleSearch}
                    className="p-2 border border-gray-300 rounded w-full max-w-xs"
                />
                <label className="flex flex-col text-sm">
                    Estado
                    <select
                        value={approvalStatus}
                        onChange={handleApprovalStatusChange}
                        className="p-2 border border-gray-300 rounded"
                    >
                        <option value="all">Todos</option>
                        <option value="approved">Aprobados</option>
                        <option value="unapproved">No aprobados</option>
                    </select>
                </label>
                <label className="flex flex-col text-sm">
                    Desde
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={handleDateFromChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                </label>
                <label className="flex flex-col text-sm">
                    Hasta
                    <input
                        type="date"
                        value={dateTo}
                        onChange={handleDateToChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                </label>
            </div>
            {toast.show && (
                <div className={`mb-4 px-4 py-2 rounded shadow-lg text-white font-semibold text-center transition
                    ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
                    {toast.message}
                </div>
            )}
            <div className="flex justify-end mb-2">
                <button
                    onClick={exportToCSV}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                    Exportar CSV
                </button>
            </div>
            <table className="w-full bg-white shadow-md rounded-xl overflow-hidden">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="py-2 px-4 text-left">Nombre</th>
                        <th className="py-2 px-4 text-left">Documento</th>
                        <th className="py-2 px-4 text-left">Tarjeta Profesional</th>
                        <th className="py-2 px-4 text-left">Fecha de creación</th>
                        <th className="py-2 px-4 text-left">Aprobado</th>
                        <th className="py-2 px-4 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map((u) => (
                        <tr key={u.id} className="border-b hover:bg-gray-50 transition">
                            <td className="py-2 px-4">{u.firstName} {u.lastName}</td>
                            <td className="py-2 px-4">{u.documentNumber}</td>
                            <td className="py-2 px-4">{u.professionalCard}</td>
                            <td className="py-2 px-4 text-sm text-gray-500">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                            </td>
                            <td className="py-2 px-4">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${u.approved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                    {u.approved ? "Sí" : "No"}
                                </span>
                            </td>
                            <td className="py-2 px-4 flex items-center gap-2">
                                <button
                                    onClick={() => setSelectedUser(u)}
                                    className="text-blue-600 hover:text-blue-800 p-1 rounded transition"
                                    title="Ver detalles"
                                >
                                    <EyeIcon className="h-5 w-5" />
                                </button>
                                <button
                                    className={`p-1 rounded transition ${u.approved ? "bg-red-100 hover:bg-red-200 text-red-600" : "bg-green-100 hover:bg-green-200 text-green-600"}`}
                                    onClick={() => toggleApproval(u.id, u.approved)}
                                    title={u.approved ? "Desaprobar" : "Aprobar"}
                                >
                                    {u.approved ? <XMarkIcon className="h-5 w-5" /> : <CheckIcon className="h-5 w-5" />}
                                </button>
                                <button
                                    className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                                    onClick={() => handleDeleteUser(u.id)}
                                    title="Eliminar usuario"
                                >
                                    <TrashIcon className="h-5 w-5" />
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