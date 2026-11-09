import { z } from 'zod';
import { CURRENT_VERSION } from './migrations';

/** Deliberately very high: real roadmaps are tens of KB, so valid files can never hit this. */
export const MAX_IMPORT_BYTES = 50 * 1024 * 1024;

/**
 * Loose structural check for uploaded roadmap JSON. It only guards the top-level shape and the
 * fields that would crash the app; `normalizeRoadmapState` still fills in defaults and migrates
 * legacy fields afterwards, so unknown/missing optional keys are fine.
 */
const idRef = z.string().min(1);

const roadmapImportSchema = z
  .object({
    id: z.string().optional(),
    version: z
      .number()
      .optional()
      .refine((v) => v === undefined || v <= CURRENT_VERSION, {
        message: 'This file was created by a newer version of Roadmap Builder.',
      }),
    config: z.object({}).loose().optional(),
    legend: z.array(z.object({ id: z.string().optional() }).loose()).optional(),
    sections: z
      .array(
        z
          .object({
            id: z.string().optional(),
            title: z.string().optional(),
            subSections: z.array(z.object({ id: z.string().optional() }).loose()).optional(),
          })
          .loose()
      )
      .optional(),
    tasks: z.array(z.object({ subSectionId: idRef.optional() }).loose()).optional(),
    timelineItems: z
      .array(
        z
          .object({
            taskId: idRef.optional(),
            startPeriod: z.coerce.number().optional(),
            duration: z.coerce.number().optional(),
            type: z.enum(['bar', 'milestone']).optional(),
          })
          .loose()
      )
      .optional(),
  })
  .loose()
  .refine((v) => v.config || v.sections, {
    message: 'Expected at least a "config" or "sections" key.',
  });

/**
 * @param {unknown} data Parsed JSON.
 * @returns {{ ok: true, data: object } | { ok: false, error: string }}
 */
export function validateRoadmapImport(data) {
  const result = roadmapImportSchema.safeParse(data);
  if (result.success) return { ok: true, data: result.data };
  const issue = result.error.issues[0];
  const where = issue.path.length ? ` at "${issue.path.join('.')}"` : '';
  return { ok: false, error: `Invalid roadmap JSON${where}: ${issue.message}` };
}
