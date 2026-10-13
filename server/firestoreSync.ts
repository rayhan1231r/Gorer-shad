import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import type { DatabaseSchema } from './store.ts';

// Read firebase-applet-config.json
let firebaseConfig: any = null;
try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
} catch (err) {
  console.warn('Could not read firebase-applet-config.json:', err);
}

let firestoreInstance: any = null;

function getCloudDb() {
  if (firestoreInstance) return firestoreInstance;
  if (!firebaseConfig || !firebaseConfig.projectId) return null;

  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const dbId = firebaseConfig.firestoreDatabaseId;
    firestoreInstance = dbId ? getFirestore(app, dbId) : getFirestore(app);
    return firestoreInstance;
  } catch (err) {
    console.warn('Failed to initialize Firebase Firestore in server:', err);
    return null;
  }
}

export interface CloudSyncStatus {
  isConfigured: boolean;
  projectId: string;
  connected: boolean;
  lastSyncedAt: string | null;
  cloudFoodsCount: number;
  cloudCategoriesCount: number;
  lastError?: string | null;
}

let lastSyncedTimestamp: string | null = null;
let lastSyncError: string | null = null;

export const cloudSyncService = {
  getProjectId(): string {
    return firebaseConfig?.projectId || 'Not Configured';
  },

  async getStatus(): Promise<CloudSyncStatus> {
    const db = getCloudDb();
    if (!db) {
      return {
        isConfigured: false,
        projectId: 'N/A',
        connected: false,
        lastSyncedAt: null,
        cloudFoodsCount: 0,
        cloudCategoriesCount: 0,
        lastError: 'firebase-applet-config.json not found'
      };
    }

    try {
      const snapDoc = await getDoc(doc(db, 'system_store', 'snapshot'));
      const exists = snapDoc.exists();
      const data = exists ? snapDoc.data() : null;
      return {
        isConfigured: true,
        projectId: firebaseConfig.projectId,
        connected: true,
        lastSyncedAt: data?.updatedAt || lastSyncedTimestamp,
        cloudFoodsCount: Array.isArray(data?.foods) ? data.foods.length : 0,
        cloudCategoriesCount: Array.isArray(data?.categories) ? data.categories.length : 0,
        lastError: null
      };
    } catch (err: any) {
      return {
        isConfigured: true,
        projectId: firebaseConfig.projectId,
        connected: false,
        lastSyncedAt: lastSyncedTimestamp,
        cloudFoodsCount: 0,
        cloudCategoriesCount: 0,
        lastError: err?.message || String(err)
      };
    }
  },

  /**
   * Push current database snapshot to Firestore cloud
   */
  async pushToCloud(storeData: DatabaseSchema): Promise<{ success: boolean; message: string; timestamp: string }> {
    const db = getCloudDb();
    if (!db) {
      throw new Error('Firebase Firestore is not configured');
    }

    const now = new Date().toISOString();
    try {
      // 1. Save full cloud snapshot in system_store/snapshot
      // Clean non-serializable items
      const payload = {
        updatedAt: now,
        projectId: firebaseConfig.projectId,
        config: storeData.config,
        homepageContent: storeData.homepageContent,
        foods: storeData.foods || [],
        categories: storeData.categories || [],
        deliveryZones: storeData.deliveryZones || [],
        paymentMethods: storeData.paymentMethods || [],
        coupons: storeData.coupons || [],
        reviews: storeData.reviews || [],
        ownerEmail: storeData.ownerEmail
      };

      await setDoc(doc(db, 'system_store', 'snapshot'), payload);
      lastSyncedTimestamp = now;
      lastSyncError = null;

      // 2. Also sync individual food items to the /foods collection for granular querying
      try {
        const batch = writeBatch(db);
        const foodsToSync = (storeData.foods || []).slice(0, 150); // Batch limit
        for (const f of foodsToSync) {
          if (f.id) {
            batch.set(doc(db, 'foods', f.id), { ...f, syncedAt: now }, { merge: true });
          }
        }
        await batch.commit();
      } catch (batchErr) {
        // Individual items batch error is non-fatal since snapshot is saved
        console.warn('Batch individual foods sync notice:', batchErr);
      }

      return {
        success: true,
        message: `সফলভাবে ক্লাউড ফায়ারবেসে ${payload.foods.length}টি খাদ্যসামগ্রী ও সেটিংস সংরক্ষিত হয়েছে!`,
        timestamp: now
      };
    } catch (err: any) {
      lastSyncError = err?.message || String(err);
      console.error('Failed to push to Firestore cloud:', err);
      throw new Error(`ক্লাউডে সংরক্ষণ ব্যর্থ: ${err?.message || String(err)}`);
    }
  },

  /**
   * Pull database from Firestore cloud
   */
  async pullFromCloud(): Promise<{ success: boolean; data: Partial<DatabaseSchema> | null; message: string }> {
    const db = getCloudDb();
    if (!db) {
      return { success: false, data: null, message: 'Firebase Firestore not configured' };
    }

    try {
      const snapDoc = await getDoc(doc(db, 'system_store', 'snapshot'));
      if (snapDoc.exists()) {
        const cloudData = snapDoc.data();
        if (cloudData && Array.isArray(cloudData.foods) && cloudData.foods.length > 0) {
          lastSyncedTimestamp = cloudData.updatedAt || new Date().toISOString();
          return {
            success: true,
            data: {
              config: cloudData.config,
              homepageContent: cloudData.homepageContent,
              foods: cloudData.foods,
              categories: cloudData.categories,
              deliveryZones: cloudData.deliveryZones,
              paymentMethods: cloudData.paymentMethods,
              coupons: cloudData.coupons,
              reviews: cloudData.reviews,
              ownerEmail: cloudData.ownerEmail
            },
            message: `ক্লাউড থেকে ${cloudData.foods.length}টি খাদ্যসামগ্রী ও ক্যাটাগরি সফলভাবে লোড হয়েছে!`
          };
        }
      }

      // If snapshot wasn't found, try checking /foods collection
      const foodsSnap = await getDocs(collection(db, 'foods'));
      if (!foodsSnap.empty) {
        const foodsList: any[] = [];
        foodsSnap.forEach(d => foodsList.push(d.data()));
        return {
          success: true,
          data: { foods: foodsList },
          message: `ক্লাউড থেকে ${foodsList.length}টি পণ্য লোড করা হয়েছে!`
        };
      }

      return { success: false, data: null, message: 'ক্লাউডে কোনো পূর্ববর্তী ডেটা পাওয়া যায়নি।' };
    } catch (err: any) {
      console.warn('Failed to pull from Firestore cloud:', err);
      return { success: false, data: null, message: `ক্লাউড থেকে লোড ব্যর্থ: ${err?.message || String(err)}` };
    }
  }
};
