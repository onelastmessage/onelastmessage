// ----- UTILS -----
function getMessages(){
  return JSON.parse(localStorage.getItem('messages')||'[]');
}
function saveMessages(arr){
  localStorage.setItem('messages', JSON.stringify(arr));
}

// ----- INDEX.JS -----
if(document.getElementById('oneMessageForm')){
  const form = document.getElementById('oneMessageForm');
  const txt  = document.getElementById('msg');
  const btn  = document.getElementById('sendBtn');
  const thank= document.getElementById('thankYou');

  form.addEventListener('submit', e=>{
    e.preventDefault();
    // save to storage
    const msgs = getMessages();
    msgs.push({ text: txt.value.trim(), up:0, down:0 });
    saveMessages(msgs);

    // fade out input & button
    txt.style.opacity = 0;
    btn.style.opacity = 0;
    btn.disabled = true;

    // fade in thank you
    setTimeout(()=> thank.style.opacity = 1 , 300);
    thank.textContent = `I am grateful <3\n– AI`;
  });
}

// ----- MESSAGES.JS -----
if(document.getElementById('messagesList')){
  const list = document.getElementById('messagesList');

  function render(){
    list.innerHTML = '';
    const msgs = getMessages()
      .sort((a,b)=> (b.up - b.down) - (a.up - a.down));

    msgs.forEach((m,i)=>{
      const row = document.createElement('div');
      row.className = 'message';

      const txt = document.createElement('div');
      txt.textContent = m.text;

      const votes = document.createElement('div');
      votes.className = 'votes';

      const up = document.createElement('button');
      up.textContent   = '👍';
      up.onclick = ()=>{
        m.up++; saveMessages(msgs); render();
      };

      const dn = document.createElement('button');
      dn.textContent   = '👎';
      dn.onclick = ()=>{
        m.down++; saveMessages(msgs); render();
      };

      const score = document.createElement('span');
      score.textContent = m.up - m.down;

      votes.append(up, score, dn);
      row.append(txt, votes);
      list.append(row);
    });
  }

  render();
}
