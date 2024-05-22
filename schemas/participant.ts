import { z } from 'zod';

export const participantIdentifierSchema = z
  .string()
  .min(1, { message: 'Identifier cannot be empty' })
  .max(255, { message: 'Identifier too long. Maxiumum of 255 characters.' });

export const participantLabelSchema = z.string().optional();

const ParticipantRowSchema = z.union([
  z.object({
    identifier: z.string(),
    label: z.string().optional(),
  }),
  z.object({
    label: z.string(),
    identifier: z.string().optional(),
  }),
]);

export const FormSchema = z.object({
  csvFile: z.array(ParticipantRowSchema, {
    invalid_type_error: 'Invalid CSV',
  }),
});

export type FormSchema = z.infer<typeof FormSchema>;

// Used for import
export const participantListInputSchema = z.array(ParticipantRowSchema);

export const updateSchema = z.object({
  identifier: participantIdentifierSchema,
  data: z.object({
    identifier: participantIdentifierSchema,
    label: participantLabelSchema,
  }),
});
