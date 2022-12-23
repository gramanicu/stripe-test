import SimpleButton from '@components/buttons/SimpleButton';
import EmailInput from '@components/inputs/EmailInput';
import SimpleModal from '@components/modals/SimpleModal';
import SimpleSwitch from '@components/toggles/SimpleSwitch';
import { Dialog } from '@headlessui/react';
import moment from 'moment';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useSessionStore } from 'stores/session.store';

export type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function AuthModal({ isOpen, onClose }: ModalProps) {
    const [typedEmail, setTypedEmail] = useState('');
    const [validEmail, setValidEmail] = useState(false);
    const [signup, setSignup] = useState(false);

    const updateEmail = useSessionStore(state => state.updateEmail);
    const updateSessionExpireAt = useSessionStore(state => state.updateExpireAt);

    const handleAuthResponse = async (res: Response) => {
        if (res.status === 200) {
            const { user, session_duration } = await res.json();
            const { email } = user;

            setTimeout(() => {
                updateEmail('');
            }, session_duration * 1000);

            updateEmail(email);
            updateSessionExpireAt(moment().add(session_duration, 'seconds').unix());

            setTypedEmail('');
            setValidEmail(false);

            toast.success(signup ? 'Signed up' : 'Signed in');

            onClose();
        }

        if (res.status === 401) {
            toast.error('Invalid email');
        }

        if (res.status === 409) {
            toast.error('Email already exists');
        }
    };

    const handleAuth = async () => {
        if (!validEmail) return;

        if (signup) {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: typedEmail,
                }),
            });

            handleAuthResponse(res);

            return;
        }

        const res = await fetch('/api/auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: typedEmail,
            }),
        });

        handleAuthResponse(res);
    };

    return (
        <SimpleModal isOpen={isOpen} onClose={onClose}>
            <Dialog.Title as="h3" className="text-xl font-bold leading-6 ">
                {signup ? 'Sign up for an account' : 'Sign into your account'}
            </Dialog.Title>

            <div className="mt-6 flex flex-row items-center gap-2">
                <label htmlFor={'signin/signup switch'}>Email</label>
                <EmailInput
                    email={typedEmail}
                    onChange={(email, isValid) => {
                        setTypedEmail(email);
                        setValidEmail(isValid);
                    }}
                    showErrors={false}
                />
            </div>

            <div className="mt-4 w-full flex flex-row justify-between">
                <div className="flex flex-row items-center gap-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300" htmlFor={'auth_switch'}>
                        {signup ? 'Change to signin' : 'Change to signup'}
                    </label>
                    <SimpleSwitch
                        name={'auth_switch'}
                        checked={signup}
                        onChange={checked => {
                            setSignup(checked);
                        }}
                    />
                </div>
                <SimpleButton text={signup ? 'Sign up' : 'Sign in'} onClick={handleAuth} disabled={!validEmail} />
            </div>
        </SimpleModal>
    );
}
