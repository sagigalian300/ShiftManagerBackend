/*
    getShiftsForWeekFromDB(week_id)
    getAllRolesFromDB(userId)            (role.numOfWorkers is used as required)
    getWorkerSuggestionsForWeekFromDB(week_id)
    getWorkerRolesFromDB(userId)
    getAllWorkersFromDB(userId)

*/
const { getShiftsForWeekFromDB } = require("../models/ShiftCRUD");
const { getAllRolesFromDB } = require("../models/RoleCRUD");
const {
  getWorkerSuggestionsForWeekFromDB,
} = require("../models/WorkerAssignmentsCRUD");
const { getWorkerRolesFromDB } = require("../models/WorkerCRUD");
const { getAllWorkersFromDB } = require("../models/WorkerCRUD");
/**
 * Assignment algorithm (greedy scoring) that builds an (approximate) optimal
 * weekly shift assignment while trying to maximize total worker "price" (rank).
 *
 * NOTE: DB access functions are placeholders — implement them to fetch real data.
 *
 * The score for each candidate worker is:
 *   score = rankWeight * worker.rank + suggestionBonus*(suggested?1:0) - loadPenalty*assignedCount
 *
 * where:
 *  - worker.rank is taken from the workers table (0 if missing)
 *  - suggestionBonus rewards workers who asked for the shift
 *  - loadPenalty tries to balance load across workers
 *
 * This remains greedy (per-slot) — good for a fast approximation. For exact optimal
 * matching (global max) switch to integer programming / Hungarian algorithm with costs.
 */

/* ---------------------------
   Helpers
   --------------------------- */
function toTime(dateLike) {
  if (!dateLike) return null;
  return typeof dateLike === "string" ? new Date(dateLike) : dateLike;
}

function shiftsOverlap(a, b) {
  if (!a || !b) return false;
  const aS = toTime(a.start_time).getTime();
  const aE = toTime(a.end_time).getTime();
  const bS = toTime(b.start_time).getTime();
  const bE = toTime(b.end_time).getTime();
  return Math.max(aS, bS) < Math.min(aE, bE);
}

/* ---------------------------
   Main algorithm
   --------------------------- */
async function computeOptimalAssignment(userId, weekId, options = {}) {
  // options:
  //   suggestionBonus: numeric bonus for suggested shift (default 1000)
  //   loadPenalty: per-assigned-shift penalty (default 20)
  //   rankWeight: multiplier for worker.rank (default 100)
  const {
    suggestionBonus = 1000,
    loadPenalty = 20,
    rankWeight = 100,
  } = options;

  // 1. Load data using your functions (userId is available)
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

  // Index suggestions: shiftId -> Set(workerId)
  const suggestionsByShift = new Map();
  // Also build map of workerId -> Set(shiftId) for quick lookup of which shifts a worker suggested
  const suggestionsByWorker = new Map();
  for (const s of suggestionsRows || []) {
    const set = suggestionsByShift.get(s.shift_id) || new Set();
    set.add(s.worker_id);
    suggestionsByShift.set(s.shift_id, set);

    const wset = suggestionsByWorker.get(s.worker_id) || new Set();
    wset.add(s.shift_id);
    suggestionsByWorker.set(s.worker_id, wset);
  }

  // Index roles by worker: workerId -> Set(roleId)
  const rolesByWorker = new Map();
  for (const r of workerRolesRows || []) {
    const set = rolesByWorker.get(r.worker_id) || new Set();
    set.add(r.role_id);
    rolesByWorker.set(r.worker_id, set);
  }

  // Index workers: workerId -> workerObj (including rank)
  const workerById = new Map();
  for (const w of workersList || []) {
    const rank = w?.rank != null ? Number(w.rank) : 0;
    workerById.set(w.id, { ...w, rank: Number.isFinite(rank) ? rank : 0 });
  }

  // assignment state
  const assignments = {}; // shiftId -> [ { role_id, worker_id } ]
  const assignedShiftsByWorker = new Map(); // workerId -> [shift objects assigned]
  const assignedCount = new Map(); // workerId -> number assigned

  // Build per-shift role requirements from allRoles (role.numOfWorkers used)
  // If you have per-shift role mapping later, replace this logic accordingly.
  const shiftRequirements = new Map();
  for (const shift of shifts || []) {
    const reqs = (allRoles || []).map((role) => {
      return {
        role_id: role.id ?? role.role_id,
        required: Number(role.numOfWorkers ?? role.num_of_workers ?? 0),
      };
    });
    shiftRequirements.set(shift.id, reqs);
  }

  // Sort shifts by start time for determinism
  const sortedShifts = (shifts || []).slice().sort((a, b) => {
    const at = toTime(a.start_time)?.getTime() || 0;
    const bt = toTime(b.start_time)?.getTime() || 0;
    return at - bt;
  });

  function isWorkerAvailableForShift(workerId, shift) {
    const assigned = assignedShiftsByWorker.get(workerId) || [];
    for (const s of assigned) {
      if (shiftsOverlap(s, shift)) return false;
    }
    return true;
  }

  function candidateWorkersForRoleAndShift(roleId, shiftId) {
    // Only consider workers who both have the role AND explicitly suggested this shift.
    const candidates = [];
    const suggestedSet = suggestionsByShift.get(shiftId);
    if (!suggestedSet || suggestedSet.size === 0) return candidates; // no one suggested this shift -> no candidates

    for (const [workerId, roleSet] of rolesByWorker.entries()) {
      if (!roleSet.has(roleId)) continue;
      // require that worker suggested this particular shift
      if (!suggestedSet.has(workerId)) continue;
      candidates.push(workerId);
    }
    return candidates;
  }

  // Iterate shifts and assign
  for (const shift of sortedShifts) {
    const shiftId = shift.id;
    assignments[shiftId] = assignments[shiftId] || [];
    const reqs = shiftRequirements.get(shiftId) || [];

    // track workers already assigned to this specific shift so a worker
    // cannot occupy more than one role/slot in the same shift
    const assignedWorkersThisShift = new Set();

    for (const req of reqs) {
      const roleId = req.role_id;
      const requiredCount = Number(req.required ?? req.count ?? req.qty ?? 0);

      for (let slot = 0; slot < requiredCount; slot++) {
        const candidates = [];
        const workerCandidates = candidateWorkersForRoleAndShift(roleId, shiftId);

        for (const workerId of workerCandidates) {
          // skip if this worker already assigned to this same shift (prevents multi-role in same shift)
          if (assignedWorkersThisShift.has(workerId)) continue;
          if (!isWorkerAvailableForShift(workerId, shift)) continue;

          const worker = workerById.get(workerId) || { rank: 0 };
          const rankVal = Number(worker.rank || 0);

          const suggested =
            suggestionsByShift.get(shiftId)?.has(workerId) ?? false;
          const suggestionScore = suggested ? suggestionBonus : 0;
          const load = assignedCount.get(workerId) ?? 0;
          const loadScore = -load * loadPenalty;

          const rankScore = rankWeight * rankVal;
          const idTiebreak = Number(workerId) || 0;

          const score =
            rankScore + suggestionScore + loadScore - idTiebreak * 1e-6;

          candidates.push({ workerId, score, rankVal, load, suggested });
        }

        if (candidates.length === 0) {
          // no eligible candidate for this slot (either nobody with role suggested this shift
          // or all were unavailable) -> leave unfilled
          assignments[shiftId].push({ role_id: roleId, worker_id: null });
          continue;
        }

        candidates.sort((a, b) => b.score - a.score);
        const chosen = candidates[0].workerId;

        // assign
        assignments[shiftId].push({ role_id: roleId, worker_id: chosen });

        // update state
        assignedCount.set(chosen, (assignedCount.get(chosen) || 0) + 1);
        assignedShiftsByWorker.set(chosen, [
          ...(assignedShiftsByWorker.get(chosen) || []),
          shift,
        ]);
        // mark worker as used for this shift so they won't be assigned another slot here
        assignedWorkersThisShift.add(chosen);
      }
    }
  }

  // Build unfilled report and compute total price
  const unfilled = [];
  let totalPrice = 0;
  for (const [shiftId, slots] of Object.entries(assignments)) {
    for (const slot of slots) {
      if (!slot.worker_id) {
        unfilled.push({ shift_id: Number(shiftId), role_id: slot.role_id });
      } else {
        const w = workerById.get(slot.worker_id);
        totalPrice += w?.rank ? Number(w.rank) : 0;
      }
    }
  }

  // Summary stats
  const stats = {
    totalShifts: (shifts || []).length,
    totalAssignedSlots: 0,
    totalUnfilledSlots: unfilled.length,
    assignedPerWorker: Object.fromEntries(assignedCount),
    totalPrice,
  };
  for (const slots of Object.values(assignments)) {
    for (const s of slots) if (s.worker_id) stats.totalAssignedSlots++;
  }
 
  return { assignments, unfilled, stats, assignedShiftsByWorker };
}

/* Export */
module.exports = {
  computeOptimalAssignment,
};
