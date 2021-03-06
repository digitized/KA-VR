import {
  USER_SIGNIN,
  USER_SIGNUP,
  USER_SIGNOUT,
  REDIRECT_SIGNUP,
  REDIRECT_SIGNIN,
} from '../actions/ActionTypes';

const authState = (state = {
  signedIn: document.cookie === 'null',
  currentPage: '',
}, action) => {
  switch (action.type) {
    case USER_SIGNIN:
      return Object.assign({}, state, {
        state: action.state,
        userData: action.userData,
        signedIn: action.signedIn,
        currentPage: action.currentPage,
      });
    case USER_SIGNUP:
      return Object.assign({}, state, {
        state: action.state,
        userData: action.userData,
        signedIn: action.signedIn,
        currentPage: action.currentPage,
      });
    case USER_SIGNOUT:
      return Object.assign({}, state, {
        state: action.state,
        signedIn: action.signedIn,
        currentPage: action.currentPage,
      });
    case REDIRECT_SIGNUP:
      return Object.assign({}, state, {
        state: action.state,
        currentPage: action.currentPage,
      });
    case REDIRECT_SIGNIN:
      return Object.assign({}, state, {
        state: action.state,
        currentPage: action.currentPage,
      });
    default:
      return state;
  }
};

export { authState };
