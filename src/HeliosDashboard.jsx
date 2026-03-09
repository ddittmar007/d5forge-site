import { useState, useMemo } from "react";
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

/* ── D5 FORGE THEME: True black + gold/amber accents ── */
const T = {
  bg: "#0a0a0a",
  bgCard: "#111111",
  border: "#1c1c1c",
  borderLight: "#282828",
  gold: "#c9a227",
  goldMuted: "#a68520",
  goldDim: "rgba(201,162,39,0.12)",
  cyan: "#22d3ee",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  text1: "#e8e8e8",
  text2: "#888888",
  text3: "#555555",
  text4: "#333333",
};

const PALETTE = [T.gold, T.cyan, "#f59e0b", "#ef4444", "#a78bfa", "#34d399", "#fb923c"];
const STATUS_COLORS = { Active: T.green, "Expiring Soon": T.amber, Expired: T.red };

const fmt = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtK = (n) => "$" + (n / 1000).toFixed(0) + "k";

function getStatus(c) { if (!c.end) return "Active"; const d = (new Date(c.end) - TODAY) / 864e5; return d < 0 ? "Expired" : d < 180 ? "Expiring Soon" : "Active"; }
function daysUntil(s) { return s ? Math.round((new Date(s) - TODAY) / 864e5) : null; }

/* ── Gold Diamond Logo ── */
const Logo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M50 8 L85 40 L50 92 L15 40 Z" stroke={T.gold} strokeWidth="2.5" fill="none" />
    <path d="M22 40 L78 40" stroke={T.gold} strokeWidth="1.5" opacity="0.5" />
    <path d="M50 8 L50 92" stroke={T.gold} strokeWidth="1" opacity="0.2" />
    <path d="M15 40 L50 58 L85 40" stroke={T.gold} strokeWidth="1" opacity="0.2" fill="none" />
  </svg>
);

/* ── Shared Components ── */
const Stat = ({ label, value, sub, accent }) => (
  <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: "20px 24px", flex: "1 1 200px", minWidth: 200, position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accent || T.gold }} />
    <div style={{ fontSize: 11, color: T.text2, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: 28, color: T.text1, fontWeight: 700, lineHeight: 1.1, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: T.text3, marginTop: 6 }}>{sub}</div>}
  </div>
);

const Badge = ({ text, color }) => (
  <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", background: color + "18", color, border: `1px solid ${color}33`, textTransform: "uppercase" }}>{text}</span>
);

const Tip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0d0d0d", border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: T.text1, boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color || T.text2, marginTop: 2 }}>{p.name}: {formatter ? formatter(p.value) : p.value}</div>)}
    </div>
  );
};

const Card = ({ title, children }) => (
  <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, padding: "20px 20px 14px" }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: T.text2, marginBottom: 16, letterSpacing: "0.1em", textTransform: "uppercase" }}>{title}</div>
    {children}
  </div>
);

/* ── Global Reset ── */
const Reset = () => <style>{`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { background: ${T.bg}; min-height: 100vh; margin: 0; padding: 0; }
  body { overflow-x: hidden; -webkit-font-smoothing: antialiased; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shake { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-8px); } 40%,80% { transform: translateX(8px); } }
`}</style>;

/* ───────────────── LOGIN ───────────────── */
function Login({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [shake, setShake] = useState(false);

  const go = () => {
    if (pw === CLIENT_PASSWORD) onLogin();
    else { setErr(true); setShake(true); setTimeout(() => setShake(false), 500); }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Reset />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />

      <div style={{ width: 360, padding: 48, textAlign: "center", animation: shake ? "shake 0.4s ease" : "fadeUp 0.6s ease" }}>
        <div style={{ marginBottom: 28 }}><Logo size={52} /></div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: T.text1, margin: "0 0 4px" }}>
          Forge <span style={{ fontWeight: 400, color: T.text3, fontSize: 14 }}>by D5</span>
        </h1>
        <p style={{ fontSize: 13, color: T.text3, margin: "0 0 36px" }}>Helios Education — Client Portal</p>

        <input type="password" placeholder="Enter access code" value={pw}
          onChange={(e) => { setPw(e.target.value); setErr(false); }}
          onKeyDown={(e) => e.key === "Enter" && go()}
          style={{ width: "100%", padding: "14px 18px", fontSize: 14, background: T.bgCard, border: `1px solid ${err ? T.red : T.border}`, borderRadius: 8, color: T.text1, outline: "none", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em", boxSizing: "border-box" }}
          onFocus={(e) => !err && (e.target.style.borderColor = T.goldMuted)}
          onBlur={(e) => !err && (e.target.style.borderColor = T.border)}
        />
        {err && <p style={{ fontSize: 12, color: T.red, margin: "10px 0 0" }}>Invalid access code.</p>}

        <button onClick={go} style={{ width: "100%", padding: "14px 0", marginTop: 16, fontSize: 14, fontWeight: 600, background: T.gold, border: "none", borderRadius: 8, color: "#0a0a0a", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
          onMouseEnter={(e) => e.target.style.opacity = "0.85"} onMouseLeave={(e) => e.target.style.opacity = "1"}>
          Access Dashboard
        </button>

        <p style={{ fontSize: 11, color: T.text4, marginTop: 40 }}>Protected financial data. Authorized access only.</p>
      </div>
    </div>
  );
}

/* ───────────────── DASHBOARD ───────────────── */
function Dash({ onLogout }) {
  const [view, setView] = useState("overview");
  const [sortCol, setSortCol] = useState("amount");
  const [sortDir, setSortDir] = useState("desc");

  const enriched = useMemo(() => contracts.map(c => ({
    ...c, status: getStatus(c), daysLeft: daysUntil(c.end),
    annualized: c.amount && c.term ? (() => { const m = c.term.match(/([\d.]+)/); return m ? c.amount / parseFloat(m[1]) : c.amount; })() : c.amount,
  })), []);

  const active = enriched.filter(c => c.status !== "Expired");
  const expSoon = enriched.filter(c => c.status === "Expiring Soon");
  const expired = enriched.filter(c => c.status === "Expired");
  const totVal = active.reduce((s, c) => s + (c.amount || 0), 0);
  const totAnn = active.reduce((s, c) => s + (c.annualized || 0), 0);
  const addOnTot = active.reduce((s, c) => s + (c.addOnAmt || 0), 0);
  const avg = totVal / (active.length || 1);

  const termDist = useMemo(() => { const m = {}; active.forEach(c => { const t = c.term || "Unknown"; m[t] = (m[t] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value })); }, []);
  const timeline = useMemo(() => { const by = {}; enriched.forEach(c => { if (!c.end) return; const y = new Date(c.end).getFullYear(); if (y >= 2025 && y <= 2031) { if (!by[y]) by[y] = { year: y.toString(), count: 0, value: 0 }; by[y].count++; by[y].value += c.amount || 0; } }); return Object.values(by).sort((a, b) => a.year - b.year); }, []);
  const rateDist = useMemo(() => { const m = {}; active.forEach(c => { if (c.rate > 0) { const r = "$" + c.rate; m[r] = (m[r] || 0) + 1; } }); return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value })); }, []);
  const locDist = useMemo(() => { const m = {}; active.forEach(c => { const l = c.location || "Unknown"; m[l] = (m[l] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value })); }, []);
  const top10 = useMemo(() => [...enriched].filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount).slice(0, 10), []);

  const tbl = useMemo(() => [...enriched].sort((a, b) => {
    let av = a[sortCol], bv = b[sortCol]; if (av == null) return 1; if (bv == null) return -1;
    if (typeof av === "string") av = av.toLowerCase(); if (typeof bv === "string") bv = bv.toLowerCase();
    return av < bv ? (sortDir === "asc" ? -1 : 1) : av > bv ? (sortDir === "asc" ? 1 : -1) : 0;
  }), [sortCol, sortDir]);

  const sort = (col) => { if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortCol(col); setSortDir("desc"); } };

  const flags = useMemo(() => {
    const f = [];
    enriched.forEach(c => {
      if (c.status === "Expiring Soon") f.push({ partner: c.partner, flag: `Expires in ${c.daysLeft} days`, sev: "warn" });
      if (c.status === "Expired") f.push({ partner: c.partner, flag: "Contract expired", sev: "error" });
      if (c.notes?.includes("no T&C")) f.push({ partner: c.partner, flag: "Missing T&C", sev: "warn" });
      if (c.notes?.includes("find T&C")) f.push({ partner: c.partner, flag: "T&C needs to be located", sev: "warn" });
      if (c.notice === "30 days") f.push({ partner: c.partner, flag: "Short notice (30 days)", sev: "info" });
      if (!c.earlyTerm && c.status !== "Expired") f.push({ partner: c.partner, flag: "No early termination clause", sev: "info" });
      if (c.renewal === "no auto renewal") f.push({ partner: c.partner, flag: "No auto-renewal", sev: "info" });
    });
    return f.sort((a, b) => ({ error: 0, warn: 1, info: 2 }[a.sev] - { error: 0, warn: 1, info: 2 }[b.sev]));
  }, []);

  const tabs = [{ id: "overview", label: "Overview" }, { id: "table", label: "All Contracts" }, { id: "risk", label: "Risk & Flags" }];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text1, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Reset />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <div style={{ padding: "20px 40px 14px", borderBottom: `1px solid ${T.border}`, background: "rgba(10,10,10,0.95)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Logo size={32} />
            <div>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.text1 }}>Helios Ed. — Contract Analysis</h1>
              <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>Forge by D5 &middot; {enriched.length} partner contracts &middot; As of March 9, 2026</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ padding: "7px 16px", fontSize: 12, fontWeight: 500, borderRadius: 6, background: "transparent", border: `1px solid ${T.border}`, color: T.text2, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
            onMouseEnter={(e) => { e.target.style.color = T.text1; e.target.style.borderColor = T.borderLight; }}
            onMouseLeave={(e) => { e.target.style.color = T.text2; e.target.style.borderColor = T.border; }}>Sign Out</button>
        </div>
        <div style={{ display: "flex", gap: 2, marginTop: 14 }}>
          {tabs.map(t => <button key={t.id} onClick={() => setView(t.id)} style={{ padding: "7px 18px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif", background: view === t.id ? T.goldDim : "transparent", color: view === t.id ? T.gold : T.text3 }}>{t.label}</button>)}
        </div>
      </div>

      <div style={{ padding: "28px 40px 60px", maxWidth: 1320, margin: "0 auto" }}>

        {view === "overview" && <>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
            <Stat label="Active Contracts" value={active.length} sub={`${expired.length} expired · ${expSoon.length} expiring soon`} accent={T.gold} />
            <Stat label="Total Contract Value" value={fmt(totVal)} sub={`Avg deal ${fmt(Math.round(avg))}`} accent={T.cyan} />
            <Stat label="Annualized Revenue" value={fmt(Math.round(totAnn))} sub="Active contracts only" accent={T.green} />
            <Stat label="Add-On Revenue" value={fmt(Math.round(addOnTot))} sub={`${active.filter(c => c.addOn).length} with add-ons`} accent={T.amber} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <Card title="Top 10 by Contract Value">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={top10} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tickFormatter={fmtK} tick={{ fill: T.text3, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="partner" width={110} tick={{ fill: T.text2, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip formatter={fmt} />} />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]} fill={T.gold} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Renewal / Expiry Timeline">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeline} margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="year" tick={{ fill: T.text2, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="l" tick={{ fill: T.text3, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="r" orientation="right" tickFormatter={fmtK} tick={{ fill: T.text3, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip formatter={(v) => typeof v === "number" && v > 100 ? fmt(v) : v} />} />
                  <Bar yAxisId="l" dataKey="count" fill={T.cyan} radius={[3, 3, 0, 0]} barSize={22} name="Contracts" />
                  <Bar yAxisId="r" dataKey="value" fill="rgba(201,162,39,0.3)" radius={[3, 3, 0, 0]} barSize={22} name="Value" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Contract Term Distribution">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={termDist} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" stroke="none">
                    {termDist.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Tooltip content={<Tip />} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11, color: T.text2 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Service Hour Rates">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
                {rateDist.map(r => (
                  <div key={r.name} style={{ padding: "14px 22px", borderRadius: 8, background: T.goldDim, border: "1px solid rgba(201,162,39,0.2)", textAlign: "center" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, color: T.gold, fontWeight: 700 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>{r.value} contract{r.value !== 1 ? "s" : ""}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.text2, marginBottom: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>Location Type</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {locDist.map((l, i) => (
                  <div key={l.name} style={{ padding: "12px 20px", borderRadius: 8, background: `${PALETTE[i % PALETTE.length]}0c`, border: `1px solid ${PALETTE[i % PALETTE.length]}1a`, textAlign: "center", flex: "1 1 100px" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: PALETTE[i % PALETTE.length], fontWeight: 700 }}>{l.value}</div>
                    <div style={{ fontSize: 11, color: T.text2, marginTop: 4 }}>{l.name}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>}

        {view === "table" && (
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                    {[{ k: "partner", l: "Partner" }, { k: "status", l: "Status" }, { k: "amount", l: "Contract $" }, { k: "annualized", l: "Annual $" }, { k: "term", l: "Term" }, { k: "end", l: "End Date" }, { k: "daysLeft", l: "Days Left" }, { k: "rate", l: "Rate" }, { k: "location", l: "Loc" }, { k: "renewal", l: "Renewal" }].map(col => (
                      <th key={col.k} onClick={() => sort(col.k)} style={{ padding: "14px 14px", textAlign: "left", fontWeight: 700, color: T.text2, cursor: "pointer", whiteSpace: "nowrap", userSelect: "none", borderBottom: `1px solid ${T.border}`, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        {col.l} {sortCol === col.k ? (sortDir === "asc" ? "↑" : "↓") : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tbl.map((c, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.text4}22`, background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(201,162,39,0.03)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)"}>
                      <td style={{ padding: "11px 14px", fontWeight: 600, color: T.text1 }}>{c.partner}</td>
                      <td style={{ padding: "11px 14px" }}><Badge text={c.status} color={STATUS_COLORS[c.status]} /></td>
                      <td style={{ padding: "11px 14px", fontFamily: "'JetBrains Mono', monospace", color: T.gold, fontSize: 11 }}>{c.amount ? fmt(c.amount) : "—"}</td>
                      <td style={{ padding: "11px 14px", fontFamily: "'JetBrains Mono', monospace", color: T.cyan, fontSize: 11 }}>{c.annualized ? fmt(Math.round(c.annualized)) : "—"}</td>
                      <td style={{ padding: "11px 14px", color: T.text2 }}>{c.term || "—"}</td>
                      <td style={{ padding: "11px 14px", color: T.text2 }}>{c.end || "—"}</td>
                      <td style={{ padding: "11px 14px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: c.daysLeft != null && c.daysLeft < 0 ? T.red : c.daysLeft != null && c.daysLeft < 180 ? T.amber : T.text2 }}>{c.daysLeft != null ? c.daysLeft : "—"}</td>
                      <td style={{ padding: "11px 14px", fontFamily: "'JetBrains Mono', monospace", color: T.text2, fontSize: 11 }}>{c.rate ? "$" + c.rate : "—"}</td>
                      <td style={{ padding: "11px 14px", color: T.text2 }}>{c.location || "—"}</td>
                      <td style={{ padding: "11px 14px", color: T.text2, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.renewal || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === "risk" && <>
          <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            <Stat label="Expired Contracts" value={expired.length} sub="Require renewal or offboarding" accent={T.red} />
            <Stat label="Expiring < 6 Months" value={expSoon.length} sub="Begin renewal outreach" accent={T.amber} />
            <Stat label="Total Flags" value={flags.length} sub="Items requiring attention" accent={T.gold} />
          </div>
          <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "14px 24px", borderBottom: `1px solid ${T.border}`, fontSize: 11, fontWeight: 700, color: T.text2, letterSpacing: "0.1em", textTransform: "uppercase" }}>All Flags & Alerts</div>
            {flags.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 24px", borderBottom: `1px solid ${T.text4}22`, background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(201,162,39,0.03)"}
                onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)"}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: f.sev === "error" ? T.red : f.sev === "warn" ? T.amber : T.gold }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, color: T.text1 }}>{f.partner}</span>
                  <span style={{ color: T.text3, marginLeft: 8 }}>— {f.flag}</span>
                </div>
                <Badge text={f.sev === "error" ? "Critical" : f.sev === "warn" ? "Warning" : "Info"} color={f.sev === "error" ? T.red : f.sev === "warn" ? T.amber : T.gold} />
              </div>
            ))}
          </div>
        </>}
      </div>

      {/* FOOTER */}
      <div style={{ padding: "18px 40px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: T.text4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Logo size={14} /><span>Forge by D5 &middot; D5 Ventures LLC</span></div>
        <span>Confidential — Prepared for Helios Education</span>
      </div>
    </div>
  );
}

/* ── ROOT ── */
export default function HeliosDashboard() {
  const [auth, setAuth] = useState(false);
  return auth ? <Dash onLogout={() => setAuth(false)} /> : <Login onLogin={() => setAuth(true)} />;
}
