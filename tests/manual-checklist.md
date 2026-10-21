# Manual verification checklist

- [ ] Health endpoint responds.
- [ ] Register always creates a MEMBER, ignoring any submitted role field.
- [ ] Unverified account cannot log in or submit reports/claims.
- [ ] Invalid credentials do not reveal whether the email exists.
- [ ] Public found-item output never includes `privateIdentifiers`, `storageLocation`, `embedding`, reporter email, or claim evidence.
- [ ] Member cannot read another member's report or claim details.
- [ ] Member cannot access officer evidence endpoint.
- [ ] Officer cannot access a claim outside their assigned desk.
- [ ] Duplicate active claims are rejected.
- [ ] Rejected/pending claims cannot be handed over.
- [ ] Only APPROVED claims can be handed over; report status becomes RETURNED.
- [ ] Semantic match returns possible matches, never ownership decisions.
- [ ] Policy RAG cites retrieved sources and gracefully answers when no relevant policy exists.
- [ ] Conversational history is scoped to the authenticated user.
- [ ] Agent tool outputs never contain private report fields.
