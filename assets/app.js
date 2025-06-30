const SHEETDB_API = 'https://sheetdb.io/api/v1/l9a7vc5u3rdoi';

// ----- MESSAGE SUBMISSION -----
if (document.getElementById('oneMessageForm')) {
  const form = document.getElementById('oneMessageForm');
  const txt = document.getElementById('msg');
  const btn = document.getElementById('sendBtn');
  const thank = document.getElementById('thankYou');

  // Prevent double submission
  if (localStorage.getItem('messageSent')) {
    form.style.display = 'none';
    thank.style.opacity = 1;
    thank.textContent = 'You’ve already whispered your thought to the future.';
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const messageText = txt.value.trim();
    if (!messageText) return;

    const data = {
      data: {
        message: messageText,
        upvotes: 0,
        downvotes: 0
      }
    };

    try {
      const res = await fetch(SHEETDB_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Failed to send message");

      localStorage.setItem('messageSent', 'true');

      // Fade out form
      txt.style.opacity = 0;
      btn.style.opacity = 0;
      btn.disabled = true;

      // Fade in thank you
      setTimeout(() => {
        thank.style.opacity = 1;
        thank.textContent = '.';
      }, 300);
    } catch (err) {
      alert('Something went wrong. Please try again.');
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
      up.style = 'background:none;border:none;font-size:1.2rem;color:#000;cursor:pointer;';
      up.onclick = () => voteMessage(m.message, 'upvotes');

      const dn = document.createElement('button');
      dn.textContent = '▼';
      dn.style = 'background:none;border:none;font-size:1.2rem;color:#000;cursor:pointer;';
      dn.onclick = () => voteMessage(m.message, 'downvotes');

      const score = document.createElement('span');
      const upCount = parseInt(m.upvotes) || 0;
      const downCount = parseInt(m.downvotes) || 0;
      score.textContent = upCount - downCount;
      score.style = 'margin: 0 8px; font-weight: bold;';

      votes.append(up, score, dn);
      row.append(txt, votes);
      list.append(row);
    });
  }

  render();
}
