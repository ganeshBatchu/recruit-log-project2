/**
 * Query 3: Count Applications for a Specific User
 *
 * Requirement: Must count documents for a specific user.
 *
 * For the applicant with username "alice_dev":
 *   - Get the total count of entries in the applications array (using $size
 *     via aggregation)
 *   - Break down the count by application status
 *
 * Database: recruitlog
 * Collection: applicants
 */

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'recruitlog';

const TARGET_USERNAME = 'alice_dev';

async function main() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB.\n');

    const db = client.db(dbName);
    const applicants = db.collection('applicants');

    // --- Total application count using $size in aggregation ---
    const countPipeline = [
      { $match: { username: TARGET_USERNAME } },
      {
        $project: {
          username: 1,
          total_applications: { $size: { $ifNull: ['$applications', []] } }
        }
      }
    ];

    const countResult = await applicants.aggregate(countPipeline).toArray();

    console.log(`=== Application Count for "${TARGET_USERNAME}" ===\n`);

    if (countResult.length === 0) {
      console.log(`User "${TARGET_USERNAME}" not found.`);
      return;
    }

    console.log(`Total applications: ${countResult[0].total_applications}\n`);

    // --- Breakdown by status using $unwind + $group ---
    const breakdownPipeline = [
      { $match: { username: TARGET_USERNAME } },
      { $unwind: '$applications' },
      {
        $group: {
          _id: '$applications.status',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ];

    const breakdownResults = await applicants.aggregate(breakdownPipeline).toArray();

    console.log('Breakdown by status:');
    console.log('-'.repeat(30));

    if (breakdownResults.length === 0) {
      console.log('  No applications found.');
    } else {
      breakdownResults.forEach((row) => {
        const status = row._id || 'unknown';
        console.log(`  ${status.padEnd(20)} : ${row.count}`);
      });
    }

    // Also print the raw application details
    console.log('\nDetailed application list:');
    console.log('-'.repeat(50));

    const user = await applicants.findOne(
      { username: TARGET_USERNAME },
      { projection: { applications: 1, _id: 0 } }
    );

    if (user && user.applications) {
      user.applications.forEach((app, i) => {
        console.log(`  ${i + 1}. ${app.company_name} - ${app.listing_title}`);
        console.log(`     Status: ${app.status} | Active: ${app.is_active}`);
        if (app.rejection_stage) {
          console.log(`     Rejection Stage: ${app.rejection_stage}`);
        }
        if (app.offer_salary) {
          console.log(`     Offer Salary: $${app.offer_salary.toLocaleString()}`);
        }
        console.log('');
      });
    }
  } finally {
    await client.close();
    console.log('Connection closed.');
  }
}

main().catch(console.error);
