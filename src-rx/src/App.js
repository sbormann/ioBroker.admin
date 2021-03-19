import React, { Suspense } from 'react';
import withWidth from '@material-ui/core/withWidth';
import { withStyles } from '@material-ui/core/styles';

import clsx from 'clsx';

import Connection from './components/Connection';
import { PROGRESS } from './components/Connection';
import Loader from '@iobroker/adapter-react/Components/Loader';
import I18n from '@iobroker/adapter-react/i18n';
import Router from '@iobroker/adapter-react/Components/Router';

// @material-ui/core
import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';

// import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

// @material-ui/icons
import MenuIcon from '@material-ui/icons/Menu';
import BuildIcon from '@material-ui/icons/Build';
import VisibilityIcon from '@material-ui/icons/Visibility';
import ExpertIcon from '@iobroker/adapter-react/Components/ExpertIcon';

import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness5Icon from '@material-ui/icons/Brightness5';
import Brightness6Icon from '@material-ui/icons/Brightness6';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import PictureInPictureAltIcon from '@material-ui/icons/PictureInPictureAlt';

import ConfirmDialog from './dialogs/ConfirmDialog';
import CommandDialog from './dialogs/CommandDialog';
import Drawer from './components/Drawer';
import { STATES as DrawerStates } from './components/Drawer';
import { DRAWER_FULL_WIDTH, DRAWER_COMPACT_WIDTH } from './components/Drawer';
import Connecting from './components/Connecting';

import { ThemeProvider } from '@material-ui/core/styles';
import theme from './Theme';
import LogsWorker from './components/LogsWorker';
import InstancesWorker from './components/InstancesWorker';
import HostsWorker from './components/HostsWorker';
import Login from './login/Login';

import i18n from '@iobroker/adapter-react/i18n';
import Utils from '@iobroker/adapter-react/Components/Utils';
import WizardDialog from './dialogs/WizardDialog';
import BaseSettingsDialog from './dialogs/BaseSettingsDialog';
import SystemSettingsDialog from './dialogs/SystemSettingsDialog';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { ContextWrapper } from './components/ContextWrapper';
import HostSelectors from './components/HostSelectors';
// Tabs
const Adapters = React.lazy(() => import('./tabs/Adapters'));
const Instances = React.lazy(() => import('./tabs/Instances'));
const Intro = React.lazy(() => import('./tabs/Intro'));
const Logs = React.lazy(() => import('./tabs/Logs'));
const Files = React.lazy(() => import('./tabs/Files'));
const Objects = React.lazy(() => import('./tabs/Objects'));
const Users = React.lazy(() => import('./tabs/Users'));
const CustomTab = React.lazy(() => import('./tabs/CustomTab'));

const query = {};
(window.location.search || '').replace(/^\?/, '').split('&').forEach(attr => {
    const parts = attr.split('=');
    if (!parts[0]) {
        return;
    }
    query[parts[0]] = parts[1] === undefined ? true : decodeURIComponent(parts[1]);
});

const styles = theme => ({
    root: {
        display: 'flex',
        height: '100%',
    },
    appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    logoWhite: {
        background: '#FFFFFF'
    },
    appBarShift: {
        width: `calc(100% - ${DRAWER_FULL_WIDTH}px)`,
        marginLeft: DRAWER_FULL_WIDTH,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    appBarShiftCompact: {
        width: `calc(100% - ${DRAWER_COMPACT_WIDTH}px)`,
        marginLeft: DRAWER_COMPACT_WIDTH,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    hide: {
        display: 'none'
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(1),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowY: 'auto',
        marginTop: theme.mixins.toolbar.minHeight,
        '@media (min-width:0px) and (orientation: landscape)': {
            marginTop: theme.mixins.toolbar['@media (min-width:0px) and (orientation: landscape)'].minHeight
        },
        '@media (min-width:600px)': {
            marginTop: theme.mixins.toolbar['@media (min-width:600px)'].minHeight
        }
    },
    contentMargin: {
        marginLeft: -DRAWER_FULL_WIDTH,
    },
    contentMarginCompact: {
        marginLeft: -DRAWER_COMPACT_WIDTH,
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0
    },
    expertIcon: {
        width: 22,
        height: 22,
        //color: theme.palette.text ? theme.palette.text.disabled : 'grey'
    },
    expertIconActive: {
        //color: theme.palette.action.active
    },
    baseSettingsButton: {
        color: 'red',
    },
    alert_info: {

    },
    alert_error: {
        backgroundColor: '#f44336'
    },
    alert_success: {
        backgroundColor: '#4caf50'
    },
    avatarNotVisible: {
        opacity: 0,
        transition: 'opacity 0.3s'
    },
    avatarVisible: {
        opacity: 1
    },
    cmd: {
        animation: '1s linear infinite alternate $myEffect',
        opacity: 0.2,
    },
    "@keyframes myEffect": {
        "0%": {
            opacity: 0.2,
            transform: "translateY(0)"
        },
        "100%": {
            opacity: 1,
            transform: "translateY(-10%)"
        }
    },
    errorCmd: {
        color: '#a90000',
        animation: '0.2s linear infinite alternate $myEffect2',
    },
    performed: {
        color: '#388e3c',
        animation: '0.2s linear infinite alternate $myEffect2',
    },
    "@keyframes myEffect2": {
        "0%": {
            opacity: 1,
            transform: "translateX(0)"
        },
        "100%": {
            opacity: 0.7,
            transform: "translateX(-2%)"
        }
    }
});

class App extends Router {
    constructor(props) {

        super(props);

        window.alert = message => {
            if (message && message.toString().toLowerCase().includes('error')) {
                console.error(message);
                this.showAlert(message.toString(), 'error');
            } else {
                console.log(message);
                this.showAlert(message.toString(), 'info');
            }
        };
        // init translations
        this.translations = {
            'en': require('@iobroker/adapter-react/i18n/en'),
            'de': require('@iobroker/adapter-react/i18n/de'),
            'ru': require('@iobroker/adapter-react/i18n/ru'),
            'pt': require('@iobroker/adapter-react/i18n/pt'),
            'nl': require('@iobroker/adapter-react/i18n/nl'),
            'fr': require('@iobroker/adapter-react/i18n/fr'),
            'it': require('@iobroker/adapter-react/i18n/it'),
            'es': require('@iobroker/adapter-react/i18n/es'),
            'pl': require('@iobroker/adapter-react/i18n/pl'),
            'zh-cn': require('@iobroker/adapter-react/i18n/zh-cn'),
        };

        const translations = {
            'en': require('./i18n/en'),
            'de': require('./i18n/de'),
            'ru': require('./i18n/ru'),
            'pt': require('./i18n/pt'),
            'nl': require('./i18n/nl'),
            'fr': require('./i18n/fr'),
            'it': require('./i18n/it'),
            'es': require('./i18n/es'),
            'pl': require('./i18n/pl'),
            'zh-cn': require('./i18n/zh-cn'),
        };
        // merge together
        Object.keys(translations).forEach(lang => this.translations[lang] = Object.assign(this.translations[lang], translations[lang]));

        // init translations
        I18n.setTranslations(this.translations);
        I18n.setLanguage((navigator.language || navigator.userLanguage || 'en').substring(0, 2).toLowerCase());

        if (!query.login) {
            let drawerState = window.localStorage.getItem('App.drawerState');
            if (drawerState) {
                drawerState = parseInt(drawerState, 10);
            } else {
                drawerState = this.props.width === 'xs' ? DrawerStates.closed : DrawerStates.opened;
            }

            const theme = this.createTheme();

            this.state = {
                connected: false,
                progress: 0,
                ready: false,
                lang: 'en',

                //Finished
                protocol: this.getProtocol(),
                hostname: window.location.hostname,
                port: this.getPort(),
                //---------

                allTabs: null,

                expertMode: window.localStorage.getItem('App.expertMode') === 'true',

                states: {},
                hosts: [],
                currentHost: '',
                currentHostName: '',
                currentTab: Router.getLocation(),
                currentDialog: null,
                currentUser: '',
                subscribesStates: {},
                subscribesObjects: {},
                subscribesLogs: 0,
                systemConfig: null,

                objects: {},

                waitForRestart: false,
                tabs: null,
                config: {},

                stateChanged: false,

                theme,
                themeName: this.getThemeName(theme),
                themeType: this.getThemeType(theme),

                alert: false,
                alertType: 'info',
                alertMessage: '',
                drawerState,

                tab: null,
                allStored: true,
                dataNotStoredDialog: false,
                dataNotStoredTab: '',

                baseSettingsOpened: false,
                unsavedDataInDialog: false,
                systemSettingsOpened: false,

                cmd: null,
                cmdDialog: false,
                wizard: true,
                commandError: false,
                performed: false
            };
            this.logsWorker = null;
            this.instancesWorker = null;
            this.hostsWorker = null;
        } else {
            const theme = this.createTheme();
            this.state = {
                login: true,
                theme,
                themeName: this.getThemeName(theme),
                themeType: this.getThemeType(theme)
            }
        }
    }

    setUnsavedData(hasUnsavedData) {
        if (hasUnsavedData !== this.state.unsavedDataInDialog) {
            this.setState({ unsavedDataInDialog: hasUnsavedData });
        }
    }

    componentDidMount() {
        if (!this.state.login) {
            window.addEventListener('hashchange', () => this.onHashChanged(), false);

            if (!this.state.currentTab.tab) {
                this.handleNavigation('tab-intro');
            } else {
                this.setTitle(this.state.currentTab.tab.replace('tab-', ''));
            }

            this.socket = new Connection({
                name: 'admin',
                port: this.getPort(),
                autoSubscribes: ['system.adapter.*'], // do not subscribe on '*' and really we don't need a 'system.adapter.*' too. Every tab must subscribe itself on everything that it needs
                autoSubscribeLog: true,
                onProgress: progress => {
                    if (progress === PROGRESS.CONNECTING) {
                        this.setState({
                            connected: false
                        });
                    } else if (progress === PROGRESS.READY) {
                        this.setState({
                            connected: true,
                            progress: 100
                        });
                    } else {
                        this.setState({
                            connected: true,
                            progress: Math.round(PROGRESS.READY / progress * 100)
                        });
                    }
                },
                onReady: async (objects, scripts) => {
                    I18n.setLanguage(this.socket.systemLang);
                    // create Workers
                    this.logsWorker = this.logsWorker || new LogsWorker(this.socket, 1000);
                    this.instancesWorker = this.instancesWorker || new InstancesWorker(this.socket);
                    this.hostsWorker = this.hostsWorker || new HostsWorker(this.socket);

                    const newState = {
                        lang: this.socket.systemLang,
                        ready: true,
                        objects,
                    };

                    try {
                        newState.systemConfig = await this.socket.getSystemConfig();
                        newState.wizard = !newState.systemConfig.common.licenseConfirmed;
                    } catch (error) {
                        console.log(error);
                    }

                    newState.hosts = await this.socket.getHosts();

                    if (!this.state.currentHost) {
                        const currentHost = window.localStorage.getItem('App.currentHost');
                        if (currentHost && newState.hosts.find(({ _id }) => _id === currentHost)) {
                            newState.currentHost = newState.hosts.find(({ _id }) => _id === currentHost)._id;
                            newState.currentHostName = newState.hosts.find(({ _id }) => _id === currentHost).common.name;
                        } else {
                            newState.currentHost = newState.hosts[0]._id;
                            newState.currentHostName = newState.hosts[0].common.name;
                        }
                    }

                    this.subscribeOnHostsStatus();

                    this.setState(newState, () => this.setCurrentTabTitle());

                    this.logsWorkerChanged(this.state.currentHost);
                    
                    if (!this.logsHandlerRegistered) {
                        this.logsHandlerRegistered = true;
                        const { setStateContext } = this.context;
                        this.logsWorker.registerErrorCountHandler(logErrors => setStateContext({
                            logErrors
                        }));
                        this.logsWorker.registerWarningCountHandler(logWarnings => setStateContext({
                            logWarnings
                        }));
                    }                    
                },
                //onObjectChange: (objects, scripts) => this.onObjectChange(objects, scripts),
                onError: error => {
                    console.error(error);
                    this.showAlert(error, 'error');
                }
            });
        }
    }

    logsWorkerChanged = (currentHost) => {
        this.logsWorker && this.logsWorker.setCurrentHost(currentHost);
    }

    onHostStatusChanged = (id, state) => {
        const host = this.state.hosts.find(_id => id + '.alive' === id);
        if (host) {
            console.log('Current status ' + id + ': ' + state?.val);
        }
    };

    subscribeOnHostsStatus() {
        // this.state.hosts.forEach
        // this.socket.subscribeState(id + '.alive', this.onHostStatusChanged)
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', () => this.onHashChanged(), false);
        // unsubscibe
        // this.state.hosts.forEach
        // this.socket.unsubscribeState(id + '.alive', this.onHostStatusChanged);
    }

    /**
     * Updates the current currentTab in the states
     */
    onHashChanged() {
        this.setState({
            currentTab: Router.getLocation()
        }, () => this.setCurrentTabTitle());
    }

    /**
     * Get the used port
     */
    getPort() {
        let port = parseInt(window.location.port, 10);

        if (isNaN(port)) {
            switch (this.getProtocol()) {
                case 'https:':
                    port = 443;
                    break;
                case 'http:':
                    port = 80;
                    break;
                default:
                    break;
            }
        }

        if (!port || port === 3000) {
            port = 8081;
        }

        return port;
    }

    /**
     * Get the used protocol
     */
    getProtocol() {
        return window.location.protocol;
    }

    /**
     * Get a theme
     * @param {string} name Theme name
     * @returns {Theme}
     */
    createTheme(name) {
        return theme(Utils.getThemeName(name));
    }

    /**
     * Get the theme name
     * @param {Theme} theme Theme
     * @returns {string} Theme name
     */
    getThemeName(theme) {
        return theme.name;
    }

    /**
     * Get the theme type
     * @param {Theme} theme Theme
     * @returns {string} Theme type
     */
    getThemeType(theme) {
        return theme.palette.type;
    }

    /**
     * Changes the current theme
     */
    toggleTheme() {
        const themeName = this.state.themeName;

        const newThemeName = themeName === 'dark' ? 'blue' :
            themeName === 'blue' ? 'colored' : themeName === 'colored' ? 'light' :
                themeName === 'light' ? 'dark' : 'colored';

        Utils.setThemeName(newThemeName);

        const theme = this.createTheme(newThemeName);

        this.setState({
            theme: theme,
            themeName: this.getThemeName(theme),
            themeType: this.getThemeType(theme)
        });
    }

    async onObjectChange(id, obj) {
        console.log('OBJECT: ' + id);
        if (obj) {
            this.setState(prevState => {

                const objects = prevState.objects;
                objects[id] = obj;

                return {
                    objects: objects
                };
            });
        } else {
            this.setState(prevState => {

                const objects = prevState.objects;
                delete objects[id];

                return {
                    objects: objects
                };
            });
        }
    }

    setCurrentTabTitle() {
        this.setTitle(this.state.currentTab.tab.replace('tab-', ''));
    }

    setTitle(title) {
        document.title = title + ' - ' + (this.state.currentHostName || 'ioBroker');
    }

    /*addEventMessage(id, stateOrObj, isMessage, isState) {
        /* // cannot directly use tabs.events.add, because to init time not available.
        tabs.events.add(id, stateOrObj, isMessage, isState));
    }

    saveConfig(attr, value) {
        if (attr) {
            const config = this.state.config.slice();
            config[attr] = value;
            this.setState({
            config: config
            })
        }

        if (typeof Storage !== 'undefined') {
            Storage.setItem('adminConfig', JSON.stringify(this.state.config));
        }
    }

    saveTabs() {
        try {
            this.socket.setObject('system.config', this.state.systemConfig);
        } catch(error) {
            this.showError(error);
        }
    }*/

    /*getUser() {
        if (!this.state.currentUser) {
            this.socket.socket.emit('authEnabled', (auth, user) => {
                const currentUser = 'system.user.' + user;
                this.setState({
                    currentUser: currentUser,
                    authenticated: auth
                });
            });
        } else if (this.state.objects[this.state.currentUser]) {
            const obj = this.state.objects[this.state.currentUser];
            let name = '';

            if (!obj || !obj.common || !obj.common.name) {
                name = this.state.currentUser.replace(/^system\.user\./);
                name = name[0].toUpperCase() + name.substring(1).toLowerCase();
            } else {
                //name = translateName(obj.common.name);
            }

            if (obj && obj.common && obj.common.icon) {
                const objs = {};
                objs[this.state.currentUser] = obj;
                //$('#current-user-icon').html(main.getIcon(main.currentUser, null, objs));
            } else {
                //$('#current-user-icon').html('<i className="large material-icons">account_circle</i>');
            }
            //$('#current-user').html(name);
            const groups = [];
            for (let i = 0; i < this.state.tabs.users.groups.length; i++) {
                const group = this.state.objects[this.state.tabs.users.groups[i]];
                if (group && group.common && group.common.members && group.common.members.indexOf(this.state.currentUser) !== -1) {
                    //groups.push(_(translateName(group.common.name)));
                }
            }
            //$('#current-group').html(groups.join(', '));
        }
    }*/

    getCurrentTab() {
        if (this.state && this.state.currentTab && this.state.currentTab.tab) {
            if (this.state.currentTab.tab === 'tab-adapters') {
                return (
                    <Suspense fallback={<Connecting />}>
                        <Adapters
                            key="adapters"
                            theme={this.state.theme}
                            themeName={this.state.themeName}
                            themeType={this.state.themeType}
                            systemConfig={this.state.systemConfig}
                            socket={this.socket}
                            hosts={this.state.hosts}
                            currentHost={this.state.currentHost}
                            currentHostName={this.state.currentHostName}
                            ready={this.state.ready}
                            t={I18n.t}
                            lang={I18n.getLanguage()}
                            expertMode={this.state.expertMode}
                            executeCommand={cmd => this.executeCommand(cmd)}
                        />
                    </Suspense>
                );
            } else
                if (this.state.currentTab.tab === 'tab-instances') {
                    return (
                        <Suspense fallback={<Connecting />}>
                            <Instances
                                key="instances"
                                socket={this.socket}
                                lang={I18n.getLanguage()}
                                protocol={this.state.protocol}
                                hostname={this.state.hostname}
                                themeName={this.state.themeName}
                                expertMode={this.state.expertMode}
                                idHost={this.state.hosts.find(({ common: { name } }) => name === this.state.currentHostName)._id}
                                currentHostName={this.state.currentHostName}
                                t={I18n.t}
                                configStored={value => this.allStored(value)}
                            />
                        </Suspense>
                    );
                } else
                    if (this.state.currentTab.tab === 'tab-intro') {
                        return (
                            <Suspense fallback={<Connecting />}>
                                <Intro
                                    key="intro"
                                    protocol={this.state.protocol}
                                    hostname={this.state.hostname}
                                    showAlert={(message, type) => this.showAlert(message, type)}
                                    socket={this.socket}
                                    t={I18n.t}
                                    lang={I18n.getLanguage()}
                                />
                            </Suspense>
                        );
                    } else
                        if (this.state.currentTab.tab === 'tab-logs') {
                            return (
                                <Suspense fallback={<Connecting />}>
                                    <Logs
                                        key="logs"
                                        t={I18n.t}
                                        lang={this.state.lang}
                                        socket={this.socket}
                                        ready={this.state.ready}
                                        logsWorker={this.logsWorker}
                                        expertMode={this.state.expertMode}
                                        currentHost={this.state.currentHost}
                                        clearErrors={cb => this.clearLogErrors(cb)}
                                    />
                                </Suspense>
                            );
                        } else
                            if (this.state.currentTab.tab === 'tab-files') {
                                return (
                                    <Suspense fallback={<Connecting />}>
                                        <Files
                                            key="files"
                                            ready={this.state.ready}
                                            t={I18n.t}
                                            expertMode={this.state.expertMode}
                                            lang={I18n.getLanguage()}
                                            socket={this.socket}
                                        />
                                    </Suspense>
                                );
                            } else
                                if (this.state.currentTab.tab === 'tab-users') {
                                    return (
                                        <Suspense fallback={<Connecting />}>
                                            <Users
                                                key="users"
                                                ready={this.state.ready}
                                                t={I18n.t}
                                                expertMode={this.state.expertMode}
                                                lang={I18n.getLanguage()}
                                                socket={this.socket}
                                            />
                                        </Suspense>
                                    );
                                } else
                                    if (this.state.currentTab.tab === 'tab-objects') {
                                        return (
                                            <Suspense fallback={<Connecting />}>
                                                <Objects
                                                    key="objects"
                                                    t={I18n.t}
                                                    themeName={this.state.themeName}
                                                    expertMode={this.state.expertMode}
                                                    lang={I18n.getLanguage()}
                                                    socket={this.socket}
                                                />
                                            </Suspense>
                                        );
                                    } else {
                                        const m = this.state.currentTab.tab.match(/^tab-([-\w\d]+)(-\d+)?$/);
                                        if (m) {
                                            /*const adapter  = m[1];
                                            const instance = m[2] ? parseInt(m[2], 10) : null;
    
                                            let link  = tab.common.adminTab.link || '/adapter/' + tab.common.name + '/tab.html';
                                            if (tab.common.materializeTab) {
                                                link  = tab.common.adminTab.link || '/adapter/' + tab.common.name + '/tab_m.html';
                                            }*/

                                            // /adapter/javascript/tab.html
                                            return (
                                                <Suspense fallback={<Connecting />}>
                                                    <CustomTab
                                                        key={this.state.currentTab.tab}
                                                        t={I18n.t}
                                                        protocol={this.state.protocol}
                                                        hostname={this.state.hostname}
                                                        instancesWorker={this.instancesWorker}
                                                        tab={this.state.currentTab.tab}
                                                        themeName={this.state.themeName}
                                                        expertMode={this.state.expertMode}
                                                        lang={I18n.getLanguage()}
                                                    />
                                                </Suspense>
                                            );
                                        }
                                    }
        }

        return null;
    }

    clearLogErrors = async () => {
        const { setStateContext } = this.context;
        setStateContext({
            logErrors: 0,
            logWarnings: 0
        });
    }

    getCurrentDialog() {
        if (this.state && this.state.currentTab && this.state.currentTab.dialog) {
            if (this.state.currentTab.dialog === 'base') {
                return this.getBaseSettingsDialog();
            } else if (this.state.currentTab.dialog === 'system') {
                return this.getSystemSettingsDialog();
            }
        }
        return null;
    }

    getBaseSettingsDialog() {
        return <BaseSettingsDialog
            currentHost={this.state.currentHost}
            hosts={this.state.hosts}
            themeName={this.state.themeName}
            currentHostName={this.state.currentHostName}
            key="base"
            onClose={() => Router.doNavigate(null)}
            lang={this.state.lang}
            showAlert={(message, type) => this.showAlert(message, type)}
            socket={this.socket}
            currentTab={this.state.currentTab}
            t={I18n.t}
        />;
    }

    getSystemSettingsDialog() {
        return <SystemSettingsDialog
            currentHost={this.state.currentHost}
            themeName={this.state.themeName}
            theme={this.state.theme}
            key="systemSettings"
            onClose={() => Router.doNavigate(null)}
            lang={this.state.lang}
            showAlert={(message, type) => this.showAlert(message, type)}
            socket={this.socket}
            currentTab={this.state.currentTab}
            t={I18n.t}
        />;
    }

    handleAlertClose(event, reason) {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({ alert: false });
    }

    showAlert(message, type) {

        if (type !== 'error' && type !== 'warning' && type !== 'info' && type !== 'success') {
            type = 'info';
        }

        this.setState({
            alert: true,
            alertType: type,
            alertMessage: message
        });
    }

    handleDrawerState(state) {
        window.localStorage.setItem('App.drawerState', state);
        this.setState({
            drawerState: state
        });
    }

    logout() {
        if (window.location.port === '3000') {
            window.location = window.location.protocol + '//' + window.location.hostname + ':8081/logout?dev';
        } else {
            window.location = '/logout';
        }
    }

    handleNavigation(tab) {
        if (tab) {
            if (this.state.allStored) {

                Router.doNavigate(tab);

                this.setState({ currentTab: Router.getLocation() });
            } else {
                this.setState({
                    dataNotStoredDialog: true,
                    dataNotStoredTab: tab
                });
            }
        }

        if (this.props.width === 'xs' || this.props.width === 'sm') {
            this.handleDrawerState(DrawerStates.closed);
        }

        tab = tab || (this.state.currentTab && this.state.currentTab.tab) || '';

        this.setTitle(tab.replace('tab-', ''));
    }

    allStored(value) {
        this.setState({
            allStored: value
        });
    };

    closeDataNotStoredDialog() {
        this.setState({ dataNotStoredDialog: false });
    }

    confirmDataNotStored() {
        this.setState({
            dataNotStoredDialog: false,
            allStored: true
        }, () => {
            this.handleNavigation(this.state.dataNotStoredTab);
        });
    }

    executeCommand(cmd) {
        this.setState({
            cmd,
            cmdDialog: true
        });
    }

    closeCmdDialog() {
        this.setState({
            cmd: null,
            cmdDialog: false,
            commandError: false,
            performed: false
        });
    }

    renderWizardDialog() {
        if (this.state.wizard) {
            return <WizardDialog
                socket={this.socket}
                t={I18n.t}
                lang={I18n.getLanguage()}
                onClose={() => this.setState({ wizard: false })}
            />;
        }
    }

    renderCommandDialog() {
        return this.state.cmd ?
            <CommandDialog
                onClose={() => this.closeCmdDialog()}
                open={this.state.cmdDialog}
                header={i18n.t('Command') /* Placeholder */}
                onConfirm={() => {
                    this.setState({ cmdDialog: false })
                } /* Test command */}
                cmd={this.state.cmd}
                errorFunc={() => this.setState({ commandError: true })}
                performed={() => this.setState({ performed: true })}
                inBackground={this.state.commandError || this.state.performed}
                commandError={this.state.commandError}
                // confirmText={i18n.t('Ok') /* Test command */}
                socket={this.socket}
                currentHost={this.state.currentHost}
                ready={this.state.ready}
                t={I18n.t}
            /> : null;
    }

    renderConfirmDialog() {
        return <ConfirmDialog
            onClose={() => this.closeDataNotStoredDialog()}
            open={this.state.dataNotStoredDialog}
            header={i18n.t('Please confirm')}
            onConfirm={() => this.confirmDataNotStored()}
            confirmText={i18n.t('Ok')}
        >
            {i18n.t('Some data are not stored. Discard?')}
        </ConfirmDialog>;
    }

    renderHostSelector() {

    }

    render() {
        if (this.state.login) {
            return (
                <ThemeProvider theme={this.state.theme}>
                    <Login t={I18n.t} />
                </ThemeProvider>
            );
        }

        if (!this.state.ready) {
            return (
                <ThemeProvider theme={this.state.theme}>
                    <Loader theme={this.state.themeType} />
                </ThemeProvider>
            );
        }

        const { classes } = this.props;
        const small = this.props.width === 'xs' || this.props.width === 'sm';
        return (
            <ThemeProvider theme={this.state.theme}>
                <Paper elevation={0} className={classes.root}>
                    <AppBar
                        color="default"
                        position="fixed"
                        className={clsx(
                            classes.appBar,
                            { [classes.appBarShift]: !small && this.state.drawerState === DrawerStates.opened },
                            { [classes.appBarShiftCompact]: !small && this.state.drawerState === DrawerStates.compact }
                        )}
                    >
                        <Toolbar>
                            <IconButton
                                edge="start"
                                className={clsx(classes.menuButton, !small && this.state.drawerState !== DrawerStates.closed && classes.hide)}
                                onClick={() => this.handleDrawerState(DrawerStates.opened)}
                            >
                                <MenuIcon />
                            </IconButton>
                            <IconButton>
                                <VisibilityIcon />
                            </IconButton>
                            <IconButton onClick={() => Router.doNavigate(null, 'system')}>
                                <BuildIcon />
                            </IconButton>
                            <IconButton onClick={() => this.toggleTheme()}>
                                {this.state.themeName === 'dark' &&
                                    <Brightness4Icon />
                                }
                                {this.state.themeName === 'blue' &&
                                    <Brightness5Icon />
                                }
                                {this.state.themeName === 'colored' &&
                                    <Brightness6Icon />
                                }
                                {this.state.themeName === 'light' &&
                                    <Brightness7Icon />
                                }
                            </IconButton>
                            {/*This will be removed later to settings, to not allow so easy to enable it*/}
                            <IconButton
                                onClick={() => {
                                    window.localStorage.setItem('App.expertMode', !this.state.expertMode);
                                    this.setState({ expertMode: !this.state.expertMode });
                                }}
                                color={this.state.expertMode ? 'secondary' : 'default'}
                            >
                                <ExpertIcon
                                    title={I18n.t('Toggle expert mode')}
                                    glowColor={this.state.theme.palette.secondary.main}
                                    active={this.state.expertMode}
                                    className={clsx(classes.expertIcon, this.state.expertMode && classes.expertIconActive)}
                                />
                            </IconButton>
                            {/*This will be removed later to settings, to not allow so easy to edit it*/}
                            {this.state.expertMode &&
                                <IconButton onClick={() => Router.doNavigate(null, 'base')}>
                                    <BuildIcon className={classes.baseSettingsButton} />
                                </IconButton>
                            }
                            <HostSelectors
                                socket={this.socket}
                                currentHostName={this.state.currentHostName}
                                currentHost={this.state.currentHost}
                                setCurrentHost={(hostName, host) => {
                                    this.setState({
                                        currentHostName: hostName,
                                        currentHost: host
                                    }, () => {
                                        this.logsWorkerChanged(host);
                                        window.localStorage.setItem('App.currentHost', host);
                                    });
                                }}
                                disabled={
                                    this.state.currentTab.tab !== 'tab-instances' &&
                                    this.state.currentTab.tab !== 'tab-adapters' &&
                                    this.state.currentTab.tab !== 'tab-logs'
                                }
                            />
                            <Typography variant="h6" className={classes.title} style={{ flexGrow: 1 }} />
                            {this.state.cmd && !this.state.cmdDialog && <IconButton onClick={() => this.setState({ cmdDialog: true })}>
                                <PictureInPictureAltIcon className={this.state.commandError ? classes.errorCmd : this.state.performed ? classes.performed : classes.cmd} />
                            </IconButton>}
                            {/* Show host selector */}

                            <Grid container className={clsx(this.state.drawerState !== 0 && classes.avatarVisible, classes.avatarNotVisible)} spacing={1} alignItems="center" style={{ width: 'initial' }}>
                                <Grid item>
                                    <Typography>admin</Typography>
                                </Grid>
                                <Grid item>
                                    <Avatar className={clsx((this.state.themeName === 'colored' || this.state.themeName === 'blue') && classes.logoWhite)} alt="ioBroker" src="img/no-image.png" />
                                </Grid>
                            </Grid>
                        </Toolbar>
                    </AppBar>
                    <DndProvider backend={!small ? HTML5Backend : TouchBackend}>
                        <Drawer
                            state={this.state.drawerState}
                            systemConfig={this.state.systemConfig}
                            handleNavigation={name => this.handleNavigation(name)}
                            onStateChange={state => this.handleDrawerState(state)}
                            onLogout={() => this.logout()}
                            currentTab={this.state.currentTab && this.state.currentTab.tab}
                            instancesWorker={this.instancesWorker}
                            logoutTitle={I18n.t('Logout')}
                            isSecure={this.socket.isSecure}
                            t={I18n.t}
                            lang={I18n.getLanguage()}
                            socket={this.socket}
                            expertMode={this.state.expertMode}
                            ready={this.state.ready}
                            themeName={this.state.themeName}
                        />
                    </DndProvider>
                    <Paper
                        elevation={0}
                        square
                        className={
                            clsx(classes.content, {
                                [classes.contentMargin]: !small && this.state.drawerState !== DrawerStates.compact,
                                [classes.contentMarginCompact]: !small && this.state.drawerState !== DrawerStates.opened,
                                [classes.contentShift]: !small && this.state.drawerState !== DrawerStates.closed
                            })
                        }
                    >
                        {this.getCurrentTab()}
                    </Paper>
                    <Snackbar
                        className={this.props.classes['alert_' + this.state.alertType]}
                        open={this.state.alert}
                        autoHideDuration={6000}
                        onClose={() => this.handleAlertClose()}
                        message={this.state.alertMessage}
                    />
                </Paper>
                {this.getCurrentDialog()}
                {this.renderConfirmDialog()}
                {this.renderCommandDialog()}
                {this.renderWizardDialog()}
                {!this.state.connected && <Connecting />}
            </ThemeProvider>
        );
    }
}
App.contextType = ContextWrapper;
export default withWidth()(withStyles(styles)(App));