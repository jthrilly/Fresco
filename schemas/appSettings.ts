import { z } from 'zod';

export const appSettingsSchema = z.object({
  configured: z.boolean(),
  allowAnonymousRecruitment: z.boolean(),
  limitInterviews: z.boolean(),
  initializedAt: z.date(),
  installationId: z.string(),
  disableAnalytics: z.boolean(),
  uploadThingToken: z.string().optional(),
});

const appSettings = [...appSettingsSchema.keyof().options] as const;

export type AppSetting = (typeof appSettings)[number];

const parseBoolean = (value: unknown): boolean | undefined => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

export const appSettingPreprocessedSchema = appSettingsSchema.extend({
  initializedAt: z.preprocess((value) => {
    if (typeof value === 'string' || value instanceof Date) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return value;
  }, z.date()),
  configured: z.preprocess(parseBoolean, z.boolean()),
  allowAnonymousRecruitment: z.preprocess(parseBoolean, z.boolean()),
  limitInterviews: z.preprocess(parseBoolean, z.boolean()),
  uploadThingToken: z.preprocess((value) => value, z.string()).optional(),
  installationId: z.preprocess((value) => value, z.string()),
  disableAnalytics: z.preprocess(parseBoolean, z.boolean()),
});