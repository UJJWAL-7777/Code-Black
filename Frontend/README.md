# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.






//FORM SIGNUP PAGE --------------------------------------------------------------
🧾 Final Summary
Step	What Happens
1️⃣	useForm() sets up form control.
2️⃣	register() connects inputs to the form state.
3️⃣	User fills the form.
4️⃣	On clicking “Submit”, handleSubmit() collects and validates inputs.
5️⃣	If successful, submittedData() runs and logs the form data.
6️⃣	If there are validation issues (not used yet), they appear in the errors object.
import { useForm } from 'react-hook-form';
npm i react-hook-form  -->to install this----



*****************************************************************************************************************
//Error format in the signup page when something is wrong is:-
const errors = {
    firsstname: {
        type: 'minlength,             //Type of validation that failed
        message: "Minimum character should be 3"        // Custom error message
    },
    emailId:{
        type: 'Invalid_string'
        message: 'Invalid Email'
    }
}



******************************************************************************************************************
//Signup page-> used react form npm and ZOD for submiting the form and validating the form parameters respectively
npm i react-form

