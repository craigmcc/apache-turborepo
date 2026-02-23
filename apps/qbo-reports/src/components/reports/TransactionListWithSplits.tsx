"use client";

/**
 * Enter criteria for a Transaction List With Splits, and call
 * /api/transactionListWithSplits to get the report data, and render it.
 */

// External Modules ----------------------------------------------------------

import { useAppForm } from "@repo/bootstrap-tanstack-form/useAppForm";
import { QBReportTable, Report } from "@repo/shared-components/QBReportTable";
import { clientLogger as logger } from "@repo/shared-utils";
import { useState} from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { z } from "zod";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export function TransactionListWithSplits() {

  const [report, setReport] = useState<Report>({});
  const [submitClicked, setSubmitClicked] = useState<boolean>(false);

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const url = "/api/transactionListWithSplits" +
        "?start_date=" + encodeURIComponent(value.startDate) +
        "&end_date=" + encodeURIComponent(value.endDate);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        }
      });
      const report = await response.json() as Report;
      setReport(report);
      logger.trace({
        context: "TransactionListWithSplits.onSubmit",
        report,
      })
      setSubmitClicked(true);
    },
    validators: {
      onBlur: TransactionListWithSplitsSchema,
      onChange: TransactionListWithSplitsSchema,
      onSubmit: TransactionListWithSplitsSchema,
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
            <h5>Transaction List With Splits Criteria</h5>
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

const TransactionListWithSplitsSchema = z.object({
  endDate: z.string().min(1, { message: "End Date is required." }),
  startDate: z.string().min(1, { message: "Start Date is required." }),
});
