import React from 'react';
import { Formik, Form } from 'formik';
import { Link, Text, Stack } from '@chakra-ui/layout';
import { FormLabel } from '@chakra-ui/form-control';
import * as Yup from 'yup';
import { FormikControl } from './FormikControl';
import { ButtonPrimary } from './ButtonPrimary';
import { Link as RouterLink, useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth/authContext';

const styles = {
  input: {
    borderWidth: '1.6px',
    borderColor: '#000',
    focusBorderColor: '#70BAE7',
    size: 'sm',
  },
  text: {
    fontSize: '14px',
    mt: '24px',
    textAlign: 'center',
  },
  link: {
    color: '#70bae7',
  },
};
const initialValues = {
  email: '',
  password: '',
  first_name: '',
  last_name: '',
};

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Enter a valid email address.')
    .required('Email is a required field.'),
  password: Yup.string()
    .matches(
      /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/gm,
      'password must contain 1 number (0-9), 1 uppercase letters,1 lowercase letters, 1 non-alpha numeric number, password is 8-16 characters with no space'
    )
    .required('Password is required field.'),
  first_name: Yup.string()
    .matches(/^([^0-9]*)$/, 'First name should not contain numbers.')
    .required('First name is a required field.'),
  last_name: Yup.string()
    .matches(/^([^0-9]*)$/, 'Last name should not contain numbers.')
    .required('Last name is a required field.'),
});

export const RegisterForm = () => {
  // const { state } = useLocation();
  const { register } = useAuth();
  const histroy = useHistory();

  // register api does not return token.
  // TODO: create a registration flow.
  //  - send registration data -> ask user to validate email -> ...
  const onSubmit = async (data = {}, { setErrors }) => {
    console.log(data);
    const response = await register(data);

    console.log(response);
    if (response.ok) {
      console.log(response.successMessage);
      histroy.push('/register-success');
    } else {
      setErrors(response.errors);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      <Form>
        <FormLabel as="legend" fontSize="22px" mb="28px">
          Create your fehler account
        </FormLabel>
        <Stack spacing={10}>
          <FormikControl
            control="input"
            name="email"
            label="Email"
            type="email"
            placeholder="jon@email.com"
            {...styles.input}
          />

          <FormikControl
            control="input"
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••••••"
            {...styles.input}
          />
          <Stack direction="row" spacing={4}>
            <FormikControl
              control="input"
              name="first_name"
              label="First name"
              type="text"
              placeholder="Jon"
              {...styles.input}
            />
            <FormikControl
              control="input"
              name="last_name"
              label="Last name"
              type="text"
              placeholder="Smith"
              {...styles.input}
            />
          </Stack>
          <ButtonPrimary name="Sign up" />
        </Stack>
        <Text fontSize="14px" mt="24px" textAlign="center">
          Already have an account? &nbsp;
          <Link color="#70bae7" as={RouterLink} to="/login">
            Login here
          </Link>
        </Text>
      </Form>
    </Formik>
  );
};
