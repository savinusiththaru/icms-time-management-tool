import { addWeeks, setDay, startOfWeek, isSameDay, isBefore, addDays, getDay } from 'date-fns';

/**
 * Calculates the next occurrence date based on the last occurrence and the recurrence rules.
 * @param lastDate The date of the last task instance (weekStart)
 * @param intervalWeeks Number of weeks between occurrences
 * @param targetDayOfWeek 0=Sunday, 1=Monday...
 */
export function getNextOccurrence(lastDate: Date, intervalWeeks: number, targetDayOfWeek: number): Date {
    // 1. Add interval weeks to the last date
    let nextDate = addWeeks(lastDate, intervalWeeks);

    // 2. Ensure we align with the correct day of the week (though weekStart should ideally be Monday)
    // If our system relies on 'weekStart' always being Monday, we return the Monday of that week.
    // But if 'targetDayOfWeek' is the actual due day, we might need to handle that.
    // The schema has `weekStart` (Monday) and `dayOfWeek` (Int).
    // Assuming `weekStart` is the anchor.

    return startOfWeek(nextDate, { weekStartsOn: 1 });
}

/**
 * Generates a list of needed weekStart dates up to a threshold.
 * @param lastWeekStart The last generated weekStart
 * @param intervalWeeks Recurrence interval
 * @param weeksBuffer How many weeks in advance to generate (e.g., 4)
 */
export function getNeededOccurrences(lastWeekStart: Date, intervalWeeks: number, weeksBuffer: number = 4): Date[] {
    const needs: Date[] = [];
    const today = new Date();
    const threshold = addWeeks(startOfWeek(today, { weekStartsOn: 1 }), weeksBuffer);

    let current = getNextOccurrence(lastWeekStart, intervalWeeks, 1);

    while (isBefore(current, threshold) || isSameDay(current, threshold)) {
        needs.push(current);
        current = getNextOccurrence(current, intervalWeeks, 1);
    }

    return needs;
}
