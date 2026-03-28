const { MongoClient, ObjectId } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = "recruitlog";

let client;
let db;

async function connect() {
  if (db) return db;
  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`Connected to MongoDB: ${DB_NAME}`);
  return db;
}

async function close() {
  if (client) await client.close();
}

// ─── COMPANIES ──────────────────────────────────────────────

async function getCompanies() {
  const database = await connect();
  return database.collection("companies").find({}).sort({ company_name: 1 }).toArray();
}

async function getCompanyById(id) {
  const database = await connect();
  return database.collection("companies").findOne({ _id: new ObjectId(id) });
}

async function createCompany(data) {
  const database = await connect();
  const doc = {
    company_name: data.company_name,
    industry: data.industry,
    company_size: data.company_size,
    headquarters_location: data.headquarters_location,
    website_url: data.website_url,
    job_listings: [],
  };
  return database.collection("companies").insertOne(doc);
}

async function updateCompany(id, data) {
  const database = await connect();
  return database.collection("companies").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        company_name: data.company_name,
        industry: data.industry,
        company_size: data.company_size,
        headquarters_location: data.headquarters_location,
        website_url: data.website_url,
      },
    }
  );
}

async function deleteCompany(id) {
  const database = await connect();
  return database.collection("companies").deleteOne({ _id: new ObjectId(id) });
}

// ─── APPLICANTS ─────────────────────────────────────────────

async function getApplicants() {
  const database = await connect();
  return database.collection("applicants").find({}).sort({ username: 1 }).toArray();
}

async function getApplicantById(id) {
  const database = await connect();
  return database.collection("applicants").findOne({ _id: new ObjectId(id) });
}

async function createApplicant(data) {
  const database = await connect();
  const doc = {
    email: data.email,
    username: data.username,
    university: data.university,
    gpa: parseFloat(data.gpa),
    graduation_year: parseInt(data.graduation_year),
    years_of_experience: parseInt(data.years_of_experience),
    degree_level: data.degree_level,
    is_anonymized: data.is_anonymized === "true" || data.is_anonymized === true,
    skills: [],
    applications: [],
  };
  return database.collection("applicants").insertOne(doc);
}

async function updateApplicant(id, data) {
  const database = await connect();
  return database.collection("applicants").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        email: data.email,
        username: data.username,
        university: data.university,
        gpa: parseFloat(data.gpa),
        graduation_year: parseInt(data.graduation_year),
        years_of_experience: parseInt(data.years_of_experience),
        degree_level: data.degree_level,
        is_anonymized: data.is_anonymized === "true" || data.is_anonymized === true,
      },
    }
  );
}

async function deleteApplicant(id) {
  const database = await connect();
  return database.collection("applicants").deleteOne({ _id: new ObjectId(id) });
}

// ─── HOMEPAGE STATS ─────────────────────────────────────────

async function getHomepageStats() {
  const database = await connect();

  const totalCompanies = await database.collection("companies").countDocuments();
  const totalApplicants = await database.collection("applicants").countDocuments();

  // Count total listings across all companies
  const listingsAgg = await database
    .collection("companies")
    .aggregate([
      { $project: { count: { $size: "$job_listings" } } },
      { $group: { _id: null, total: { $sum: "$count" } } },
    ])
    .toArray();
  const totalListings = listingsAgg.length > 0 ? listingsAgg[0].total : 0;

  // Count total applications across all applicants
  const appsAgg = await database
    .collection("applicants")
    .aggregate([
      { $project: { count: { $size: "$applications" } } },
      { $group: { _id: null, total: { $sum: "$count" } } },
    ])
    .toArray();
  const totalApplications = appsAgg.length > 0 ? appsAgg[0].total : 0;

  // Count accepted offers
  const acceptedAgg = await database
    .collection("applicants")
    .aggregate([
      { $unwind: "$applications" },
      { $match: { "applications.status": "accepted" } },
      { $count: "total" },
    ])
    .toArray();
  const acceptedOffers = acceptedAgg.length > 0 ? acceptedAgg[0].total : 0;

  return { totalCompanies, totalApplicants, totalListings, totalApplications, acceptedOffers };
}

module.exports = {
  connect,
  close,
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getApplicants,
  getApplicantById,
  createApplicant,
  updateApplicant,
  deleteApplicant,
  getHomepageStats,
};
