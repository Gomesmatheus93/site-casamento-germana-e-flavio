import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function getFirebaseApp(): App {
  return (
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    })
  );
}

// Inicializa o Admin SDK só na primeira vez que db/adminAuth forem
// realmente usados (não no momento em que este módulo é importado). O
// Next.js importa as rotas de API durante o build para decidir se são
// estáticas ou dinâmicas, e nesse momento as credenciais do Firebase
// (segredos de servidor) não estão disponíveis como variável de build.
function lazy<T extends object>(factory: () => T): T {
  let instance: T | undefined;
  return new Proxy({} as T, {
    get(_target, prop, receiver) {
      if (!instance) instance = factory();
      return Reflect.get(instance as object, prop, receiver);
    },
  });
}

export const db: Firestore = lazy(() => getFirestore(getFirebaseApp()));
export const adminAuth: Auth = lazy(() => getAuth(getFirebaseApp()));
