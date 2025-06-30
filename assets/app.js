const SHEETDB_API = 'https://sheetdb.io/api/v1/l9a7vc5u3rdoi';

// ----- MESSAGE SUBMISSION -----
if (document.getElementById('oneMessageForm')) {
  const form = document.getElementById('oneMessageForm');
  const txt  = document.getElementById('msg');
  const btn  = document.getElementById('sendBtn');
  const thank= document.getElementById('thankYou');

  // prevent multiple submissions
  if (localStorage.getItem('messageSent')) {
    form.style.display = 'none';
    thank.style.opacity = 1;
    thank.textContent = 'You’ve already whispered your thought to the future.';
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const messageText = txt.value.trim();
    if (!messageText) return;

    // get approximate location
    let location = 'Unknown';
    try {
      const res = await fetch('https://ipapi.co/json/');
      const geo = await res.json();
      location = `${geo.city}, ${geo.country_name}`;
    } catch (err) {
      console.warn('Location fetch failed');
    }

    const payload = {
      data: {
        message: messageText,
        upvotes: 0,
        downvotes: 0,
        location: location
      }
    };

    try {
      const res = await fetch(SHEETDB_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Send failed');

      localStorage.setItem('messageSent','true');
      txt.style.opacity = 0;
      btn.style.opacity = 0;
      btn.disabled = true;

      setTimeout(() => {
        thank.style.opacity = 1;
        thank.textContent = 'thank you';
      }, 300);
    } catch (err) {
      alert('Something went wrong. Please try again.');
      console.error(err);
    }
  });
}

// ----- DISPLAY TOP MESSAGES + VOTING -----
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
    const newCount = (parseInt(match[type])||0) + 1;

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
      .sort((a,b)=> (b.upvotes-b.downvotes)-(a.upvotes-a.downvotes));

    list.innerHTML = '';
    sorted.forEach(m => {
      const row = document.createElement('div');
      row.className = 'message';

      const txt = document.createElement('div');
      txt.textContent = m.message + (m.location ? ` — ${m.location}` : '');

      const votes = document.createElement('div');
      votes.className = 'votes';

      const up = document.createElement('button');
      up.textContent = '▲';
      up.onclick = ()=> voteMessage(m.message, 'upvotes');

      const dn = document.createElement('button');
      dn.textContent = '▼';
      dn.onclick = ()=> voteMessage(m.message, 'downvotes');

      const score = document.createElement('span');
      const upCount = parseInt(m.upvotes)||0;
      const downCount = parseInt(m.downvotes)||0;
      score.textContent = upCount - downCount;

      votes.append(up, score, dn);
      row.append(txt, votes);
      list.append(row);
    });
  }

  render();

  // ----- MINI-MAP -----
  const map = L.map('map').setView([20,0],2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // geocode each location and plot
  fetchMessages().then(msgs=>{
    const seen = {};
    msgs.forEach(m=>{
      if (m.location && !seen[m.location]) {
        seen[m.location] = true;
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(m.location)}`)
          .then(r=>r.json())
          .then(results=>{
            if (results[0]) {
              const { lat, lon } = results[0];
              L.circleMarker([lat, lon], {
                radius: 4, fillColor:"#000", fillOpacity:0.8, stroke:false
              }).addTo(map);
            }
          })
          .catch(()=>{/* ignore geocode errors */});
      }
    });
  });
}
