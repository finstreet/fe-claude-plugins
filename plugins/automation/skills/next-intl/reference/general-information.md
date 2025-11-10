# General information

This file explains some general concepts for translations with the finstreet boilerplate.

The `de.json` file that contains all of the projects translations follows a strict structure. First of all there are some general translations for `buttons`, `notifications`, `validations`

```json
{
  "buttons": {
    "cancel": "Abbrechen",
    "back": "Zurück",
    "next": "Weiter",
    "submit": "Speichern"
  },
  "notifications": {},
  "validations": {}
}
```

Afterwards we structure our validations in the following way:

```json
{
  "{featureName}": {
    "{product}": {
      "{role}": {
        // translations
      }
    }
  }
}
```

Sometimes it's

```json
{
  "{featureName}": {
    "{product}": {
      "{role}": {
        "{subFeatureNames}": {
          // translations
        }
      }
    }
  }
}
```

`Product` and `role` might not be available. These are ALWAYS optional and you can just leave them out if they are not provided
