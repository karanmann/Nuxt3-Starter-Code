import { defineStore } from "pinia"
import guid from '@/helpers/guid'
import {
    SCID_URL,
    ENVIRONMENT,
    AUTHENTICATE_PATH,
    MESSAGE_SCID_SUCCESS,
    MESSAGE_SCID_FAILURE,
    MESSAGE_AUTH_SUCCESS,
    MESSAGE_AUTH_FAILURE,
  } from '@/constants'

interface AuthStore {
    isLoggedIn: boolean
    townHallLevel: number
    loading: boolean
    loginError: boolean

    authenticateStatus: string | null
    logoutStatus: string | null
  
    loginWindow: WindowProxy | null
    loginWindowIsOpen: boolean
}

// locale access
const i18n = useI18n()
const router = useRouter()

export const authStore = defineStore('authStore', {
    state: (): AuthStore => ({
        isLoggedIn: false,
        townHallLevel: 0,
        loading: false,
        loginError: false,

        authenticateStatus: null,
        logoutStatus: null,

        loginWindow: null,
        loginWindowIsOpen: false,
      }),
    actions: {
        openScidLogin() {
            // Close SCID login window if it already exists
            if (this.loginWindow && !this.loginWindow.closed) {
                this.loginWindow.close()
            }
      
            // Trigger SCID login window
      
            // Set and save state for login - used later in the authentication phase
            const loginState = guid()
            window.localStorage.setItem('loginState', loginState)
      
            // eslint-disable-next-line no-console
            if (!SCID_URL && ENVIRONMENT === 'dev') console.warn('DEV NOTE: Missing .env var')
      
            // Pass locale to SCID login window to localize it
            const langString = `&lang=${i18n.locale}`
      
            const url =
              SCID_URL +
              langString +
              '&redirect_uri=' +
              window.location.origin +
              AUTHENTICATE_PATH +
              '&state=' +
              encodeURIComponent(loginState)
      
            const LOGIN_WINDOW_WIDTH = 500
            const LOGIN_WINDOW_HEIGHT = 728
      
            const left = (screen.width - LOGIN_WINDOW_WIDTH) * 0.5
            const top = (screen.height - LOGIN_WINDOW_HEIGHT) * 0.5
            const loginWindow = window.open(
              url,
              'login',
              'location=no, menubar=no, resizable=no, width=' +
                LOGIN_WINDOW_WIDTH +
                ', height=' +
                LOGIN_WINDOW_HEIGHT +
                ', top=' +
                top +
                ', left=' +
                left
            ) as WindowProxy
      
            this.loginWindow = loginWindow
      
            if (loginWindow) {
              loginWindow.moveTo(left, top)
              loginWindow.focus()
            }
      
            // Handle SCID oauth message sent from login window
            const scidMessageHandler = (e: MessageEvent) => {
              // Security check - origin must match and source must be login window
              if (e.origin !== window.location.origin || e.source !== this.loginWindow) return
      
              if (e.data.message === MESSAGE_SCID_SUCCESS) {
                this.authenticate(e.data.code).catch((error) => {
                    console.log(error)
                })
              } else if (e.data.message === MESSAGE_SCID_FAILURE) {
                // TODO - go to main app state
              }
      
              window.removeEventListener('message', scidMessageHandler)
            }
      
            // Listen for SCID oauth message sent from login window
            window.addEventListener('message', scidMessageHandler, false)
          },
          initAuthentication() {
            // Action called from within the SCID login window after redirect
            // Action are in the scope of login window
      
            // Rest
            this.loginError = false
      
            if (window.opener) {
              const code = decodeURI(router.currentRoute.query.code as string)
              const state = decodeURI(router.currentRoute.query.state as string)
              const loginState = window.localStorage.getItem('loginState')
              window.localStorage.removeItem('loginState')
      
              if (code && state === loginState) {
                window.opener.postMessage({ message: MESSAGE_SCID_SUCCESS, code }, window.location.origin)
              } else {
                window.opener.postMessage({ message: MESSAGE_SCID_FAILURE }, window.location.origin)
              }
      
              // Handle auth message sent from main app instance
              const authMessageHandler = (e: MessageEvent) => {
                // Security check - origin must on match and source must be login windows opener
                if (e.origin !== window.location.origin || e.source !== window.opener) return
      
                window.removeEventListener('message', authMessageHandler)
      
                if (e.data.message === MESSAGE_AUTH_SUCCESS) {
                  // Authentication successful - close login window
                  window.close()
                } else if (e.data.message === MESSAGE_AUTH_FAILURE) {
                  // Authentication failed - show error message
                  this.loginError  =true 
                }
              }
      
              // Listen for authentication message sent from main app instance
              window.addEventListener('message', authMessageHandler, false)
            }
          },
          authenticate(code: string): Promise<object> {
            // Authenticate SCID user
            // this.setAuthenticateStatus(API_STATUS_PENDING)
      
            // return axios
            //   .post('/users/login', {
            //     code: code,
            //   })
            //   .then(response => {
            //     dispatch('user/setUserId', response.data.userId, { root: true })
            //     dispatch('user/setUsername', response.data.username, { root: true })
            //     dispatch('user/setProfileImage', response.data.profileImage, { root: true })
      
            //     globalLoginWindow?.postMessage({ message: MESSAGE_AUTH_SUCCESS }, window.location.origin)
      
            //     this.setAuthenticateStatus(API_STATUS_SUCCESS)
            //     return Promise.resolve(response)
            //   })
            //   .catch(error => {
            //     globalLoginWindow?.postMessage(MESSAGE_AUTH_FAILURE)
      
            //     this.setAuthenticateStatus(API_STATUS_FAILURE)
            //     return Promise.reject(error)
            //   })
          },
          logout() {
        //    this.setLogoutStatus(API_STATUS_PENDING)
      
        //     return axios
        //       .post('/users/logout')
        //       .then(response => {
        //         dispatch('user/clear', null, { root: true })
      
        //         commit('setLogoutStatus', API_STATUS_SUCCESS)
        //         return Promise.resolve(response)
        //       })
        //       .catch(error => {
        //         dispatch('user/clear', null, { root: true })
      
        //         commit('setLogoutStatus', API_STATUS_FAILURE)
        //         return Promise.reject(error)
        //       })
          },
    }
})
