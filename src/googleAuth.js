// googleAuth.js
import { auth, provider, signInWithPopup, db, doc, setDoc } from './firebase';

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Extract first and last name
    const displayName = user.displayName || '';
    const [firstName, ...rest] = displayName.split(' ');
    const lastName = rest.join(' ');

    // Save to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: `${firstName} ${lastName}`,
    });

    console.log('User signed in and saved');
  } catch (error) {
    console.error('Google sign-in error:', error);
  }
};
