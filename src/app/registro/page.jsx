"use client";
import { useState } from "react";
import { auth, db } from "../../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import ModalPoliticaDatos from "@/components/politicaDatos";

const especialidades = [
    "Algología",
    "Anatomía patológica",
    "Anestesiología",
    "Angiología",
    "Antropología médica",
    "Bioética",
    "Biomedicina",
    "Bioquímica clínica",
    "Biotech pharma",
    "Cardiología",
    "Ciencias de la nutrición",
    "Ciencias forenses",
    "Cirugía",
    "Cirugía general y del aparato digestivo",
    "Cirugía maxilofacial",
    "Cirugía plástica",
    "Cirugía torácica",
    "Dermatología",
    "Dietética",
    "Embriología",
    "Endocrinología",
    "Enfermedades infecciosas",
    "Epidemiología",
    "Farmacología",
    "Farmacología clínica",
    "Fisiatría",
    "Física médica",
    "Fisioterapia",
    "Fitoterapia",
    "Fonoaudiología",
    "Gastroenterología",
    "Geriatría",
    "Gerontología",
    "Hematología",
    "Hepatología",
    "Homeopatía",
    "Infectología",
    "Inmunología",
    "Medicina aeronáutica",
    "Medicina alternativa",
    "Medicina biorreguladora de sistemas",
    "Medicina del trabajo",
    "Medicina deportiva",
    "Medicina estética",
    "Medicina familiar y comunitaria",
    "Medicina forense",
    "Medicina general",
    "Medicina intensiva",
    "Medicina interna",
    "Medicina nuclear",
    "Medicina paliativa",
    "Medicina preventiva",
    "Medicina traslacional",
    "Médico veterinario",
    "Nefrología",
    "Neumología",
    "Neurología",
    "Obstetricia",
    "Obstetricia y ginecología",
    "Odontología",
    "Oftalmología",
    "Oncología",
    "Optometría",
    "Ortopedia",
    "Otorrinolaringología",
    "Parasitología",
    "Pediatría",
    "Podología",
    "Psiquiatría",
    "Radiología",
    "Reumatología",
    "Rinología",
    "Terapia ocupacional",
    "Toxicología",
    "Traumatología",
    "Urgencias médicas",
    "Urología",
    "Otra",
];
const paises = ["Colombia", "México", "Argentina", "España", "Chile", "Perú", "Ecuador", "Otro"];

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        documentType: "Cédula de ciudadanía",
        documentNumber: "",
        phone: "",
        country: "Colombia",
        department: "",
        city: "",
        address: "",
        specialty: "Medicina General",
        professionalCard: "",
        email: "",
        password: "",
        confirmPassword: "",
        howDidYouKnow:"",
        isHealthProfessional: false,
        acceptTerms: false,
    });

    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Validación en tiempo real
    const validateField = (name, value) => {
        let msg = "";
        if (!value && name !== "howDidYouKnow") msg = "Este campo es obligatorio.";
        if (name === "email" && value && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) msg = "Correo inválido.";
        if (name === "password" && value && value.length < 6) msg = "Mínimo 6 caracteres.";
        if (name === "confirmPassword" && value && value !== form.password) msg = "Las contraseñas no coinciden.";
        return msg;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Validación en tiempo real
        setFieldErrors((prev) => ({
            ...prev,
            [name]: validateField(name, type === "checkbox" ? checked : value),
        }));

        if (name === "confirmPassword" || name === "password") {
            setPasswordMatch(
                name === "confirmPassword"
                    ? form.password === value
                    : value === form.confirmPassword
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        // Validación de todos los campos
        const newFieldErrors = {};
        Object.entries(form).forEach(([name, value]) => {
            const msg = validateField(name, value);
            if (msg) newFieldErrors[name] = msg;
        });
        setFieldErrors(newFieldErrors);
        if (Object.keys(newFieldErrors).length > 0) {
            setError("Por favor corrige los errores antes de continuar.");
            return;
        }

        if (!passwordMatch) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setSubmitting(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                firstName: form.firstName,
                lastName: form.lastName,
                documentType: form.documentType,
                documentNumber: form.documentNumber,
                phone: form.phone,
                country: form.country,
                department: form.department,
                city: form.city,
                address: form.address,
                specialty: form.specialty,
                professionalCard: form.professionalCard,
                email: form.email,
                approved: false,
                createdAt: new Date().toISOString(),
                howDidYouKnow: form.howDidYouKnow,
                isHealthProfessional: form.isHealthProfessional,
            });

            setSuccess(true);
            setTimeout(() => router.push("/login"), 2000);
        } catch (error) {
            setError(error.message);
        }
        setSubmitting(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#165185] via-[#389AD0] to-[#165185]">
            <div className="w-full my-[24px] max-w-[95%] md:max-w-[50%] bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row p-6 lg:p-12">
                <div className="w-full lg:w-[100%] px-8 lg:px-12 py-10">
                    <h2 className="text-4xl font-extrabold text-center text-white mb-6">Crear Cuenta</h2>
                    {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
                    {success && (
                        <div className="mb-4 px-4 py-2 rounded shadow-lg text-white font-semibold text-center bg-green-600">
                            Registro exitoso. Espera aprobación del administrador.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        {/* Agrupación visual */}
                        <div className="mb-2">
                            <h3 className="text-lg font-semibold text-white mb-2">Datos personales</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white mb-1">Nombre</label>
                                    <input type="text" name="firstName" className={`input ${fieldErrors.firstName ? "border-red-500" : ""}`}
                                        value={form.firstName} onChange={handleChange} required />
                                    {fieldErrors.firstName && <span className="text-red-500 text-xs">{fieldErrors.firstName}</span>}
                                </div>
                                <div>
                                    <label className="block text-white mb-1">Apellido</label>
                                    <input type="text" name="lastName" className={`input ${fieldErrors.lastName ? "border-red-500" : ""}`}
                                        value={form.lastName} onChange={handleChange} required />
                                    {fieldErrors.lastName && <span className="text-red-500 text-xs">{fieldErrors.lastName}</span>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
                                <div>
                                    <label className="block text-white mb-1">Tipo de documento</label>
                                    <select name="documentType" className="input" value={form.documentType} onChange={handleChange}>
                                        <option>Cédula de ciudadanía</option>
                                        <option>Cédula de extranjería</option>
                                        <option>Pasaporte</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white mb-1">Número de documento</label>
                                    <input type="text" name="documentNumber" className={`input ${fieldErrors.documentNumber ? "border-red-500" : ""}`}
                                        value={form.documentNumber} onChange={handleChange} required />
                                    {fieldErrors.documentNumber && <span className="text-red-500 text-xs">{fieldErrors.documentNumber}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="mb-2">
                            <h3 className="text-lg font-semibold text-white mb-2">Datos de contacto</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white mb-1">Teléfono</label>
                                    <input type="text" name="phone" className={`input ${fieldErrors.phone ? "border-red-500" : ""}`}
                                        value={form.phone} onChange={handleChange} required />
                                    {fieldErrors.phone && <span className="text-red-500 text-xs">{fieldErrors.phone}</span>}
                                </div>
                                <div>
                                    <label className="block text-white mb-1">Correo electrónico</label>
                                    <input type="email" name="email" className={`input ${fieldErrors.email ? "border-red-500" : ""}`}
                                        value={form.email} onChange={handleChange} required />
                                    {fieldErrors.email && <span className="text-red-500 text-xs">{fieldErrors.email}</span>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
                                <div>
                                    <label className="block text-white mb-1">País</label>
                                    <select name="country" className="input" value={form.country} onChange={handleChange}>
                                        {paises.map((pais) => (
                                            <option key={pais}>{pais}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white mb-1">Departamento</label>
                                    <input type="text" name="department" className={`input ${fieldErrors.department ? "border-red-500" : ""}`}
                                        value={form.department} onChange={handleChange} required />
                                    {fieldErrors.department && <span className="text-red-500 text-xs">{fieldErrors.department}</span>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
                                <div>
                                    <label className="block text-white mb-1">Ciudad</label>
                                    <input type="text" name="city" className={`input ${fieldErrors.city ? "border-red-500" : ""}`}
                                        value={form.city} onChange={handleChange} required />
                                    {fieldErrors.city && <span className="text-red-500 text-xs">{fieldErrors.city}</span>}
                                </div>
                                <div>
                                    <label className="block text-white mb-1">Dirección</label>
                                    <input type="text" name="address" className={`input ${fieldErrors.address ? "border-red-500" : ""}`}
                                        value={form.address} onChange={handleChange} required />
                                    {fieldErrors.address && <span className="text-red-500 text-xs">{fieldErrors.address}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="mb-2">
                            <h3 className="text-lg font-semibold text-white mb-2">Datos profesionales</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white mb-1">Especialidad</label>
                                    <select name="specialty" className="input" value={form.specialty} onChange={handleChange}>
                                        {especialidades.map((esp) => (
                                            <option key={esp}>{esp}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white mb-1">No. de Tarjeta Profesional</label>
                                    <input type="text" name="professionalCard" className={`input ${fieldErrors.professionalCard ? "border-red-500" : ""}`}
                                        value={form.professionalCard} onChange={handleChange} required />
                                    {fieldErrors.professionalCard && <span className="text-red-500 text-xs">{fieldErrors.professionalCard}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="mb-2">
                            <h3 className="text-lg font-semibold text-white mb-2">Seguridad</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-white mb-1">Contraseña</label>
                                    <input type={showPassword ? "text" : "password"} name="password"
                                        className={`input pr-10 ${fieldErrors.password ? "border-red-500" : ""}`}
                                        value={form.password} onChange={handleChange} required />
                                    <button type="button" className="absolute right-3 top-[2.5rem] text-gray-500"
                                        onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeSlashIcon className="h-6 w-6 my-auto" /> : <EyeIcon className="h-6 w-6 my-auto" />}
                                    </button>
                                    {fieldErrors.password && <span className="text-red-500 text-xs">{fieldErrors.password}</span>}
                                </div>
                                <div className="relative">
                                    <label className="block text-white mb-1">Confirmar Contraseña</label>
                                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword"
                                        className={`input pr-10 ${!passwordMatch || fieldErrors.confirmPassword ? "border-red-500" : ""}`}
                                        value={form.confirmPassword} onChange={handleChange} required />
                                    <button type="button" className="absolute right-3 top-[2.5rem]  text-gray-500"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <EyeSlashIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
                                    </button>
                                    {(!passwordMatch || fieldErrors.confirmPassword) && <span className="text-red-500 text-xs">{fieldErrors.confirmPassword || "Las contraseñas no coinciden."}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="mb-2">
                            <h3 className="text-lg font-semibold text-white mb-2">Información adicional</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-white">
                                <label className="block mb-1">¿Cómo se enteró de BiotechPharma?</label>
                                <select name="howDidYouKnow" className="input text-black" value={form.howDidYouKnow} onChange={handleChange}>
                                    <option value="">Seleccione una opción</option>
                                    <option>Visita médica</option>
                                    <option>Redes Sociales</option>
                                    <option>Colega</option>
                                    <option>Otro</option>
                                </select>
                            </div>
                        </div>

                        <ModalPoliticaDatos isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <input type="checkbox" name="isHealthProfessional" onChange={handleChange} required
                                    className="mr-2" checked={form.isHealthProfessional} />
                                <label className="text-white text-sm">Acepto que soy profesional de la salud</label>
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" name="acceptTerms" onChange={handleChange} required
                                    className="mr-2" checked={form.acceptTerms} />
                                <label className="text-white text-sm">
                                    Declaro que he leído y autorizo el tratamiento de mis datos personales de acuerdo a la
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(true)}
                                        className="text-green-400 hover:text-green-200 underline ml-1"
                                    >
                                        Política de Protección de Datos Personales.
                                    </button>
                                </label>
                            </div>
                        </div>
                        <div className='flex justify-center'>
                            <button
                                type="submit"
                                className="w-[250px] md:w-[400px] bg-green-600 text-white p-3 rounded-xl hover:bg-green-400 transition text-lg font-semibold"
                                disabled={submitting}
                            >
                                {submitting ? "Registrando..." : "Registrarse"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
