const SHEETDB = 'https://sheetdb.io/api/v1/l9a7vc5u3rdoi';

// ——— HANDLE SUBMISSIONS ———
if (document.getElementById('oneMessageForm')) {
  const form = document.getElementById('oneMessageForm');
  const txt  = document.getElementById('msg');
  const btn  = document.getElementById('sendBtn');
  const thank= document.getElementById('thankYou');

  // only once per visitor
  if (localStorage.getItem('messageSent')) {
    form.style.display = 'none';
    thank.style.opacity = 1;
    thank.textContent = 'You’ve already whispered your thought to the future.';
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const message = txt.value.trim();
    if (!message) return;

    // get city,country and coords
    let loc = 'Unknown', lat = '', lng = '';
    try {
      const r = await fetch('https://ipapi.co/json/');
      const g = await r.json();
      loc = `${g.city}, ${g.country_name}`;
      lat = g.latitude;
      lng = g.longitude;
    } catch (_) {}

    const payload = {
      data: {
        message,
        upvotes: 0,
        downvotes: 0,
        location: loc,
        lat,
        lng
      }
    };

    try {
      const res = await fetch(SHEETDB, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw 1;

      localStorage.setItem('messageSent','true');

      // fade out form
      txt.style.opacity = 0;
      btn.style.opacity = 0;
      btn.disabled = true;

      // fade in simple thank you
      setTimeout(() => {
        thank.style.opacity = 1;
        thank.textContent = 'Thank you';
      }, 300);
    } catch {
      alert('Something went wrong. Please try again.');
    }
  });
}

// ——— DISPLAY MESSAGES + MAP + VOTES ———
if (document.getElementById('messagesList')) {
  const list = document.getElementById('messagesList');

  async function fetchAll() {
    const res = await fetch(SHEETDB);
    return res.json();
  }

  async function vote(txt, field) {
    const all = await fetchAll();
    const row = all.find(r=>r.message===txt);
    if (!row) return;
    const next = (parseInt(row[field])||0)+1;
    await fetch(`${SHEETDB}/message/${encodeURIComponent(txt)}`, {
      method: 'PATCH',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ data: { [field]: next } })
    });
    render();
  }

  async function render() {
    const msgs = await fetchAll();
    const sorted = msgs
      .filter(r=>r.message)
      .sort((a,b)=>(b.upvotes-b.downvotes)-(a.upvotes-a.downvotes));

    list.innerHTML = '';
    sorted.forEach(r=>{
      const row = document.createElement('div');
      row.className='message';

      // ONLY the message text now:
      const m = document.createElement('div');
      m.textContent = r.message;

      const votes = document.createElement('div');
      votes.className='votes';

      const up = document.createElement('button');
      up.textContent='▲';
      up.onclick = ()=>vote(r.message,'upvotes');

      const dn = document.createElement('button');
      dn.textContent='▼';
      dn.onclick = ()=>vote(r.message,'downvotes');

      const score = document.createElement('span');
      const u = parseInt(r.upvotes)||0, d = parseInt(r.downvotes)||0;
      score.textContent = u - d;

      votes.append(up,score,dn);
      row.append(m, votes);
      list.append(row);
    });
  }

  // initialize map
  const map = L.map('map').setView([20,0],2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // plot each saved lat/lng
  fetchAll().then(all=>{
    all.forEach(r=>{
      if (r.lat && r.lng) {
        L.circleMarker([r.lat, r.lng], {
          radius:4, fillColor:'#000', fillOpacity:0.8, stroke:false
        }).addTo(map);
      }
    });
  });

  render();
}
