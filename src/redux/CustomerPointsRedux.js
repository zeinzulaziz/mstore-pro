/** @format */

import CustomerPointsAPI from '../services/CustomerPointsAPI';

const types = {
  FETCH_CUSTOMER_POINTS: 'FETCH_CUSTOMER_POINTS',
  FETCH_CUSTOMER_POINTS_SUCCESS: 'FETCH_CUSTOMER_POINTS_SUCCESS',
  FETCH_CUSTOMER_POINTS_FAILURE: 'FETCH_CUSTOMER_POINTS_FAILURE',
  CLEAR_CUSTOMER_POINTS: 'CLEAR_CUSTOMER_POINTS',
};

export const actions = {
  fetchCustomerPoints: (userId) => {
    return async (dispatch) => {
      dispatch({ type: types.FETCH_CUSTOMER_POINTS, userId });
      
      try {
        const result = await CustomerPointsAPI.getCustomerPointsWithRetry(userId);
        
        if (result.success) {
          dispatch({
            type: types.FETCH_CUSTOMER_POINTS_SUCCESS,
            data: result.data,
            userId: userId,
          });
        } else {
          dispatch({
            type: types.FETCH_CUSTOMER_POINTS_FAILURE,
            error: result.error,
            userId: userId,
          });
        }
      } catch (error) {
        dispatch({
          type: types.FETCH_CUSTOMER_POINTS_FAILURE,
          error: error.message,
          userId: userId,
        });
      }
    };
  },

  clearCustomerPoints: () => {
    return { type: types.CLEAR_CUSTOMER_POINTS };
  },
};

// API Response: {"user_id": 32, "points": 380}
const initialState = {
  points: 0,
  user_id: null,
  isFetching: false,
  error: null,
  lastUpdated: null,
};

export const reducer = (state = initialState, action) => {
  const { type, data, error, userId } = action;

  switch (type) {
    case types.FETCH_CUSTOMER_POINTS:
      return {
        ...state,
        isFetching: true,
        error: null,
        user_id: userId,
      };

    case types.FETCH_CUSTOMER_POINTS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        points: data.points || 0,
        user_id: userId,
        error: null,
        lastUpdated: new Date().toISOString(),
      };

    case types.FETCH_CUSTOMER_POINTS_FAILURE:
      return {
        ...state,
        isFetching: false,
        error: error,
        user_id: userId,
      };

    case types.CLEAR_CUSTOMER_POINTS:
      return {
        ...initialState,
      };

    default:
      return state;
  }
};
