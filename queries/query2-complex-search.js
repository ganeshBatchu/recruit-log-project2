/**
 * Query 2: Complex Search with $or and Multiple Logical Connectors
 *
 * Requirement: Must use complex search with $or and multiple logical connectors.
 *
 * Find applicants who match EITHER:
 *   A) (degree_level is "MS" or "PhD") AND years_of_experience >= 2
 *   B) (degree_level is "BS") AND (gpa > 3.8) AND (has a skill with
 *       skill_name "Python" and proficiency_level "advanced")
 *
 * Uses $or at the top level with nested $and conditions.
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

    const query = {
      $or: [
        // Condition A: (MS or PhD) AND >= 2 years experience
        {
          $and: [
            { degree_level: { $in: ['MS', 'PhD'] } },
            { years_of_experience: { $gte: 2 } }
          ]
        },

        // Condition B: BS AND gpa > 3.8 AND has advanced Python skill
        {
          $and: [
            { degree_level: 'BS' },
            { gpa: { $gt: 3.8 } },
            {
              skills: {
                $elemMatch: {
                  skill_name: 'Python',
                  proficiency_level: 'advanced'
                }
              }
            }
          ]
        }
      ]
    };

    const projection = {
      username: 1,
      university: 1,
      degree_level: 1,
      gpa: 1,
      years_of_experience: 1,
      _id: 0
    };

    const results = await applicants.find(query).project(projection).toArray();

    console.log('=== Complex Search: Qualified Applicants ===');
    console.log('Criteria:');
    console.log('  A) (MS or PhD) with >= 2 years experience');
    console.log('  B) BS with GPA > 3.8 and advanced Python skill\n');

    if (results.length === 0) {
      console.log('No matching applicants found.');
    } else {
      results.forEach((applicant, i) => {
        console.log(`${i + 1}. ${applicant.username}`);
        console.log(`   University  : ${applicant.university}`);
        console.log(`   Degree      : ${applicant.degree_level}`);
        console.log(`   GPA         : ${applicant.gpa}`);
        console.log(`   Experience  : ${applicant.years_of_experience} year(s)`);
        console.log('');
      });
    }

    console.log(`Total matching applicants: ${results.length}`);
  } finally {
    await client.close();
    console.log('\nConnection closed.');
  }
}

main().catch(console.error);
