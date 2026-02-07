import { kv } from "@vercel/kv";

const inMemoryCache = new Map<string, { value: string; expiresAt: number }>();

function isKVConfigured(): boolean {
	return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function cacheGet<T>(key: string): Promise<T | null> {
	if (isKVConfigured()) {
		try {
			return await kv.get<T>(key);
		} catch {
			return fallbackGet<T>(key);
		}
	}
	return fallbackGet<T>(key);
}

export async function cacheSet(
	key: string,
	value: unknown,
	ttlSeconds: number = 3600,
): Promise<void> {
	if (isKVConfigured()) {
		try {
			await kv.set(key, value, { ex: ttlSeconds });
			return;
		} catch {
			fallbackSet(key, value, ttlSeconds);
			return;
		}
	}
	fallbackSet(key, value, ttlSeconds);
}

function fallbackGet<T>(key: string): T | null {
	const entry = inMemoryCache.get(key);
	if (!entry) return null;
	if (Date.now() > entry.expiresAt) {
		inMemoryCache.delete(key);
		return null;
	}
	return JSON.parse(entry.value) as T;
}

function fallbackSet(key: string, value: unknown, ttlSeconds: number): void {
	inMemoryCache.set(key, {
		value: JSON.stringify(value),
		expiresAt: Date.now() + ttlSeconds * 1000,
	});
}
