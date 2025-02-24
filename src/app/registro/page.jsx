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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (name === "confirmPassword" || name === "password") {
            setPasswordMatch(form.password === (name === "confirmPassword" ? value : form.confirmPassword));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!passwordMatch) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
            const user = userCredential.user;

            // 🔹 Guardar todos los datos en Firestore
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
                approved: false, // 🔹 Sigue pendiente de aprobación
                createdAt: new Date().toISOString(),
                howDidYouKnow: form.howDidYouKnow, // 🔹 Nuevo campo
                isHealthProfessional: form.isHealthProfessional, // 🔹 Nuevo campo
            });

            alert("Registro exitoso. Espera aprobación del administrador.");
            router.push("/login");
        } catch (error) {
            setError(error.message);
        }
    };


    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#165185] via-[#389AD0] to-[#165185]">
            <div
                className="w-full my-[24px] max-w-[95%] md:max-w-[50%] bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row p-6 lg:p-12">
                {/* Sección Derecha: Formulario */}
                <div className="w-full lg:w-[100%] px-8 lg:px-12 py-10">
                    <h2 className="text-4xl font-extrabold text-center text-white">Crear Cuenta</h2>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <input type="text" name="firstName" placeholder="Nombre" className="input"
                                   onChange={handleChange} required/>
                            <input type="text" name="lastName" placeholder="Apellido" className="input"
                                   onChange={handleChange} required/>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <select name="documentType" className="input" onChange={handleChange}>
                                <option>Cédula de ciudadanía</option>
                                <option>Cédula de extranjería</option>
                                <option>Pasaporte</option>
                            </select>
                            <input type="text" name="documentNumber" placeholder="Número de documento" className="input"
                                   onChange={handleChange} required/>
                        </div>

                        <input type="text" name="phone" placeholder="Número de teléfono" className="input"
                               onChange={handleChange} required/>

                        <input type="email" name="email" placeholder="Correo Electronico" className="input"
                               onChange={handleChange} required/>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <select name="country" className="input" onChange={handleChange}>
                                {paises.map((pais) => (
                                    <option key={pais}>{pais}</option>
                                ))}
                            </select>
                            <input type="text" name="department" placeholder="Departamento" className="input"
                                   onChange={handleChange} required/>
                        </div>

                        <input type="text" name="city" placeholder="Ciudad" className="input" onChange={handleChange}
                               required/>
                        <input type="text" name="address" placeholder="Dirección" className="input"
                               onChange={handleChange} required/>

                        <select name="specialty" className="input" onChange={handleChange}>
                            {especialidades.map((esp) => (
                                <option key={esp}>{esp}</option>
                            ))}
                        </select>
                        <input type="text" name="professionalCard" placeholder="No. de Tarjeta Profesional"
                               className="input" onChange={handleChange} required/>

                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} name="password" placeholder="Contraseña"
                                   className="input pr-10" onChange={handleChange} required/>
                            <button type="button" className="absolute right-3 top-3 text-gray-500"
                                    onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeSlashIcon className="h-6 w-6"/> : <EyeIcon className="h-6 w-6"/>}
                            </button>
                        </div>

                        <div className="relative">
                            <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword"
                                   placeholder="Confirmar Contraseña"
                                   className={`input pr-10 ${!passwordMatch ? "border-red-500" : ""}`}
                                   onChange={handleChange} required/>
                            <button type="button" className="absolute right-3 top-3 text-gray-500"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeSlashIcon className="h-6 w-6"/> :
                                    <EyeIcon className="h-6 w-6"/>}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-white">
                            ¿Como se entero de BiotechPharma?
                            <select name="howDidYouKnow" className="input text-black" onChange={handleChange}>
                                <option>Visita médica</option>
                                <option>Redes Sociales</option>
                                <option>Colega</option>
                                <option>Otro</option>
                            </select>
                        </div>
                        <ModalPoliticaDatos isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <input type="checkbox" name="isHealthProfessional" onChange={handleChange} required
                                       className="mr-2"/>
                                <label className="text-white text-sm">Acepto que soy profesional de la salud</label>
                            </div>

                            <div className="flex items-center">
                                <input type="checkbox" name="acceptTerms" onChange={handleChange} required
                                       className="mr-2"/>
                                <label className="text-white text-sm">
                                    Declaro que he leído y autorizo el tratamiento de mis datos personales de acuerdo a
                                    la
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
                            <button type="submit"
                                    className="w-[250px] md:w-[400px] bg-green-600 text-white p-3 rounded-xl hover:bg-green-400 transition text-lg font-semibold">
                                Registrarse
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
