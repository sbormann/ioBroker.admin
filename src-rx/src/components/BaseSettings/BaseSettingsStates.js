import { createRef, Component } from 'react';
import {withStyles} from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Paper from  '@material-ui/core/Paper';
import FormHelperText from '@material-ui/core/FormHelperText';
import Switch from "@material-ui/core/Switch";

import DialogConfirm from '@iobroker/adapter-react/Dialogs/Confirm';

const styles = theme => ({
    paper: {
        height:    '100%',
        maxHeight: '100%',
        maxWidth:  '100%',
        overflow:  'auto',
        padding:   theme.spacing(1),
    },
    controlItem: {
        width: 400,
        marginBottom: theme.spacing(2),
        marginRight: theme.spacing(1),
        marginLeft: theme.spacing(1),
    },
});

class BaseSettingsObjects extends Component {
    constructor(props) {
        super(props);

        const settings   = this.props.settings || {};
        settings.options = settings.options    || {};
        settings.backup  = settings.backup     || {};

        this.state = {
            type:                    settings.type                    || 'file',
            host:                    Array.isArray(settings.host) ? settings.host.join(',') : (settings.host || '127.0.0.1'),
            port:                    settings.port                    || 9000,
            connectTimeout:          settings.connectTimeout          || 2000,
            writeFileInterval:       settings.writeFileInterval       || 5000,
            dataDir:                 settings.dataDir                 || '',
            options_auth_pass:       settings.options.auth_pass       || settings.pass || '',
            options_retry_max_delay: settings.options.retry_max_delay || 2000,
            options_retry_max_count: settings.options.retry_max_count || 19,
            options_db:              settings.options.db              || 0,
            options_family:          settings.options.family          || 0,
            backup_disabled:         settings.backup.disabled         || false,
            backup_files:            settings.backup.files            || 24,
            backup_hours:            settings.backup.hours            || 48,
            backup_period:           settings.backup.period           || 120,
            backup_path:             settings.backup.path             || '',
            textIP:                  Array.isArray(settings.host) || (settings.host || '').match(/[^.\d]/) || (settings.host || '').includes(','),

            IPs:                     ['0.0.0.0', '127.0.0.1'],
            loading:                 true,
            showWarningDialog:       false,
            toConfirmType:           '',
            originalDBType:          settings.type                    || 'file',
        };

        this.focusRef = createRef();

        this.props.socket.getIpAddresses(this.props.currentHost)
            .then(_IPs => {
                const IPs = [..._IPs];
                !IPs.includes('0.0.0.0') && IPs.push('0.0.0.0');
                !IPs.includes('127.0.0.1') && IPs.push('127.0.0.1');
                this.setState({ IPs, loading: false });
            })
    }

    componentDidMount() {
        this.focusRef.current && this.focusRef.current.focus();
    }

    onChange() {
        this.props.onChange({
            type:                this.state.type,
            host:                this.state.host,
            port:                parseInt(this.state.port, 10),
            noFileCache:         this.state.noFileCache,
            connectTimeout:      parseInt(this.state.connectTimeout, 10),
            writeFileInterval:   parseInt(this.state.writeFileInterval, 10),
            dataDir:             this.state.dataDir,
            options: {
                auth_pass:       this.state.options_auth_pass || null,
                retry_max_delay: parseInt(this.state.options_retry_max_delay, 10),
                retry_max_count: parseInt(this.state.options_retry_max_count, 10),
                db:              parseInt(this.state.options_db, 10),
                family:          parseInt(this.state.options_family, 10),
            },
            backup: {
                disabled:        this.state.backup_disabled,
                files:           parseInt(this.state.backup_files, 10),
                hours:           parseInt(this.state.backup_hours, 10),
                period:          parseInt(this.state.backup_period, 10),
                path:            this.state.backup_path,
            },
        });
    }

    renderWarning() {
        if (this.state.showWarningDialog) {
            return <DialogConfirm
                title={this.props.t('Please confirm')}
                text={this.props.t('switch_db_note')}
                onClose={result => {
                    if (result) {
                        let port;

                        if (this.state.toConfirmType === 'redis') {
                            port = 6379;
                        } else {
                            port = 9000;
                        }
                        this.setState({type: this.state.toConfirmType, showWarningDialog: false, port},
                            () => this.onChange());
                    } else {
                        this.setState({showWarningDialog: false});
                    }
                }}
            />
        } else {
            return null;
        }
    }

    render() {
        return <Paper className={ this.props.classes.paper }>
            {this.renderWarning()}
            <Grid item className={ this.props.classes.gridSettings }>
                <Grid container direction="column">
                    <Grid item>
                        <FormControl className={this.props.classes.controlItem}>
                            <InputLabel>{ this.props.t('Type') }</InputLabel>
                            <Select
                                value={ this.state.type }
                                onChange={ e => {
                                    if (e.target.value !== this.state.originalDBType) {
                                        this.setState({ toConfirmType: e.target.value, showWarningDialog: true });
                                    } else {
                                        let port;

                                        if (e.target.value === 'redis') {
                                            port = 6379;
                                        } else {
                                            port = 9000;
                                        }
                                        this.setState({type: e.target.value, port},
                                            () => this.onChange());
                                    }
                                }}
                            >
                                <MenuItem value="file">{ this.props.t('File') }</MenuItem>
                                <MenuItem value="redis">Redis</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={this.state.textIP}
                                    onChange={e => this.setState({ textIP: e.target.checked })}
                                />
                            }
                            label={this.props.t('IP is domain or more than one address')}
                        />
                    </Grid>
                    <Grid item>
                        {this.state.textIP ?
                            <TextField
                                className={this.props.classes.controlItem}
                                value={this.state.host}
                                type="text"
                                onChange={e => this.setState({host: e.target.value}, () => this.onChange())}
                                label={this.props.t('Bind IP address')}
                                helperText={this.props.t('You can enter more than one address divided by comma')}
                            />
                            :
                            <FormControl className={this.props.classes.controlItem}>
                                <InputLabel>{this.props.t('Bind IP address')}</InputLabel>
                                <Select
                                    value={this.state.host}
                                    onChange={e => this.setState({host: e.target.value}, () => this.onChange())}
                                >
                                    {this.state.IPs.map(ip => <MenuItem key={ip}
                                                                        value={ip}>{ip === '0.0.0.0' ? `0.0.0.0 [${this.props.t('All addresses')}]` : ip}</MenuItem>)}
                                </Select>
                            </FormControl>
                        }
                    </Grid>

                    <Grid item>
                        <TextField
                            className={ this.props.classes.controlItem }
                            value={ this.state.port }
                            type="number"
                            min={ 1 }
                            max={ 65535 }
                            onChange={ e => this.setState({ port: e.target.value }, () => this.onChange())}
                            label={ this.props.t('Port') }
                        />
                    </Grid>

                    { this.state.type === 'file' ? <Grid item>
                        <TextField
                            className={ this.props.classes.controlItem }
                            value={ this.state.dataDir }
                            helperText={ this.props.t('Optional. Always relative to iobroker.js-controller/') }
                            onChange={ e => this.setState({ dataDir: e.target.value }, () => this.onChange())}
                            label={ this.props.t('Directory path') }
                        />
                    </Grid> : null }

                    { this.state.type === 'file' ? <Grid item>
                        <TextField
                            className={ this.props.classes.controlItem }
                            value={ this.state.connectTimeout }
                            helperText={ this.props.t('ms') }
                            type="number"
                            min={ 200 }
                            onChange={ e => this.setState({ connectTimeout: e.target.value }, () => this.onChange())}
                            label={ this.props.t('Connect timeout') }
                        />
                    </Grid> : null }

                    { this.state.type === 'file' ? <Grid item>
                        <TextField
                            className={ this.props.classes.controlItem }
                            value={ this.state.writeFileInterval }
                            helperText={ this.props.t('How often the data from RAM will be saved on disk in ms') }
                            type="number"
                            min={ 200 }
                            onChange={ e => this.setState({ writeFileInterval: e.target.value }, () => this.onChange())}
                            label={ this.props.t('Store file interval') }
                        />
                    </Grid> : null }

                    <Grid item>
                        <TextField
                            className={ this.props.classes.controlItem }
                            value={ this.state.options_auth_pass }
                            type="password"
                            helperText={ this.props.t('Optional') }
                            inputProps={{
                                autoComplete: 'new-password',
                                form: {
                                    autoComplete: 'off',
                                },
                            }}
                            autoComplete="off"
                            onChange={ e => this.setState({ options_auth_pass: e.target.value })}
                            label={ this.state.type === 'redis' ? this.props.t('Redis password') : this.props.t('Connection password') }
                        />
                    </Grid>

                    { this.state.type === 'redis' ? <Grid item>
                        <TextField
                            className={ this.props.classes.controlItem }
                            value={ this.state.options_retry_max_delay }
                            type="number"
                            helperText={ this.props.t('Maximum delay between connection attempts') }
                            onChange={ e => this.setState({ options_retry_max_delay: e.target.value }, () => this.onChange())}
                            label={ this.props.t('Retry maximum delay') }
                        />
                    </Grid> : null }

                    { this.state.type === 'redis' ? <Grid item>
                        <TextField
                            className={ this.props.classes.controlItem }
                            value={ this.state.options_retry_max_count }
                            type="number"
                            helperText={ this.props.t('Maximum number of connection retries') }
                            onChange={ e => this.setState({ options_retry_max_count: e.target.value }, () => this.onChange())}
                            label={ this.props.t('Retry maximum count') }
                        />
                    </Grid> : null }

                    { this.state.type === 'redis' ? <Grid item>
                        <TextField
                            className={ this.props.classes.controlItem }
                            value={ this.state.options_db }
                            type="number"
                            helperText={ this.props.t('Used for sentinels') }
                            onChange={ e => this.setState({ options_db: e.target.value })}
                            label={ this.props.t('DB number') }
                        />
                    </Grid> : null }

                    { this.state.type === 'redis' ? <Grid item>
                        <FormControl className={this.props.classes.controlItem}>
                            <InputLabel>{ this.props.t('Family number') }</InputLabel>
                            <Select
                                value={ this.state.options_family }
                                onChange={ e => this.setState({ options_family: e.target.value}, () => this.onChange())}
                            >
                                <MenuItem value={0}>auto</MenuItem>
                                <MenuItem value={4}>IPv4</MenuItem>
                                <MenuItem value={6}>IPv6</MenuItem>
                            </Select>
                            <FormHelperText>{ this.props.t('Used for sentinels') }</FormHelperText>
                        </FormControl>
                    </Grid> : null }

                    { this.state.type === 'file' ? <Grid item>
                        <FormControlLabel
                            className={ this.props.classes.controlItem }
                            control={
                                <Checkbox
                                    checked={ this.state.backup_disabled }
                                    onChange={ e => this.setState( { backup_disabled: e.target.checked }, () => this.onChange()) }
                                />
                            }
                            label={ this.props.t(`No on-the-fly backup`) }
                        />
                        <div>{ this.props.t('By every write the backup of object.json will be created.') }</div>
                    </Grid> : null }

                    { this.state.type === 'file' && !this.state.backup_disabled ? <Grid item>
                        <TextField
                            className={ this.props.classes.controlItem }
                            value={ this.state.backup_files }
                            type="number"
                            helperText={ this.props.t('Minimal number of backup files, after the deletion will be executed according to the backup time settings') }
                            onChange={ e => this.setState({ backup_files: e.target.value }, () => this.onChange())}
                            label={ this.props.t('Number of files') }
                        />
                    </Grid> : null }

                    { this.state.type === 'file' && !this.state.backup_disabled ? <Grid item>
                        <TextField
                            className={ this.props.classes.controlItem }
                            value={ this.state.backup_hours }
                            type="number"
                            helperText={ this.props.t('All backups older than these hours will be deleted, but only if the number of files is greater than of the files number') }
                            onChange={ e => this.setState({ backup_hours: e.target.value }, () => this.onChange())}
                            label={ this.props.t('Backup hours') }
                        />
                    </Grid> : null }

                    { this.state.type === 'file' && !this.state.backup_disabled ? <Grid item>
                        <TextField
                            className={ this.props.classes.controlItem }
                            value={ this.state.backup_period }
                            type="number"
                            helperText={ this.props.t('By default the backup is every 2 hours. Time is in minutes. To disable backup set the value to 0') }
                            onChange={ e => this.setState({ backup_period: e.target.value }, () => this.onChange())}
                            label={ this.props.t('How often') }
                        />
                    </Grid> : null }

                    { this.state.type === 'file' && !this.state.backup_disabled ? <Grid item>
                    <TextField
                        className={ this.props.classes.controlItem }
                        value={ this.state.backup_path }
                        helperText={ this.props.t('Absolute path to backup directory or empty to backup in data directory. Leave it empty for default storage place.') }
                        onChange={ e => this.setState({ backup_path: e.target.value }, () => this.onChange())}
                        label={ this.props.t('Path') }
                    />
                </Grid> : null }
                </Grid>
            </Grid>
        </Paper>;
    }
}

BaseSettingsObjects.propTypes = {
    t: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    settings: PropTypes.object.isRequired,
    currentHost: PropTypes.string,
};

export default withWidth()(withStyles(styles)(BaseSettingsObjects));
