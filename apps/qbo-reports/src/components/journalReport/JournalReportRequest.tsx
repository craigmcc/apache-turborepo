"use client";

/**
 * Enter criteria for a Journal Report, and then ask the
 * JournalReportResponse component to request that data and render it.
 */

// External Modules ----------------------------------------------------------

import { useAppForm } from "@repo/bootstrap-tanstack-form/useAppForm";
import { useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { z } from "zod";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export function JournalReportRequest() {

  const [submitClicked, setSubmitClicked] = useState<boolean>(false);

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      setSubmitClicked(true);
    },
    validators: {
      onBlur: JournalReportRequestSchema,
      onChange: JournalReportRequestSchema,
      onSubmit: JournalReportRequestSchema,
    },
  });

  return (
    <Container fluid>
      <Row>
        <Form onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}>
          <Col>
            <h5>Journal Report Criteria</h5>
          </Col>
          <Col>
            <form.AppField name="startDate">
              {field => (
                <field.Input
                  horizontal={3}
                  label="Start Date (YYYY-MM-DD):"
                />
              )}
            </form.AppField>
          </Col>
          <Col>
            <form.AppField name="endDate">
              {field => (
                <field.Input
                  horizontal={3}
                  label="End Date (YYYY-MM-DD):"
                />
              )}
            </form.AppField>
          </Col>
          <Col>
            <Button variant="primary" type="submit">Generate</Button>
          </Col>
        </Form>
      </Row>
      <Row>
        <hr/>
      </Row>
      {submitClicked &&
        <span>TODO</span> }
    </Container>
  );
}

// Private Objects -----------------------------------------------------------

const defaultValues = {
  endDate: "",
  startDate: "",
}

const JournalReportRequestSchema = z.object({
  endDate: z.string().min(1, { message: "End Date is required." }),
  startDate: z.string().min(1, { message: "Start Date is required." }),
});
