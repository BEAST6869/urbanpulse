import express from "express";
import Report from "../models/Report.js";

const router = express.Router();

/**
 * GET /api/reports
 * Optional query params: status, category
 */
router.get("/", async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if
