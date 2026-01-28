"use client";

/**
 * Horizontal Form example (for Bootstrap).
 */

// External Modules ----------------------------------------------------------

import { FormSelectOption } from "@repo/bootstrap-tanstack-form/FormSelect";
import { useAppForm } from "@repo/bootstrap-tanstack-form/useAppForm";
import {
  Button,
  Col,
  Container,
  Form,
  Row,
} from "react-bootstrap";
import { toast } from "sonner";

// Internal Modules ----------------------------------------------------------

import {
  ProjectSchema,
  ProjectSchemaType,
  PROJECT_STATUSES
} from "@/zod-schemas/ProjectSchema";

// Public Objects ------------------------------------------------------------

export function HorizontalForm() {

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const result = await createProject(value);
      if (result.success) {
        toast.success("Project created successfully!");
        form.reset();
      } else {
        toast.error("Failed to create project - please check your input.");
        form.reset();
      }
    },
    validators: {
      onBlur: ProjectSchema,
      onChange: ProjectSchema,
      onSubmit: ProjectSchema,
    },
  });

  return (
    <Container fluid>
      <Form onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}>
        <Row className="mb-3">
          <Col>
            <form.AppField name="name">
              {field => (
                <field.Input horizontal={3} label="Name:"/>
              )}
            </form.AppField>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <form.AppField name="status">
              {field => (
                <field.Select horizontal={3} label="Status:" options={statuses}/>
              )}
            </form.AppField>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <form.AppField name="description">
              {field => (
                <field.Textarea horizontal={3} label="Description:" rows={3}/>
              )}
            </form.AppField>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col lg={5}>Notifications Requested:</Col>
          <Col>
            <form.AppField name="notifications.email">
              {field => (
                <field.Checkbox label="Email"/>
              )}
            </form.AppField>
          </Col>
          <Col>
            <form.AppField name="notifications.sms">
              {field => (
                <field.Checkbox label="SMS"/>
              )}
            </form.AppField>
          </Col>
          <Col>
            <form.AppField name="notifications.push">
              {field => (
                <field.Checkbox label="Push"/>
              )}
            </form.AppField>
          </Col>
        </Row>

        <Row className="g-4">
          <Col>
            <Button
              variant="primary"
              type="submit"
            >
              Submit
            </Button>
          </Col>
          <Col className="text-end">
            <Button
              variant="secondary"
              type="button"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

// Private Objects -----------------------------------------------------------

const defaultValues: ProjectSchemaType = {
  description: "",
  name: "",
  notifications: {
    email: false,
    push: false,
    sms: false
  },
  status: PROJECT_STATUSES[0],
};

const statuses: FormSelectOption[] =
  PROJECT_STATUSES.map(status => ({ label: status, value: status }));

async function createProject(unsafeData: ProjectSchemaType): Promise<{success: boolean}>
{
  const data = ProjectSchema.safeParse(unsafeData);
  if (!data.success) {
    return { success: false };
  }
  // TODO - Save to DB
  return { success: true };
}
