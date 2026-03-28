const express = require("express");
const router = express.Router();
const db = require("../db/dbConnector_Mongo");

// ─── HOME ───────────────────────────────────────────────────

router.get("/", async (req, res) => {
  try {
    const stats = await db.getHomepageStats();
    res.render("index", { title: "Recruit.log", stats });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to load homepage", error: err });
  }
});

// ─── COMPANIES — LIST ───────────────────────────────────────

router.get("/companies", async (req, res) => {
  try {
    const companies = await db.getCompanies();
    res.render("companies", { title: "Companies", companies });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to load companies", error: err });
  }
});

// ─── COMPANIES — NEW FORM ───────────────────────────────────

router.get("/companies/new", (req, res) => {
  res.render("company-form", { title: "Add Company", company: null, action: "/companies" });
});

// ─── COMPANIES — CREATE ─────────────────────────────────────

router.post("/companies", async (req, res) => {
  try {
    await db.createCompany(req.body);
    res.redirect("/companies");
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to create company", error: err });
  }
});

// ─── COMPANIES — DETAIL ─────────────────────────────────────

router.get("/companies/:id", async (req, res) => {
  try {
    const company = await db.getCompanyById(req.params.id);
    if (!company) return res.status(404).render("error", { message: "Company not found", error: {} });
    res.render("company-detail", { title: company.company_name, company });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to load company", error: err });
  }
});

// ─── COMPANIES — EDIT FORM ──────────────────────────────────

router.get("/companies/:id/edit", async (req, res) => {
  try {
    const company = await db.getCompanyById(req.params.id);
    if (!company) return res.status(404).render("error", { message: "Company not found", error: {} });
    res.render("company-form", { title: "Edit " + company.company_name, company, action: `/companies/${req.params.id}?_method=PUT` });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to load company", error: err });
  }
});

// ─── COMPANIES — UPDATE ─────────────────────────────────────

router.put("/companies/:id", async (req, res) => {
  try {
    await db.updateCompany(req.params.id, req.body);
    res.redirect(`/companies/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to update company", error: err });
  }
});

// ─── COMPANIES — DELETE ─────────────────────────────────────

router.delete("/companies/:id", async (req, res) => {
  try {
    await db.deleteCompany(req.params.id);
    res.redirect("/companies");
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to delete company", error: err });
  }
});

// ─── APPLICANTS — LIST ──────────────────────────────────────

router.get("/applicants", async (req, res) => {
  try {
    const applicants = await db.getApplicants();
    res.render("applicants", { title: "Applicants", applicants });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to load applicants", error: err });
  }
});

// ─── APPLICANTS — NEW FORM ──────────────────────────────────

router.get("/applicants/new", (req, res) => {
  res.render("applicant-form", { title: "Add Applicant", applicant: null, action: "/applicants" });
});

// ─── APPLICANTS — CREATE ────────────────────────────────────

router.post("/applicants", async (req, res) => {
  try {
    await db.createApplicant(req.body);
    res.redirect("/applicants");
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to create applicant", error: err });
  }
});

// ─── APPLICANTS — DETAIL ────────────────────────────────────

router.get("/applicants/:id", async (req, res) => {
  try {
    const applicant = await db.getApplicantById(req.params.id);
    if (!applicant) return res.status(404).render("error", { message: "Applicant not found", error: {} });
    res.render("applicant-detail", { title: applicant.username, applicant });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to load applicant", error: err });
  }
});

// ─── APPLICANTS — EDIT FORM ─────────────────────────────────

router.get("/applicants/:id/edit", async (req, res) => {
  try {
    const applicant = await db.getApplicantById(req.params.id);
    if (!applicant) return res.status(404).render("error", { message: "Applicant not found", error: {} });
    res.render("applicant-form", { title: "Edit " + applicant.username, applicant, action: `/applicants/${req.params.id}?_method=PUT` });
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to load applicant", error: err });
  }
});

// ─── APPLICANTS — UPDATE ────────────────────────────────────

router.put("/applicants/:id", async (req, res) => {
  try {
    await db.updateApplicant(req.params.id, req.body);
    res.redirect(`/applicants/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to update applicant", error: err });
  }
});

// ─── APPLICANTS — DELETE ────────────────────────────────────

router.delete("/applicants/:id", async (req, res) => {
  try {
    await db.deleteApplicant(req.params.id);
    res.redirect("/applicants");
  } catch (err) {
    console.error(err);
    res.status(500).render("error", { message: "Failed to delete applicant", error: err });
  }
});

module.exports = router;
