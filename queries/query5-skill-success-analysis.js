/**
 * Query 5: Skill-Based Success Analysis (Bonus Aggregation)
 *
 * Requirement: Use aggregation to analyze which skills correlate with
 * accepted applications.
 *
 * Pipeline:
 *   1. $unwind the skills array
 *   2. $unwind the applications array
 *   3. $group by skill_name:
 *      - Count distinct applicants with that skill
 *      - Count how many of those applicants have at least one accepted
 *        application
 *   4. Calculate success_rate
 *   5. $sort by success_rate descending
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
      // Unwind skills so each skill becomes its own document
      { $unwind: '$skills' },

      // Unwind applications so each (skill, application) pair is a document
      { $unwind: '$applications' },

      // For each (applicant, skill) pair, determine if this application was accepted
      {
        $group: {
          _id: {
            skill_name: '$skills.skill_name',
            applicant_id: '$_id'
          },
          has_acceptance: {
            $max: {
              $cond: [{ $eq: ['$applications.status', 'accepted'] }, 1, 0]
            }
          }
        }
      },

      // Now group by skill_name across all applicants
      {
        $group: {
          _id: '$_id.skill_name',
          total_applicants_with_skill: { $sum: 1 },
          applicants_with_acceptance: { $sum: '$has_acceptance' }
        }
      },

      // Compute the success rate
      {
        $addFields: {
          success_rate_pct: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$applicants_with_acceptance', '$total_applicants_with_skill'] },
                  100
                ]
              },
              2
            ]
          }
        }
      },

      // Sort by success rate descending
      { $sort: { success_rate_pct: -1, _id: 1 } }
    ];

    const results = await applicants.aggregate(pipeline).toArray();

    console.log('=== Skill-Based Success Analysis ===');
    console.log('Which skills correlate with accepted applications?\n');

    if (results.length === 0) {
      console.log('No data found.');
    } else {
      // Print header
      console.log(
        'Skill'.padEnd(25) +
        'Applicants'.padEnd(14) +
        'Accepted'.padEnd(12) +
        'Success Rate'
      );
      console.log('-'.repeat(63));

      results.forEach((row) => {
        console.log(
          (row._id || 'unknown').padEnd(25) +
          String(row.total_applicants_with_skill).padEnd(14) +
          String(row.applicants_with_acceptance).padEnd(12) +
          `${row.success_rate_pct}%`
        );
      });
    }

    console.log(`\nTotal distinct skills analyzed: ${results.length}`);
  } finally {
    await client.close();
    console.log('\nConnection closed.');
  }
}

main().catch(console.error);
