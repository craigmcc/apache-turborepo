"use client";

/**
 * Forms Example Component
 */

// External Modules ----------------------------------------------------------

import {
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Container,
  Row,
} from "react-bootstrap";

// Internal Modules ----------------------------------------------------------

import { HorizontalForm } from "@/components/forms/HorizontalForm";
import { VerticalForm } from "../forms/VerticalForm";

// Public Objects ------------------------------------------------------------

export function Forms() {

  return (
    <Container fluid>
      <Row className="g-4">
        <Col xs={12} lg={6}>
          <Card className="border bg-info-subtle h-100">
            <CardBody>
              <CardTitle className="text-center">Horizontal Form</CardTitle>
              <CardText as="div">
                <HorizontalForm />
              </CardText>
            </CardBody>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card className="border bg-info-subtle h-100">
            <CardBody>
              <CardTitle className="text-center">Vertical Form</CardTitle>
              <CardText as="div">
                <VerticalForm />
              </CardText>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
