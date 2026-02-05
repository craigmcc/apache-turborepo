"use client";

/**
 * Enter criteria for a Transaction List, and call /api/transactionList
 * to get the report data, and render it.
 */

// External Modules ----------------------------------------------------------

import { useAppForm } from "@repo/bootstrap-tanstack-form/useAppForm";
import { Report, QBReportTable } from "@repo/shared-components/QBReportTable";
import { useState} from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { z } from "zod";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export function TransactionList() {

  const [report, setReport] = useState<Report>({});
  const [submitClicked, setSubmitClicked] = useState<boolean>(false);

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const url = "/api/transactionList" +
        "?startDate=" + encodeURIComponent(value.startDate) +
        "&endDate=" + encodeURIComponent(value.endDate);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        }
      });
      setReport(await response.json() as Report);
      setSubmitClicked(true);
    },
    validators: {
      onBlur: TransactionListSchema,
      onChange: TransactionListSchema,
      onSubmit: TransactionListSchema,
    },
  });

  return (
    <Container fluid>
      <Row className="align-items-center mb-2">
        <Form onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}>
          <Col>
            <h5>Transaction List Criteria</h5>
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
      {submitClicked &&
        <QBReportTable report={report}/> }
    </Container>
  );
}

// Private Objects -----------------------------------------------------------

const defaultValues = {
  endDate: "",
  startDate: "",
}

const TransactionListSchema = z.object({
  endDate: z.string().min(1, { message: "End Date is required." }),
  startDate: z.string().min(1, { message: "Start Date is required." }),
});
