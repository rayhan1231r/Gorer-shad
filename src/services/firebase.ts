import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
const firestoreDbId = (firebaseConfig as any).firestoreDatabaseId;
export const db = firestoreDbId ? getFirestore(app, firestoreDbId) : getFirestore(app);

// Optional helper to test Firestore connection
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline notice:', error.message);
    }
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface GoogleAuthResult {
  success: boolean;
  user?: FirebaseUser;
  error?: string;
  errorCode?: string;
  isDomainUnauthorized?: boolean;
  isPopupBlocked?: boolean;
}

// Google Sign-In helper with robust error diagnostics
export async function signInWithGoogle(): Promise<GoogleAuthResult> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const result = await signInWithPopup(auth, provider);
    return {
      success: true,
      user: result.user
    };
  } catch (error: any) {
    const code = error?.code || '';
    const isDomain = code === 'auth/unauthorized-domain';
    const isBlocked = code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request';
    console.warn('[Firebase Auth] signInWithPopup notice:', code, error?.message);
    return {
      success: false,
      errorCode: code,
      error: error?.message || 'Google Sign-in could not be completed',
      isDomainUnauthorized: isDomain,
      isPopupBlocked: isBlocked
    };
  }
}

export async function signOutFirebase() {
  await fbSignOut(auth);
}

export { onAuthStateChanged };
export type { FirebaseUser };
