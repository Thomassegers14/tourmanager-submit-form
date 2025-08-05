import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')


document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('toggle-darkmode');

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('darkmode');

  if (saved === 'true' || (saved === null && prefersDark)) {
    document.body.classList.add('darkmode');
  }

  toggleButton.addEventListener('click', () => {
    document.body.classList.toggle('darkmode');
    const isDark = document.body.classList.contains('darkmode');
    localStorage.setItem('darkmode', isDark);
  });
});
