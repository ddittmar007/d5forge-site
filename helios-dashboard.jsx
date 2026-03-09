import { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend } from "recharts";

/* ───────────────── DATA ───────────────── */
const contracts = [
  { partner: "Alta", start: "2022-05-10", end: "2025-05-10", term: "3 years", amount: 10791, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS", rate: 125, lateFee: "1% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Amethod", start: "2024-06-30", end: "2027-06-30", term: "3 years", amount: 10341, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 150, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Apple Valley", start: "2022-12-08", end: "2027-12-08", term: "5 years", amount: 41243, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 125, lateFee: "1% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Aspire", start: "2017-04-10", end: "2019-04-10", term: "2 years", amount: 24900, notice: "60 days", renewal: "annual*", earlyTerm: false, termClause: "n/a", location: "HS / OD", rate: 125, lateFee: "1% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Azusa", start: "2023-10-04", end: "2028-10-04", term: "5 years", amount: 46060, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 125, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Baldwin Park", start: "2026-02-11", end: "2029-06-30", term: "3 years", amount: 58882, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 150, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Banning", start: "2025-01-01", end: "2027-12-31", term: "3 years", amount: 56048, notice: "30 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 150, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "30 day notice, supersede?" },
  { partner: "Chawanakee", start: "2022-11-09", end: "2027-11-09", term: "5 years", amount: 18232, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS", rate: 125, lateFee: "1% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Claremont", start: "2022-03-30", end: "2025-03-30", term: "3 years", amount: 50688, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS", rate: 125, lateFee: "1% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Clayton", start: "2024-12-11", end: "2029-12-11", term: "5 years", amount: 28778, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 150, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "2 signed - 10/23/24 and 12/11/24" },
  { partner: "Colton", start: "2023-09-12", end: "2028-09-12", term: "5 years", amount: 28314, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 125, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Compass", start: "2025-06-06", end: "2026-06-06", term: "1 year", amount: 15001, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 150, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Covina Valley", start: "2025-04-17", end: "2028-04-17", term: "3 years", amount: 42400, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 125, lateFee: "1% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "CWC", start: "2022-04-11", end: "2027-04-11", term: "5 years", amount: 14018, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS", rate: 125, lateFee: "1% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Desert Center", start: "2024-09-11", end: "2029-09-11", term: "5 years", amount: 9790, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 150, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Enterprise", start: "2024-03-28", end: "2029-03-28", term: "5 years", amount: 43971, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 150, lateFee: "1.5% per month", rfp: false, addOn: "External Workflows", addOnAmt: 0, notes: "2 signed - 3/13 and 3/28" },
  { partner: "Foxborough", start: "2023-02-15", end: "2026-02-15", term: "3 years", amount: 19862, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "3 months fee", location: "HS / OD", rate: 125, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Fullerton", start: "2021-12-01", end: "2027-06-30", term: "5.5 years", amount: 52817, notice: null, renewal: null, earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 0, lateFee: null, rfp: false, addOn: null, addOnAmt: 0, notes: "find T&C" },
  { partner: "Global", start: "2025-08-29", end: "2030-08-29", term: "5 years", amount: 9874, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 150, lateFee: "1.5% per month", rfp: false, addOn: "Evals, WF, TR, Onb, Hiring", addOnAmt: 9623.25, notes: "" },
  { partner: "Granada Hills", start: null, end: null, term: null, amount: 23775, notice: null, renewal: null, earlyTerm: false, termClause: null, location: "OD", rate: null, lateFee: null, rfp: false, addOn: null, addOnAmt: 0, notes: "Invoice only" },
  { partner: "Grossmont", start: "2025-06-23", end: "2028-06-23", term: "3 years", amount: 165477, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 150, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Hacienda", start: "2019-04-04", end: "2022-04-04", term: "3 years", amount: 33834, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "3 months fee", location: "HS", rate: 125, lateFee: "1% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "Non-renewed" },
  { partner: "Hemet", start: "2024-04-17", end: "2028-04-17", term: "4 years", amount: 81466, notice: "60 days", renewal: "no auto renewal", earlyTerm: true, termClause: "services to date", location: "HS / OD", rate: 150, lateFee: "1.5% per month", rfp: false, addOn: "External Workflows", addOnAmt: 0, notes: "term w/out cause, no notice" },
  { partner: "Hesperia", start: "2025-07-01", end: "2026-06-30", term: "1 year", amount: 85000, notice: "60 days", renewal: "none", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 150, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Hughson", start: "2022-12-22", end: "2029-12-22", term: "5 years", amount: 28824, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 125, lateFee: "1% per month", rfp: false, addOn: "External Workflows", addOnAmt: 3415, notes: "" },
  { partner: "Jurupa", start: "2023-12-27", end: "2028-12-27", term: "5 years", amount: 49594, notice: "60 days", renewal: "annual*", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 125, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "board 1/22/2024" },
  { partner: "Keppel", start: "2024-02-01", end: "2027-02-01", term: "3 years", amount: 21846, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 125, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "2 signed - 1/30/24 and 2/1/24" },
  { partner: "Keyes", start: "2023-05-16", end: "2028-06-30", term: "5 years", amount: 25064, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 125, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "LaCanada", start: "2020-06-09", end: "2023-06-09", term: "3 years", amount: 21112, notice: null, renewal: null, earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 125, lateFee: null, rfp: false, addOn: "Aries Interface", addOnAmt: 4165, notes: "no T&C" },
  { partner: "Lake Elsinore", start: "2025-10-10", end: "2030-10-10", term: "5 years", amount: 114024, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 150, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Lake Tahoe", start: "2024-08-08", end: "2027-08-08", term: "3 years", amount: 32547, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 150, lateFee: "1.5% per month", rfp: false, addOn: "Mobile App", addOnAmt: 3696, notes: "" },
  { partner: "Leadership", start: "2025-02-11", end: "2030-02-11", term: "5 years", amount: 3000, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS", rate: 125, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Menifee", start: "2024-01-17", end: "2030-03-31", term: "5 years", amount: 51360, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 125, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "prorated contract to align with fiscal year" },
  { partner: "Milpitas", start: "2023-05-12", end: "2026-05-12", term: "3 years", amount: 43189, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS", rate: 0, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Monrovia", start: "2025-06-27", end: "2028-06-27", term: "3 years", amount: 44792, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS", rate: 125, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Natomas", start: "2024-02-13", end: "2029-02-13", term: "5 years", amount: 65192, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 125, lateFee: "1.5% per month", rfp: false, addOn: "External Workflows", addOnAmt: 0, notes: "" },
  { partner: "Orinda", start: "2024-10-29", end: "2026-10-29", term: "2 years", amount: 17940, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 0, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Palmdale", start: "2024-01-17", end: "2029-01-17", term: "5 years", amount: 29766, notice: "30 days", renewal: "annual that requires proposal and district board approval", earlyTerm: true, termClause: "services to date", location: "HS / OD", rate: 125, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Paramount", start: "2023-11-17", end: "2028-11-17", term: "5 years", amount: 23718, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 125, lateFee: "1.5% per month", rfp: false, addOn: "Emp Portal, Ext Workflow, Evals", addOnAmt: 16363, notes: "" },
  { partner: "Rapid City", start: "2023-10-18", end: "2028-10-18", term: "5 years", amount: 22550, notice: null, renewal: null, earlyTerm: false, termClause: null, location: "HS", rate: 125, lateFee: null, rfp: false, addOn: null, addOnAmt: 0, notes: "no T&C" },
  { partner: "Redding", start: "2024-05-31", end: "2029-05-31", term: "5 years", amount: 38915, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 150, lateFee: "1.5% per month", rfp: false, addOn: "Mobile App", addOnAmt: 4480, notes: "" },
  { partner: "Rialto", start: "2022-01-26", end: "2027-01-26", term: "5 years", amount: 53813, notice: "30 days", renewal: "annual that requires proposal and district board approval", earlyTerm: true, termClause: "unearned balance + 6 month fee", location: "HS", rate: 125, lateFee: "10% per year", rfp: true, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Romoland", start: "2025-12-22", end: "2030-12-22", term: "5 years", amount: 81043, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 150, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "San Leandro", start: "2022-10-28", end: "2025-10-28", term: "3 years", amount: 43928, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS", rate: 125, lateFee: "1% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "San Luis Coastal", start: "2018-11-28", end: "2021-11-28", term: "3 years", amount: 49990, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS", rate: 125, lateFee: "n/a", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "San Marino", start: "2021-11-02", end: "2026-11-02", term: "5 years", amount: 16933, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS", rate: 125, lateFee: "1% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Sia Tech", start: "2022-11-18", end: "2027-11-18", term: "5 years", amount: 23131, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS", rate: 125, lateFee: "1% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "South Pasadena", start: "2022-08-10", end: "2027-08-10", term: "5 years", amount: 22952, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS", rate: 125, lateFee: "1% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "South Whittier", start: "2024-12-03", end: "2027-12-03", term: "3 years", amount: 16191, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 150, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Summit", start: "2016-06-26", end: "2019-06-26", term: "3 years", amount: 15820, notice: null, renewal: "annual*", earlyTerm: false, termClause: null, location: "HS", rate: 125, lateFee: "1% per month", rfp: false, addOn: "Greenhouse & Trinet", addOnAmt: 1500, notes: "" },
  { partner: "Tahoe Truckee", start: "2025-08-20", end: "2029-08-31", term: "4 years", amount: 64654, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 150, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "TEACH", start: "2019-04-30", end: "2022-04-30", term: "3 years", amount: 5790, notice: "30 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS", rate: 125, lateFee: "1% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Temecula", start: "2025-05-21", end: "2030-05-21", term: "5 years", amount: 85636, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 150, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Temple City", start: "2023-10-05", end: "2026-10-05", term: "3 years", amount: 36416, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS", rate: 125, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Victor", start: "2025-05-01", end: "2028-05-01", term: "3 years", amount: 44862, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 0, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Voices", start: "2024-12-13", end: "2027-12-13", term: "3 years", amount: 14241, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS / OD", rate: 150, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "West Covina", start: "2021-08-25", end: "2026-08-25", term: "5 years", amount: 22943, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS", rate: 125, lateFee: "1% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Whittier", start: "2022-12-13", end: "2025-12-13", term: "3 years", amount: 34944, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS", rate: 125, lateFee: "1% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Yucaipa", start: "2023-04-19", end: "2026-04-19", term: "3 years", amount: 31603, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "HS", rate: 125, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Delano", start: "2023-05-10", end: "2026-05-10", term: "3 years", amount: 13851, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "OD", rate: 125, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Philadelphia Montessori", start: "2023-05-12", end: "2028-05-12", term: "5 years", amount: 12912, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "OD", rate: 125, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Santa Paula", start: "2023-06-16", end: "2026-06-16", term: "3 years", amount: 26743, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "OD", rate: 125, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
  { partner: "Shasta Union", start: "2024-05-24", end: "2025-05-24", term: "1 year", amount: 57051, notice: "60 days", renewal: "annual", earlyTerm: true, termClause: "1 year of annual fee", location: "OD", rate: 150, lateFee: "1.5% per month", rfp: false, addOn: null, addOnAmt: 0, notes: "" },
];

const TODAY = new Date("2026-03-09");
const CLIENT_PASSWORD = "helios2026";

/* ───────────────── HELPERS ───────────────── */
const fmt = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtK = (n) => "$" + (n / 1000).toFixed(0) + "k";

const STATUS_COLORS = { Active: "#22c55e", "Expiring Soon": "#f59e0b", Expired: "#ef4444" };
const CHART_PALETTE = ["#818cf8", "#22d3ee", "#f59e0b", "#ef4444", "#a78bfa", "#34d399", "#fb923c"];

function getStatus(c) {
  if (!c.end) return "Active";
  const end = new Date(c.end);
  const diff = (end - TODAY) / (1000 * 60 * 60 * 24);
  if (diff < 0) return "Expired";
  if (diff < 180) return "Expiring Soon";
  return "Active";
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.round((new Date(dateStr) - TODAY) / (1000 * 60 * 60 * 24));
}

/* ───────────────── CRUCIBLE LOGO SVG ───────────────── */
const CrucibleLogo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="crucible-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="50%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#818cf8" />
      </linearGradient>
    </defs>
    {/* Diamond vessel / crucible shape */}
    <path d="M50 8 L85 40 L50 92 L15 40 Z" stroke="url(#crucible-grad)" strokeWidth="2.5" fill="none" />
    <path d="M22 40 L78 40" stroke="url(#crucible-grad)" strokeWidth="1.5" opacity="0.6" />
    <path d="M50 8 L50 92" stroke="url(#crucible-grad)" strokeWidth="1" opacity="0.3" />
    <path d="M15 40 L50 58 L85 40" stroke="url(#crucible-grad)" strokeWidth="1" opacity="0.25" fill="none" />
  </svg>
);

/* ───────────────── SHARED COMPONENTS ───────────────── */
const StatCard = ({ label, value, sub, accent }) => (
  <div style={{
    background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12, padding: "20px 24px", flex: "1 1 200px", minWidth: 200,
    position: "relative", overflow: "hidden",
    transition: "border-color 0.2s ease",
  }}
    onMouseEnter={e => e.currentTarget.style.borderColor = (accent || "#818cf8") + "44"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
  >
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accent || "#818cf8" }} />
    <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: 28, color: "#f1f5f9", fontWeight: 700, lineHeight: 1.1, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: "#475569", marginTop: 6 }}>{sub}</div>}
  </div>
);

const Badge = ({ text, color }) => (
  <span style={{
    display: "inline-block", padding: "2px 10px", borderRadius: 999,
    fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
    background: color + "18", color, border: `1px solid ${color}33`,
    textTransform: "uppercase",
  }}>{text}</span>
);

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: "12px 16px",
      fontSize: 12, color: "#e2e8f0", boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: "#f8fafc" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#94a3b8", marginTop: 2 }}>
          {p.name}: {formatter ? formatter(p.value) : p.value}
        </div>
      ))}
    </div>
  );
};

/* ───────────────── LOGIN SCREEN ───────────────── */
function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === CLIENT_PASSWORD) {
      onLogin();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(165deg, #050810 0%, #0c1220 40%, #0a0f1e 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* Subtle grid background */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div style={{
        width: 380, padding: 48, textAlign: "center", position: "relative",
        animation: shake ? "shake 0.4s ease-in-out" : "fadeIn 0.6s ease-out",
      }}>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-8px); } 40%, 80% { transform: translateX(8px); } }
          @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        `}</style>

        <div style={{ marginBottom: 32 }}>
          <CrucibleLogo size={56} />
        </div>

        <h1 style={{
          fontSize: 22, fontWeight: 700, color: "#f8fafc", margin: "0 0 4px",
          letterSpacing: "-0.02em",
        }}>Forge by D5</h1>
        <p style={{ fontSize: 13, color: "#475569", margin: "0 0 36px" }}>
          Helios Education — Client Portal
        </p>

        <div>
          <input
            type="password"
            placeholder="Enter access code"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
            style={{
              width: "100%", padding: "14px 18px", fontSize: 14,
              background: "rgba(255,255,255,0.04)", border: `1px solid ${error ? "#ef4444" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 10, color: "#f1f5f9", outline: "none",
              fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em",
              boxSizing: "border-box",
              transition: "border-color 0.2s ease",
            }}
            onFocus={(e) => !error && (e.target.style.borderColor = "#818cf833")}
            onBlur={(e) => !error && (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
          />
          {error && (
            <p style={{ fontSize: 12, color: "#ef4444", margin: "10px 0 0", animation: "fadeIn 0.3s ease" }}>
              Invalid access code. Please try again.
            </p>
          )}

          <button
            onClick={handleSubmit}
            style={{
              width: "100%", padding: "14px 0", marginTop: 16, fontSize: 14, fontWeight: 600,
              background: "linear-gradient(135deg, #818cf8 0%, #22d3ee 100%)",
              border: "none", borderRadius: 10, color: "#020617", cursor: "pointer",
              fontFamily: "'Outfit', sans-serif", letterSpacing: "0.02em",
              transition: "opacity 0.2s ease, transform 0.15s ease",
            }}
            onMouseEnter={(e) => { e.target.style.opacity = "0.9"; e.target.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.target.style.opacity = "1"; e.target.style.transform = "translateY(0)"; }}
          >
            Access Dashboard
          </button>
        </div>

        <p style={{ fontSize: 11, color: "#334155", marginTop: 40, lineHeight: 1.6 }}>
          Protected financial data. Authorized access only.
        </p>
      </div>
    </div>
  );
}

/* ───────────────── MAIN DASHBOARD ───────────────── */
function Dashboard({ onLogout }) {
  const [view, setView] = useState("overview");
  const [sortCol, setSortCol] = useState("amount");
  const [sortDir, setSortDir] = useState("desc");

  const enriched = useMemo(() => contracts.map(c => ({
    ...c,
    status: getStatus(c),
    daysLeft: daysUntil(c.end),
    annualized: c.amount && c.term ? (() => {
      const m = c.term.match(/([\d.]+)/);
      return m ? c.amount / parseFloat(m[1]) : c.amount;
    })() : c.amount,
  })), []);

  const active = enriched.filter(c => c.status !== "Expired");
  const expiringSoon = enriched.filter(c => c.status === "Expiring Soon");
  const expired = enriched.filter(c => c.status === "Expired");

  const totalValue = active.reduce((s, c) => s + (c.amount || 0), 0);
  const totalAnnualized = active.reduce((s, c) => s + (c.annualized || 0), 0);
  const addOnTotal = active.reduce((s, c) => s + (c.addOnAmt || 0), 0);
  const avgDeal = totalValue / (active.length || 1);

  const termDist = useMemo(() => {
    const map = {};
    active.forEach(c => { const t = c.term || "Unknown"; map[t] = (map[t] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, []);

  const renewalTimeline = useMemo(() => {
    const byYear = {};
    enriched.forEach(c => {
      if (!c.end) return;
      const y = new Date(c.end).getFullYear();
      if (y >= 2025 && y <= 2031) {
        if (!byYear[y]) byYear[y] = { year: y.toString(), count: 0, value: 0 };
        byYear[y].count += 1;
        byYear[y].value += c.amount || 0;
      }
    });
    return Object.values(byYear).sort((a, b) => a.year - b.year);
  }, []);

  const rateDist = useMemo(() => {
    const map = {};
    active.forEach(c => { if (c.rate > 0) { const r = "$" + c.rate; map[r] = (map[r] || 0) + 1; } });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, []);

  const locationDist = useMemo(() => {
    const map = {};
    active.forEach(c => { const loc = c.location || "Unknown"; map[loc] = (map[loc] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, []);

  const top10 = useMemo(() =>
    [...enriched].filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount).slice(0, 10), []);

  const tableData = useMemo(() => {
    return [...enriched].sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [sortCol, sortDir]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  const flags = useMemo(() => {
    const items = [];
    enriched.forEach(c => {
      if (c.status === "Expiring Soon") items.push({ partner: c.partner, flag: `Expires in ${c.daysLeft} days`, severity: "warn" });
      if (c.status === "Expired") items.push({ partner: c.partner, flag: "Contract expired", severity: "error" });
      if (c.notes?.includes("no T&C")) items.push({ partner: c.partner, flag: "Missing T&C", severity: "warn" });
      if (c.notes?.includes("find T&C")) items.push({ partner: c.partner, flag: "T&C needs to be located", severity: "warn" });
      if (c.notice === "30 days") items.push({ partner: c.partner, flag: "Short notice period (30 days)", severity: "info" });
      if (!c.earlyTerm && c.status !== "Expired") items.push({ partner: c.partner, flag: "No early termination clause", severity: "info" });
      if (c.renewal === "no auto renewal") items.push({ partner: c.partner, flag: "No auto-renewal", severity: "info" });
    });
    return items.sort((a, b) => ({ error: 0, warn: 1, info: 2 }[a.severity] - { error: 0, warn: 1, info: 2 }[b.severity]));
  }, []);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "table", label: "All Contracts" },
    { id: "risk", label: "Risk & Flags" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(165deg, #050810 0%, #0c1220 40%, #0a0f1e 100%)",
      color: "#e2e8f0",
      fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* Subtle grid bg */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.02, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      {/* Header */}
      <div style={{
        padding: "24px 40px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <CrucibleLogo size={34} />
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#f8fafc", letterSpacing: "-0.02em" }}>
                Helios Ed. — Contract Analysis
              </h1>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 2, letterSpacing: "0.02em" }}>
                Forge by D5 &middot; {enriched.length} partner contracts &middot; As of March 9, 2026
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              padding: "8px 16px", fontSize: 12, fontWeight: 500, borderRadius: 8,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              color: "#64748b", cursor: "pointer", fontFamily: "'Outfit', sans-serif",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.target.style.color = "#f1f5f9"; e.target.style.borderColor = "rgba(255,255,255,0.15)"; }}
            onMouseLeave={(e) => { e.target.style.color = "#64748b"; e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
          >
            Sign Out
          </button>
        </div>

        <div style={{ display: "flex", gap: 2, marginTop: 16 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setView(t.id)} style={{
              padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
              background: view === t.id ? "rgba(129,140,248,0.12)" : "transparent",
              color: view === t.id ? "#a5b4fc" : "#475569",
              transition: "all 0.15s ease",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "28px 40px 60px", maxWidth: 1320, margin: "0 auto", position: "relative" }}>

        {view === "overview" && (
          <>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
              <StatCard label="Active Contracts" value={active.length} sub={`${expired.length} expired · ${expiringSoon.length} expiring soon`} accent="#818cf8" />
              <StatCard label="Total Contract Value" value={fmt(totalValue)} sub={`Avg deal ${fmt(Math.round(avgDeal))}`} accent="#22d3ee" />
              <StatCard label="Annualized Revenue" value={fmt(Math.round(totalAnnualized))} sub="Active contracts only" accent="#34d399" />
              <StatCard label="Add-On Revenue" value={fmt(Math.round(addOnTotal))} sub={`${active.filter(c => c.addOn).length} with add-ons`} accent="#f59e0b" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              {/* Top 10 */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "24px 20px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 16, letterSpacing: "0.1em", textTransform: "uppercase" }}>Top 10 by Contract Value</div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={top10} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <XAxis type="number" tickFormatter={fmtK} tick={{ fill: "#475569", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="partner" width={110} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip formatter={fmt} />} />
                    <Bar dataKey="amount" radius={[0, 6, 6, 0]} fill="#818cf8" barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Renewal Timeline */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "24px 20px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 16, letterSpacing: "0.1em", textTransform: "uppercase" }}>Renewal / Expiry Timeline</div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={renewalTimeline} margin={{ left: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fill: "#475569", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={fmtK} tick={{ fill: "#475569", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip formatter={(v) => typeof v === "number" && v > 100 ? fmt(v) : v} />} />
                    <Bar yAxisId="left" dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} barSize={24} name="Contracts" />
                    <Bar yAxisId="right" dataKey="value" fill="rgba(129,140,248,0.3)" radius={[4, 4, 0, 0]} barSize={24} name="Value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Term Distribution */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "24px 20px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 16, letterSpacing: "0.1em", textTransform: "uppercase" }}>Contract Term Distribution</div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={termDist} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" stroke="none">
                      {termDist.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Rate & Location */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "24px 24px", display: "flex", flexDirection: "column", gap: 28 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>Service Hour Rates</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {rateDist.map(r => (
                      <div key={r.name} style={{
                        padding: "12px 20px", borderRadius: 10,
                        background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.12)",
                        textAlign: "center",
                      }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, color: "#a5b4fc", fontWeight: 700 }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{r.value} contract{r.value !== 1 ? "s" : ""}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 14, letterSpacing: "0.1em", textTransform: "uppercase" }}>Location Type</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {locationDist.map((l, i) => (
                      <div key={l.name} style={{
                        padding: "12px 20px", borderRadius: 10,
                        background: `${CHART_PALETTE[i]}0a`, border: `1px solid ${CHART_PALETTE[i]}1a`,
                        textAlign: "center", flex: "1 1 100px",
                      }}>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: CHART_PALETTE[i], fontWeight: 700 }}>{l.value}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{l.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {view === "table" && (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                    {[
                      { key: "partner", label: "Partner" },
                      { key: "status", label: "Status" },
                      { key: "amount", label: "Contract $" },
                      { key: "annualized", label: "Annual $" },
                      { key: "term", label: "Term" },
                      { key: "end", label: "End Date" },
                      { key: "daysLeft", label: "Days Left" },
                      { key: "rate", label: "Rate" },
                      { key: "location", label: "Loc" },
                      { key: "renewal", label: "Renewal" },
                    ].map(col => (
                      <th key={col.key} onClick={() => handleSort(col.key)} style={{
                        padding: "14px 14px", textAlign: "left", fontWeight: 700, color: "#64748b",
                        cursor: "pointer", whiteSpace: "nowrap", userSelect: "none",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em",
                      }}>
                        {col.label} {sortCol === col.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((c, i) => (
                    <tr key={i} style={{
                      borderBottom: "1px solid rgba(255,255,255,0.025)",
                      background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.008)",
                      transition: "background 0.1s ease",
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(129,140,248,0.04)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.008)"}
                    >
                      <td style={{ padding: "11px 14px", fontWeight: 600, color: "#f1f5f9" }}>{c.partner}</td>
                      <td style={{ padding: "11px 14px" }}><Badge text={c.status} color={STATUS_COLORS[c.status]} /></td>
                      <td style={{ padding: "11px 14px", fontFamily: "'JetBrains Mono', monospace", color: "#a5b4fc", fontSize: 11 }}>{c.amount ? fmt(c.amount) : "—"}</td>
                      <td style={{ padding: "11px 14px", fontFamily: "'JetBrains Mono', monospace", color: "#67e8f9", fontSize: 11 }}>{c.annualized ? fmt(Math.round(c.annualized)) : "—"}</td>
                      <td style={{ padding: "11px 14px", color: "#94a3b8" }}>{c.term || "—"}</td>
                      <td style={{ padding: "11px 14px", color: "#94a3b8" }}>{c.end || "—"}</td>
                      <td style={{ padding: "11px 14px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: c.daysLeft != null && c.daysLeft < 0 ? "#ef4444" : c.daysLeft != null && c.daysLeft < 180 ? "#f59e0b" : "#94a3b8" }}>
                        {c.daysLeft != null ? c.daysLeft : "—"}
                      </td>
                      <td style={{ padding: "11px 14px", fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8", fontSize: 11 }}>{c.rate ? "$" + c.rate : "—"}</td>
                      <td style={{ padding: "11px 14px", color: "#94a3b8" }}>{c.location || "—"}</td>
                      <td style={{ padding: "11px 14px", color: "#94a3b8", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.renewal || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === "risk" && (
          <>
            <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
              <StatCard label="Expired Contracts" value={expired.length} sub="Require renewal or offboarding" accent="#ef4444" />
              <StatCard label="Expiring < 6 Months" value={expiringSoon.length} sub="Begin renewal outreach" accent="#f59e0b" />
              <StatCard label="Total Flags" value={flags.length} sub="Items requiring attention" accent="#a78bfa" />
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                All Flags & Alerts
              </div>
              {flags.map((f, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "13px 24px",
                  borderBottom: "1px solid rgba(255,255,255,0.025)",
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.008)",
                  transition: "background 0.1s ease",
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(129,140,248,0.03)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.008)"}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: f.severity === "error" ? "#ef4444" : f.severity === "warn" ? "#f59e0b" : "#818cf8",
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, color: "#f1f5f9" }}>{f.partner}</span>
                    <span style={{ color: "#64748b", marginLeft: 8 }}>— {f.flag}</span>
                  </div>
                  <Badge
                    text={f.severity === "error" ? "Critical" : f.severity === "warn" ? "Warning" : "Info"}
                    color={f.severity === "error" ? "#ef4444" : f.severity === "warn" ? "#f59e0b" : "#818cf8"}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: "20px 40px", borderTop: "1px solid rgba(255,255,255,0.03)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 11, color: "#334155",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CrucibleLogo size={16} />
          <span>Forge by D5 &middot; D5 Ventures LLC</span>
        </div>
        <span>Confidential — Prepared for Helios Education</span>
      </div>
    </div>
  );
}

/* ───────────────── APP ROOT ───────────────── */
export default function App() {
  const [authenticated, setAuthenticated] = useState(false);

  return authenticated
    ? <Dashboard onLogout={() => setAuthenticated(false)} />
    : <LoginScreen onLogin={() => setAuthenticated(true)} />;
}
