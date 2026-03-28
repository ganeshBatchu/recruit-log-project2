/**
 * Query 1: Aggregation - Acceptance Rate by Company
 *
 * Requirement: Must use the aggregation framework.
 *
 * Pipeline:
 *   1. $unwind the applicants.applications array
 *   2. $group by company_name to compute total_applications, total_accepted,
 *      and acceptance_rate_pct
 *   3. $sort by acceptance_rate ascending
 *
 * Database: recruitlog
 * Collection: applicants
 */

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'recruitlog';

async function main() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB.\n');

    const db = client.db(dbName);
    const applicants = db.collection('applicants');

    const pipeline = [
      // Unwind the applications array so each application becomes its own document
      { $unwind: '$applications' },

      // Group by the company_name inside each application
      {
        $group: {
          _id: '$applications.company_name',
          total_applications: { $sum: 1 },
          total_accepted: {
            $sum: {
              $cond: [{ $eq: ['$applications.status', 'accepted'] }, 1, 0]
            }
          }
        }
      },

      // Compute the acceptance rate as a percentage
      {
        $addFields: {
          acceptance_rate_pct: {
            $round: [
              { $multiply: [{ $divide: ['$total_accepted', '$total_applications'] }, 100] },
              2
            ]
          }
        }
      },

      // Sort by acceptance rate ascending (lowest first)
      { $sort: { acceptance_rate_pct: 1 } }
    ];

    const results = await applicants.aggregate(pipeline).toArray();

    console.log('=== Acceptance Rate by Company ===');
    console.log('(Sorted by acceptance rate, ascending)\n');

    if (results.length === 0) {
      console.log('No application data found.');
    } else {
      results.forEach((row, i) => {
        console.log(`${i + 1}. ${row._id}`);
        console.log(`   Total Applications : ${row.total_applications}`);
        console.log(`   Total Accepted     : ${row.total_accepted}`);
        console.log(`   Acceptance Rate    : ${row.acceptance_rate_pct}%`);
        console.log('');
      });
    }

    console.log(`Total companies with applications: ${results.length}`);
  } finally {
    await client.close();
    console.log('\nConnection closed.');
  }
}

main().catch(console.error);
