/**
 * @param {Date} d
 * @returns {string} YYYY-MM-DD
 */
export function toIsoDate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * Returns Monday of the week for the provided date.
 * @param {Date} d
 * @returns {Date}
 */
export function getWeekStartMonday(d) {
    const copy = new Date(d);
    const day = copy.getDay(); // 0 Sun ... 6 Sat
    const diff = (day === 0 ? -6 : 1) - day; // move to Monday
    copy.setDate(copy.getDate() + diff);
    copy.setHours(0, 0, 0, 0);
    return copy;
}

/**
 * @param {string} iso YYYY-MM-DD
 * @returns {Date}
 */
export function fromIsoDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1);
    dt.setHours(0, 0, 0, 0);
    return dt;
}

/**
 * @param {string} weekStartIso YYYY-MM-DD
 * @returns {string[]} 7 ISO dates starting from weekStartIso
 */
export function getWeekDays(weekStartIso) {
    const start = fromIsoDate(weekStartIso);
    const days = [];
    for (let i = 0; i < 7; i += 1) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push(toIsoDate(d));
    }
    return days;
}
