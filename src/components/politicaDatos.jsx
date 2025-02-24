"use client";
import { useState } from "react";

export default function ModalPoliticaDatos({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-2xl max-h-[80vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Política de Protección de Datos</h2>
                <p className="text-sm text-gray-700">
                    En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013, BIOTECH PHARMA adopta
                    la siguiente Política de Protección de Datos Personales, con el fin de garantizar el tratamiento
                    adecuado de los datos personales de sus clientes, usuarios y colaboradores.
                </p>

                <h3 className="font-semibold mt-4">1. Identificación del Responsable</h3>
                <p className="text-sm text-gray-700">
                    BIOTECH PHARMA S.A.S.<br/>
                </p>

                <h3 className="font-semibold mt-4">2. Finalidad del Tratamiento</h3>
                <p className="text-sm text-gray-700">
                    Los datos personales serán utilizados para:<br/>
                    - Gestionar el acceso a los servicios ofrecidos.<br/>
                    - Realizar comunicaciones comerciales y promocionales.<br/>
                    - Cumplir con obligaciones legales y contractuales.<br/>
                    - Brindar soporte y atención al cliente.
                </p>

                <h3 className="font-semibold mt-4">3. Derechos de los Titulares</h3>
                <p className="text-sm text-gray-700">
                    Los titulares de los datos personales tienen derecho a:<br/>
                    - Conocer, actualizar y rectificar sus datos.<br/>
                    - Ser informados sobre el uso de sus datos.<br/>
                    - Presentar quejas ante la Superintendencia de Industria y Comercio.<br/>
                    - Revocar la autorización y solicitar la eliminación de sus datos.
                </p>

                <h3 className="font-semibold mt-4">4. Contacto</h3>
                <p className="text-sm text-gray-700">
                    Para ejercer sus derechos, puede comunicarse con nosotros.
                </p>

                <button
                    onClick={onClose}
                    className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-400 transition"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
}
