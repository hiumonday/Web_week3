const BASE_URL = 'https://jsonplaceholder.typicode.com/users';

/**
 * Fetch all users
 * @returns {Promise<Array>} List of users
 */
export const fetchUsers = async () => {
    try {
        const response = await fetch(BASE_URL);
        if (!response.ok) throw new Error('Failed to fetch users');
        return await response.json();
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

/**
 * Create a new user
 * @param {Object} userData 
 * @returns {Promise<Object>} Created user
 */
export const createUser = async (userData) => {
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });
        if (!response.ok) throw new Error('Failed to create user');
        return await response.json();
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

/**
 * Update an existing user
 * @param {number} id 
 * @param {Object} userData 
 * @returns {Promise<Object>} Updated user
 */
export const updateUser = async (id, userData) => {
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });
        if (!response.ok) throw new Error('Failed to update user');
        return await response.json();
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

/**
 * Delete a user
 * @param {number} id 
 * @returns {Promise<boolean>} Success status
 */
export const deleteUser = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete user');
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};
