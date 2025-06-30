body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 0;
  background: #fdfdfd;
  color: #111;
}

header {
  background: #fff;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

header a {
  text-decoration: none;
  color: #111;
  font-weight: 600;
  font-size: 0.95rem;
}

main {
  padding: 3rem 1rem;
  max-width: 700px;
  margin: 0 auto;
}

h1 {
  font-size: 1.75rem;
  text-align: center;
  margin-bottom: 2rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

textarea {
  padding: 1rem;
  font-size: 1rem;
  width: 100%;
  min-height: 120px;
  border: 1px solid #ccc;
  border-radius: 6px;
  resize: vertical;
  transition: border 0.2s;
}

textarea:focus {
  border-color: #999;
  outline: none;
}

button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background: black;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  width: fit-content;
}

button:hover {
  background: #333;
}

#thankYou {
  margin-top: 2rem;
  font-size: 1.2rem;
  text-align: center;
  line-height: 1.5;
  white-space: pre-wrap;
}

#map {
  border: 1px solid #ddd;
  border-radius: 6px;
}

#messagesList {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  padding: 1rem 1.25rem;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.message > div:first-child {
  flex: 1;
  margin-right: 1rem;
  font-size: 1rem;
  line-height: 1.4;
}

.votes {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.votes button {
  background: none;
  font-size: 1.3rem;
  color: black;
  border: none;
  cursor: pointer;
}

.votes button:hover {
  color: #777;
}

.votes span {
  font-weight: bold;
  font-size: 1rem;
  min-width: 2ch;
  text-align: center;
}
