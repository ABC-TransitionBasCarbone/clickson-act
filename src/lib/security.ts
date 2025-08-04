// Additional security utilities for admin system

import { NextRequest } from "next/server";

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  req: NextRequest,
  maxRequests: number = 10,
  windowMs: number = 60000,
): { allowed: boolean; remaining: number } {
  const clientId =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const clientData = rateLimitMap.get(clientId);

  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (clientData.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  clientData.count++;
  return { allowed: true, remaining: maxRequests - clientData.count };
}

// Input sanitization for XSS prevention
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Validate UUID format
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Check for SQL injection patterns (basic)
export function containsSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|OR|AND)\b)/i,
    /(--|\/\*|\*\/|;)/,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?)/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Log security events
export function logSecurityEvent(
  event: string,
  details: Record<string, unknown>,
) {
  console.log(`[SECURITY] ${new Date().toISOString()}: ${event}`, details);
}
