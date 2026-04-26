// Nyansa AI — Daily Study Reminder Module
// Handles permission requests, scheduling, and UI

var NyansaReminder = (function() {

  var STORAGE_KEY = 'nyansa_reminder';

  // ── Load saved settings ───────────────────────────────────────────────────
  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { enabled: false, time: '19:00' };
    } catch(e) {
      return { enabled: false, time: '19:00' };
    }
  }

  // ── Save settings ─────────────────────────────────────────────────────────
  function save(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  // ── Request notification permission ──────────────────────────────────────
  function requestPermission(callback) {
    if (!('Notification' in window)) {
      callback(false, 'Your browser does not support notifications.');
      return;
    }
    if (Notification.permission === 'granted') {
      callback(true);
      return;
    }
    Notification.requestPermission().then(function(result) {
      callback(result === 'granted', result === 'denied' ? 'Please allow notifications in your browser settings.' : null);
    });
  }

  // ── Tell service worker about the schedule ────────────────────────────────
  function syncWithSW(time, lastSubject) {
    if (!navigator.serviceWorker || !navigator.serviceWorker.controller) return;
    navigator.serviceWorker.controller.postMessage({
      type: 'SCHEDULE_REMINDER',
      time: time,
      lastSubject: lastSubject || null
    });
  }

  // ── Check every minute if it's time to fire ───────────────────────────────
  function startChecker() {
    // Clear existing checker
    if (window._reminderInterval) clearInterval(window._reminderInterval);

    window._reminderInterval = setInterval(function() {
      var settings = load();
      if (!settings.enabled) return;
      if (Notification.permission !== 'granted') return;

      var now = new Date();
      var hh = String(now.getHours()).padStart(2, '0');
      var mm = String(now.getMinutes()).padStart(2, '0');
      var currentTime = hh + ':' + mm;

      if (currentTime === settings.time) {
        // Prevent firing twice in same minute
        var lastFired = localStorage.getItem('nyansa_last_reminder');
        var todayKey = now.toDateString() + '_' + settings.time;
        if (lastFired === todayKey) return;
        localStorage.setItem('nyansa_last_reminder', todayKey);

        // Get last studied subject
        var lastSubject = null;
        try {
          var hist = JSON.parse(localStorage.getItem('nyansa_history') || '[]');
          if (hist.length > 0) lastSubject = hist[0].subject || null;
        } catch(e) {}

        // Trigger via SW
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'TRIGGER_REMINDER',
            lastSubject: lastSubject
          });
        }
      }
    }, 60000); // check every minute
  }

  // ── Enable reminders ──────────────────────────────────────────────────────
  function enable(time, callback) {
    requestPermission(function(granted, errMsg) {
      if (!granted) {
        callback(false, errMsg || 'Permission denied.');
        return;
      }
      var settings = { enabled: true, time: time };
      save(settings);
      syncWithSW(time, null);
      startChecker();
      callback(true);
    });
  }

  // ── Disable reminders ─────────────────────────────────────────────────────
  function disable() {
    var settings = load();
    settings.enabled = false;
    save(settings);
    if (window._reminderInterval) clearInterval(window._reminderInterval);
  }

  // ── Init on page load ─────────────────────────────────────────────────────
  function init() {
    var settings = load();
    if (settings.enabled && Notification.permission === 'granted') {
      startChecker();
    }
  }

  // ── Render settings UI ────────────────────────────────────────────────────
  function renderSettingsUI(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var settings = load();
    var permStatus = !('Notification' in window) ? 'not-supported'
      : Notification.permission === 'granted' ? 'granted'
      : Notification.permission === 'denied' ? 'denied' : 'default';

    container.innerHTML =
      '<div style="background:var(--card);border:1px solid var(--border);border-radius:var(--rl);padding:1.2rem;margin-bottom:1rem;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">' +
          '<div>' +
            '<div style="font-family:var(--fh);font-size:15px;font-weight:700;">🔔 Daily Study Reminder</div>' +
            '<div style="font-size:12px;color:var(--muted);margin-top:2px;">Get reminded to study every day</div>' +
          '</div>' +
          '<label class="tog">' +
            '<input type="checkbox" id="reminder-toggle" ' + (settings.enabled ? 'checked' : '') + '>' +
            '<span class="tog-sl"></span>' +
          '</label>' +
        '</div>' +

        '<div id="reminder-time-row" style="' + (!settings.enabled ? 'display:none;' : '') + 'margin-bottom:1rem;">' +
          '<label class="fl">Reminder Time</label>' +
          '<input type="time" id="reminder-time" value="' + settings.time + '" style="max-width:160px;">' +
        '</div>' +

        '<div id="reminder-status" style="font-size:12px;margin-top:8px;">' +
          (permStatus === 'denied'
            ? '<span style="color:#ce1126;">⚠️ Notifications blocked. Please enable in browser settings.</span>'
            : permStatus === 'granted' && settings.enabled
            ? '<span style="color:#006b3f;">✅ Reminder set for ' + settings.time + ' daily</span>'
            : '') +
        '</div>' +
      '</div>';

    // Wire up toggle
    var toggle = document.getElementById('reminder-toggle');
    var timeRow = document.getElementById('reminder-time-row');
    var timeInput = document.getElementById('reminder-time');
    var statusEl = document.getElementById('reminder-status');

    toggle.addEventListener('change', function() {
      if (toggle.checked) {
        timeRow.style.display = 'block';
        var chosenTime = timeInput.value || '19:00';
        enable(chosenTime, function(ok, err) {
          if (ok) {
            statusEl.innerHTML = '<span style="color:#006b3f;">✅ Reminder set for ' + chosenTime + ' daily</span>';
          } else {
            statusEl.innerHTML = '<span style="color:#ce1126;">⚠️ ' + (err || 'Could not enable.') + '</span>';
            toggle.checked = false;
            timeRow.style.display = 'none';
          }
        });
      } else {
        disable();
        timeRow.style.display = 'none';
        statusEl.innerHTML = '<span style="color:var(--muted);">Reminder off</span>';
      }
    });

    timeInput.addEventListener('change', function() {
      if (toggle.checked) {
        var newTime = timeInput.value;
        var s = load();
        s.time = newTime;
        save(s);
        syncWithSW(newTime, null);
        statusEl.innerHTML = '<span style="color:#006b3f;">✅ Reminder updated to ' + newTime + ' daily</span>';
      }
    });
  }

  return { init: init, enable: enable, disable: disable, load: load, renderSettingsUI: renderSettingsUI };

})();

// Auto-init
document.addEventListener('DOMContentLoaded', function() {
  NyansaReminder.init();
});
