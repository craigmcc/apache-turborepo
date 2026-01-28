import z from "zod"

export const PROJECT_STATUSES = ["active", "draft", "finished"] as const

export const ProjectSchema = z.object({
  description: z.string().transform(v => v || undefined),
  name: z.string().min(1, "Name is required"),
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
  }),
  status: z.enum(PROJECT_STATUSES),
});

export type ProjectSchemaType = z.infer<typeof ProjectSchema>;
