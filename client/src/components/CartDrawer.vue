<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { cartState, cartActions, cartGetters } from '../store/cart.js'
import { useLocale } from '../composables/useLocale.js'
import { formatPrice } from '../store/locale.js'

const router = useRouter()
const { t } = useLocale()

const closeCart = () => {
  cartActions.closeCart()
}

const goToCheckout = () => {
  closeCart()
  router.push('/checkout')
}
</script>

<template>
  <Teleport to="body">
    <transition name="drawer-fade">
      <div v-if="cartState.isOpen" class="cart-drawer-overlay" @click="closeCart"></div>
    </transition>

    <transition name="drawer-slide">
      <div v-if="cartState.isOpen" class="cart-drawer">
        <div class="cart-drawer-header">
          <h2 class="cart-title">{{ t('cart.title') }}</h2>
          <button class="close-btn" @click="closeCart" aria-label="Cerrar Carrito">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="cart-drawer-body">
          <div v-if="cartState.items.length === 0" class="empty-cart-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cccccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <p>{{ t('cart.empty') }}</p>
            <button class="btn-primary continue-shopping-btn" @click="closeCart">{{ t('cart.continueShopping') }}</button>
          </div>
          
          <div v-else class="cart-items-container">
            <div class="cart-item" v-for="item in cartState.items" :key="item.cartItemId">
              <img :src="item.image" :alt="item.name" class="cart-item-image">
              <div class="cart-item-details">
                <p class="cart-item-artist">{{ item.tienda }}</p>
                <h4 class="cart-item-name">{{ item.name }}</h4>
                <p class="cart-item-meta">{{ t('cart.size') }}: {{ item.size }}</p>
                <div class="cart-item-price">
                  {{ formatPrice(item.price) }}
                  <span v-if="item.quantity > 1" class="item-subtotal">
                    (Subtotal: {{ formatPrice(item.price * item.quantity) }})
                  </span>
                </div>
                
                <div class="cart-item-controls">
                  <div class="qty-control">
                    <button @click="cartActions.updateQuantity(item.cartItemId, item.quantity - 1)">-</button>
                    <span>{{ item.quantity }}</span>
                    <button :disabled="item.stock !== undefined && item.quantity >= item.stock" @click="cartActions.updateQuantity(item.cartItemId, item.quantity + 1)">+</button>
                  </div>
                  <button class="remove-btn" @click="cartActions.removeItem(item.cartItemId)">{{ t('cart.remove') }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="cart-drawer-footer">
          <div class="cart-summary">
            <span class="summary-label">{{ t('cart.subtotal') }}</span>
            <span class="summary-value">{{ formatPrice(cartGetters.totalPrice.value) }}</span>
          </div>
          <p class="shipping-notice">{{ t('cart.shippingNotice') }}</p>
          <button
            class="btn-secondary checkout-btn"
            :disabled="cartState.items.length === 0"
            @click="goToCheckout"
          >
            {{ t('cart.checkout') }}
          </button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.cart-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.cart-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 400px;
  height: 100vh;
  background-color: var(--bg-color);
  z-index: 1001;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.cart-drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
}

.cart-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.close-btn {
  color: var(--text-muted);
  transition: color 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: var(--primary-color);
  transform: scale(1.1);
}

.cart-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.empty-cart-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  text-align: center;
  gap: 16px;
  margin-top: 48px;
}

.empty-cart-message p {
  font-size: 1.1rem;
  font-weight: 500;
}

.continue-shopping-btn {
  margin-top: 16px;
  width: 100%;
}

.cart-items-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: flex;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.cart-item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
  background: #f5f5f5;
}

.cart-item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.cart-item-artist {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.cart-item-name {
  font-family: 'Jost', sans-serif;
  font-weight: 800;
  font-size: 1rem;
  color: var(--text-main);
  margin-bottom: 4px;
}

.cart-item-meta {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.cart-item-price {
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-subtotal {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
}

.cart-item-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.qty-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.qty-control button {
  width: 32px;
  height: 32px;
  background: var(--bg-color);
  color: var(--text-main);
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.15s;
}

.qty-control button:hover {
  background: var(--border-color);
}

.qty-control button:disabled {
  background: var(--bg-color);
  color: var(--text-muted);
  cursor: not-allowed;
  opacity: 0.5;
}

.qty-control span {
  width: 32px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
  background: var(--bg-color);
}

.remove-btn {
  background: none;
  border: none;
  color: #ff4d4f;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

.remove-btn:hover {
  color: #d9363e;
}

.cart-drawer-footer {
  padding: 24px;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-color);
}

.cart-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-main);
}

.summary-value {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--primary-color);
}

.shipping-notice {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-align: center;
  margin-bottom: 20px;
}

.checkout-btn {
  width: 100%;
  font-size: 1.1rem;
  padding: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.checkout-btn:disabled {
  background-color: #e0e0e0;
  color: #a0a0a0;
  cursor: not-allowed;
  opacity: 1;
}

/* Animations */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}
</style>
