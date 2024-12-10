import { api } from './api.service';

export async function getAllUsers(userId: string) {
  try {
    const response: any = await api.get(`users/${userId}`);
    return response;
  } catch (error: any) {
    console.error('Error fetching a user:', error.message);
    throw new Error(`Error while fetching a user.`, error?.message);
  }
}

export async function updateUser(userId: string, data: any) {
  try {
    const response: any = await api.patch(`/users/${userId}`, data);
    return response;
  } catch (error: any) {
    console.error('Error updating a user:', error?.message);
    throw new Error(`Error updating user :`, error?.message);
  }
}

// Email config Services...

export async function updateUserInboxConfig(updateConfigId: string, data: any) {
  try {
    console.log('Data being sent to API', data);
    console.log('UsrInboxConfig data::', data?.userInboxConfig);
    const response: any = await api.patch(
      `user-inbox-config/${updateConfigId}`,
      data?.userInboxConfig,
    );
    return response;
  } catch (error: any) {
    console.error('Error updating an email config:', error?.message);
    throw new Error(`Error updating an email config:`, error?.message);
  }
}

export async function createUserInboxConfig(data: any) {
  try {
    console.log('Data being sent to API:', { ...data });

    if (!data?.userInboxConfig) {
      throw new Error('Invalid data: userInboxConfig is missing');
    }

    console.log('Data being sent to API:', data.userInboxConfig);

    const response: any = await api.post(
      'user-inbox-config',
      data?.userInboxConfig,
    );
    console.log(response, 'getting responses');
    return response;
  } catch (error: any) {
    console.error('Error updating user inbox config:', error);
    throw error;
  }
}

// Test IMAP connection

export async function userInboxConfigTestImapConnection(
  updateConfigId: string,
) {
  try {
    const response: any = await api.get(
      `user-inbox-config/${updateConfigId}/test-connection`,
    );
    return response;
  } catch (error: any) {
    console.error('Error testing IMAP connection:', error);
    throw error;
  }
}

// User Profile Soft Delete

export async function softDeleteUser(userId: string) {
  try {
    const response: any = await api.delete(`users/${userId}/soft-delete`);
    return response;
  } catch (error: any) {
    console.error('Error soft deleting a user:', error?.message);
    throw new Error(`Error soft deleting a user:`, error?.message);
  }
}


// change password

export async function userChangePassword(data: any) {
  console.log('Request data:', data)
  try {
      const response: any = await api.patch(`auth/change-password`,{
        password: data?.password
      });
      console.log('API response:', response)

      if (!response) {
          console.warn('Warning: API returned an undefined response');
          throw new Error('Unexpected response from the server.');
      }

      return response;
  } catch (error: any) {
      console.error('Error details:', error); // Log complete error object.
      console.error('Error response:', error?.response); // Log server response, if available.
      throw new Error(error?.response?.data?.message || 'Failed to change password');
  }
}

