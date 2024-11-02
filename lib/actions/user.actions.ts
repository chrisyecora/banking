'use server';

import { ID } from 'node-appwrite';
import { createAdminClient, createSessionClient } from '../appwrite';
import { parseStringify } from '../utils';
import { cookies } from 'next/headers';

export const signIn = async ({ email, password }: signInProps) => {
    try {
        const { account } = await createAdminClient();
        const cookieStore = await cookies();
        const response = await account.createEmailPasswordSession(
            email,
            password
        );

        cookieStore.set('appwrite-session', response.secret, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
        });

        return parseStringify(response);
    } catch (error) {
        console.error('Error', error);
    }
};

export const signUp = async (userData: SignUpParams) => {
    const { email, password, firstName, lastName } = userData;
    const cookieStore = await cookies();

    try {
        const { account } = await createAdminClient();

        const newUserAccount = await account.create(
            ID.unique(),
            email,
            password,
            `${firstName} ${lastName}`
        );

        const session = await account.createEmailPasswordSession(
            email,
            password
        );

        cookieStore.set('appwrite-session', session.secret, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
        });

        return parseStringify(newUserAccount);
    } catch (error) {
        console.error('Error', error);
    }
};

export async function getLoggedInUser() {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();

        return parseStringify(user);
    } catch (error) {
        return null;
    }
}

export const logoutAccount = async () => {
    try {
        const { account } = await createSessionClient();
        const cookieStore = await cookies();
        cookieStore.delete('appwrite-session');

        await account.deleteSession('current');
    } catch (error) {
        return null;
    }
};
