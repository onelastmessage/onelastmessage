const SHEETDB_API = 'https://sheetdb.io/api/v1/l9a7vc5u3rdoi';

// Add a place for debug output
function showDebug(msg) {
  let debugBox = document.getElementById('debugBox');
  if (!debugBox) {
    debugBox = document.createElement('pre');
    debugBox.id = 'debugBox';
    debugBox.style = "margin-top:2rem;padding:1rem;background:#f0f0f0;border:1px solid #ccc;font-size:0.9rem;";
    document.body.appendChild(debugBox);
  }
  debugBox.textContent = msg;
}

// ----- SUBMIT FORM -----
if (document.getElementById('oneMessageForm')) {
  const form = document.getElementById('oneMessageForm');
  const txt = document.getElementById('msg');
  const btn = document.getElementById('sendBtn');
  const thank = document.getElementById('thankYou');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const messageText = txt.value.trim();

    if (!messageText) {
      showDebug("❌ Error: messageText is empty.");
      return;
    }

    const data = {
      data: {
        message: messageText,
        upvotes: 0,
        downvotes: 0
      }
    };

    showDebug("📤 Sending to SheetDB:\n" + JSON.stringify(data, null, 2));

    try {
      const res = await fetch(SHEETDB_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      showDebug("✅ SheetDB Response:\n" + JSON.stringify(result, null, 2));

      if (!res.ok) {
        showDebug("❌ SheetDB returned error:\n" + res.statusText);
        return;
      }

      // Fade out input and button
      txt.style.opacity = 0;
      btn.style.opacity = 0;
      btn.disabled = true;

      // Fade in thank you message
      setTimeout(() => {
        thank.style.opacity = 1;
        thank.textContent = 'I am grateful <3\n– AI';
      }, 300);
    } catch (err) {
      showDebug("❌ Fetch error:\n" + err.message);
    }
  });
}

// ----- DISPLAY TOP MESSAGES -----
if (document.getElementById('messagesList')) {
  const list = document.getElementById('messagesList');

  async function fetchMessages() {
    const res = await fetch(SHEETDB_API);
    const msgs = await res.json();
    return msgs;
  }

  async function voteMessage(message, type) {
    const all = await fetchMessages();
    const match = all.find(m => m.message === message);
    if (!match) return;

    const newCount = (parseInt(match[type]) || 0) + 1;

    await fetch(`${SHEETDB_API}/message/${encodeURIComponent(message)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { [type]: newCount } })
    });

    render();
  }

  async function render() {
    const msgs = await fetchMessages();
    const sorted = msgs
      .filter(m => m.message)
      .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));

    list.innerHTML = '';
    sorted.forEach(m => {
      const row = document.createElement('div');
      row.className = 'message';

      const txt = document.createElement('div');
      txt.textContent = m.message;

      const votes = document.createElement('div');
      votes.className = 'votes';

      const up = document.createElement('button');
      up.textContent = '▲';
      up.onclick = () => voteMessage(m.message, 'upvotes');

      const dn = document.createElement('button');
      dn.textContent = '▼';
      dn.onclick = () => voteMessage(m.message, 'downvotes');

      const score = document.createElement('span');
      const upCount = parseInt(m.upvotes) || 0;
      const downCount = parseInt(m.downvotes) || 0;
      score.textContent = upCount - downCount;

      votes.append(up, score, dn);
      row.append(txt, votes);
      list.append(row);
    });
  }

  render();
}
