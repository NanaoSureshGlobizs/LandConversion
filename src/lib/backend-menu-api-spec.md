# Backend Menu API Specification

To enable full backend control over the sidebar navigation, the frontend expects an API endpoint (e.g., `/api/user-menu`) that returns a JSON array of menu item objects tailored to the authenticated user's role.

The frontend will recursively render this structure to build the main menus and sub-menus.

## JSON Object Structure

Each object in the array represents a single menu item and should conform to the following structure:

```json
{
  "label": "string",
  "icon": "string",
  "href": "string | null",
  "type": "string | null",
  "workflowId": "number | null",
  "subItems": "Array<MenuItem> | null"
}
```

### Field Descriptions

- **`label`** (string, required): The text displayed for the menu item (e.g., "Dashboard", "Conversion").
- **`icon`** (string, required): A key representing the icon. The frontend maps this to a specific icon component. See the list of available icon keys below.
- **`href`** (string | null): The URL path for the link (e.g., `/dashboard/pending-enquiries`). This should be `null` for parent items that only act as collapsible group headers.
- **`type`** (string | null): Used as a query parameter for pages that differentiate content, like "conversion" or "diversion". Results in a URL like `/dashboard/pending-enquiries?type=conversion`.
- **`workflowId`** (number | null): The specific `workflow_sequence_id` associated with the page, which the frontend can use for subsequent API calls.
- **`subItems`** (Array | null): An array of `MenuItem` objects to create a nested submenu. If the item has no submenu, this should be `null` or omitted.

---

## Example API Response for "SDO/DAO" Role

This example shows the JSON response for a user with the "SDO/DAO" role. This user should see the "Dashboard", a "Conversion" menu, and a "Diversion" menu, each with specific sub-items.

```json
[
  {
    "label": "Dashboard",
    "icon": "Home",
    "href": "/dashboard",
    "type": null,
    "workflowId": null,
    "subItems": null
  },
  {
    "label": "Conversion",
    "icon": "FileText",
    "href": null,
    "type": null,
    "workflowId": null,
    "subItems": [
      {
        "label": "SDO/DAO Report",
        "icon": null,
        "href": "/dashboard/sdo-dao-report",
        "type": "conversion",
        "workflowId": 25,
        "subItems": null
      },
      {
        "label": "LLMC Recommendations",
        "icon": null,
        "href": "/dashboard/llmc-recommendations",
        "type": "conversion",
        "workflowId": 27,
        "subItems": null
      }
    ]
  },
  {
    "label": "Diversion",
    "icon": "ShieldCheck",
    "href": null,
    "type": null,
    "workflowId": null,
    "subItems": [
      {
        "label": "SDO/DAO Report",
        "icon": null,
        "href": "/dashboard/sdo-dao-report",
        "type": "diversion",
        "workflowId": 18,
        "subItems": null
      }
    ]
  }
]
```

---

## Available Icon Keys

The frontend will map the `icon` string to the corresponding component. Use one of the following keys:

- `Home`
- `Files`
- `FilePlus2`
- `Mountain`
- `Users`
- `History`
- `FileText`
- `ShieldCheck`
- `AreaChart`
- `Library`
- `FileBarChart`
- `Gavel`
- `Map`
- `Trees`
- `Briefcase`
- `Building2`

If an icon is not needed (e.g., for a sub-item), you can pass `null` or an empty string.
