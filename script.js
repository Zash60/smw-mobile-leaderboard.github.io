      import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, push, onValue, update, set, get, query, orderByChild, equalTo, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCUlURbPgVucJZlUeFs7vj1_HRINgButaA",
  authDomain: "smw-speedrun-mobile-lederbord.firebaseapp.com",
  // A linha abaixo foi gerada automaticamente baseada no seu ID. 
  // Se der erro, verifique no Console do Firebase > Realtime Database a URL correta.
  databaseURL: "https://smw-speedrun-mobile-lederbord-default-rtdb.firebaseio.com/",
  projectId: "smw-speedrun-mobile-lederbord",
  storageBucket: "smw-speedrun-mobile-lederbord.firebasestorage.app",
  messagingSenderId: "938362959999",
  appId: "1:938362959999:web:50ac271e89704ec3bce74a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// ... O resto do seu código continua igual daqui para baixo ...
      
      let allCategoriesData = [];
      let currentCategorySelection = null;
      let currentGameId = 'smw';
      const apiBaseUrl = `https://www.speedrun.com/api/v1`;

      window.toggleGame = function() {
          currentGameId = (currentGameId === 'smw') ? 'smwext' : 'smw';
          updateGameUI();
          fetchAndDisplayCategories();
      }

      function updateGameUI() {
          const isMainGame = currentGameId === 'smw';
          const toggleBtn = document.getElementById('extension-toggle-btn');

          toggleBtn.textContent = isMainGame ? 'View Category Extensions' : 'View Main Categories';
          toggleBtn.setAttribute('data-game', currentGameId);
          document.getElementById('smw-categories-container').style.display = isMainGame ? 'block' : 'none';
          document.getElementById('smwext-categories-container').style.display = isMainGame ? 'none' : 'block';

          document.getElementById('leaderboard-list').innerHTML = '';
          document.getElementById('leaderboard-title').textContent = 'Leaderboard';
          document.getElementById('leaderboard-loader').textContent = 'Select a category';
          currentCategorySelection = null;
      }

      async function fetchAndDisplayCategories() {
          const loader = document.getElementById('leaderboard-loader');
          loader.textContent = 'Loading categories...';
          loader.style.display = 'block';
          allCategoriesData = [];

          try {
              const response = await fetch(`${apiBaseUrl}/games/${currentGameId}/categories?embed=variables`);
              const data = await response.json();
              allCategoriesData = data.data;
              loader.textContent = 'Select a category';

              if (currentGameId === 'smw') {
                  displaySmwCategories();
              } else {
                  displaySmwExtCategories();
              }
          } catch (error) {
              console.error('Error fetching categories:', error);
              loader.textContent = 'Failed to load categories.';
          }
      }

      function displaySmwCategories() {
          const mainCategoriesNav = document.getElementById('main-categories-nav');
          mainCategoriesNav.innerHTML = '';
          if (allCategoriesData.length > 0) {
              allCategoriesData.forEach((category, index) => {
                  const button = document.createElement('button');
                  button.textContent = category.name;
                  button.onclick = () => selectMainCategory(category.id);
                  mainCategoriesNav.appendChild(button);
                  if (index === 0) selectMainCategory(category.id);
              });
          }
      }

      function displaySmwExtCategories() {
          const select = document.getElementById('smwext-category-select');
          select.innerHTML = '';
          if (allCategoriesData.length > 0) {
              allCategoriesData.forEach(category => {
                  const subVar = category.variables.data.find(v => v['is-subcategory']);
                  if (subVar) {
                      Object.entries(subVar.values.values).forEach(([valueId, valueData]) => {
                          const option = new Option(`${category.name} - ${valueData.label}`);
                          option.dataset.categoryId = category.id;
                          option.dataset.variableId = subVar.id;
                          option.dataset.valueId = valueId;
                          select.appendChild(option);
                      });
                  } else {
                      const option = new Option(category.name);
                      option.dataset.categoryId = category.id;
                      select.appendChild(option);
                  }
              });
              loadLeaderboardFromDropdown(select);
          }
      }

      window.loadLeaderboardFromDropdown = function(selectElement) {
          const selectedOption = selectElement.options[selectElement.selectedIndex];
          const { categoryId, variableId, valueId } = selectedOption.dataset;
          const title = selectedOption.textContent;
          loadLeaderboard(categoryId, variableId || null, valueId || null, title);
      }

      function parseTimeToMilliseconds(timeStr) {
          if (!timeStr || typeof timeStr !== 'string') return 0;
          let totalMs = 0;
          const hourMatch = timeStr.match(/(\d+)\s*h/);
          const minMatch = timeStr.match(/(\d+)\s*m(?!s)/);
          const secMatch = timeStr.match(/(\d+(\.\d+)?)\s*s/);
          const msMatch = timeStr.match(/(\d+)\s*ms/);
          if (hourMatch || minMatch || secMatch || msMatch) {
              if (hourMatch) totalMs += parseInt(hourMatch[1]) * 3600000;
              if (minMatch) totalMs += parseInt(minMatch[1]) * 60000;
              if (secMatch) totalMs += parseFloat(secMatch[1]) * 1000;
              if (msMatch) totalMs += parseInt(msMatch[1]);
              return totalMs;
          }
          const parts = timeStr.split(':');
          if (parts.length === 3) {
              totalMs += parseInt(parts[0]) * 3600000;
              totalMs += parseInt(parts[1]) * 60000;
              totalMs += parseFloat(parts[2]) * 1000;
          } else if (parts.length === 2) {
              totalMs += parseInt(parts[0]) * 60000;
              totalMs += parseFloat(parts[1]) * 1000;
          }
          return totalMs;
      }

      function loadLeaderboard(categoryId, variableId, valueId, title) {
          currentCategorySelection = { categoryId, variableId, valueId, title };
          const leaderboardList = document.getElementById('leaderboard-list');
          const leaderboardTitle = document.getElementById('leaderboard-title');
          const loader = document.getElementById('leaderboard-loader');
          leaderboardTitle.textContent = title;
          leaderboardList.innerHTML = '';
          loader.style.display = 'block';
          loader.textContent = 'Loading leaderboard...';

          let dbPath = `games/${currentGameId}/leaderboards/${categoryId}`;
          if (variableId && valueId) dbPath += `/${variableId}/${valueId}`;
          
          onValue(ref(database, dbPath), (snapshot) => {
              loader.style.display = 'none';
              leaderboardList.innerHTML = '';
              const data = snapshot.val();
              if (data) {
                  const runs = Object.values(data);
                  runs.sort((a, b) => parseTimeToMilliseconds(a.time) - parseTimeToMilliseconds(b.time));
                  
                  runs.forEach((run, index) => {
                      const li = document.createElement('li');
                      const youtubeIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.582,6.186 C21.328,5.247 20.753,4.672 19.814,4.418 C18.109,4 12,4 12,4 C12,4 5.891,4 4.186,4.418 C3.247,4.672 2.672,5.247 2.418,6.186 C2,7.891 2,12 2,12 C2,12 2,16.109 2.418,17.814 C2.672,18.753 3.247,19.328 4.186,19.582 C5.891,20 12,20 12,20 C12,20 18.109,20 19.814,19.582 C20.753,19.328 21.328,18.753 21.582,17.814 C22,16.109 22,12 22,12 C22,12 22,7.891 21.582,6.186 Z" fill="#FF0000"/><path d="M9.75,15.5 L15.75,12 L9.75,8.5 L9.75,15.5 Z" fill="white"/></svg>`;
                      const youtubeLink = run.videoUrl ? `<a href="${run.videoUrl}" target="_blank" class="yt-link" title="Watch video">${youtubeIcon}</a>` : '';
                      
                      li.innerHTML = `
                          <strong class="rank">#${index + 1}</strong>
                          <div class="player-info">
                              <span>${run.player} ${youtubeLink}</span>
                              <div class="run-details">${run.date}</div>
                          </div>
                          <strong class="run-time">${run.time}</strong>
                      `;
                      leaderboardList.appendChild(li);
                  });
              } else {
                  leaderboardList.innerHTML = '<li style="justify-content: center;">No runs submitted for this category yet.</li>';
              }
          });
      }
      
      window.closeModal = (modalId) => { document.getElementById(modalId).style.display = 'none'; }
      
      window.openSubmitModal = function() {
          if (!allCategoriesData.length) {
              alert("Categories are still loading, please wait.");
              return;
          }
          populateCategoryDropdowns('submit', currentCategorySelection);
          document.getElementById('submit-run-modal').style.display = 'block';
      }

      window.submitRun = async function(event) {
          event.preventDefault();
          const mainCatSelect = document.getElementById('submit-main-category');
          const subCatSelect = document.getElementById('submit-sub-category');
          
          const categoryData = allCategoriesData.find(c => c.id === mainCatSelect.value);
          const subcategoryVariable = categoryData.variables.data.find(v => v['is-subcategory']);
          const subcategoryValue = subcategoryVariable?.values.values[subCatSelect.value];
          
          const runData = {
              player: document.getElementById('player-name').value,
              time: document.getElementById('run-time').value,
              date: document.getElementById('run-date').value,
              videoUrl: document.getElementById('video-url').value,
              status: 'pending',
              submittedAt: new Date().toISOString(),
              category: { id: categoryData.id, name: categoryData.name },
              subcategory: subcategoryValue ? { variableId: subcategoryVariable.id, valueId: subCatSelect.value, name: subcategoryValue.label } : null
          };
          
          try {
              const submissionsRef = ref(database, `games/${currentGameId}/submissions`);
              await push(submissionsRef, runData);
              alert('Run submitted for verification successfully!');
              closeModal('submit-run-modal');
              document.getElementById('submit-run-form').reset();
          } catch (error) {
              console.error("Error submitting run:", error);
              alert('Failed to submit run.');
          }
      }

      window.loadSubmissions = function(filterStatus) {
          document.querySelectorAll('.mod-filters button').forEach(btn => btn.classList.remove('active'));
          document.getElementById(`filter-${filterStatus}`).classList.add('active');

          const container = document.getElementById('submission-list-container');
          container.innerHTML = '<div class="loader">Loading submissions...</div>';
          
          const submissionsQuery = query(ref(database, `games/${currentGameId}/submissions`), orderByChild('status'), equalTo(filterStatus));
          onValue(submissionsQuery, (snapshot) => {
              container.innerHTML = '';
              const submissions = snapshot.val();
              if (!submissions || snapshot.size === 0) {
                  container.innerHTML = `<p style="text-align:center">No '${filterStatus}' submissions found.</p>`;
                  return;
              }
              
              Object.entries(submissions).forEach(([id, data]) => {
                  const item = document.createElement('div');
                  item.className = `submission-item status-${data.status}`;
                  let rejectButton = '';
                  if (data.status === 'pending' || data.status === 'verified') {
                      rejectButton = `<button class="btn-reject" onclick="updateRunStatus('${id}', 'rejected')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Reject</button>`;
                  }

                  const categoryTitle = data.subcategory ? `${data.category.name} - ${data.subcategory.name}` : data.category.name;

                  item.innerHTML = `
                      <div class="submission-header">
                          <div class="submission-info">
                              <p><strong>Player:</strong> ${data.player}</p>
                              <p><strong>Time:</strong> ${data.time} | <strong>Date:</strong> ${data.date}</p>
                          </div>
                      </div>
                      <p class="submission-category"><strong>Category:</strong> ${categoryTitle}</p>
                      <p class="submission-video"><strong>Video:</strong> <a href="${data.videoUrl}" target="_blank">Watch Video</a></p>
                      <div class="submission-actions">
                          ${data.status === 'pending' ? `<button class="btn-verify" onclick="verifyRun('${id}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Approve</button>` : ''}
                          ${rejectButton}
                          <button class="btn-edit" onclick="openEditModal('${id}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Edit</button>
                          <button class="btn-delete" onclick="deleteRun('${id}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Delete</button>
                      </div>
                  `;
                  container.appendChild(item);
              });
          });
      }

      window.updateRunStatus = async (id, newStatus) => {
          const submissionRef = ref(database, `games/${currentGameId}/submissions/${id}`);
          try {
              const snapshot = await get(submissionRef);
              const data = snapshot.val();

              if (data && data.status === 'verified' && newStatus === 'rejected' && data.leaderboardKey) {
                  let leaderboardPath = `games/${currentGameId}/leaderboards/${data.category.id}`;
                  if (data.subcategory) leaderboardPath += `/${data.subcategory.variableId}/${data.subcategory.valueId}`;
                  leaderboardPath += `/${data.leaderboardKey}`;
                  
                  await remove(ref(database, leaderboardPath));
                  await update(submissionRef, { leaderboardKey: null }); 
              }

              await update(submissionRef, { status: newStatus });
              alert(`Run status changed to ${newStatus}.`);

          } catch (error) {
              console.error("Error updating run status:", error);
              alert("Failed to update run status.");
          }
      }

      window.verifyRun = async (id) => {
          const submissionRef = ref(database, `games/${currentGameId}/submissions/${id}`);
          const snapshot = await get(submissionRef);
          const data = snapshot.val();
          if (!data) return;
          
          let leaderboardPath = `games/${currentGameId}/leaderboards/${data.category.id}`;
          if (data.subcategory && data.subcategory.variableId && data.subcategory.valueId) {
              leaderboardPath += `/${data.subcategory.variableId}/${data.subcategory.valueId}`;
          }
          
          const newRunOnLeaderboardRef = await push(ref(database, leaderboardPath), {
              player: data.player,
              time: data.time,
              date: data.date,
              videoUrl: data.videoUrl || ''
          });
          
          await update(submissionRef, { 
              status: 'verified',
              leaderboardKey: newRunOnLeaderboardRef.key
          });
          alert('Run verified and added to the leaderboard!');
      }

      window.deleteRun = async (id) => {
          if (!confirm("Are you sure you want to permanently delete this run? This action cannot be undone.")) {
              return;
          }

          const submissionRef = ref(database, `games/${currentGameId}/submissions/${id}`);
          try {
              const snapshot = await get(submissionRef);
              const data = snapshot.val();

              if (data && data.status === 'verified' && data.leaderboardKey) {
                  let leaderboardPath = `games/${currentGameId}/leaderboards/${data.category.id}`;
                  if (data.subcategory && data.subcategory.variableId && data.subcategory.valueId) {
                    leaderboardPath += `/${data.subcategory.variableId}/${data.subcategory.valueId}`;
                  }
                  leaderboardPath += `/${data.leaderboardKey}`;
                  
                  await remove(ref(database, leaderboardPath));
              }

              await remove(submissionRef);
              alert('Run permanently deleted.');
          } catch (error) {
              console.error("Error deleting run:", error);
              alert("Failed to delete run.");
          }
      }
      
      window.openEditModal = async (id) => {
          const submissionRef = ref(database, `games/${currentGameId}/submissions/${id}`);
          const snapshot = await get(submissionRef);
          const data = snapshot.val();

          const selection = {
             categoryId: data.category.id,
             valueId: data.subcategory ? data.subcategory.valueId : null
          };

          document.getElementById('edit-run-id').value = id;
          populateCategoryDropdowns('edit', selection);
          document.getElementById('edit-player-name').value = data.player;
          document.getElementById('edit-run-time').value = data.time;
          document.getElementById('edit-run-date').value = data.date;
          document.getElementById('edit-video-url').value = data.videoUrl || '';
          document.getElementById('edit-run-modal').style.display = 'block';
      }
      
      window.saveEditedRun = async (event) => {
          event.preventDefault();
          const id = document.getElementById('edit-run-id').value;
          const mainCatSelect = document.getElementById('edit-main-category');
          const subCatSelect = document.getElementById('edit-sub-category');
          
          const categoryData = allCategoriesData.find(c => c.id === mainCatSelect.value);
          const subcategoryVariable = categoryData.variables.data.find(v => v['is-subcategory']);
          const subcategoryValue = subcategoryVariable?.values.values[subCatSelect.value];

          const updatedData = {
              player: document.getElementById('edit-player-name').value,
              time: document.getElementById('edit-run-time').value,
              date: document.getElementById('edit-run-date').value,
              videoUrl: document.getElementById('edit-video-url').value,
              category: { id: categoryData.id, name: categoryData.name },
              subcategory: subcategoryValue ? { variableId: subcategoryVariable.id, valueId: subCatSelect.value, name: subcategoryValue.label } : null
          };
          
          const submissionRef = ref(database, `games/${currentGameId}/submissions/${id}`);
          const snapshot = await get(submissionRef);
          const existingData = snapshot.val();
          Object.assign(existingData, updatedData);

          await set(submissionRef, existingData);
          alert('Run updated!');
          closeModal('edit-run-modal');
      }

      function populateCategoryDropdowns(prefix, selection) {
          const mainCatSelect = document.getElementById(`${prefix}-main-category`);
          mainCatSelect.innerHTML = '';
          allCategoriesData.forEach(cat => {
              const option = new Option(cat.name, cat.id);
              if (selection && cat.id === selection.categoryId) option.selected = true;
              mainCatSelect.appendChild(option);
          });
          updateSubCategoryDropdown(prefix, selection ? selection.valueId : null);
      }

      window.updateSubCategoryDropdown = function(prefix, selectedValueId = null) {
          const mainCatSelect = document.getElementById(`${prefix}-main-category`);
          const subCatSelect = document.getElementById(`${prefix}-sub-category`);
          subCatSelect.innerHTML = '';
          const category = allCategoriesData.find(c => c.id === mainCatSelect.value);
          const subcategoryVariable = category?.variables.data.find(v => v['is-subcategory']);

          if (subcategoryVariable) {
              Object.entries(subcategoryVariable.values.values).forEach(([valueId, valueData]) => {
                  const option = new Option(valueData.label, valueId);
                  if (selectedValueId && valueId === selectedValueId) option.selected = true;
                  subCatSelect.appendChild(option);
              });
              subCatSelect.style.display = 'block';
              subCatSelect.previousElementSibling.style.display = 'block';
          } else {
              subCatSelect.style.display = 'none';
              subCatSelect.previousElementSibling.style.display = 'none';
          }
      }

      window.showTab = function(tabName) {
          document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
          document.querySelectorAll('.main-nav button').forEach(btn => btn.classList.remove('active'));
          document.getElementById(tabName).classList.add('active');
          document.getElementById(`${tabName}-btn`).classList.add('active');
      }

      window.login = function(event) {
          event.preventDefault();
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          signInWithEmailAndPassword(auth, email, password).catch(error => alert("Login Error: " + error.message));
      }
      
      window.logout = function() {
          signOut(auth).catch(error => console.error("Logout Error:", error));
      }

      onAuthStateChanged(auth, (user) => {
          if (user) {
              document.getElementById('login-container').style.display = 'none';
              document.getElementById('mod-panel').style.display = 'block';
              loadSubmissions('pending');
          } else {
              document.getElementById('login-container').style.display = 'block';
              document.getElementById('mod-panel').style.display = 'none';
          }
      });
      
      document.addEventListener('DOMContentLoaded', () => {
          updateGameUI();
          fetchAndDisplayCategories();
      });

      function selectMainCategory(categoryId) {
          document.querySelectorAll('#main-categories-nav button').forEach(btn => {
              const category = allCategoriesData.find(c => c.id === categoryId);
              btn.classList.toggle('active', btn.textContent === category.name);
          });
          const subCategoriesNav = document.getElementById('sub-categories-nav');
          subCategoriesNav.innerHTML = '';
          const category = allCategoriesData.find(c => c.id === categoryId);
          const subcategoryVariables = category.variables.data.filter(v => v['is-subcategory']);
          if (subcategoryVariables.length > 0) {
              const variable = subcategoryVariables[0];
              Object.entries(variable.values.values).forEach(([valueId, valueData], index) => {
                  const button = document.createElement('button');
                  button.textContent = valueData.label;
                  button.onclick = () => selectSubCategory(categoryId, variable.id, valueId, button);
                  subCategoriesNav.appendChild(button);
                  if (index === 0) button.click();
              });
          } else {
              loadLeaderboard(categoryId, null, null, category.name);
          }
      }

      function selectSubCategory(categoryId, variableId, valueId, clickedButton) {
          document.querySelectorAll('#sub-categories-nav button').forEach(btn => btn.classList.remove('active'));
          clickedButton.classList.add('active');
          const category = allCategoriesData.find(c => c.id === categoryId);
          const title = `${category.name} - ${clickedButton.textContent}`;
          loadLeaderboard(categoryId, variableId, valueId, title);
      }
