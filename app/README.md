# Admin email changes

In **Admin → Users → Edit User Profile**, change the email and save. The server
updates Firebase Authentication, `profiles_nbb`, and every account-number lookup
for that user. Their UID, password, balances, and transactions stay the same.
The new email is marked unverified; this action does not send email messages.
The fixed administrator login cannot be changed through this form.

If a previous edit changed only the profile email, open the customer under
**Admin → Users → Edit User Profile** and click **Sync login email**. This
explicitly applies the saved profile email to Firebase Authentication and the
account-number lookups, even when the form email has not changed. After success,
the customer must sign out and sign in with that email and their existing
password. This action also requires the server credential described below.

## Deployment

1. Configure `FIREBASE_SERVICE_ACCOUNT_JSON` in the server hosting environment
   with service-account JSON for Firebase project `smokescreen-2bc84`. It needs
   Firebase Authentication user-management and Firestore read/write permissions.
   Keep the credential server-only; never use a `VITE_` prefix or commit it.
2. Deploy the `app` directory with its Vercel `api` functions. Plain static
   hosting and `vite dev` alone do not serve `/api/admin-change-email`; use
   `vercel dev` for local integration checks.
3. Deploy the included rules from `app` with
   `firebase deploy --only firestore:rules --project smokescreen-2bc84`.

The endpoint verifies the caller's Firebase token (including revocation) and
current administrator email. It does not trust editable profile roles. Rules
reserve email writes for the server so client changes cannot bypass Auth.
Concurrent changes to the same user are serialized with a short server-only
Firestore lease. Profile and lookup writes are atomic. If they fail after Auth
changes, the endpoint attempts to restore the previous login email and reports
any incomplete recovery with instructions to retry the same address.

Vercel compiles API functions using the root `tsconfig.json`. Keep its
`module: ESNext` setting aligned with `package.json`'s `type: module`; the
referenced Vite TypeScript configuration alone does not configure function
compilation. Run `npm run test:api-startup` to check that the emitted function
loads in Node with the real Firebase Admin dependencies, without credentials.

The Firebase Admin dependency chain (`jwks-rsa` → `jose`) requires Node's
`require(esm)` support. Vercel disables that support by default. `vercel.json`
therefore sets the non-secret runtime option
`NODE_OPTIONS=--experimental-require-module`, and `package.json` selects Node 22.
The startup test reproduces Vercel's disabled default, applies this runtime
option, and loads the real endpoint in a separate Node process. See
[Vercel's runtime guidance](https://vercel.com/docs/functions/runtimes/node-js/advanced-node-configuration#experimental-nodejs-require-of-es-module).

Validate in a non-production environment: change a customer email, sign in
with the new email and the existing password, then sign in by account number.
Check that the old email no longer signs in and that duplicate emails and
non-admin requests are rejected. No live account is changed by the local tests.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
