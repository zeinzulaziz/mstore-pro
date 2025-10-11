/** @format */

import {persistCombineReducers} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// You have to import every reducers and combine them.
import {reducer as AppReducer} from './AppRedux';
import {reducer as CategoryReducer} from './CategoryRedux';
import {reducer as ProductRedux} from './ProductRedux';
import {reducer as NetInfoReducer} from './NetInfoRedux';
import {reducer as ToastReducer} from './ToastRedux';
import {reducer as UserRedux} from './UserRedux';
import {reducer as CartRedux} from './CartRedux';
import {reducer as WishListRedux} from './WishListRedux';
import {reducer as NewsRedux} from './NewsRedux';
import {reducer as LayoutRedux} from './LayoutRedux';
import {reducer as PaymentRedux} from './PaymentRedux';
import {reducer as CountryRedux} from './CountryRedux';
import {reducer as LangRedux} from './LangRedux';
import {reducer as CurrencyRedux} from './CurrencyRedux';
import {reducer as SideMenuRedux} from './SideMenuRedux';
import {reducer as TagRedux} from './TagRedux';
import {reducer as AddressRedux} from './AddressRedux';
import {reducer as BrandsRedux} from './BrandsRedux';
import {reducer as FilterRedux} from './FilterRedux';
import {reducer as CustomerPointsRedux} from './CustomerPointsRedux';
import ShippingRedux from './ShippingRedux';

// State migration function to handle old keys
const stateMigration = (state) => {
  try {
    // Define expected keys
    const expectedKeys = [
      'app', 'categories', 'products', 'netInfo', 'toast', 'user', 'carts',
      'wishList', 'news', 'layouts', 'language', 'payments', 'countries',
      'currency', 'sideMenu', 'tags', 'addresses', 'brands', 'filters',
      'customerPoints', 'shipping'
    ];
    
    // Find unexpected keys
    const unexpectedKeys = Object.keys(state).filter(key => !expectedKeys.includes(key));
    
    if (unexpectedKeys.length > 0) {
      console.log('🔄 Redux state migration: Found unexpected keys:', unexpectedKeys);
      
      // Remove unexpected keys
      const migratedState = {};
      expectedKeys.forEach(key => {
        if (state.hasOwnProperty(key)) {
          migratedState[key] = state[key];
        }
      });
      
      console.log('✅ Redux state migration completed successfully');
      return migratedState;
    }
    
    return state;
  } catch (error) {
    console.error('❌ Error during Redux state migration:', error);
    // Return empty state if migration fails
    return {};
  }
};

const config = {
  key: 'root',
  version: 1, // Increment this when making breaking changes to state structure
  storage: AsyncStorage,
  blacklist: [
    'netInfo',
    'toast',
    'nav',
    'layouts',
    'payment',
    'sideMenu',
    'filters',
  ],
  whitelist: [
    'addresses', // Cache address data including location
    'shipping',  // Cache shipping preferences
    'user',      // Cache user data
    'carts',     // Cache cart data
  ],
  migrate: stateMigration,
};

export default persistCombineReducers(config, {
  app: AppReducer,
  categories: CategoryReducer,
  products: ProductRedux,
  netInfo: NetInfoReducer,
  toast: ToastReducer,
  user: UserRedux,
  carts: CartRedux,
  wishList: WishListRedux,
  news: NewsRedux,
  layouts: LayoutRedux,
  language: LangRedux,
  payments: PaymentRedux,
  countries: CountryRedux,
  currency: CurrencyRedux,
  sideMenu: SideMenuRedux,
  tags: TagRedux,
  addresses: AddressRedux,
  brands: BrandsRedux,
  filters: FilterRedux,
  customerPoints: CustomerPointsRedux,
  shipping: ShippingRedux,
});
