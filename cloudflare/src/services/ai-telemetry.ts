import { Env } from '../types';

export interface TelemetryLog {
    feature: string;
    model?: string;
    request_tokens?: number;
    response_tokens?: number;
    latency_ms?: number;
    status: 'success' | 'error';
    error_type?: string;
    metadata: any;
}

export interface ContentAuditLog {
    feature: string;
    content_id?: string;
    content_excerpt: string;
}

export class AITelemetryService {
    constructor(private db: D1Database) { }

    /**
     * Log telemetry data to D1.
     * Use ctx.waitUntil(promise) in the worker to ensure this completes without blocking the response.
     */
    async logTelemetry(data: TelemetryLog, waitUntil?: (promise: Promise<any>) => void): Promise<void> {
        const id = crypto.randomUUID();
        const timestamp = new Date().toISOString();

        // Ensure metadata is stringified and safe
        const metadataJson = JSON.stringify(data.metadata || {});

        const query = `
            INSERT INTO ai_telemetry 
            (id, timestamp, feature, model, request_tokens, response_tokens, latency_ms, status, error_type, metadata_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const promise = this.db.prepare(query)
            .bind(
                id,
                timestamp,
                data.feature,
                data.model || null,
                data.request_tokens || 0,
                data.response_tokens || 0,
                data.latency_ms || 0,
                data.status,
                data.error_type || null,
                metadataJson
            )
            .run();

        if (waitUntil) {
            waitUntil(promise);
        } else {
            await promise;
        }
    }

    /**
     * Log content for audit purposes.
     */
    async logContentAudit(data: ContentAuditLog): Promise<void> {
        const id = crypto.randomUUID();
        const created_at = new Date().toISOString();

        // Sanitize excerpt (simple truncation for now, could be more complex)
        const excerpt = data.content_excerpt.slice(0, 1000);

        const query = `
            INSERT INTO ai_content_audit
            (id, feature, content_id, content_excerpt, created_at)
            VALUES (?, ?, ?, ?, ?)
        `;

        await this.db.prepare(query)
            .bind(
                id,
                data.feature,
                data.content_id || null,
                excerpt,
                created_at
            )
            .run();
    }
}
