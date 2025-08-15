async function loadRepos() {
  try {
    const response = await fetch('https://api.github.com/users/lklostermair/repos');
    const data = await response.json();
    const list = document.getElementById('repo-list');
    data.forEach(repo => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = repo.html_url;
      a.textContent = repo.name;
      li.appendChild(a);
      list.appendChild(li);
    });
  } catch (error) {
    console.error('Failed to load repositories', error);
  }
}

document.addEventListener('DOMContentLoaded', loadRepos);
