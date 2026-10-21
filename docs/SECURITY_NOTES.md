# Security notes before deployment

- Member registration always assigns the `MEMBER` role. A moderator must explicitly assign staff roles.
- Private report fields are excluded from public serializers and normally excluded from Mongoose queries.
- Claims require a verified account, duplicate active claims are rejected, and the server checks the officer's desk assignment.
- Only approved claims can be handed over; AI similarity never approves a claim.
- Passwords use bcrypt hashes; reset/verification tokens are stored as hashes and expire.
- Protected write endpoints require the CSRF cookie/header pair. Access tokens are HTTP-only cookies.
- Use HTTPS and set `COOKIE_SECURE=true` in production. Use a long random `JWT_SECRET`.
- The demo exposes verification/reset tokens only when `NODE_ENV` is not `production`. Connect an actual campus email service before deployment.
- Add persistent login/session revocation, audit logs, email verification delivery, monitoring, backups, and institution-approved retention rules before real-world use.
- Confirm that your campus email domain, desk policy, retention periods, and contact details are approved by your institution.
