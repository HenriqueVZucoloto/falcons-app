import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(() => ({})),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
    getIdToken: vi.fn(),
}))

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn(() => ({})),
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    addDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    writeBatch: vi.fn(),
    runTransaction: vi.fn(),
    serverTimestamp: vi.fn(),
    Timestamp: {
        now: vi.fn(),
        fromDate: vi.fn((d: Date) => ({ toDate: () => d })),
    },
    CollectionReference: vi.fn(),
}))

// Mock Firebase Storage
vi.mock('firebase/storage', () => ({
    getStorage: vi.fn(() => ({})),
    ref: vi.fn(),
    uploadBytes: vi.fn(),
    getDownloadURL: vi.fn(),
}))

// Mock Firebase Functions
vi.mock('firebase/functions', () => ({
    getFunctions: vi.fn(() => ({})),
    httpsCallable: vi.fn(),
}))

// Mock Firebase App
vi.mock('firebase/app', () => ({
    initializeApp: vi.fn(() => ({})),
    FirebaseError: class FirebaseError extends Error {
        code: string
        constructor(code: string, message: string) {
            super(message)
            this.code = code
        }
    },
}))

// Mock ../lib/firebase
vi.mock('../lib/firebase', () => ({
    auth: { currentUser: { uid: 'test-uid' } },
    db: {},
    storage: {},
    functions: {},
    usersCollection: {},
    paymentsCollection: {},
    default: {},
}))

// Mock import.meta.env
vi.stubEnv('VITE_PIX_KEY', 'test-pix-key')
vi.stubEnv('VITE_PIX_MERCHANT_NAME', 'FALCONS TEST')
vi.stubEnv('VITE_PIX_MERCHANT_CITY', 'SAO CARLOS')
vi.stubEnv('VITE_PIX_TXID_PREFIX', 'FLC')
