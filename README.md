# Recruit.log: MongoDB Document Database (Project 2)

A document-based database redesign of **Recruit.log**, converting the original 11-table relational schema (SQLite) into 3 hierarchical MongoDB collections using embedded data patterns.

**Authors:** Ganesh Batchu & Quinn Lambert
**Course:** CS3200 — Database Design | Northeastern University

---

## Quick Start

```bash
# 1. Import seed data into MongoDB
mongoimport --db recruitlog --collection companies  --file data/companies.json  --jsonArray --drop
mongoimport --db recruitlog --collection applicants --file data/applicants.json --jsonArray --drop
mongoimport --db recruitlog --collection advisors   --file data/advisors.json   --jsonArray --drop

# 2. Run queries
cd queries && npm install
node query1-aggregation-acceptance-rate.js
node query2-complex-search.js
node query3-count-user-applications.js
node query4-toggle-listing-active.js
node query5-skill-success-analysis.js

# 3. Launch the web app
cd ../app && npm install && npm start
# Open http://localhost:3000
```

---

## Repository Structure

```
recruit-log-project2/
├── README.md                          ← This file
│
├── docs/
│   ├── project-2-requirements.md      ← [Task 1] Problem requirements
│   └── collection-definitions.json    ← [Task 3] JSON collection examples with comments
│
├── diagrams/
│   └── project-2-hierarchical-erd.md  ← [Task 2] Hierarchical logical model (Mermaid)
│
├── data/
│   ├── companies.json                 ← [Task 4] 12 companies with embedded listings
│   ├── applicants.json                ← [Task 4] 15 applicants with embedded skills/apps
│   ├── advisors.json                  ← [Task 4] 5 advisors with embedded bookmarks
│   └── README-import.md              ← [Task 4] Import instructions (mongoimport / Compass)
│
├── queries/
│   ├── package.json                   ← MongoDB driver dependency
│   ├── query1-aggregation-acceptance-rate.js  ← [Task 5] Aggregation framework
│   ├── query2-complex-search.js               ← [Task 5] Complex $or search
│   ├── query3-count-user-applications.js      ← [Task 5] Count for specific user
│   ├── query4-toggle-listing-active.js        ← [Task 5] Update/toggle boolean
│   └── query5-skill-success-analysis.js       ← [Task 5] Bonus aggregation
│
└── app/                               ← [Task 6] Node + Express + MongoDB
    ├── package.json
    ├── app.js                         ← Express server entry point
    ├── db/
    │   └── dbConnector_Mongo.js       ← MongoDB CRUD operations
    ├── routes/
    │   └── index.js                   ← Express routes (companies + applicants)
    └── views/                         ← EJS templates
        ├── layout/
        │   ├── header.ejs
        │   └── footer.ejs
        ├── index.ejs
        ├── companies.ejs
        ├── company-detail.ejs
        ├── company-form.ejs
        ├── applicants.ejs
        ├── applicant-detail.ejs
        ├── applicant-form.ejs
        └── error.ejs
```

---

## Schema Design: SQL → MongoDB

### From 11 Normalized Tables to 3 Collections

| SQL Tables | MongoDB Collection | Embedding Strategy |
|---|---|---|
| Company, Job_Listing, Internship, Full_Time_Position, Skill (via Listing_Requirement) | **companies** | Listings embedded in company; requirements embedded in listing; subtype details as nullable sub-objects |
| Applicant, Applicant_Skill, Skill, Application | **applicants** | Skills and applications embedded in applicant; company/listing info denormalized as strings |
| Advisor, Advisor_Bookmark | **advisors** | Bookmarks embedded in advisor; listing info denormalized |

### Design Rationale

Following the **embedded data model** recommended by MongoDB documentation:
- **One-to-many** relationships (Company → Listings, Applicant → Skills) are embedded as arrays
- **Generalization/subtype** (Internship vs Full_Time) is represented with nullable `internship_details` / `full_time_details` sub-objects
- **Cross-collection references** use denormalized strings (company_name, listing_title) rather than ObjectId refs, optimizing for read-heavy access patterns

---

## Task Deliverables

### Task 1 — Problem Requirements & UML (5 pts)
- See `docs/project-2-requirements.md`
- UML diagram reused from Project 1 (available in the [Project 1 repo](https://github.com/Nalomun/recruit.log))

### Task 2 — Hierarchical Logical Model (15 pts)
- See `diagrams/project-2-hierarchical-erd.md` (Mermaid ER diagram)

### Task 3 — Collection Definitions (10 pts)
- See `docs/collection-definitions.json` — 2 example documents per collection with comments

### Task 4 — Test Data Population (15 pts)
- JSON files in `data/` folder
- Import instructions in `data/README-import.md`
- Data counts: 12 companies, 14 listings, 15 applicants, 40 skills, 30 applications, 5 advisors, 10 bookmarks

### Task 5 — MongoDB Queries (30 pts)
| Query | File | Requirement |
|---|---|---|
| 1 | `query1-aggregation-acceptance-rate.js` | **Aggregation framework** — `$unwind` + `$group` for acceptance rates |
| 2 | `query2-complex-search.js` | **Complex search** — `$or` with nested `$and` + `$elemMatch` |
| 3 | `query3-count-user-applications.js` | **Count documents** — application count for specific user |
| 4 | `query4-toggle-listing-active.js` | **Update document** — toggle `is_active` boolean |
| 5 | `query5-skill-success-analysis.js` | **Bonus** — double `$unwind` skill-to-success correlation |

### Task 6 — Node + Express App (25 pts, Optional)
Full CRUD for **companies** and **applicants** collections:
- List all, view detail, create, edit, delete
- Bootstrap 5 responsive UI
- Homepage with aggregated stats

---

## Prerequisites

- **MongoDB** 6.0+ (local install or Atlas)
- **Node.js** 18+
- **npm** 9+

---

## Database Import

See `data/README-import.md` for detailed instructions. Quick version:

```bash
mongoimport --db recruitlog --collection companies  --file data/companies.json  --jsonArray --drop
mongoimport --db recruitlog --collection applicants --file data/applicants.json --jsonArray --drop
mongoimport --db recruitlog --collection advisors   --file data/advisors.json   --jsonArray --drop
```

Verify:
```bash
mongosh recruitlog --eval "
  print('Companies:  ' + db.companies.countDocuments());
  print('Applicants: ' + db.applicants.countDocuments());
  print('Advisors:   ' + db.advisors.countDocuments());
"
```
