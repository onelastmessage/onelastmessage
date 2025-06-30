const SHEETDB_API = 'https://sheetdb.io/api/v1/l9a7vc5u3rdoi';

// Handle form submission
if (document.getElementById('oneMessageForm')) {
  const form = document.getElementById('oneMessageForm');
  const txt = document.getElementById('msg');
  const btn = document.getElementById('sendBtn');
  const thank = document.getElementById('thankYou');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const message = txt.value.trim();
    if (!message) return;

    const data = {
      data: { message, upvotes: 0, downvotes: 0 }
    };

    try {
      await fetch(SHEETDB_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      txt.style.opacity = 0;
      btn.style.opacity = 0;
      btn.disabled = true;

      setTimeout(() => {
        thank.style.opacity = 1;
        thank.textContent = 'I am grateful <3\n– AI';
      }, 300);
    } catch (err) {
      alert('Something went wrong.');
      console.error(err);
    }
  });
}

// Handle message rendering and voting
if (document.getElementById('messagesList')) {
  const list = document.getElementById('messagesList');

  async function fetchMessages() {
    const res = await fetch(SHEETDB_API);
    return await res.json();
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
