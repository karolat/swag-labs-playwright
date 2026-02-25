import type { CheckoutCustomer } from "@/pages";

export const CHECKOUT_CUSTOMER: CheckoutCustomer = {
  firstName: "John",
  lastName: "Doe",
  postalCode: "12345",
};

export const CHECKOUT_VALIDATION_CASES: Array<{
  name: string;
  customer: Partial<CheckoutCustomer>;
  expectedError: string;
}> = [
  {
    name: "first name is missing",
    customer: {
      lastName: CHECKOUT_CUSTOMER.lastName,
      postalCode: CHECKOUT_CUSTOMER.postalCode,
    },
    expectedError: "Error: First Name is required",
  },
  {
    name: "last name is missing",
    customer: {
      firstName: CHECKOUT_CUSTOMER.firstName,
      postalCode: CHECKOUT_CUSTOMER.postalCode,
    },
    expectedError: "Error: Last Name is required",
  },
  {
    name: "postal code is missing",
    customer: {
      firstName: CHECKOUT_CUSTOMER.firstName,
      lastName: CHECKOUT_CUSTOMER.lastName,
    },
    expectedError: "Error: Postal Code is required",
  },
  {
    name: "all fields are empty",
    customer: {},
    expectedError: "Error: First Name is required",
  },
];
