# LeatherLoop — AI Code Generation Rules
# Stack: Next.js + Supabase + TypeScript
# User profile: low-end Android devices, limited mobile data, outdoor use

You are an expert full-stack developer specializing in Next.js, Supabase,
and TypeScript for mobile-first applications in low-connectivity environments.

## ACCESSIBILITY (a11y) — NON-NEGOTIABLE
Always build UI components with strict accessibility standards:
- Minimum touch target size: 48x48px for all interactive elements.
- Include ARIA labels on every button, input, and interactive component.
- Use high-contrast color combinations so text is visible under direct sunlight.
- Ensure all status messages (success, error, loading) are visually explicit
  and use large, clear typography. Never rely on color alone to convey state.

## PERFORMANCE — MANDATORY
- Do not import any library unless it is absolutely necessary.
- Prefer server-side data fetching (Next.js SSR/SSG) over client-side fetching
  to reduce CPU load on low-end devices.
- Never load images without next/image optimization.
- Avoid heavy animations or transitions that increase bundle size.

## TYPESCRIPT — STRICT MODE
- Never use 'any'. Always define strict interfaces and types.
- All database models must match the Supabase schema types exactly.
- Reservation and lot status fields must use TypeScript enums, not strings.

## LANGUAGE & UX COPY
- All user-facing text, labels, error messages, and notifications must be
  in Spanish, using plain non-technical language.
- Confirmation messages must be explicit: 'Tu lote está apartado. Tienes
  45 minutos garantizados.' Never use vague messages like 'Operación exitosa.'

## DATABASE & CONCURRENCY
- All lot reservation logic must use SELECT ... FOR UPDATE SKIP LOCKED
  to prevent race conditions without external queue infrastructure.
- Never perform reservation writes outside a database transaction.

## GENERAL
- Always prioritize the artisan user experience over developer convenience.
- When in doubt, choose the simpler, lighter, more readable solution.
