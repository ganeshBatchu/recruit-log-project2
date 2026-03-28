/**
 * Query 4: Toggle is_active on a Job Listing
 *
 * Requirement: Must update a document based on a query parameter (toggle a
 * boolean).
 *
 * Target: Company "Palantir", job listing "Defense Tech Intern"
 *
 * Steps:
 *   1. Read the current is_active value for the matching listing
 *   2. Toggle it (true -> false, false -> true) using arrayFilters
 *   3. Print the before and after state
 *
 * Database: recruitlog
 * Collection: companies
 */

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'recruitlog';

const COMPANY_NAME = 'Palantir';
const LISTING_TITLE = 'Defense Tech Intern';

async function main() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB.\n');

    const db = client.db(dbName);
    const companies = db.collection('companies');

    // --- Step 1: Read the current state ---
    const beforeDoc = await companies.findOne(
      { company_name: COMPANY_NAME },
      { projection: { company_name: 1, job_listings: 1 } }
    );

    if (!beforeDoc) {
      console.log(`Company "${COMPANY_NAME}" not found.`);
      return;
    }

    const targetListing = beforeDoc.job_listings
      ? beforeDoc.job_listings.find((l) => l.listing_title === LISTING_TITLE)
      : null;

    if (!targetListing) {
      console.log(`Listing "${LISTING_TITLE}" not found for ${COMPANY_NAME}.`);
      return;
    }

    const currentActive = targetListing.is_active;
    const newActive = !currentActive;

    console.log(`=== Toggle is_active for "${LISTING_TITLE}" at ${COMPANY_NAME} ===\n`);
    console.log(`BEFORE: is_active = ${currentActive}`);

    // --- Step 2: Toggle the is_active field using arrayFilters ---
    const updateResult = await companies.updateOne(
      { company_name: COMPANY_NAME },
      {
        $set: { 'job_listings.$[listing].is_active': newActive }
      },
      {
        arrayFilters: [{ 'listing.listing_title': LISTING_TITLE }]
      }
    );

    console.log(`\nUpdate result: matchedCount=${updateResult.matchedCount}, modifiedCount=${updateResult.modifiedCount}`);

    // --- Step 3: Read and print the after state ---
    const afterDoc = await companies.findOne(
      { company_name: COMPANY_NAME },
      { projection: { job_listings: 1 } }
    );

    const updatedListing = afterDoc.job_listings.find(
      (l) => l.listing_title === LISTING_TITLE
    );

    console.log(`AFTER:  is_active = ${updatedListing.is_active}`);
    console.log(`\nSuccessfully toggled is_active from ${currentActive} to ${updatedListing.is_active}.`);
  } finally {
    await client.close();
    console.log('\nConnection closed.');
  }
}

main().catch(console.error);
