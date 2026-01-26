/**
 * Buttons Example Component
 */

// External Modules ----------------------------------------------------------

import {
  Button,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Table,
} from "react-bootstrap";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export function Buttons() {
  const SIZES = [
    "lg",
    "sm",
  ] as const;
  const VARIANTS = [
    "primary",
    "secondary",
    "success",
    "warning",
    "danger",
    "info",
    "light",
    "dark",
    "link",
  ] as const;

  return (
    <div className="d-flex justify-content-evenly gap-4">

      <Card className="border bg-light">
        <CardBody>
          <CardTitle className="text-center">Plain Variants</CardTitle>
          <CardText as="div">
            <Table border={2} bordered>
              <thead>
              <tr>
                <th>Variant</th>
                <th className="text-center">Button</th>
              </tr>
              </thead>
              <tbody>
              {VARIANTS.map((variant) => (
                <tr key={variant}>
                  <td className="font-weight-medium">{variant}</td>
                  <td className="text-center">
                    <Button variant={variant}>{variant}</Button>
                  </td>
                </tr>
              ))}
              </tbody>
            </Table>
          </CardText>
        </CardBody>
      </Card>

      <Card className="border bg-light">
        <CardBody>
          <CardTitle className="text-center">Outline Variants</CardTitle>
          <CardText as="div">
            <Table border={2} bordered>
              <thead>
              <tr>
                <th>Variant</th>
                <th className="text-center">Button</th>
              </tr>
              </thead>
              <tbody>
              {VARIANTS.map((variant) => (
                <tr key={variant}>
                  <td className="font-weight-medium">{variant}</td>
                  <td className="text-center">
                    <Button variant={"outline-" + variant}>{variant}</Button>
                  </td>
                </tr>
              ))}
              </tbody>
            </Table>
          </CardText>
        </CardBody>
      </Card>

      <Card className="border bg-light">
        <CardBody>
          <CardTitle className="text-center">Size Options</CardTitle>
          <CardText as="div">
            <Table border={2} bordered>
              <thead>
              <tr>
                <th>Variants</th>
                <th className="text-center" colSpan={2}>Button Sizes</th>
              </tr>
              </thead>
              <tbody>
              {VARIANTS.map((variant) => (
                <tr key={variant}>
                  <td className="font-weight-medium">{variant}</td>
                  {SIZES.map((size, index) => (
                    <td key={variant+index} className="text-center">
                      <Button size={size} variant={variant}>
                        {variant + " " + size}
                      </Button>
                    </td>
                  ))}
                </tr>
              ))}
              </tbody>
            </Table>
          </CardText>
        </CardBody>
      </Card>

    </div>
  );
}
