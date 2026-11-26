// Private media (voice notes, videos, photos) stays on this device in IndexedDB.
const DB = "elevate-media";
const STORE = "blobs";

function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function putMedia(id: string, blob: Blob) {
  const d = await db();
  await new Promise<void>((res, rej) => {
    const tx = d.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

export async function getMedia(id: string): Promise<Blob | undefined> {
  const d = await db();
  return new Promise((res, rej) => {
    const tx = d.transaction(STORE, "readonly");
    const r = tx.objectStore(STORE).get(id);
    r.onsuccess = () => res(r.result as Blob | undefined);
    r.onerror = () => rej(r.error);
  });
}

export async function removeMedia(id: string) {
  const d = await db();
  await new Promise<void>((res) => {
    const tx = d.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => res();
    tx.onerror = () => res();
  });
}

export async function clearAllMedia() {
  await new Promise<void>((res) => {
    const r = indexedDB.deleteDatabase(DB);
    r.onsuccess = () => res();
    r.onerror = () => res();
    r.onblocked = () => res();
  });
}
