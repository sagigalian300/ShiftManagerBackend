/*
    getShiftsForWeekFromDB(week_id)
    getAllRolesFromDB(userId)
    getWorkerSuggestionsForWeekFromDB(week_id)
    getWorkerRolesFromDB(userId)
    getAllWorkersFromDB(userId)
*/

const { getShiftsForWeekFromDB } = require("../models/ShiftCRUD");
const { getAllRolesFromDB } = require("../models/RoleCRUD");
const {
  getWorkerSuggestionsForWeekFromDB,
} = require("../models/WorkerAssignmentsCRUD");
const {
  getWorkerRolesFromDB,
  getAllWorkersFromDB,
} = require("../models/WorkerCRUD");

/* ---------------------------
   Helpers
--------------------------- */

// אין צורך בפונקציות תאריך מסובכות, משתמשים ב-day_id

/* ---------------------------
   Main algorithm
--------------------------- */

async function computeOptimalAssignment(userId, weekId, options = {}) {
  const {
    suggestionBonus = 1000,
    loadPenalty = 20,
    rankWeight = 100,
  } = options;

  console.log(
    "🚀 Starting Greedy Assignment using DAY_ID constraint + Readable Stats"
  );

  // 1. Load data
  const [
    shifts,
    suggestionsRows,
    workerRolesRows,
    { data: workersList },
    { data: allRoles },
  ] = await Promise.all([
    getShiftsForWeekFromDB(weekId),
    getWorkerSuggestionsForWeekFromDB(weekId),
    getWorkerRolesFromDB(userId),
    getAllWorkersFromDB(userId),
    getAllRolesFromDB(userId),
  ]);

  // Index suggestions
  const suggestionsByShift = new Map();
  for (const s of suggestionsRows || []) {
    const set = suggestionsByShift.get(s.shift_id) || new Set();
    set.add(s.worker_id);
    suggestionsByShift.set(s.shift_id, set);
  }

  // Index roles per worker
  const rolesByWorker = new Map();
  for (const r of workerRolesRows || []) {
    const set = rolesByWorker.get(r.worker_id) || new Set();
    set.add(r.role_id);
    rolesByWorker.set(r.worker_id, set);
  }

  // Index workers - שומרים את האובייקט המלא כדי לשלוף שמות אח"כ
  const workerById = new Map();
  for (const w of workersList || []) {
    workerById.set(w.id, {
      ...w,
      rank: Number(w.rank ?? 0),
    });
  }

  // State
  const assignments = {};
  const assignedShiftsByWorker = new Map();
  const assignedCount = new Map();

  // Shift requirements
  const shiftRequirements = new Map();
  for (const shift of shifts || []) {
    shiftRequirements.set(
      shift.id,
      (allRoles || []).map((role) => ({
        role_id: role.id ?? role.role_id,
        required: Number(role.numOfWorkers ?? role.num_of_workers ?? 0),
      }))
    );
  }

  // Sort shifts: קודם לפי יום (day_id) ואז לפי סוג
  const sortedShifts = (shifts || []).slice().sort((a, b) => {
    if (a.day_id !== b.day_id) {
      return a.day_id - b.day_id;
    }
    return (a.type || 0) - (b.type || 0);
  });

  /**
   * Availability check based on day_id
   */
  function isWorkerAvailableForShift(workerId, shiftToCheck) {
    const assignedShifts = assignedShiftsByWorker.get(workerId) || [];

    for (const assignedShift of assignedShifts) {
      if (assignedShift.day_id === shiftToCheck.day_id) {
        return false;
      }
    }
    return true;
  }

  function candidateWorkersForRoleAndShift(roleId, shiftId) {
    const suggested = suggestionsByShift.get(shiftId);
    if (!suggested) return [];

    const result = [];
    for (const [workerId, roles] of rolesByWorker.entries()) {
      if (roles.has(roleId) && suggested.has(workerId)) {
        result.push(workerId);
      }
    }
    return result;
  }

  // Greedy assignment loop
  for (const shift of sortedShifts) {
    assignments[shift.id] = assignments[shift.id] || [];
    const reqs = shiftRequirements.get(shift.id) || [];
    const assignedThisShift = new Set();

    for (const req of reqs) {
      for (let i = 0; i < req.required; i++) {
        const candidates = [];

        for (const workerId of candidateWorkersForRoleAndShift(
          req.role_id,
          shift.id
        )) {
          if (assignedThisShift.has(workerId)) continue;
          if (!isWorkerAvailableForShift(workerId, shift)) continue;

          const load = assignedCount.get(workerId) || 0;
          const rank = workerById.get(workerId)?.rank || 0;

          const score =
            rankWeight * rank - loadPenalty * load - Number(workerId) * 1e-6;

          candidates.push({ workerId, score });
        }

        if (candidates.length === 0) {
          assignments[shift.id].push({
            role_id: req.role_id,
            worker_id: null,
          });
          continue;
        }

        candidates.sort((a, b) => b.score - a.score);
        const chosen = candidates[0].workerId;

        assignments[shift.id].push({
          role_id: req.role_id,
          worker_id: chosen,
        });

        assignedThisShift.add(chosen);
        assignedCount.set(chosen, (assignedCount.get(chosen) || 0) + 1);
        assignedShiftsByWorker.set(chosen, [
          ...(assignedShiftsByWorker.get(chosen) || []),
          shift,
        ]);
      }
    }
  }

  // --- יצירת דוח מסודר עם שמות ---
  // במקום להחזיר רק ID, אנחנו בונים אובייקט עם שמות קריאים
  const assignedPerWorkerReadable = {};

  // עוברים על המפה של הספירות (ID -> כמות)
  for (const [wId, count] of assignedCount.entries()) {
    const w = workerById.get(wId);
    if (w) {
      // יצירת המפתח בפורמט שביקשת: שם פרטי + משפחה + מזהה
      const fullNameKey = `${w.first_name || ""} ${
        w.last_name || ""
      } (${wId})`.trim();
      assignedPerWorkerReadable[fullNameKey] = count;
    } else {
      // גיבוי למקרה שאין פרטי עובד
      assignedPerWorkerReadable[`Unknown Worker (${wId})`] = count;
    }
  }

  // Stats calculation
  const unfilled = [];
  let totalPrice = 0;

  for (const [shiftId, slots] of Object.entries(assignments)) {
    for (const slot of slots) {
      if (!slot.worker_id) {
        unfilled.push({ shift_id: Number(shiftId), role_id: slot.role_id });
      } else {
        totalPrice += workerById.get(slot.worker_id)?.rank || 0;
      }
    }
  }

  const stats = {
    totalShifts: shifts.length,
    totalAssignedSlots: Object.values(assignments)
      .flat()
      .filter((s) => s.worker_id).length,
    totalUnfilledSlots: unfilled.length,
    assignedPerWorker: assignedPerWorkerReadable, // כאן הכנסנו את האובייקט החדש
    totalPrice,
  };

  return { assignments, unfilled, stats, assignedShiftsByWorker };
}

module.exports = {
  computeOptimalAssignment,
};
