# Recruit.log -- Project 2 Requirements

## Problem Domain

Recruit.log is a CS internship and full-time job application tracking system designed for university students, career advisors, and institutional researchers. The system captures the full lifecycle of tech recruiting: companies post listings, applicants submit applications, and advisors monitor placement trends. All data is anonymized by default to protect student privacy while still enabling aggregate analysis.

Project 2 adapts the original SQL-based relational design (Project 1, which used 11 normalized tables) into a MongoDB document model with 3 denormalized collections. The migration prioritizes read-heavy access patterns typical of dashboards and analytics queries over write-time normalization.

---

## Business Rules

1. **Anonymized by default.** All applicant records have an `is_anonymized` flag set to `true` by default. Advisors and institutional researchers see only aggregate statistics unless the applicant explicitly opts out of anonymization.

2. **One application per listing per applicant.** An applicant may submit at most one application to any given job listing. Duplicate applications to the same listing are not permitted.

3. **Rejection stage tracking.** When an application is rejected, the `rejection_stage` field must be populated with the pipeline stage at which the rejection occurred. Valid stages are: `application`, `OA` (online assessment), `phoneScreen`, and `interview`.

4. **Rejection stage is null for non-rejected applications.** The `rejection_stage` field must be `null` for any application whose status is not `rejected`. This includes applications with status `applied`, `accepted`, or `withdrawn`.

5. **Application status lifecycle.** An application's status progresses through a defined set of values: `applied`, `accepted`, `rejected`, or `withdrawn`. Status transitions are one-directional (e.g., an accepted application cannot revert to applied).

6. **Listing subtype exclusivity.** Each job listing is either an internship or a full-time position. When `listing_type` is `internship`, only `internship_details` is populated and `full_time_details` is `null`, and vice versa. Both cannot be non-null simultaneously.

7. **Active listing window.** A listing's `is_active` flag should reflect whether the current date falls within the `posted_date` to `closing_date` range. Listings past their closing date should be marked inactive.

8. **Skills are self-reported.** Applicant skills include a self-assessed `proficiency_level` (beginner, intermediate, advanced) and `years_used`. These are not validated against external sources.

9. **Advisor roles determine visibility.** An advisor's `role` (faculty, careerCenter, institutionalResearcher, consultant) determines the scope of data they can access. Institutional researchers see cross-university aggregate data; faculty see department-level trends.

10. **Bookmarks preserve history.** When an advisor un-bookmarks a listing, the bookmark entry is retained with `is_bookmarked` set to `false` rather than being deleted. This preserves viewing history for analytics.

11. **Applications are soft-deleted.** Withdrawn applications set `is_active` to `false` but remain in the applicant's `applications` array. No application records are physically deleted.

12. **Salary semantics vary by listing type.** For internship listings, `salary_min` and `salary_max` represent monthly compensation. For full-time listings, they represent annual base salary. The `listing_type` field disambiguates the unit.

---

## User Personas

### Applicant
A current university student (BS, MS, or PhD) applying to internships and full-time positions in the tech industry. Applicants track their own application history, manage their skill profiles, and monitor application statuses. They interact primarily with their own applicant document.

### Advisor
A faculty member, career center counselor, or external consultant affiliated with a university. Advisors bookmark listings of interest, monitor placement trends, and provide guidance to students. They see anonymized aggregate data by default and interact with the advisors and companies collections.

### Institutional Researcher
A specialized advisor role focused on cross-university analytics. Institutional researchers analyze acceptance rates, rejection stage distributions, salary trends, and skill demand patterns across the full dataset. They query all three collections but do not modify applicant data.

---

## Entities

### Company
The root entity in the `companies` collection. Represents a hiring organization with attributes such as name, industry, size category, headquarters location, and website. Each company embeds an array of its job listings.

### Job_Listing (embedded in Company)
A specific position posted by a company. Contains title, location, salary range, posting dates, active status, and experience level. Each listing is subtyped as either an internship or full-time position via the `listing_type` discriminator field.

#### Internship (sub-document of Job_Listing)
Populated when `listing_type` is `internship`. Contains internship-specific fields: season (summer, fall, spring), whether it is a co-op, and duration in weeks.

#### Full_Time (sub-document of Job_Listing)
Populated when `listing_type` is `full_time`. Contains full-time-specific fields: employment type, signing bonus, and remote work policy (onsite, hybrid, remote).

### Skill (embedded in Job_Listing requirements and Applicant skills)
A technical competency categorized by type (language, framework, tool, concept). Skills appear in two contexts: as listing requirements (with `is_required` and `desired_proficiency`) and as applicant skills (with `proficiency_level` and `years_used`).

### Applicant
The root entity in the `applicants` collection. Represents a job-seeking student with academic attributes (university, GPA, graduation year, degree level) and an anonymization flag. Each applicant embeds arrays of skills and applications.

### Application (embedded in Applicant)
A record of an applicant's submission to a specific job listing. References the target listing by denormalized company name and listing title. Tracks status, rejection stage (if applicable), offer salary, and notes.

### Advisor
The root entity in the `advisors` collection. Represents a university-affiliated professional who monitors job listings. Contains name, email, role, institution, and department. Each advisor embeds an array of bookmarked listings.

---

## MongoDB Adaptation Notes

| Aspect | Project 1 (SQL) | Project 2 (MongoDB) |
|--------|-----------------|---------------------|
| Tables/Collections | 11 normalized tables | 3 denormalized collections |
| Relationships | Foreign keys with JOIN | Embedded sub-documents |
| Subtype hierarchy | Separate Internship/Full_Time tables | Discriminator field + conditional sub-documents |
| Skill references | Skill table + join tables | Inline skill objects (denormalized) |
| Cross-entity links | Integer foreign keys | Denormalized string references (company_name, listing_title) |
| Access pattern | Flexible multi-table joins | Optimized for single-document reads per persona |
