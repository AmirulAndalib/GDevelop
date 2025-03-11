// @flow
import { initializeApp } from 'firebase/app';
import {
  Auth,
  getAuth,
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  sendEmailVerification,
  updateEmail,
} from 'firebase/auth';
import axios from 'axios';
import { GDevelopFirebaseConfig, GDevelopUserApi } from './ApiConfigs';
import type { LoginProvider } from '../../LoginProvider';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import { type CommunityLinks, type UserSurvey } from './User';
import { userCancellationErrorName } from '../../LoginProvider/Utils';

export type Profile = {|
  id: string,
  email: string,
  username: ?string,
  description: ?string,
  updatedAt: number,
  createdAt: number,
  deactivatedAt?: number,
  getGameStatsEmail: boolean,
  getNewsletterEmail: boolean,
  appLanguage: ?string,
  isCreator: boolean,
  isPlayer: boolean,
  isEmailAutogenerated: boolean,
  donateLink: ?string,
  discordUsername: ?string,
  githubUsername?: ?string,
  communityLinks?: CommunityLinks,
  survey?: UserSurvey,

  gdevelopUsage?: string,
  teamOrCompanySize?: string,
  companyName?: string,
  creationExperience?: string,
  creationGoal?: string,
  hearFrom?: string,
|};

export type LoginForm = {|
  email: string,
  password: string,
|};

export type ForgotPasswordForm = {|
  email: string,
|};

export type RegisterForm = {|
  email: string,
  password: string,
  username: string,
  getNewsletterEmail: boolean,
|};

export type EditForm = {|
  +username: string,
  +description: string,
  +getGameStatsEmail: boolean,
  +getNewsletterEmail: boolean,
  +donateLink: string,
  +discordUsername: string,
  +githubUsername: string,
  +communityLinks: CommunityLinks,
|};

export type PatchUserPayload = {
  +username?: string,
  +description?: string,
  +getGameStatsEmail?: boolean,
  +getNewsletterEmail?: boolean,
  +appLanguage?: string,
  +isCreator?: boolean,
  +donateLink?: string,
  +discordUsername?: string,
  +githubUsername?: string,
  +communityLinks?: CommunityLinks,
  +survey?: UserSurvey,
};

export type ChangeEmailForm = {|
  email: string,
|};

export type AuthError = {
  code:
    | 'auth/invalid-email'
    | 'auth/missing-email'
    | 'auth/user-disabled'
    | 'auth/user-not-found'
    | 'auth/wrong-password'
    | 'auth/email-already-in-use'
    | 'auth/operation-not-allowed'
    | 'auth/weak-password'
    | 'auth/username-used'
    | 'auth/malformed-username'
    | 'auth/requires-recent-login'
    | 'auth/too-many-requests'
    | 'auth/internal-error'
    | 'auth/network-request-failed'
    | 'auth/account-exists-with-different-credential',
};

export type UpdateGitHubStarResponse = {|
  +code:
    | 'github-star/badge-already-given'
    | 'github-star/badge-given'
    | 'github-star/repository-not-starred'
    | 'github-star/user-not-found',
|};

export type UpdateTiktokFollowResponse = {|
  +code:
    | 'tiktok-follow/badge-already-given'
    | 'tiktok-follow/badge-given'
    | 'tiktok-follow/account-not-followed'
    | 'tiktok-follow/user-not-found',
|};

export type UpdateTwitterFollowResponse = {|
  +code:
    | 'twitter-follow/badge-already-given'
    | 'twitter-follow/badge-given'
    | 'twitter-follow/account-not-followed'
    | 'twitter-follow/user-not-found',
|};

export type UpdateYoutubeSubscriptionResponse = {|
  +code:
    | 'youtube-subscription/badge-already-given'
    | 'youtube-subscription/badge-given'
    | 'youtube-subscription/channel-not-subscribed'
    | 'youtube-subscription/user-not-found',
|};

export type IdentityProvider = 'google' | 'apple' | 'github';

export default class Authentication {
  auth: Auth;
  _onUserLogoutCallbacks: Array<() => void | Promise<void>> = [];
  _onUserUpdateCallbacks: Array<() => void | Promise<void>> = [];
  loginProvider: ?LoginProvider;

  constructor() {
    const app = initializeApp(GDevelopFirebaseConfig);
    this.auth = getAuth(app);
    onAuthStateChanged(this.auth, user => {
      if (user) {
        // User has logged in or changed.
        this._onUserUpdateCallbacks.forEach(cb => cb());
      } else {
        // User has logged out.
        this._onUserLogoutCallbacks.forEach(cb => cb());
      }
    });
  }

  setLoginProvider = (loginProvider: LoginProvider) => {
    this.loginProvider = loginProvider;
  };

  addUserLogoutListener = (cb: () => void | Promise<void>) => {
    this._onUserLogoutCallbacks.push(cb);
  };

  addUserUpdateListener = (cb: () => void | Promise<void>) => {
    this._onUserUpdateCallbacks.push(cb);
  };

  removeEventListener = (cbToRemove: () => void | Promise<void>) => {
    this._onUserLogoutCallbacks = this._onUserLogoutCallbacks.filter(
      cb => cb !== cbToRemove
    );
    this._onUserUpdateCallbacks = this._onUserUpdateCallbacks.filter(
      cb => cb !== cbToRemove
    );
  };

  createFirebaseAccount = (form: RegisterForm): Promise<void> => {
    return createUserWithEmailAndPassword(this.auth, form.email, form.password)
      .then(userCredentials => {
        // The user is now stored in `this.auth`.
        sendEmailVerification(userCredentials.user);
      })
      .catch(error => {
        console.error('Error while creating firebase account:', error);
        throw error;
      });
  };

  createUser = (
    getAuthorizationHeader: () => Promise<string>,
    form: RegisterForm,
    appLanguage: string
  ): Promise<void> => {
    return getAuthorizationHeader()
      .then(authorizationHeader => {
        const { currentUser } = this.auth;
        if (!currentUser) {
          console.error(
            'Cannot create the user as it is not logged in any more.'
          );
          throw new Error(
            'Cannot create the user as it is not logged in any more.'
          );
        }
        return axios.post(
          `${GDevelopUserApi.baseUrl}/user`,
          {
            id: currentUser.uid,
            email: form.email,
            username: form.username,
            appLanguage: appLanguage,
            getNewsletterEmail: form.getNewsletterEmail,
            isCreator: true,
          },
          {
            params: {
              userId: currentUser.uid,
            },
            headers: {
              Authorization: authorizationHeader,
            },
          }
        );
      })
      .then(() => {
        // User successfully created
      })
      .catch(error => {
        console.error('Error while creating user:', error);
        throw error;
      });
  };

  login = (form: LoginForm): Promise<void> => {
    const { loginProvider } = this;
    if (!loginProvider) {
      throw new Error('Login provider not set.');
    }
    return loginProvider
      .loginWithEmailAndPassword(form)
      .then(userCredentials => {
        // The user is now stored in `this.auth`.
      })
      .catch(error => {
        console.error('Error while login:', error);
        throw error;
      });
  };

  loginWithProvider = ({
    provider,
    signal,
  }: {|
    provider: IdentityProvider,
    signal?: AbortSignal,
  |}): Promise<void> => {
    const { loginProvider } = this;
    if (!loginProvider) {
      throw new Error('Login provider not set.');
    }

    return loginProvider
      .loginOrSignupWithProvider({ provider, signal })
      .then(userCredentials => {
        // The user is now stored in `this.auth`.
      })
      .catch(error => {
        if (error.name !== userCancellationErrorName) {
          console.error('Error while login with provider:', error);
        }
        throw error;
      });
  };

  forgotPassword = (form: ForgotPasswordForm): Promise<void> => {
    return sendPasswordResetEmail(this.auth, form.email);
  };

  getFirebaseUser = async (): Promise<?FirebaseUser> => {
    const { currentUser } = this.auth;
    if (!currentUser) {
      return null;
    }

    // In order to fetch the latest firebaseUser properties (like emailVerified)
    // we have to call the reload method.
    await currentUser.reload();
    return this.auth.currentUser;
  };

  sendFirebaseEmailVerification = async (): Promise<void> => {
    {
      const { currentUser } = this.auth;
      if (!currentUser)
        throw new Error(
          'Tried to send verification email while not authenticated.'
        );

      await currentUser.reload();
    }
    const { currentUser } = this.auth;
    if (!currentUser || currentUser.emailVerified) return;

    try {
      await sendEmailVerification(currentUser);
    } catch (error) {
      showErrorBox({
        message:
          'An email has been sent recently, check your inbox or please try again later.',
        rawError: error,
        errorId: 'email-verification-send-error',
      });
    }
  };

  changeEmail = async (
    getAuthorizationHeader: () => Promise<string>,
    form: ChangeEmailForm
  ) => {
    const { currentUser } = this.auth;
    if (!currentUser)
      throw new Error('Tried to change email while not authenticated.');

    return updateEmail(currentUser, form.email)
      .then(() => sendEmailVerification(currentUser))
      .then(() => {
        console.log('Email successfully changed in Firebase.');
        return getAuthorizationHeader();
      })
      .then(authorizationHeader => {
        return axios.patch(
          `${GDevelopUserApi.baseUrl}/user/${currentUser.uid}`,
          {
            email: form.email,
          },
          {
            params: {
              userId: currentUser.uid,
            },
            headers: {
              Authorization: authorizationHeader,
            },
          }
        );
      })
      .then(() => {
        console.log('Email successfully changed in the GDevelop services.');
      })
      .catch(error => {
        console.error('An error happened during email change.', error);
        throw error;
      });
  };

  getUserProfile = async (
    getAuthorizationHeader: () => Promise<string>
  ): Promise<Profile> => {
    const { currentUser } = this.auth;
    if (!currentUser)
      throw new Error('Tried to get user profile while not authenticated.');

    return getAuthorizationHeader()
      .then(authorizationHeader => {
        return axios.get(`${GDevelopUserApi.baseUrl}/user/${currentUser.uid}`, {
          params: {
            userId: currentUser.uid,
          },
          headers: {
            Authorization: authorizationHeader,
          },
        });
      })
      .then(response => response.data)
      .catch(error => {
        console.error('Error while fetching user:', error);
        throw error;
      });
  };

  editUserProfile = async (
    getAuthorizationHeader: () => Promise<string>,
    {
      username,
      description,
      getGameStatsEmail,
      getNewsletterEmail,
      appLanguage,
      isCreator,
      donateLink,
      discordUsername,
      githubUsername,
      communityLinks,
      survey,
    }: PatchUserPayload
  ) => {
    const { currentUser } = this.auth;
    if (!currentUser)
      throw new Error('Tried to edit user profile while not authenticated.');

    return getAuthorizationHeader()
      .then(authorizationHeader => {
        return axios.patch(
          `${GDevelopUserApi.baseUrl}/user/${currentUser.uid}`,
          {
            username,
            description,
            getGameStatsEmail,
            getNewsletterEmail,
            appLanguage,
            isCreator,
            donateLink,
            discordUsername,
            githubUsername,
            communityLinks,
            survey,
          },
          {
            params: {
              userId: currentUser.uid,
            },
            headers: {
              Authorization: authorizationHeader,
            },
          }
        );
      })
      .then(response => response.data)
      .catch(error => {
        console.error('Error while editing user:', error);
        throw error;
      });
  };

  updateGitHubStar = async (
    getAuthorizationHeader: () => Promise<string>
  ): Promise<UpdateGitHubStarResponse> => {
    const { currentUser } = this.auth;
    if (!currentUser)
      throw new Error('Tried to update github star while not authenticated.');
    const { uid } = currentUser;

    const authorizationHeader = await getAuthorizationHeader();
    const response = await axios.post(
      `${GDevelopUserApi.baseUrl}/user/${uid}/action/update-github-star`,
      {},
      {
        params: { userId: uid },
        headers: { Authorization: authorizationHeader },
      }
    );

    return response.data;
  };

  updateTiktokFollow = async (
    getAuthorizationHeader: () => Promise<string>
  ): Promise<UpdateTiktokFollowResponse> => {
    const { currentUser } = this.auth;
    if (!currentUser)
      throw new Error('Tried to update tiktok follow while not authenticated.');
    const { uid } = currentUser;

    const authorizationHeader = await getAuthorizationHeader();
    const response = await axios.post(
      `${GDevelopUserApi.baseUrl}/user/${uid}/action/update-tiktok-follow`,
      {},
      {
        params: { userId: uid },
        headers: { Authorization: authorizationHeader },
      }
    );

    return response.data;
  };

  updateTwitterFollow = async (
    getAuthorizationHeader: () => Promise<string>
  ): Promise<UpdateTwitterFollowResponse> => {
    const { currentUser } = this.auth;
    if (!currentUser)
      throw new Error(
        'Tried to update twitter follow while not authenticated.'
      );
    const { uid } = currentUser;

    const authorizationHeader = await getAuthorizationHeader();
    const response = await axios.post(
      `${GDevelopUserApi.baseUrl}/user/${uid}/action/update-twitter-follow`,
      {},
      {
        params: { userId: uid },
        headers: { Authorization: authorizationHeader },
      }
    );

    return response.data;
  };

  updateYoutubeSubscription = async (
    getAuthorizationHeader: () => Promise<string>
  ): Promise<UpdateYoutubeSubscriptionResponse> => {
    const { currentUser } = this.auth;
    if (!currentUser)
      throw new Error(
        'Tried to update youtube subscription while not authenticated.'
      );
    const { uid } = currentUser;

    const authorizationHeader = await getAuthorizationHeader();
    const response = await axios.post(
      `${
        GDevelopUserApi.baseUrl
      }/user/${uid}/action/update-youtube-subscription`,
      {},
      {
        params: { userId: uid },
        headers: { Authorization: authorizationHeader },
      }
    );

    return response.data;
  };

  acceptGameStatsEmail = async (
    getAuthorizationHeader: () => Promise<string>,
    value: boolean
  ) => {
    const { currentUser } = this.auth;
    if (!currentUser)
      throw new Error(
        'Tried to accept game stats email while not authenticated.'
      );

    return getAuthorizationHeader()
      .then(authorizationHeader => {
        return axios.patch(
          `${GDevelopUserApi.baseUrl}/user/${currentUser.uid}`,
          { getGameStatsEmail: value },
          {
            params: { userId: currentUser.uid },
            headers: { Authorization: authorizationHeader },
          }
        );
      })
      .then(response => response.data)
      .catch(error => {
        console.error('Error while accepting game stats email:', error);
        throw error;
      });
  };

  getFirebaseUserSync = (): ?FirebaseUser => {
    return this.auth.currentUser || null;
  };

  logout = async () => {
    try {
      await signOut(this.auth);
      console.log('Logout successful.');
    } catch (error) {
      console.error('An error happened during logout.', error);
      throw error;
    }
  };

  deleteAccount = async (getAuthorizationHeader: () => Promise<string>) => {
    const { currentUser } = this.auth;
    if (!currentUser) {
      throw new Error('Tried to delete account while not authenticated.');
    }

    try {
      const authorizationHeader = await getAuthorizationHeader();
      await axios.delete(`${GDevelopUserApi.baseUrl}/user/${currentUser.uid}`, {
        params: {
          userId: currentUser.uid,
        },
        headers: {
          Authorization: authorizationHeader,
        },
      });
      // Ensure we logout the user after the account has been deleted.
      await this.logout();
    } catch (error) {
      console.error('An error happened during account deletion.', error);
      throw error;
    }
  };

  getAuthorizationHeader = async (): Promise<string> => {
    const { currentUser } = this.auth;
    if (!currentUser) throw new Error('User is not authenticated.');

    return currentUser.getIdToken().then(token => `Bearer ${token}`);
  };

  isAuthenticated = (): boolean => {
    return !!this.auth.currentUser;
  };
}
