// Private media (voice notes, videos, photos) stays on this device in IndexedDB.
const DB = "veev-media";
const STORE = "blobs";

// Older versions stored media under a previous name; move it over once.
const OLD_DB = "elevate-media";
const MOVED = "veev.mediaMoved";

function open(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function moveOldMedia(to: IDBDatabase) {
  try {
    if (localStorage.getItem(MOVED)) return;
    const from = await open(OLD_DB);
    const entries = await new Promise<[IDBValidKey, Blob][]>((res, rej) => {
      const out: [IDBValidKey, Blob][] = [];
      const r = from.transaction(STORE, "readonly").objectStore(STORE).openCursor();
      r.onsuccess = () => {
        const c = r.result;
        if (!c) return res(out);
        out.push([c.key, c.value as Blob]);
        c.continue();
      };
      r.onerror = () => rej(r.error);
    });
    from.close();
    if (entries.length) {
      await new Promise<void>((res, rej) => {
        const tx = to.transaction(STORE, "readwrite");
        const st = tx.objectStore(STORE);
        entries.forEach(([k, v]) => st.put(v, k));
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
    }
    localStorage.setItem(MOVED, "1");
    indexedDB.deleteDatabase(OLD_DB);
  } catch {}
}

let ready: Promise<IDBDatabase> | null = null;
function db(): Promise<IDBDatabase> {
  if (!ready)
    ready = open(DB).then(async (d) => {
      await moveOldMedia(d);
      return d;
    });
  ready.catch(() => (ready = null));
  return ready;
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
