"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                    const tokenResult = await firebaseUser.getIdTokenResult();
                    const isAdmin = tokenResult.claims.admin === true;

                    if (userDoc.exists() && userDoc.data().approved) {
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            isAdmin,
                            ...userDoc.data(),
                        });
                    } else {
                        setUser(null);
                    }
                } catch (err) {
                    console.error("Error cargando datos del usuario:", err);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
