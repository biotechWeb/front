"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export default function AdminCursosPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [materialFiles, setMaterialFiles] = useState([]);
    const [videos, setVideos] = useState([""]);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [submitting, setSubmitting] = useState(false);
    const [courses, setCourses] = useState([]);
    const [editingCourse, setEditingCourse] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [editFiles, setEditFiles] = useState([]);
    const [removingFiles, setRemovingFiles] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);

    // Redirect if not admin
    if (!loading && (!user || user.role !== "admin")) {
        if (typeof window !== "undefined") router.push("/");
        return null;
    }

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type }), 3000);
    };

    const handleVideoChange = (idx, value) => {
        const arr = [...videos];
        arr[idx] = value;
        setVideos(arr);
    };

    const addVideoInput = () => setVideos([...videos, ""]);
    const removeVideoInput = (idx) => setVideos(videos.filter((_, i) => i !== idx));

    const handleMaterialFilesChange = (e) => {
        setMaterialFiles(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            showToast("Título y descripción son obligatorios.", "error");
            return;
        }
        setSubmitting(true);

        try {
            // 1. Subir archivos a Storage
            const storage = getStorage();
            const folderName = title.trim().replace(/\s+/g, "").toLowerCase(); // ej: "sesion8"
            let materialMedicoUrls = [];

            for (const file of materialFiles) {
                const storageRef = ref(storage, `${folderName}/${file.name}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                materialMedicoUrls.push(url);
            }

            // 2. Guardar el curso en Firestore
            const courseData = {
                title: title.trim(),
                description: description.trim(),
                materialMedico: materialMedicoUrls,
                videos: videos.filter((v) => v.trim() !== ""),
            };
            console.log("Guardando en Firestore:", courseData);

            await addDoc(collection(db, "courses"), courseData);

            setTitle("");
            setDescription("");
            setMaterialFiles([]);
            setVideos([""]);
            showToast("Curso agregado correctamente.", "success");
        } catch (err) {
            console.error("Error al agregar el curso:", err);
            if (err.code) {
                showToast(`Error: ${err.code} - ${err.message}`, "error");
            } else {
                showToast("Error desconocido al agregar el curso.", "error");
            }
        }
        setSubmitting(false);
    };

    // Cargar cursos al montar
    useEffect(() => {
        const fetchCourses = async () => {
            const q = collection(db, "courses");
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setCourses(data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
        };
        fetchCourses();
    }, []);

    // Abrir modal de edición
    const openEditModal = (course) => {
        setEditingCourse(course);
        setEditForm({
            title: course.title,
            description: course.description,
            videos: [...(course.videos || [])],
            materialMedico: [...(course.materialMedico || [])],
        });
        setEditFiles([]);
        setRemovingFiles([]);
    };

    // Cerrar modal
    const closeEditModal = () => {
        setEditingCourse(null);
        setEditForm(null);
        setEditFiles([]);
        setRemovingFiles([]);
    };

    // Eliminar archivo de material médico (solo del array, no de Storage aún)
    const handleRemoveMaterial = (url) => {
        setEditForm((prev) => ({
            ...prev,
            materialMedico: prev.materialMedico.filter((m) => m !== url),
        }));
        setRemovingFiles((prev) => [...prev, url]);
    };

    // Agregar nuevo archivo a subir
    const handleEditFilesChange = (e) => {
        setEditFiles(Array.from(e.target.files));
    };

    // Editar videos
    const handleEditVideoChange = (idx, value) => {
        setEditForm((prev) => {
            const arr = [...prev.videos];
            arr[idx] = value;
            return { ...prev, videos: arr };
        });
    };
    const addEditVideoInput = () => setEditForm((prev) => ({ ...prev, videos: [...prev.videos, ""] }));
    const removeEditVideoInput = (idx) => setEditForm((prev) => ({
        ...prev,
        videos: prev.videos.filter((_, i) => i !== idx),
    }));

    // Guardar cambios
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editForm.title.trim() || !editForm.description.trim()) {
            showToast("Título y descripción son obligatorios.", "error");
            return;
        }
        setSubmitting(true);
        try {
            // 1. Eliminar archivos de Storage si corresponde
            const storage = getStorage();
            for (const url of removingFiles) {
                const path = decodeURIComponent(url.split("/o/")[1].split("?")[0]);
                await deleteObject(ref(storage, path));
            }

            // 2. Subir nuevos archivos
            let newMaterialUrls = [];
            for (const file of editFiles) {
                const folderName = editForm.title.trim().replace(/\s+/g, "").toLowerCase();
                const storageRef = ref(storage, `${folderName}/${file.name}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                newMaterialUrls.push(url);
            }

            // 3. Actualizar Firestore
            const updatedMaterial = [...editForm.materialMedico, ...newMaterialUrls];
            await updateDoc(doc(db, "courses", editingCourse.id), {
                title: editForm.title.trim(),
                description: editForm.description.trim(),
                videos: editForm.videos.map((v) => v.trim()).filter((v) => v),
                materialMedico: updatedMaterial,
            });

            showToast("Curso actualizado correctamente.", "success");
            closeEditModal();
            // Refresca la lista
            const q = collection(db, "courses");
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setCourses(data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
        } catch (err) {
            showToast("Error al actualizar el curso.", "error");
            console.error(err);
        }
        setSubmitting(false);
    };

    if (loading) return <p className="text-center">Cargando...</p>;

    return (
        <div className="min-h-screen p-10 bg-gray-50">
            <h1 className="text-3xl font-bold mb-6">Panel de Administración de Cursos</h1>
            {toast.show && (
                <div className={`mb-4 px-4 py-2 rounded shadow-lg text-white font-semibold text-center transition
                    ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
                    {toast.message}
                </div>
            )}

            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setShowAddForm((prev) => !prev)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                    {showAddForm ? "Cancelar" : "+ Agregar curso"}
                </button>
            </div>

            {showAddForm && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-xl shadow-md p-8 max-w-2xl mx-auto flex flex-col gap-6 mb-8"
                >
                    <div>
                        <label className="block font-semibold mb-1">Título (ej: sesion8)</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                            rows={3}
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Material Médico (sube uno o varios archivos PDF, etc.)</label>
                        <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.png"
                            onChange={handleMaterialFilesChange}
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                        {materialFiles.length > 0 && (
                            <ul className="mt-2 text-sm text-gray-600">
                                {materialFiles.map((file, idx) => (
                                    <li key={idx}>{file.name}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Videos (links YouTube, etc.)</label>
                        {videos.map((v, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={v}
                                    onChange={(e) => handleVideoChange(idx, e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    placeholder="URL del video"
                                />
                                {videos.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeVideoInput(idx)}
                                        className="bg-red-500 text-white px-2 rounded hover:bg-red-700"
                                        title="Eliminar"
                                    >-</button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addVideoInput}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                            + Agregar video
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                        disabled={submitting}
                    >
                        {submitting ? "Agregando..." : "Agregar curso"}
                    </button>
                </form>
            )}

            <h2 className="text-2xl font-bold mb-4">Cursos existentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                    <div key={course.id} className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-2">
                        <div className="font-bold text-lg">{course.title}</div>
                        <div className="text-gray-600">{course.description}</div>
                        <button
                            className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                            onClick={() => openEditModal(course)}
                        >
                            Editar
                        </button>
                    </div>
                ))}
            </div>
            {editingCourse && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full relative">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                            onClick={closeEditModal}
                        >✕</button>
                        <h2 className="text-xl font-bold mb-4">Editar curso</h2>
                        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block font-semibold mb-1">Título</label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Descripción</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded"
                                    rows={3}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Material Médico</label>
                                <ul className="mb-2">
                                    {editForm.materialMedico.map((url, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-sm">
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{url.split("/").pop()}</a>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMaterial(url)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Eliminar archivo"
                                            >Eliminar</button>
                                        </li>
                                    ))}
                                </ul>
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,.jpg,.png"
                                    onChange={handleEditFilesChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                                {editFiles.length > 0 && (
                                    <ul className="mt-2 text-sm text-gray-600">
                                        {editFiles.map((file, idx) => (
                                            <li key={idx}>{file.name}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Videos</label>
                                {editForm.videos.map((v, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={v}
                                            onChange={(e) => handleEditVideoChange(idx, e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded"
                                            placeholder="URL del video"
                                        />
                                        {editForm.videos.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeEditVideoInput(idx)}
                                                className="bg-red-500 text-white px-2 rounded hover:bg-red-700"
                                                title="Eliminar"
                                            >-</button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addEditVideoInput}
                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
                                >
                                    + Agregar video
                                </button>
                            </div>
                            <button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                            >
                                Guardar cambios
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
