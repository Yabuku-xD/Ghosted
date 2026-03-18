# Data Directory

Place raw source files for imports in this folder when you want to seed or refresh the local database.

## Expected files

- `LCA_Disclosure_Data_FY2025.csv`
- Additional yearly DOL disclosure files if you plan to run the batch importer

## Why raw data is not committed

The original files are large, change over time, and are better treated as local setup assets than source code. Keeping them out of Git makes cloning and reviewing the repository much lighter.

## Typical workflow

1. Download the desired DOL disclosure files locally.
2. Copy them into `backend/data/`.
3. Run the relevant management command from `backend/`, for example:

```bash
python manage.py import_h1b_data ../backend/data/LCA_Disclosure_Data_FY2025.csv
```

or:

```bash
python manage.py import_h1b_directory ../backend/data
```
