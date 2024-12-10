import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import styles from './index.module.scss';
import { Key, useState } from 'react';
import { Sidebar, Menu, MenuItem} from 'react-pro-sidebar';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button'
import { logout } from '@/services/api.service';

export default function Layout({ children }) {
    const router = useRouter();
    const [toogle, setToogle] = useState(false);
    const [collpase, setCollpase] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);

    const handleLogout = async () => {
        try {
            logout();
        } catch (error) {
            console.error('Logout error:', error.message);
        }
    };
    
    

    // category
    const category = router.asPath.split('/')[1];

    const parentCategory = [
        {
            label: 'Sales',
            path: 'sales',
        },
        {
            label: 'Internals',
            path: 'internals',
        },
        {
            label: 'Settings',
            path: 'settings/company-profile',
            isLoading: true,
        },
        {
            label: 'Message',
            path: 'email',
        },
        {
            label: 'Email',
            path: 'mail-client-design',
            isLoading: true,
        },
        {
            label: 'Meetings',
            path: 'start-meet',
            isLoading: true,
        },
        {
            label: 'Jobs',
            path: 'jobs',
        },
    ];

    const sideMenuItems = {
        sales: [
            {
                label: 'Dashboard',
                path: 'dashboard',
                imageName: 'dashboard',
            },
            {
                label: 'Accounts',
                path: 'accounts',
                imageName: 'accounts',
            },
            {
                label: 'Contacts',
                path: 'contacts',
                imageName: 'contact',
            },
            {
                label: 'Tasks',
                path: 'tasks',
                imageName: 'tasks',
            },
            {
                label: 'Clients',
                path: 'clients',
                imageName: 'client',
            },
        ],
        internals: [
            {
                label: 'Dashboard',
                path: 'dashboard',
                imageName: 'dashboard',
            },
            {
                label: 'Internal Contacts',
                path: 'contacts',
                imageName: 'internalContact',
            },
            {
                label: 'Jobs',
                path: 'jobs',
                imageName: 'jobs',
            },
            {
                label: 'RecruitmentTeam ',
                path: 'recruitment-team',
                imageName: 'accounts',
            },
            {
                label: 'Vendor Team',
                path: 'vendor-team',
                imageName: 'accounts',
            },
            // {
            //     label: 'Departments',
            //     path: 'departments',
            //     imageName: 'dashboard',
            // },
            // {
            //     label: 'Members',
            //     path: 'members',
            //     imageName: 'dashboard',
            // },
        ],
        email: [
            {
                label: 'Inbox',
                path: 'inbox',
                icon: 'pi-envelope',
            },
            {
                label: 'Sent',
                path: 'sent',
                icon: 'pi-send',
            },
            {
                label: 'Starred',
                path: 'starred',
                icon: 'pi-star',
            },
            {
                label: 'Trash',
                path: 'delete',
                icon: 'pi-trash',
            },
            {
                label: 'Settings',
                path: 'setting',
                icon: 'pi-cog',
            },
        ],

        emailClient: [
            {
                label: 'Inbox',
                key: 'inbox',
                icon: 'pi-envelope',
            },
            {
                label: 'Sent',
                key: 'sent',
                icon: 'pi-send',
            },
            {
                label: 'Starred',
                key: 'starred',
                icon: 'pi-star',
            },
            {
                label: 'Trash',
                key: 'trash',
                icon: 'pi-trash',
            },
            {
                label: 'Settings',
                key: 'settings',
                icon: 'pi-cog',
            },
        ],

        jobs: [
            {
                label: 'Dashboard',
                path: 'dashboard',
                imageName: 'dashboard',
            },
            {
                label: 'Post',
                path: 'add',
                imageName: 'post',
            },
            // {
            //     label: 'Application Form',
            //     path: 'application',
            //     imageName: 'dashboard',
            // },
            // {
            //     label: 'Recruiter Application',
            //     path: 'recruiter-form',
            //     imageName: 'dashboard',
            // },
            {
                label: 'Lists',
                path: 'lists',
                imageName: 'lists',
            },
        //     {
        //       label: 'Allocation',
        //       path: 'allocation',
        //       imageName: 'dashboard',
        //   },
            {
              label: 'Jobs Allocation',
              path: 'jobs-allocation',
              imageName: 'Resume',
          },
        ],
        
        settings: [
            {
                label: 'Company profile',
                path: 'company-profile',
                imageName: 'pc',
            },
            {
                label: 'Careers Page',
                path: 'career',
                imageName: 'careerPage',
            },
            {
                label: 'Integrations',
                path: 'integrations',
                imageName: 'integrations',
            },
            {
                label: 'Workflow ',
                path: 'workflow',
                imageName: 'workflow',
            },
            {
                label: 'Departments',
                path: 'departments',
                imageName: 'Briefcase Settings',
            },
            {
                label: 'Members',
                path: 'members',
                imageName: 'accounts',
            },
            // {
            //     label: 'Placeholders',
            //     path: 'place-holders',
            //     imageName: 'dashboard',
            // },
            {
                label: 'Email builder',
                path: 'email-template-builder',
                imageName: 'email',
            },
            {
                label: 'Tracker',
                path: 'dynamic-fields',
                imageName: 'tracker',
            },
            
            {
                label: 'User Profile',
                path: 'user-profile',
                imageName: 'user-profile',
              },

              {label: 'Add Vendor',
                path: 'add-vendor',
                imageName: 'dashboard'
              },

              {
                label: 'Add Customer',
                path: 'add-customer',
                imageName: 'dashboard'
              }
        ],
    };
    const isNoNeedForSideBar = ['mail-client-design', 'meet', 'meet-end', 'start-meet', 'join'];
    const publicRoutes = ['meet', 'meet-end', 'join']
    console.log(router.asPath.split('/').at(-1))
    const isPiblicRoute = publicRoutes.includes(router.asPath.split('/').at(-1))
    const isRouteActive = (url: string, category?: string) => {
        const spliPath = router.asPath.split('/');
        if (!category) {
            return router.asPath.includes(url) ? true : false;
        } else if (spliPath[1] == category && spliPath[2] == url) {
            return true;
        } else {
            return false;
        }
    };

    const getIcon = (item: { icon: any; name: string; imageName: any; }, i?: Key) => {
        if (item.icon) {
            return <i key={i} className={`pi ${item?.icon}`} />;
        } else {
            return (
                <Image
                    key={i}
                    width={25}
                    height={25}
                    alt={item?.name}
                    src={`/assets/icons/${item?.imageName}.svg`}
                />
            );
        }
    };

    return (
        <>
            <div className={styles.layout_wrapper}>
              {  !isPiblicRoute ? (<div className={styles.layout_topbar}>
                    <div className={styles.logo}>
                        <Link href="/" prefetch={false}>
                            <img
                                // fill="true"
                                alt="telency-main-logo"
                                src="/assets/dashboard/logo.svg"
                            />
                        </Link>
                    </div>
                    <div className={styles.links}>
                        {parentCategory.map((item, i) => (
                            <Link
                                key={`topbar-${i}`}
                                href={`/${item.path}`}
                                onClick={item?.isLoading  ?() =>{ 
                                    router.push(`/${item.path}`).then(() => window.location.reload())
                                } : () => 0}
                                className={
                                    item.path == category ? styles.active : ' '
                                }
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                    <div className={styles.icons}>
                        <Image
                            alt="email-icon"
                            src="/assets/icons/email.svg"
                            height={20}
                            width={20}
                        />
                        <Image
                            alt="notification-icon"
                            src="/assets/icons/notification.svg"
                            height={20}
                            width={20}
                        />
                        <Image
                            alt="user-profile"
                            src="/assets/icons/user.svg"
                            height={20}
                            width={20}
                            onClick={() => setDialogVisible(true)}
                        />
                        <i
                            className="pi pi-align-justify"
                            onClick={() => {
                                setToogle((prev) => !prev);
                            }}
                        />
                    </div>
                </div>) : null}

                <Dialog
                    header="Logout"
                    visible={dialogVisible}
                    style={{ width: '30vw', }}
                    footer={
                        <>
                            <Button label="Logout" icon="pi pi-sign-out" className="p-button-danger" onClick={handleLogout} />
                        </>
                    }
                    onHide={() => setDialogVisible(false)}
                >
                    <p>Are you sure you want to logout?</p>
                </Dialog>

                <div className={styles.layout_side_bar}>
                    {sideMenuItems[category]?.length > 0 && (
                        <Sidebar
                            breakPoint="sm"
                            toggled={toogle}
                            collapsed={collpase}
                            backgroundColor="#E58D75"
                            className={styles.sidebar}
                            onBackdropClick={() => {
                                setToogle((prev) => !prev);
                            }}
                        >
                            <div className={styles.logo}>
                                <img
                                    // fill="true"
                                    alt="logo"
                                    src="/assets/dashboard/logo.svg"
                                />
                            </div>

                            <Menu className={styles.desktop_items}>
                                <MenuItem
                                    onClick={() => setCollpase((prev) => !prev)}
                                    icon={<i className="pi pi-home" />}
                                >
                                    <div className="flex justify-content-between">
                                        Home
                                        <img
                                            src="/assets/icons/hideMenu.svg"
                                            alt="hide-menu-toggle"
                                        />
                                    </div>
                                </MenuItem>
                                {sideMenuItems[category]?.map((item, i) => (
                                    <MenuItem
                                        key={`side-item-${i}`}
                                        active={isRouteActive(item.path)}
                                        icon={getIcon(item, i)}
                                        component={
                                            <Link
                                                href={`/${category}/${item.path}`}
                                            />
                                        }
                                    >
                                        {item?.label}
                                    </MenuItem>
                                ))}
                            </Menu>
                            {/* <Menu className={styles.mobile_items}>
                                {parentCategory?.map((item, i) => (
                                    <SubMenu
                                        key={`side-item-${i}`}
                                        active={isRouteActive(item.path)}
                                        label={item?.label}
                                    >
                                        {Array.isArray(
                                            sideMenuItems[item.path]
                                        ) &&
                                            sideMenuItems[item.path].map(
                                                (item1, i) => (
                                                    <MenuItem
                                                        onClick={() =>
                                                            setToogle(false)
                                                        }
                                                        key={`side-item-${i}`}
                                                        active={isRouteActive(
                                                            item1.path,
                                                            item.path
                                                        )}
                                                        icon={getIcon(item1)}
                                                        component={
                                                            <Link
                                                                href={`/${item.path}/${item1.path}`}
                                                            />
                                                        }
                                                    >
                                                        {item1?.label}
                                                    </MenuItem>
                                                )
                                            )}
                                    </SubMenu>
                                ))}
                            </Menu> */}
                        </Sidebar>
                    )}
                    <div className={`${styles.content} ${!isNoNeedForSideBar.includes(router.route.split("/").at(-1)) && `container ${styles.addedGap}` }`}>
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
