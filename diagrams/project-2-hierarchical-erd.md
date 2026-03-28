# Recruit.log -- Hierarchical Document Model (MongoDB ERD)

> This diagram shows the 3 root MongoDB collections and their embedded sub-documents.
> The original Project 1 SQL schema had 11 normalized tables; Project 2 collapses them
> into 3 denormalized collections using MongoDB's embedded document pattern.

## Mapping from SQL Tables to MongoDB Collections

| SQL Tables (Project 1)                                          | MongoDB Collection (Project 2) |
|-----------------------------------------------------------------|-------------------------------|
| Company, Job_Listing, Internship, Full_Time, Skill, Listing_Requirement | **companies**           |
| Applicant, Applicant_Skill, Skill, Application                  | **applicants**                |
| Advisor, Advisor_Bookmark                                       | **advisors**                  |

## Mermaid ERD

```mermaid
erDiagram
    %% ============================================================
    %% ROOT COLLECTION 1: companies
    %% Embeds: job_listings -> requirements, internship_details, full_time_details
    %% Replaces SQL tables: Company, Job_Listing, Internship, Full_Time,
    %%                       Listing_Requirement, Skill (as requirement context)
    %% ============================================================

    companies {
        string company_name PK "Natural key"
        string industry
        string company_size "startup | mid | large | enterprise"
        string headquarters_location
        string website_url
    }

    job_listing {
        int listing_id "Local identifier"
        string title
        string role_type "internship | full-time | co-op"
        string location
        string posted_date
        string closing_date
        bool is_active
        number salary_min "Monthly (intern) or annual (FT)"
        number salary_max
        string description
        string experience_level "entry | mid | senior"
        string listing_type "Discriminator: internship | full_time"
    }

    internship_details {
        string season "summer | fall | spring"
        bool is_coop
        string duration "e.g. 12 weeks"
    }

    full_time_details {
        string employment_type "full-time | contract"
        number signing_bonus
        string remote_policy "onsite | hybrid | remote"
    }

    requirement {
        string skill_name
        string skill_type "language | framework | tool | concept"
        bool is_required
        string desired_proficiency "beginner | intermediate | advanced"
    }

    companies ||--o{ job_listing : "embeds job_listings[]"
    job_listing ||--o| internship_details : "embeds (when listing_type=internship)"
    job_listing ||--o| full_time_details : "embeds (when listing_type=full_time)"
    job_listing ||--o{ requirement : "embeds requirements[]"

    %% ============================================================
    %% ROOT COLLECTION 2: applicants
    %% Embeds: skills[], applications[]
    %% Replaces SQL tables: Applicant, Applicant_Skill, Skill (as proficiency),
    %%                       Application
    %% ============================================================

    applicants {
        string email PK "Natural key"
        string username
        string university
        float gpa
        int graduation_year
        int years_of_experience
        string degree_level "BS | MS | PhD"
        bool is_anonymized "Default true"
    }

    applicant_skill {
        string skill_name
        string skill_type "language | framework | tool | concept"
        string proficiency_level "beginner | intermediate | advanced"
        int years_used
    }

    application {
        string company_name "Denormalized ref to companies"
        string listing_title "Denormalized ref to job_listing"
        string applied_date
        string status "applied | accepted | rejected | withdrawn"
        string rejection_stage "application | OA | phoneScreen | interview | null"
        number offer_salary "null if no offer"
        string notes
        bool is_active "false when withdrawn"
    }

    applicants ||--o{ applicant_skill : "embeds skills[]"
    applicants ||--o{ application : "embeds applications[]"

    %% ============================================================
    %% ROOT COLLECTION 3: advisors
    %% Embeds: bookmarks[]
    %% Replaces SQL tables: Advisor, Advisor_Bookmark
    %% ============================================================

    advisors {
        string email PK "Natural key"
        string name
        string role "faculty | careerCenter | institutionalResearcher | consultant"
        string institution
        string department
    }

    bookmark {
        string company_name "Denormalized ref to companies"
        string listing_title "Denormalized ref to job_listing"
        string last_viewed
        bool is_bookmarked "false = un-bookmarked but kept for history"
    }

    advisors ||--o{ bookmark : "embeds bookmarks[]"

    %% ============================================================
    %% CROSS-COLLECTION REFERENCES (denormalized, not enforced)
    %% These are logical references via string matching, not MongoDB $ref
    %% ============================================================

    application }o--|| job_listing : "references via company_name + listing_title"
    bookmark }o--|| job_listing : "references via company_name + listing_title"
```

## Legend

| Symbol | Meaning |
|--------|---------|
| `||--o{` | One-to-many embedding (parent embeds array of children) |
| `||--o|` | One-to-zero-or-one embedding (conditional sub-document) |
| `}o--||` | Many-to-one logical reference (denormalized string, not a foreign key) |
| **Bold collection name** | Root-level MongoDB collection (top of document hierarchy) |
| Regular entity name | Embedded sub-document (lives inside a parent collection) |

## Transformation Summary

**11 SQL tables** collapsed into **3 MongoDB collections**:

- **companies** absorbs: Company + Job_Listing + Internship + Full_Time + Listing_Requirement + Skill (requirement context) = **6 tables**
- **applicants** absorbs: Applicant + Applicant_Skill + Skill (proficiency context) + Application = **4 tables**
- **advisors** absorbs: Advisor + Advisor_Bookmark = **2 tables**

> Note: The Skill entity from SQL appears in multiple embedded contexts (as `requirement` in listings and as `applicant_skill` in applicants) rather than as a shared referenced collection. This denormalization is intentional -- skills are lightweight value objects that benefit from co-location with their parent documents.
