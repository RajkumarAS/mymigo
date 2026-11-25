import unittest
import json
import os
import re

class StoreProfileTests(unittest.TestCase):
    def setUp(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    def test_store_profile_data_file_exists(self):
        file_path = os.path.join(self.base_dir, 'src', 'data', 'storeProfileData.js')
        self.assertTrue(os.path.exists(file_path), "storeProfileData.js should exist")
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check export
        self.assertIn('export function getStoreProfileData', content)
        # Check categories
        self.assertIn("'Sarees'", content)
        self.assertIn("'Kurtis'", content)
        self.assertIn("'2 Piece'", content)
        self.assertIn("'Daily Wear'", content)
        # Check stats
        self.assertIn("posts: '1,192'", content)
        self.assertIn("followers: '204K'", content)
        # Check delivery badge
        self.assertIn('Next Day Delivery', content)

    def test_store_profile_page_components_and_features(self):
        file_path = os.path.join(self.base_dir, 'src', 'pages', 'StoreProfilePage.js')
        self.assertTrue(os.path.exists(file_path), "StoreProfilePage.js should exist")
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check export function
        self.assertIn('export async function renderStoreProfilePage', content)

        # Check Instagram Business features
        self.assertIn('bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600', content, "Story ring gradient must be present")
        self.assertIn('Book Video Call', content, "Book Video Call button must be present")
        self.assertNotIn('>WhatsApp<', content, "WhatsApp button must be removed")
        self.assertNotIn('>Instagram<', content, "Instagram button must be removed")
        self.assertIn('store-share-btn', content, "Share button must be present")
        self.assertIn('Connections', content, "Must use Connections instead of Followers")

        # Check tabs: Products, Videos, Photos
        self.assertIn('data-profile-tab="products"', content)
        self.assertIn('data-profile-tab="videos"', content)
        self.assertIn('data-profile-tab="photos"', content)
        self.assertIn('whitespace-nowrap', content, "Must ensure Products tab label is single line")

        # Check "Shop By" toggle filter
        self.assertIn('id="shop-by-toggle-btn"', content, "Shop By toggle button must exist")
        self.assertIn('id="shop-by-categories-container"', content, "Categories container must exist")
        self.assertIn('shop-by-caret', content, "Shop By caret must exist")
        self.assertIn('data-category-pill', content, "Category pills must exist")

        # Check 2 products per grid row
        self.assertIn('grid grid-cols-2 gap-3', content, "Must use 2 products per grid row")

        # Check product cards
        self.assertIn('data-open-product-gallery', content, "Clicking product image must open gallery")
        self.assertIn('data-quick-buy-id', content, "Clicking Buy button must open QuickBuyModal")
        self.assertIn('openImageGalleryModal', content, "Must import and use openImageGalleryModal")
        self.assertIn('openQuickBuyModal', content, "Must import and use openQuickBuyModal")

        # Check Photo Lightbox with Next / Previous Arrows
        self.assertIn('openPhotoLightbox', content, "Must have photo lightbox modal")
        self.assertIn('photo-lightbox-prev-btn', content, "Must have Previous arrow button in photo popup")
        self.assertIn('photo-lightbox-next-btn', content, "Must have Next arrow button in photo popup")
        self.assertIn('photo-counter-text', content, "Must have photo counter text in photo popup")

        # Check Seller Profile Editing
        self.assertIn('openEditProfileModal', content, "Must have edit profile modal for sellers")
        self.assertIn('edit-store-name', content, "Must allow changing store name")
        self.assertIn('edit-store-desc', content, "Must allow changing store description")
        self.assertIn('edit-store-city', content, "Must allow changing store city/place")
        self.assertIn('edit-avatar-file', content, "Must allow changing profile picture")

        # Check Highlights with "+" Button (First) and Story Viewer
        self.assertIn('id="add-highlight-trigger-btn"', content, "Must have + button as first highlight item")
        self.assertIn('openStoryViewerModal', content, "Must have Story Viewer modal")
        self.assertIn('data-open-story-highlight', content, "Clicking highlight must open story")

        # Check Add Product option in products section
        self.assertIn('id="store-add-product-btn"', content, "Must have Add Product button in products tab")
        self.assertIn('openAddProductModal', content, "Must have Add Product modal")

        # Check Create Poster option in photos section
        self.assertIn('id="store-create-poster-btn"', content, "Must have Create Poster button in photos tab")
        self.assertIn('openCreatePosterModal', content, "Must have Create Poster modal")

    def test_reel_player_has_10_scrollable_products(self):
        file_path = os.path.join(self.base_dir, 'src', 'components', 'ReelPlayer.js')
        self.assertTrue(os.path.exists(file_path), "ReelPlayer.js should exist")
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check for 10 products
        self.assertIn('-p10', content, "Reel player must have up to 10 products")
        self.assertIn('scrollToProduct', content, "Reel player must support product scrolling")
        self.assertIn('data-product-track', content, "Reel player must have product track")

    def test_image_gallery_modal_supports_6_images(self):
        file_path = os.path.join(self.base_dir, 'src', 'components', 'ImageGalleryModal.js')
        self.assertTrue(os.path.exists(file_path), "ImageGalleryModal.js should exist")
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Verify support for up to 6 images
        self.assertIn('slice(0, 6)', content, "Should slice up to 6 images")
        self.assertIn('galleryImages.length', content, "Should dynamically show total image count")

    def test_auth_modal_no_blinking_and_has_demo_otp_button(self):
        file_path = os.path.join(self.base_dir, 'src', 'components', 'AuthModal.js')
        self.assertTrue(os.path.exists(file_path), "AuthModal.js should exist")
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check that timer does not re-render modal (fixing the screen blink bug)
        self.assertIn('updateCountdownUI', content, "Must use dedicated DOM update for timer")

        # Check clickable Demo/Sample OTP button
        self.assertIn('id="btn-demo-otp"', content, "Clickable Sample OTP button must exist")
        self.assertIn('fillDemoOtp', content, "Must have fillDemoOtp function to auto-fill OTP")

        # Check Account setup for Customer and Seller
        self.assertIn('btn-choose-customer-account', content, "Must allow creating Customer account")
        self.assertIn('btn-choose-seller-account', content, "Must allow creating Seller account")
        self.assertIn('btn-choose-both-accounts', content, "Must allow creating both accounts")

    def test_user_account_switcher_and_roles(self):
        file_path = os.path.join(self.base_dir, 'src', 'components', 'AuthModal.js')
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check role switcher functionality
        self.assertIn('export function switchUserRole', content, "Must export switchUserRole")
        self.assertIn('export function switchActiveAccount', content, "Must export switchActiveAccount")
        self.assertIn('data-switch-to-account', content, "Must have account switcher items")
        self.assertIn('add-type-shopper-btn', content, "Must have option to add shopper account")
        self.assertIn('add-type-seller-btn', content, "Must have option to add seller account")

        # Check Navbar integration
        navbar_path = os.path.join(self.base_dir, 'src', 'components', 'Navbar.js')
        with open(navbar_path, 'r', encoding='utf-8') as f:
            nav_content = f.read()

        self.assertIn('desktop-user-pill-btn', nav_content, "Must have user pill button in desktop navbar")
        self.assertIn('openAccountSwitcherBottomSheet', nav_content, "Navbar must open bottom sheet switcher on user pill click or hold")

    def test_multi_account_limits_2_shoppers_and_3_sellers(self):
        file_path = os.path.join(self.base_dir, 'src', 'components', 'AuthModal.js')
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check maximum limits: 2 shopper and 3 seller accounts per mobile number
        self.assertIn('MAX_SHOPPERS_PER_NUMBER = 2', content, "Must allow max 2 shopper accounts per mobile number")
        self.assertIn('MAX_SELLERS_PER_NUMBER = 3', content, "Must allow max 3 seller accounts per mobile number")

        # Check functions to add accounts and switch
        self.assertIn('export function addShopperAccount', content, "Must export addShopperAccount")
        self.assertIn('export function addSellerAccount', content, "Must export addSellerAccount")
        self.assertIn('export function switchActiveAccount', content, "Must export switchActiveAccount")

    def test_instagram_bottom_sheet_account_switcher_and_long_press(self):
        auth_path = os.path.join(self.base_dir, 'src', 'components', 'AuthModal.js')
        with open(auth_path, 'r', encoding='utf-8') as f:
            auth_content = f.read()

        # Check Instagram-style bottom sheet modal
        self.assertIn('openAccountSwitcherBottomSheet', auth_content, "Must have bottom sheet account switcher")
        self.assertIn('sheet-drag-handle', auth_content, "Must have Instagram-style drag handle")
        self.assertIn('data-switch-to-account', auth_content, "Must support switching accounts")
        self.assertIn('sheet-add-account-toggle-btn', auth_content, "Must have + Add Account button")

        # Check long-press (click and hold) support in Navbar.js
        navbar_path = os.path.join(self.base_dir, 'src', 'components', 'Navbar.js')
        with open(navbar_path, 'r', encoding='utf-8') as f:
            nav_content = f.read()

        self.assertIn('attachLongPressListener', nav_content, "Navbar must implement click and hold (long press)")
        self.assertIn('openAccountSwitcherBottomSheet', nav_content, "Navbar must trigger bottom sheet account switcher")

    def test_store_resolution_handles_kalyani_cotton_variants(self):
        file_path = os.path.join(self.base_dir, 'src', 'pages', 'StoreProfilePage.js')
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Verify it resolves both 'kalyani-cotton' and 'store-kalyani-cotton'
        self.assertIn('store-kalyani-cotton', content)
        self.assertIn('cleanId', content)

    def test_loved_stores_feature_and_integration(self):
        # 1. Verify lovedStoresService.js exists with correct API
        service_path = os.path.join(self.base_dir, 'src', 'services', 'lovedStoresService.js')
        self.assertTrue(os.path.exists(service_path), "lovedStoresService.js must exist")
        with open(service_path, 'r', encoding='utf-8') as f:
            service_content = f.read()
        self.assertIn('getLovedStores', service_content)
        self.assertIn('isStoreLoved', service_content)
        self.assertIn('toggleLovedStore', service_content)
        self.assertIn('Added to your Loves ❤️', service_content)
        self.assertIn('mymigo_loved_stores_v1', service_content)

        # 2. Verify StoreProfilePage has love buttons (header and primary action)
        store_profile_path = os.path.join(self.base_dir, 'src', 'pages', 'StoreProfilePage.js')
        with open(store_profile_path, 'r', encoding='utf-8') as f:
            store_content = f.read()
        self.assertIn('store-love-header-btn', store_content, "Store profile must have header love button")
        self.assertIn('store-love-action-btn', store_content, "Store profile must have action love button")
        self.assertIn('isStoreLoved', store_content)
        self.assertIn('toggleLovedStore', store_content)

        # 3. Verify ProfilePage dynamically displays saved stores as "My Loves"
        profile_path = os.path.join(self.base_dir, 'src', 'pages', 'ProfilePage.js')
        with open(profile_path, 'r', encoding='utf-8') as f:
            profile_content = f.read()
        self.assertIn('getLovedStores', profile_content)
        self.assertIn('data-remove-loved-store', profile_content)
        self.assertIn('My Loves by', profile_content)
        self.assertIn('>My Loves<', profile_content)

        # 4. Verify StoreCard provides love button on directory cards
        card_path = os.path.join(self.base_dir, 'src', 'components', 'StoreCard.js')
        with open(card_path, 'r', encoding='utf-8') as f:
            card_content = f.read()
        self.assertIn('data-store-love-btn', card_content)
        self.assertIn('toggleLovedStore', card_content)

    def test_affiliated_items_and_removed_seller_mode_button(self):
        # 1. Verify seller mode toggle button was removed from StoreProfilePage header
        store_profile_path = os.path.join(self.base_dir, 'src', 'pages', 'StoreProfilePage.js')
        with open(store_profile_path, 'r', encoding='utf-8') as f:
            store_content = f.read()
        self.assertNotIn('toggle-seller-mode-btn', store_content, "Seller mode toggle button must be removed")

        # 2. Verify affiliate link icon button is present on product items with dark linked state
        self.assertIn('data-affiliate-product-btn', store_content, "Product items must have affiliate link button")
        self.assertIn('toggleAffiliatedItem', store_content)
        self.assertIn('isItemAffiliated', store_content)
        self.assertIn('Linked to Affiliate', store_content, "Must show 'Linked to Affiliate' text")
        self.assertIn('bg-[#002624]', store_content, "Must apply dark styling when item is affiliated")

        # 3. Verify affiliatedItemsService.js exists with proper methods
        service_path = os.path.join(self.base_dir, 'src', 'services', 'affiliatedItemsService.js')
        self.assertTrue(os.path.exists(service_path), "affiliatedItemsService.js must exist")
        with open(service_path, 'r', encoding='utf-8') as f:
            service_content = f.read()
        self.assertIn('getAffiliatedItems', service_content)
        self.assertIn('isItemAffiliated', service_content)
        self.assertIn('toggleAffiliatedItem', service_content)
        self.assertIn('mymigo_affiliated_items_v1', service_content)
        self.assertIn('Linked to Affiliate 🔗', service_content)

        # 4. Verify ProfilePage integrates affiliated items with Unlink button & aligned header
        profile_path = os.path.join(self.base_dir, 'src', 'pages', 'ProfilePage.js')
        with open(profile_path, 'r', encoding='utf-8') as f:
            profile_content = f.read()
        self.assertIn('getAffiliatedItems', profile_content)
        self.assertIn('data-remove-affiliated-item', profile_content)
        self.assertIn('Unlink', profile_content, "Must have Unlink button in affiliated items")
        self.assertIn('profile-name-switcher-btn', profile_content, "Must have profile name switcher in header bar")
        self.assertIn('connections-pill-btn', profile_content, "Must have connections pill button in header bar")

    def test_affiliated_grid_and_pill_profile_click_and_hold(self):
        # 1. Verify 2-column grid and pricing in ProfilePage
        profile_path = os.path.join(self.base_dir, 'src', 'pages', 'ProfilePage.js')
        with open(profile_path, 'r', encoding='utf-8') as f:
            profile_content = f.read()

        self.assertIn('grid grid-cols-2', profile_content, "Affiliated items must use 2-column grid")
        self.assertIn('line-through', profile_content, "Original price must be displayed with line-through")
        self.assertIn('profile-post-image-btn', profile_content, "Must have Post Image button in profile hero")
        self.assertIn('share-profile-btn', profile_content, "Must have simple icon share button in header")

        # 2. Verify Navbar handles click to open active profile and hold to switch accounts
        navbar_path = os.path.join(self.base_dir, 'src', 'components', 'Navbar.js')
        with open(navbar_path, 'r', encoding='utf-8') as f:
            navbar_content = f.read()

        self.assertIn('handleOpenActiveProfile', navbar_content, "Must have direct click action to open active profile")
        self.assertIn('handleOpenAccountSwitcher', navbar_content, "Must have hold action to open account switcher")
        self.assertIn('attachLongPressListener(el, handleOpenAccountSwitcher, handleOpenActiveProfile)', navbar_content)

    def test_account_switcher_drawer_layout_and_shopper_profile_handle(self):
        # 1. Verify AuthModal bottom drawer layout and safe viewport styles
        auth_modal_path = os.path.join(self.base_dir, 'src', 'components', 'AuthModal.js')
        with open(auth_modal_path, 'r', encoding='utf-8') as f:
            auth_content = f.read()

        self.assertIn('100dvh', auth_content, "Sheet overlay must support dynamic viewport height")
        self.assertIn('z-[100]', auth_content, "Sheet overlay must use high z-index to stay above mobile dock")
        self.assertIn('closeSheet()', auth_content, "Sheet must properly restore body overflow on close")
        self.assertIn('safe-area-inset-bottom', auth_content, "Sheet drawer must support iOS safe-area-inset")
        self.assertIn('overflow-y-auto', auth_content, "Drawer container must support internal scrolling")

        # 2. Verify ProfilePage shopper resolution and handle display
        profile_path = os.path.join(self.base_dir, 'src', 'pages', 'ProfilePage.js')
        with open(profile_path, 'r', encoding='utf-8') as f:
            profile_content = f.read()

        self.assertIn('activeShopper', profile_content, "ProfilePage must resolve active shopper account")
        self.assertIn('currentUser.shopperAccounts', profile_content, "ProfilePage must check shopperAccounts")
        self.assertIn('profile.handle', profile_content, "ProfilePage must display profile handle")

    def test_shopper_edit_popup_layout_and_profile_avatar_media_popup(self):
        # 1. Verify Shopper edit modal matches Seller layout with no right-side overflow
        profile_path = os.path.join(self.base_dir, 'src', 'pages', 'ProfilePage.js')
        with open(profile_path, 'r', encoding='utf-8') as f:
            profile_content = f.read()

        self.assertIn('shopper-modal-avatar-preview', profile_content)
        self.assertIn('min-w-0', profile_content, "Shopper edit avatar field must have min-w-0 to prevent right side overlap")
        self.assertIn('profile-avatar-trigger-btn', profile_content, "Avatar must be clickable to open profile image popup")
        self.assertTrue('profile-image-square-modal' in profile_content or 'profile-media-popup-modal' in profile_content, "Must have square profile image popup modal")
        self.assertIn('aspect-square', profile_content, "Square profile image popup must have aspect-square frame")

        # 2. Verify StoreProfilePage has clickable avatar trigger and image popup modal
        store_path = os.path.join(self.base_dir, 'src', 'pages', 'StoreProfilePage.js')
        with open(store_path, 'r', encoding='utf-8') as f:
            store_content = f.read()

        self.assertIn('store-avatar-trigger-btn', store_content, "Store avatar must be clickable to open popup")
        self.assertIn('store-avatar-image-modal', store_content, "Seller profile must have profile image popup modal")
        self.assertIn('aspect-square', store_content, "Store image popup must have aspect ratio frame")

    def test_user_creation_page_and_privacy_requirements(self):
        # 1. Verify AuthModal user creation page has mobile privacy, role tabs, handle & interests
        auth_modal_path = os.path.join(self.base_dir, 'src', 'components', 'AuthModal.js')
        with open(auth_modal_path, 'r', encoding='utf-8') as f:
            auth_content = f.read()

        self.assertIn('setup-shopper-handle', auth_content, "AuthModal must provide shopper handle input")
        self.assertIn('setup-shopper-name', auth_content, "AuthModal must provide shopper name input")
        self.assertIn('setup-tab-shopper', auth_content, "AuthModal must provide role creation tabs")
        self.assertIn('setup-tab-seller', auth_content, "AuthModal must provide seller creation tabs")
        self.assertIn('interests-chips-container', auth_content, "AuthModal must provide shopping interest chips")
        self.assertIn('sheet-login-mobile-btn', auth_content, "Switcher sheet must provide direct mobile login button")
        self.assertIn('forceLogin', auth_content, "openAuthModal must support forceLogin")

        # 2. Verify ProfilePage keeps place/mobile private and displays handle & interests
        profile_path = os.path.join(self.base_dir, 'src', 'pages', 'ProfilePage.js')
        with open(profile_path, 'r', encoding='utf-8') as f:
            profile_content = f.read()

        self.assertNotIn('📍 ${escapeHtml(profile.city', profile_content, "Shopper profile header must not publicly display city")
        self.assertNotIn('📍 ${escapeHtml(prof.city', profile_content, "Shopper avatar popup must not display city")
        self.assertIn('profile.interests', profile_content, "ProfilePage must display user interests")
        self.assertIn('shopper-handle', profile_content, "Shopper edit popup must have handle input")
        self.assertNotIn('id="shopper-phone"', profile_content, "Shopper edit modal must not ask for phone publicly")
        self.assertNotIn('id="shopper-city"', profile_content, "Shopper edit modal must not ask for city publicly")

        # 3. Verify Supabase schema has users and sellers tables
        schema_path = os.path.join(self.base_dir, 'supabase', 'schema.sql')
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_content = f.read()

        self.assertIn('CREATE TABLE IF NOT EXISTS public.users', schema_content, "Schema must have users table")
        self.assertIn('CREATE TABLE IF NOT EXISTS public.sellers', schema_content, "Schema must have sellers table")
        self.assertIn('CREATE TABLE IF NOT EXISTS public.stores', schema_content, "Schema must have stores table")

if __name__ == '__main__':
    unittest.main()
