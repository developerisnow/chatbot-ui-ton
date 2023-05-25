import { useState, useCallback, useEffect, Fragment } from 'react';

import { Menu, Transition } from '@headlessui/react';

import { isDesktop, isMobile, openLink } from '@/utils/ton';
import { useTonWallet } from '@/hooks/useTonWallet';
import { connector, addReturnStrategy } from '@/auth/tonConnect';
import { isWalletInfoInjectable, WalletInfoInjectable } from '@tonconnect/sdk';

import AuthModal from './AuthModal';

const useWalletsList = () => {
    const [walletsList, setWalletsList] = useState(null);
    const [embeddedWallet, setEmbeddedWallet] = useState(null);

    useEffect(() => {
        const fetchWalletsList = async () => {
            const wallets = await connector.getWallets();
            setWalletsList(wallets);
            const embedded = wallets.filter(isWalletInfoInjectable).find((wallet: WalletInfoInjectable) => wallet.embedded);
            setEmbeddedWallet(embedded);
            console.log('Wallets list', wallets);
            console.log('Embedded wallet', embedded);
        };

        fetchWalletsList();
    }, []);

    return { walletsList, embeddedWallet };
};

const AuthHeader = () => {
    const wallet = useTonWallet();
    const { walletsList, embeddedWallet } = useWalletsList();

    const [modalUniversalLink, setModalUniversalLink] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleConnectWallet = useCallback(async () => {
        // Use loading screen/UI instead (while wallets list is loading)
        if (!walletsList) {
            setTimeout(handleConnectWallet, 200);
        }

        if (!isDesktop() && embeddedWallet) {
            connector.connect({ jsBridgeKey: embeddedWallet.jsBridgeKey });
            return;
        }

        const tonkeeperConnectionSource = {
            universalLink: walletsList[0].universalLink,
            bridgeUrl: walletsList[0].bridgeUrl,
        };
        console.log('Connecting to Tonkeeper', tonkeeperConnectionSource);

        const universalLink = connector.connect(tonkeeperConnectionSource);

        if (isMobile()) {
            openLink(addReturnStrategy(universalLink, 'none'), '_blank');
        } else {
            setModalUniversalLink(universalLink);
        }
    }, [walletsList, embeddedWallet])

    const handleLogout = () => {
        // replace with your own logic
        console.log('Logout clicked');
    };

    const handleDrawerToggle = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        if (modalUniversalLink && wallet) {
            setModalUniversalLink('');
        }
    }, [modalUniversalLink, wallet]);


    return (
        <div className="flex items-start justify-start p-6">
            {wallet ? (
                <Menu as="div" className="relative inline-block text-left">
                    <div>
                        <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {wallet.account.address}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>

                        </Menu.Button>
                    </div>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <Menu.Item>
                                {({ active }) => (
                                    <div
                                        onClick={handleLogout}
                                        className={`${active ? 'bg-gray-100 text-red-500' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                        </svg>
                                        Log out
                                    </div>
                                )}
                            </Menu.Item>
                        </Menu.Items>
                    </Transition>
                </Menu>
            ) : (
                <>
                    <button
                        onClick={handleConnectWallet}
                        className="inline-flex cursor-pointer select-none items-center gap-3 rounded-md border border-white/20 p-3 text-white transition-colors duration-200 hover:bg-gray-500/10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                        </svg>
                        Connect Wallet
                    </button>
                    <AuthModal
                        open={!!modalUniversalLink}
                        onOk={() => setModalUniversalLink('')}
                        onCancel={() => setModalUniversalLink('')}
                        universalLink={modalUniversalLink}
                    />
                </>

            )}
        </div>
    );
};

export default AuthHeader;