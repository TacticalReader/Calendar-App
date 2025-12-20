export const getOccurrences = (events, startRange, endRange) => {
    const occurrences = [];
    
    events.forEach(event => {
        const { date, recurrence, id, time } = event;
        const eventDate = new Date(date);
        const [hours, minutes] = time.split(':').map(Number);
        eventDate.setHours(hours, minutes, 0, 0);

        // Non-recurring event
        if (!recurrence || recurrence.type === 'none') {
            if (eventDate >= startRange && eventDate <= endRange) {
                occurrences.push({ ...event, date: new Date(eventDate), originalId: id });
            }
            return;
        }

        // Recurring event logic
        const { type, interval = 1, end, endDate, count, monthlyType, weekDay, weekDayIndex } = recurrence;
        
        let current = new Date(eventDate);
        let occurrencesCount = 0;
        const MAX_OCCURRENCES = 365 * 5; // Safety limit

        while (occurrencesCount < MAX_OCCURRENCES) {
            // Check end conditions
            if (end === 'date' && endDate && current > new Date(endDate)) break;
            if (end === 'count' && count && occurrencesCount >= count) break;
            
            // Optimization: Stop if we are past the view range (unless we need to count exact occurrences)
            // If end is 'count', we must iterate to count them correctly.
            if (end !== 'count' && current > endRange) break;

            // Add to list if in range
            if (current >= startRange && current <= endRange) {
                occurrences.push({
                    ...event,
                    date: new Date(current),
                    isOccurrence: true,
                    originalId: id
                });
            }

            occurrencesCount++;
            
            // Break if we've satisfied count or passed range (if not counting)
            if (end === 'count' && occurrencesCount >= count) break;
            if (current > endRange && end !== 'count') break;

            // Calculate next date
            if (type === 'daily') {
                current.setDate(current.getDate() + parseInt(interval));
            } else if (type === 'weekly') {
                current.setDate(current.getDate() + (parseInt(interval) * 7));
            } else if (type === 'monthly') {
                if (monthlyType === 'day') {
                    // Specific weekday (e.g., 1st Monday)
                    let nextMonth = new Date(current);
                    nextMonth.setMonth(nextMonth.getMonth() + parseInt(interval));
                    nextMonth.setDate(1);
                    
                    let found = false;
                    let searchDate = new Date(nextMonth);
                    let countFound = 0;
                    
                    // Scan the month for the nth weekday
                    const targetMonth = searchDate.getMonth();
                    while (searchDate.getMonth() === targetMonth) {
                        if (searchDate.getDay() === parseInt(weekDay)) {
                            if (countFound === parseInt(weekDayIndex)) {
                                current = new Date(searchDate);
                                found = true;
                                break;
                            }
                            countFound++;
                        }
                        searchDate.setDate(searchDate.getDate() + 1);
                    }
                    
                    // Handle "Last" (index 4) if not found by simple counting
                    if (!found && parseInt(weekDayIndex) === 4) {
                         let lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0);
                         while (lastDay.getMonth() === nextMonth.getMonth()) {
                             if (lastDay.getDay() === parseInt(weekDay)) {
                                 current = new Date(lastDay);
                                 found = true;
                                 break;
                             }
                             lastDay.setDate(lastDay.getDate() - 1);
                         }
                    }

                    if (!found) {
                        // Fallback: just move to next month start to prevent infinite loop
                        current = nextMonth;
                    } else {
                        current.setHours(hours, minutes, 0, 0);
                    }

                } else {
                    // Same date (e.g., 15th)
                    const nextMonth = current.getMonth() + parseInt(interval);
                    const expectedDate = current.getDate();
                    current.setMonth(nextMonth);
                    // Handle overflow (e.g. Jan 31 -> Feb 28)
                    if (current.getDate() !== expectedDate) {
                        current.setDate(0);
                    }
                }
            } else if (type === 'yearly') {
                current.setFullYear(current.getFullYear() + parseInt(interval));
            }
        }
    });
    
    return occurrences;
};

export const getNextOccurrence = (event, afterDate) => {
    const { date, recurrence, time } = event;
    const eventDate = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    eventDate.setHours(hours, minutes, 0, 0);

    if (!recurrence || recurrence.type === 'none') {
        return eventDate > afterDate ? { ...event, date: eventDate } : null;
    }

    // Use getOccurrences with a small future window to find the next one
    // We look ahead up to 2 years or until we find one
    const endSearch = new Date(afterDate);
    endSearch.setFullYear(endSearch.getFullYear() + 2);
    
    const occurrences = getOccurrences([event], afterDate, endSearch);
    
    // Return the first one strictly after 'afterDate' (or equal if we want to include now)
    // The logic in getOccurrences includes startRange, so the first one should be it.
    // But we need to filter strictly > afterDate if needed, or >=.
    // Usually notifications need >=.
    
    return occurrences.length > 0 ? occurrences[0] : null;
};