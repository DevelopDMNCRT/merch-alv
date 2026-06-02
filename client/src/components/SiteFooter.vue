<template>
  <footer class="site-footer">
    <div class="footer-container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="footer-logo-container">
            <img src="/logo-dark-01.png" alt="Merch ALV" class="footer-logo-img" />
          </div>
          <p class="footer-desc">{{ t('footer.desc') }}</p>
          <div class="footer-contact-info">
            <a href="https://wa.me/525568786938" target="_blank" rel="noopener noreferrer" class="footer-phone">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="phone-icon">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              +52 55 6878 6938
            </a>
          </div>
          <div class="social-links">
            <a href="https://www.facebook.com/share/1Axq7Ws3ks/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="social-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="https://www.instagram.com/merchalaventa?igsh=MTl4NnIzamh6Z3E5Mw%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="social-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://x.com/merchalv?s=21" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" class="social-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
              </svg>
            </a>
          </div>
        </div>

        <!-- Mapa del Sitio -->
        <div class="footer-links-group">
          <h4 class="footer-heading">{{ t('footer.siteMap') }}</h4>
          <ul class="footer-links">
            <li><router-link to="/">{{ t('nav.home') }}</router-link></li>
            <li><router-link to="/tiendas">{{ t('nav.stores') }}</router-link></li>
            <li><router-link to="/nosotros">{{ t('nav.about') }}</router-link></li>
            <li><router-link to="/contacto">{{ t('nav.contact') }}</router-link></li>
          </ul>
        </div>

        <!-- Legal -->
        <div class="footer-links-group">
          <h4 class="footer-heading">{{ t('footer.legal') }}</h4>
          <ul class="footer-links">
            <li><router-link to="/aviso-privacidad">{{ t('footer.privacy') }}</router-link></li>
            <li><router-link to="/terminos">{{ t('footer.terms') }}</router-link></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="copyright">{{ t('footer.copyright') }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useLocale } from '../composables/useLocale.js'
const { t } = useLocale()
</script>

<style scoped>
.site-footer {
  background-color: #09090b;
  color: #f4f4f5;
  padding: 80px 0 24px;
  position: relative;
  overflow: hidden;
}

:global(html.dark) .site-footer {
  background-color: #09090b;
  color: #f4f4f5;
}

.site-footer::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 50%;
  pointer-events: none;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  position: relative;
  z-index: 1;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 64px;
  margin-bottom: 64px;
}

.footer-logo-img {
  width: 180px;
  height: auto;
  margin-bottom: 24px;
}

.footer-desc {
  font-family: 'Jost', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.05rem;
  line-height: 1.6;
  max-width: 350px;
  margin-bottom: 16px;
}

.footer-contact-info {
  margin-bottom: 32px;
}

.footer-phone {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Jost', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.05rem;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-phone:hover {
  color: var(--accent-red, #ef4444);
}

.social-links {
  display: flex;
  gap: 16px;
}

.social-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.social-icon:hover {
  background-color: var(--accent-red);
  color: #ffffff;
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
}

.footer-heading {
  font-family: 'Jost', sans-serif;
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 24px;
  color: #ffffff;
}

.footer-text {
  font-family: 'Jost', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 16px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-links a {
  font-family: 'Jost', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 1.05rem;
  transition: color 0.2s, padding-left 0.2s;
  display: inline-block;
}

.footer-links a:hover {
  color: var(--accent-red, #ef4444);
  padding-left: 6px;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 24px;
  text-align: center;
}

.copyright {
  font-family: 'Jost', sans-serif;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 900px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }
  .footer-brand {
    grid-column: 1 / -1;
  }
}

@media (max-width: 600px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
