interface Manifest {
  [key: string]: string;
}

class BookManifestService {
  private static instance: BookManifestService;
  private manifest: Manifest | null = null;
  private lastFetch: number = 0;
  private fetchPromise: Promise<Manifest> | null = null;

  // 5 minutes TTL
  private TTL = 5 * 60 * 1000;

  private constructor() {}

  static getInstance(): BookManifestService {
    if (!BookManifestService.instance) {
      BookManifestService.instance = new BookManifestService();
    }
    return BookManifestService.instance;
  }

  async getManifest(): Promise<Manifest> {
    const now = Date.now();
    if (this.manifest && now - this.lastFetch < this.TTL) {
      return this.manifest;
    }

    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    this.fetchPromise = this.fetchManifest();
    try {
      this.manifest = await this.fetchPromise;
      this.lastFetch = Date.now();
      return this.manifest;
    } finally {
      this.fetchPromise = null;
    }
  }

  private async fetchManifest(): Promise<Manifest> {
    const r2Url = import.meta.env.VITE_R2_PUBLIC_URL;
    if (!r2Url) {
      console.warn('VITE_R2_PUBLIC_URL not set');
      return {};
    }
    try {
      const res = await fetch(`${r2Url}/manifest.json`);
      if (!res.ok) throw new Error('Failed to fetch manifest');
      return await res.json();
    } catch (e) {
      console.error('Error fetching manifest:', e);
      return {};
    }
  }

  async resolve(key: string): Promise<string | null> {
    const manifest = await this.getManifest();
    const r2Path = manifest[key];
    if (r2Path) {
       const r2Url = import.meta.env.VITE_R2_PUBLIC_URL;
       return `${r2Url}/${r2Path}`;
    }
    return null;
  }
}

export const bookManifest = BookManifestService.getInstance();
