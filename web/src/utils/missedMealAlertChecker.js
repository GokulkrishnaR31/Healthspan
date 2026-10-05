import api from '../services/api';

/**
 * Time Thresholds for Mandatory Senior Meals:
 * - Breakfast: Alert triggers if NOT logged by 12:00 PM (hour >= 12)
 * - Lunch: Alert triggers if NOT logged by 3:00 PM (hour >= 15)
 * - Dinner: Alert triggers if NOT logged by 10:00 PM (hour >= 22)
 * - Snacks: Excluded from mandatory alerts as requested.
 */
export const MEAL_ALERT_THRESHOLDS = [
  {
    type: 'Breakfast',
    label: 'Breakfast',
    icon: '🌅',
    triggerHour: 12,
    thresholdLabel: '12:00 PM',
    riskText: 'Risk of hypoglycemia, morning energy slump & medication timing delay.'
  },
  {
    type: 'Lunch',
    label: 'Lunch',
    icon: '☀️',
    triggerHour: 15,
    thresholdLabel: '3:00 PM',
    riskText: 'Risk of afternoon blood sugar drop, dehydration & delayed afternoon dose.'
  },
  {
    type: 'Dinner',
    label: 'Dinner',
    icon: '🌙',
    triggerHour: 22,
    thresholdLabel: '10:00 PM',
    riskText: 'Risk of nocturnal hypoglycemia & disturbed sleep due to empty stomach.'
  }
];

/**
 * Checks which mandatory meals are currently missed based on current local time
 * @param {Array} todayMeals - List of meal items logged today
 * @returns {Array} List of missed meal warning objects
 */
export function getMissedMeals(todayMeals = []) {
  const now = new Date();
  const currentHour = now.getHours();

  const loggedCategories = new Set(
    (todayMeals || []).map(m => (m.category || m.meal_type || '').trim().toLowerCase())
  );

  const missed = [];

  for (const threshold of MEAL_ALERT_THRESHOLDS) {
    const isLogged = Array.from(loggedCategories).some(c => 
      c.includes(threshold.type.toLowerCase())
    );

    if (!isLogged && currentHour >= threshold.triggerHour) {
      missed.push({
        ...threshold,
        currentHour,
        detectedAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  }

  return missed;
}

/**
 * Checks for missing Walking / Steps log at the end of the day (evening >= 7:00 PM / 19:00)
 * Checks for missing Sleep log at the start of the day (morning 6:00 AM - 1:00 PM / 13:00)
 * @param {Object} activityData - { walkMinutes, steps, sleepHours }
 * @returns {Array} List of unlogged activity alert objects
 */
export function getMissingActivityAlerts(activityData = {}) {
  const now = new Date();
  const currentHour = now.getHours();
  const alerts = [];

  const walkMinutes = Number(activityData?.walkMinutes || activityData?.walk_minutes || 0);
  const steps = Number(activityData?.steps || 0);
  const sleepHours = activityData?.sleepHours !== undefined && activityData?.sleepHours !== null 
    ? Number(activityData.sleepHours) 
    : (activityData?.sleep_hours !== undefined && activityData?.sleep_hours !== null ? Number(activityData.sleep_hours) : null);

  // 1. SLEEP ALERT: Morning (Start of Day, 6:00 AM to 1:00 PM)
  // If sleep data for last night is not entered yet
  const isSleepLogged = sleepHours !== null && sleepHours > 0;
  if (!isSleepLogged && currentHour >= 6 && currentHour < 14) {
    alerts.push({
      id: 'alert_missing_sleep',
      type: 'sleep',
      category: 'Morning Sleep Log',
      label: "Last Night's Sleep",
      icon: 'Moon',
      severity: 'amber',
      triggerTime: 'Morning (Start of Day)',
      title: 'Morning Sleep Log Reminder',
      message: "Last night's sleep hours have not been entered yet. Please record your sleep to track your rest and daily recovery.",
      actionLabel: 'Log Sleep',
      actionRoute: '/elder/activity-sleep'
    });
  }

  // 2. WALK ALERT: Evening (End of Day, 7:00 PM / 19:00 onwards)
  // If walking steps or activity is not entered yet
  const isWalkLogged = walkMinutes > 0 || steps > 0;
  if (!isWalkLogged && currentHour >= 19) {
    alerts.push({
      id: 'alert_missing_walk',
      type: 'walk',
      category: 'Evening Walking Activity',
      label: "Today's Walking Steps",
      icon: 'Footprints',
      severity: 'amber',
      triggerTime: 'Evening (End of Day)',
      title: 'Evening Walking Log Reminder',
      message: "Today's walking steps or light exercise have not been entered yet. Please log your steps before going to bed.",
      actionLabel: 'Log Walk',
      actionRoute: '/elder/activity-sleep'
    });
  }

  return alerts;
}

/**
 * Dispatches automated In-App Alert and SMS to the registered phone number for missed meals
 */
export async function checkAndDispatchMissedMealAlerts(elderName = 'Senior', recipientPhone = '', todayMeals = []) {
  const missed = getMissedMeals(todayMeals);
  if (missed.length === 0) return [];

  const todayStr = new Date().toISOString().split('T')[0];

  for (const item of missed) {
    const dispatchKey = `missed_meal_sms_sent_${elderName}_${item.type}_${todayStr}`;
    const alreadySent = localStorage.getItem(dispatchKey);

    if (!alreadySent) {
      const targetPhone = recipientPhone || '+91 98765 43210';
      const alertMsg = `⚠️ HealthSpan Alert: ${elderName} has not logged ${item.label} today (Past ${item.thresholdLabel}). Health Risk: ${item.riskText}. Please ensure they have eaten.`;

      try {
        await api.post('/api/send-sms', {
          phone: targetPhone,
          elder_name: elderName,
          alert_type: `Missed ${item.label} Alert`,
          message: alertMsg
        });
        localStorage.setItem(dispatchKey, new Date().toISOString());
        console.log(`✅ [Missed Meal Dispatch]: Alert sent for ${item.label} to ${targetPhone}`);
      } catch (err) {
        console.warn(`[Missed Meal Dispatch Warning]:`, err.message);
      }
    }
  }

  return missed;
}

/**
 * Dispatches automated In-App Alert and SMS for missing sleep (morning) and missing walk (evening)
 */
export async function checkAndDispatchActivityAlerts(elderName = 'Senior', recipientPhone = '', activityData = {}) {
  const alerts = getMissingActivityAlerts(activityData);
  if (alerts.length === 0) return [];

  const todayStr = new Date().toISOString().split('T')[0];

  for (const item of alerts) {
    const dispatchKey = `missing_activity_sms_sent_${elderName}_${item.type}_${todayStr}`;
    const alreadySent = localStorage.getItem(dispatchKey);

    if (!alreadySent) {
      const targetPhone = recipientPhone || '+91 98765 43210';
      const alertMsg = `⚠️ HealthSpan Alert: ${elderName} has not logged ${item.label} (${item.triggerTime}). ${item.message}`;

      try {
        await api.post('/api/send-sms', {
          phone: targetPhone,
          elder_name: elderName,
          alert_type: `${item.title}`,
          message: alertMsg
        });
        localStorage.setItem(dispatchKey, new Date().toISOString());
        console.log(`✅ [Activity Alert Dispatch]: Alert sent for ${item.type} to ${targetPhone}`);
      } catch (err) {
        console.warn(`[Activity Alert Dispatch Warning]:`, err.message);
      }
    }
  }

  return alerts;
}
