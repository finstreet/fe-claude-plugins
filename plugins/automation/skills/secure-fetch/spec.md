# Request Specification (PO-facing)

## REQUEST — API Request

**PO-friendly name:** API Request / Backend Call

**When to use:** When the feature needs to make one or more API calls to the backend. This defines the endpoints, HTTP methods, authentication requirements, and response handling.

**Information to collect:**
- **Name** — Name for this set of requests (e.g., "Fetch Financing Cases")
- **Requests** — A list of API endpoints. For each request, collect:
  - **Endpoint** — The API URL path, prefixed with the HTTP method (e.g., `GET:/api/internal/financing_inquiries/{id}`)
  - **Request type** — Either `"client"` (browser-side) or `"server"` (server-side)
  - **Paginated** — Does the response use pagination? (yes/no)
  - **Protected** — Does this endpoint require authentication? (yes/no)
  - **Result schema** — Should a TypeScript type be generated for the response? (yes/no, always yes for GET requests)

**Metadata JSON schema:**
```json
{
  "requests": [
    {
      "endpoint": "/api/internal/financing_inquiries/{id}",
      "httpMethod": "GET",
      "requestType": "server",
      "paginated": false,
      "protected": true,
      "resultSchema": true
    }
  ]
}
```

> **Note:** In the form, the endpoint is entered as `GET:/api/path`. During storage, this is split into separate `httpMethod` and `endpoint` fields.
