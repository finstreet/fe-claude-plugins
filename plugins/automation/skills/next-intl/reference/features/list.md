# List Translations

```json
{
    "{featureName}.{product}.{role}.lists.{listName}": {
        "title": "",
        "columns": {
            // translations for all columns
        },
        "noItems": "",
    }
}
```

## List Actions

Some lists have the ability to filter / sort / group the list. There we will need some more translations in the following form:

```json
{
    "{listName}": {
      "actions": {
        "label": "Suchen & Filtern",
        "search": { // only add this if searching is enabled
            "label": "Suche",
            "placeholder": "Suche nach Anfragen",
        },
        "groupBy": { // only add this if grouping is enabled
            "label": "Gruppieren nach",
            "options": {
                "none": "Keine Gruppierung",
                "status": {
                   "label": "",
                    "titles": {
                        // one title for each status item
                    }
                },
                // for each group by enum the same as for status
            }
        },
        "sortBy": { // only add this if sorting is enabled
            "label": "Sortieren nach",
            "options": {
                "none": "Keine Sortierung",
                "createdAtAsc": "",
                // for each sorting option a translation
            }
        },
        "reset": "Zurücksetzen"
    }
    }
}
```

## Grouping and Sorting translations

In your context you will receive a swagger documentation that looks like this:

```yaml
get:
  summary: Gets the list of financing cases
  tags:
    - Financial Service Providers
  security:
    - apiToken: []
  parameters:
    - name: q
      in: query
      style: deepObject
      schema:
        type: object
        properties:
          status_eq:
            type: string
            enum:
              - unmapped
              - incomplete
              - awaiting_market_value_indication
              - awaiting_offers
              - awaiting_contract_details
              - awaiting_contract
              - awaiting_signature
              - active_contract
              - archived
          case_manager_id_eq:
            type: string
          hoa_already_customer:
            type: boolean
          management_already_customer:
            type: boolean
          search_term:
            type: string
          sort:
            type: string
            enum:
              - submitted_at asc
              - submitted_at desc
              - created_at asc
              - created_at desc
              - status asc
              - status desc
              - property_management asc
              - property_management desc
            description: Sort options. Default is `submitted_at desc, created_at desc`.

```

### Sorting

For sorting you look for the `sort` parameter and add translations for all enums. Just use the correct german translations for this

### Grouping 

Grouping is a bit trickier. IGNORE all keys that are `sort`, `search_tearm` or that have the type: `string`. For all others either use the `enum` values and translate them to german or for booleans you can just go with `true` and `false` as keys and translate them to `Ja` and `Nein`

From the example above there is `case_manager_id_eq: type: string`. Just ignore this since there are no sensible values for groupings. Do this with ALL properties from type string!




