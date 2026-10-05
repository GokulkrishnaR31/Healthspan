/**
 * Natural Language Sleep Duration & Time Calculator
 * Parses statements like:
 * - "slept night 12 and woke up 5aam" -> 5.0 hours (12:00 AM to 5:00 AM)
 * - "slept at 11:30 pm and woke up at 6:30 am" -> 7.0 hours
 * - "went to bed 10pm woke up 6am" -> 8.0 hours
 * - "slept 12 to 5" -> 5.0 hours
 * - "slept 8 hours soundly" -> 8.0 hours
 */

export function parseNaturalSleepText(text = '') {
  if (!text || typeof text !== 'string') {
    return {
      sleep_hours: 7.5,
      bed_time: '10:30 PM',
      wake_time: '6:00 AM',
      sleep_quality: 'Restful',
      explanation: 'Default standard senior rest routine.'
    };
  }

  const clean = text.toLowerCase().trim();

  // 1. Check for direct hour statements like "slept 8 hours", "7.5 hrs", "slept for 6 hours"
  const directHoursMatch = clean.match(/(?:slept|rested|got)\s*(?:for)?\s*(\d+(?:\.\d+)?)\s*(?:hours|hour|hrs|hr)/i);
  if (directHoursMatch) {
    const hrs = parseFloat(directHoursMatch[1]);
    return {
      sleep_hours: Number(hrs.toFixed(1)),
      bed_time: '11:00 PM',
      wake_time: `${Math.round(hrs)}:00 AM`,
      sleep_quality: hrs < 6 ? 'Short Sleep' : hrs > 9 ? 'Extended Rest' : 'Restful',
      explanation: `Extracted ${hrs} hours directly from your log.`
    };
  }

  // 2. Comprehensive Bed-to-Wake Time Pattern Matching
  // e.g. "slept night 12 and woke up 5aam", "slept at 11 pm woke up 6 am", "10:30pm to 6:30am"
  
  // Extract numbers associated with sleep/bed and wake/up
  let bedHour = null;
  let bedMinute = 0;
  let bedIsPM = true; // Most night sleep is PM, unless 12 midnight or 1 AM

  let wakeHour = null;
  let wakeMinute = 0;
  let wakeIsAM = true; // Most waking is morning AM

  // Pattern: "slept (at/night/around)? X(:YY)? (pm/am/night)? ... (woke|up|got up|to)? (at/around)? Y(:ZZ)? (am/pm/morning)?"
  const rangeMatch = clean.match(/(?:slept|bed|sleep)?\s*(?:at|around|from|night)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|night|midnight)?\D+(?:woke|wake|up|got up|to|till|until)\s*(?:at|around|in the morning)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|morning)?/i);

  if (rangeMatch) {
    let rawBed = parseInt(rangeMatch[1], 10);
    bedMinute = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : 0;
    const bedMod = rangeMatch[3] || '';

    let rawWake = parseInt(rangeMatch[4], 10);
    wakeMinute = rangeMatch[5] ? parseInt(rangeMatch[5], 10) : 0;
    const wakeMod = rangeMatch[6] || '';

    // Normalize Bed Time:
    // If "12" or "midnight" or "night 12" -> 0 hours from midnight or 12 AM
    if (rawBed === 12 || bedMod.includes('midnight')) {
      rawBed = 0; // 00:00 (Midnight)
    } else if (rawBed < 12 && (bedMod.includes('pm') || bedMod.includes('night') || rawBed >= 8)) {
      // 8 PM to 11 PM -> 20 to 23
      rawBed = rawBed + 12;
    }

    // Normalize Wake Time:
    if (rawWake === 12 && wakeMod.includes('pm')) {
      rawWake = 12;
    } else if (rawWake < 12 && (wakeMod.includes('am') || wakeMod.includes('morning') || rawWake <= 11)) {
      rawWake = rawWake; // Morning AM (e.g. 5, 6, 7)
    }

    // Compute Duration:
    // From rawBed to rawWake across midnight
    const bedDecimal = rawBed + (bedMinute / 60);
    const wakeDecimal = rawWake + (wakeMinute / 60);

    let diffHours = 0;
    if (wakeDecimal >= bedDecimal) {
      diffHours = wakeDecimal - bedDecimal;
    } else {
      diffHours = (24 - bedDecimal) + wakeDecimal;
    }

    const finalHours = Number(Math.min(Math.max(diffHours, 2), 16).toFixed(1));
    const formatBed = rawBed === 0 ? '12:00 AM' : rawBed > 12 ? `${rawBed - 12}:${bedMinute < 10 ? '0' : ''}${bedMinute} PM` : `${rawBed}:${bedMinute < 10 ? '0' : ''}${bedMinute} AM`;
    const formatWake = `${rawWake}:${wakeMinute < 10 ? '0' : ''}${wakeMinute} AM`;

    let quality = 'Restful';
    if (finalHours < 6) quality = 'Short Sleep (Below 6h)';
    else if (finalHours >= 7 && finalHours <= 8.5) quality = 'Optimal Senior Rest ✓';
    else if (finalHours > 9) quality = 'Extended Sleep';

    return {
      sleep_hours: finalHours,
      bed_time: formatBed,
      wake_time: formatWake,
      sleep_quality: quality,
      explanation: `Calculated from ${formatBed} to ${formatWake} = ${finalHours} hours total sleep.`
    };
  }

  // 3. Fallback generic single-number detection
  const anyNumber = clean.match(/(\d+(?:\.\d+)?)/);
  if (anyNumber) {
    const val = parseFloat(anyNumber[1]);
    if (val >= 3 && val <= 12) {
      return {
        sleep_hours: val,
        bed_time: '11:00 PM',
        wake_time: `${Math.round(val - 1)}:00 AM`,
        sleep_quality: 'Restful',
        explanation: `Parsed ${val} hours sleep duration.`
      };
    }
  }

  return {
    sleep_hours: 7.5,
    bed_time: '10:30 PM',
    wake_time: '6:00 AM',
    sleep_quality: 'Restful',
    explanation: 'Recognized speech; logged standard 7.5 hours.'
  };
}
