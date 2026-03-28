# Database Import Instructions

## Prerequisites
- MongoDB installed locally (or MongoDB Atlas connection)
- `mongoimport` CLI tool (comes with MongoDB Database Tools)
- Alternatively, MongoDB Compass (GUI)

## Option 1: Using mongoimport (CLI)

```bash
# Create the database and import all three collections
mongoimport --db recruitlog --collection companies --file data/companies.json --jsonArray --drop
mongoimport --db recruitlog --collection applicants --file data/applicants.json --jsonArray --drop
mongoimport --db recruitlog --collection advisors --file data/advisors.json --jsonArray --drop
```

### Verify import
```bash
mongosh recruitlog --eval "
  print('Companies: ' + db.companies.countDocuments());
  print('Applicants: ' + db.applicants.countDocuments());
  print('Advisors: ' + db.advisors.countDocuments());
"
```

Expected output:
```
Companies: 12
Applicants: 15
Advisors: 5
```

## Option 2: Using MongoDB Compass (GUI)

1. Open MongoDB Compass and connect to `mongodb://localhost:27017`
2. Click **Create Database** → Name it `recruitlog`
3. For each collection:
   - Click **Create Collection** → Name it (`companies`, `applicants`, `advisors`)
   - Click **Add Data** → **Import JSON or CSV file**
   - Select the corresponding `.json` file from the `data/` folder
   - Click **Import**

## Option 3: Using mongosh (Shell)

```bash
mongosh recruitlog --eval "
  db.companies.drop();
  db.applicants.drop();
  db.advisors.drop();
"

# Then use mongoimport as shown in Option 1
```

## Database Summary

| Collection   | Documents | Embedded Arrays                                  |
|-------------|-----------|--------------------------------------------------|
| companies   | 12        | job_listings (14 total), requirements (25 total)  |
| applicants  | 15        | skills (40 total), applications (30 total)        |
| advisors    | 5         | bookmarks (10 total)                              |
