# Redux State Fix Documentation

## Problem
The app was showing a console error about unexpected keys in the Redux state:
```
Unexpected keys 'banner', 'announcement', 'homeCategories' found in previous state received by the reducer.
```

## Root Cause
The persisted Redux state contained old keys that are no longer defined in the current reducer structure. This typically happens when:
- The app was updated and some reducers were removed or renamed
- The Redux state structure was changed but the persisted state wasn't cleared
- Old state keys are no longer valid in the current app version

## Solution Implemented

### 1. State Migration Function
Added a migration function in `/src/redux/index.js` that:
- Automatically detects unexpected keys in the persisted state
- Removes old keys that are no longer defined in the reducer structure
- Logs the migration process for debugging
- Handles errors gracefully

### 2. Redux State Manager Utility
Created `/src/utils/ReduxStateManager.js` with utility functions:
- `clearPersistedState()` - Manually clear all persisted state
- `getPersistedState()` - Get current persisted state for debugging
- `checkForUnexpectedKeys()` - Check for unexpected keys
- `autoFixReduxState()` - Automatically fix state issues

### 3. Auto-Fix Integration
Updated `App.js` to automatically run state migration on app startup.

### 4. Clear State Script
Created `clear-redux-state.js` script for manual state clearing if needed.

## Files Modified

1. **`/src/redux/index.js`**
   - Added state migration function
   - Added version key for future migrations
   - Improved error handling

2. **`/src/utils/ReduxStateManager.js`** (new file)
   - Utility functions for state management
   - Auto-fix functionality

3. **`/App.js`**
   - Added auto-fix integration
   - Better error handling

4. **`clear-redux-state.js`** (new file)
   - Manual state clearing script

## How to Use

### Automatic Fix
The fix is now automatic. When you run the app, it will:
1. Check for unexpected keys in the persisted state
2. Automatically remove them if found
3. Log the migration process
4. Continue with normal app startup

### Manual Fix (if needed)
If you still encounter issues, you can manually clear the state:

```bash
# Run the clear state script
node clear-redux-state.js

# Or clear manually in your app
import { clearPersistedState } from '@utils/ReduxStateManager';
await clearPersistedState();
```

### Debugging
To check the current state:
```javascript
import { getPersistedState, checkForUnexpectedKeys } from '@utils/ReduxStateManager';

// Get current state
const state = await getPersistedState();
console.log('Current state:', state);

// Check for unexpected keys
const { hasUnexpectedKeys, unexpectedKeys } = await checkForUnexpectedKeys();
console.log('Has unexpected keys:', hasUnexpectedKeys);
console.log('Unexpected keys:', unexpectedKeys);
```

## Expected Behavior After Fix

1. ✅ No more console errors about unexpected keys
2. ✅ App starts normally with clean state
3. ✅ Migration logs appear in console (first time only)
4. ✅ All Redux functionality works as expected

## Future Prevention

- Always increment the `version` key in Redux config when making breaking changes
- Test state migration when removing or renaming reducers
- Use the utility functions for state management
- Consider clearing state during major app updates

## Troubleshooting

If you still see the error after this fix:

1. **Clear the app data completely:**
   - iOS: Delete and reinstall the app
   - Android: Clear app data in settings

2. **Check for other state issues:**
   ```javascript
   import { checkForUnexpectedKeys } from '@utils/ReduxStateManager';
   const result = await checkForUnexpectedKeys();
   console.log(result);
   ```

3. **Manual state clearing:**
   ```javascript
   import { clearPersistedState } from '@utils/ReduxStateManager';
   await clearPersistedState();
   ```

The fix should resolve the Redux state error and prevent it from happening again in the future.
