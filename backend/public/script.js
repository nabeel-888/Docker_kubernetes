const API_URL = '/api/notes';

const form = document.getElementById('note-form');
const input = document.getElementById('note-input');
const list = document.getElementById('notes-list');
const status = document.getElementById('status');

async function loadNotes() {
  try {
    const res = await fetch(API_URL);
    const notes = await res.json();
    renderNotes(notes);
    status.textContent = `${notes.length} note(s) loaded from MongoDB`;
  } catch (err) {
    status.textContent = 'Could not reach the backend API.';
  }
}

function renderNotes(notes) {
  list.innerHTML = '';
  notes.forEach((note) => {
    const li = document.createElement('li');

    const span = document.createElement('span');
    span.textContent = note.text;

    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.className = 'delete-btn';
    delBtn.addEventListener('click', () => deleteNote(note._id));

    li.appendChild(span);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

async function addNote(text) {
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  loadNotes();
}

async function deleteNote(id) {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  loadNotes();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addNote(text);
  input.value = '';
});

loadNotes();
