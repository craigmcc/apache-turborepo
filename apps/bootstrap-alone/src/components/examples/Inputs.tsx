"use client";

/**
 * Inputs Example Component.
 */

// External Modules ----------------------------------------------------------

import { useState } from "react";
import {
  Card,
  CardBody,
  CardText,
  CardTitle,
  Table,
} from "react-bootstrap";
import { FieldCheckbox } from "@repo/bootstrap-tanstack-form/FieldCheckbox";
import { FieldInput } from "@repo/bootstrap-tanstack-form/FieldInput";
import { FieldSelect, FieldSelectOption } from "@repo/bootstrap-tanstack-form/FieldSelect";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

export function Inputs() {

  const [exampleCheckbox, setExampleCheckbox] = useState<boolean>(true);
  const [exampleInput, setExampleInput] = useState<string>("");
  const [examplePassword, setExamplePassword] = useState<string>("");
  const [exampleSelect, setExampleSelect] = useState<string>("option1");

  const selectOptions: FieldSelectOption[] = [
    { label: "Please select an option" },
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
  ];

  return (
    <div className="d-flex justify-content-evenly gap-4">

      <Card className="border bg-light">
        <CardBody>
          <CardTitle className="text-center">Vertical Inputs</CardTitle>
          <CardText as="div">
            <Table border={2} bordered>
              <thead>
              <tr>
                <th>Input Type</th>
                <th className="text-center">Example</th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td className="font-weight-medium">Checkbox</td>
                <td className="text-center">
                  <FieldCheckbox
                    handleChange={(newValue) => setExampleCheckbox(newValue)}
                    label="Example Checkbox"
                    name="exampleCheckbox"
                    value={exampleCheckbox}
                  />
                </td>
              </tr>
              <tr>
                <td className="font-weight-medium">Password</td>
                <td className="form-control">
                  <FieldInput
                    handleChange={(newValue) => setExamplePassword(newValue)}
                    label="Example Password Input"
                    name="examplePassword"
                    placeholder="Enter password"
                    type="password"
                    value={examplePassword}
                  />
                </td>
              </tr>
              <tr>
                <td className="font-weight-medium">Select</td>
                <td className="form-control">
                  <FieldSelect
                    handleChange={(newValue) => setExampleSelect(newValue)}
                    label="Example Select Input"
                    name="exampleSelect"
                    options={selectOptions}
                    value={exampleSelect}
                  />
                </td>
              </tr>
              <tr>
                <td className="font-weight-medium">Text</td>
                <td className="form-control">
                  <FieldInput
                    handleChange={(newValue) => setExampleInput(newValue)}
                    label="Example Text Input"
                    name="exampleInput"
                    placeholder="Enter text"
                    value={exampleInput}
                  />
                </td>
              </tr>
              </tbody>
            </Table>
          </CardText>
        </CardBody>
      </Card>

    </div>
  );

}
