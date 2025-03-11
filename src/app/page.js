"use client";
import Image from "next/image";
import {useAuth} from "@/context/AuthContext";

export default function Home() {

    const { user } = useAuth();
  return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <Image alt='prodcust biotech pharma' src={'/images/inicial.jpg'} width={600}
               height={300}
               className="w-[1200px] h-[500px] object-cover"/>
          {user ?
              <a href="/medicos" className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition mb-10">
          Acceder a Zona Médicos
        </a>:
              null
          }
      </div>
  );
}
