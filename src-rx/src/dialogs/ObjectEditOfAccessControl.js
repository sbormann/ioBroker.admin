import React, { useEffect, useState } from 'react';
import { Checkbox, FormControl, InputLabel, LinearProgress, MenuItem, Select, Switch } from '@material-ui/core';

import Icon from '@iobroker/adapter-react/Components/Icon';
import I18n from '@iobroker/adapter-react/i18n';

import Utils from '../components/Utils';
import CustomModal from '../components/CustomModal';

const readWriteArray = [
    {
        Owner: [
            { name: 'read', valueNum: 0x400, title: 'read owner' },
            { name: 'write', valueNum: 0x200, title: 'write owner' }
        ]
    },
    {
        Group: [
            { name: 'read', valueNum: 0x40, title: 'read group' },
            { name: 'write', valueNum: 0x20, title: 'write group' }
        ]
    },
    {
        Everyone: [
            { name: 'read', valueNum: 0x4, title: 'read everyone' },
            { name: 'write', valueNum: 0x2, title: 'write everyone' }
        ]
    },
];

const newValueAccessControl = (value, newValue, mask) => {
    value |= newValue & mask;
    value &= newValue | (~mask & 0xFFFF);
    return value;
}

const ObjectRights = ({ value, disabled, setValue, t, differentValues, applyToChildren, mask, setMask }) => {
    useEffect(() => {
        if (applyToChildren) {
            let _checkDifferent = 0;
            for (let e = 0; e < differentValues.length; e++) {
                _checkDifferent |= value ^ differentValues[e];
            }
            setMask(_checkDifferent);
        } else {
            setMask(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [differentValues, applyToChildren]);

    let newSelected = value;

    return <div style={{
        display: 'flex',
        width: 'fit-content',
        margin: 20,
        border: '1px solid',
        borderLeft: 0
    }}>
        {readWriteArray.map(el => {
            const name = Object.keys(el)[0];
            return <div style={{
                width: 150,
                height: 150,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderLeft: '1px solid'
            }} key={name} >
                <div style={{
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 18,
                    borderBottom: '1px solid silver',
                    width: '100%',
                    justifyContent: 'center'
                }}>{t(name)}</div>
                <div style={{
                    display: 'flex',
                    width: '100%'
                }}>
                    {el[name].map((obj, idx) => {
                        let bool = false;
                        if (newSelected - obj.valueNum >= 0) {
                            newSelected = newSelected - obj.valueNum;
                            bool = true;
                        }
                        return <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            flex: 1,
                            alignItems: 'center',
                            borderRight: idx === 0 ? '1px solid' : 0
                        }} key={obj.valueNum}>
                            <div style={{
                                height: 50,
                                borderBottom: '1px solid',
                                width: '100%',
                                justifyContent: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                color: 'silver'
                            }}>{t(obj.name)}</div>
                            <div style={{ height: 50, display: 'flex' }}>
                                <Checkbox
                                    disabled={disabled}
                                    checked={bool}
                                    color={mask & obj.valueNum ? 'primary' : 'secondary'}
                                    indeterminate={!!(mask & obj.valueNum)}
                                    style={mask & obj.valueNum ? { opacity: 0.5 } : null}
                                    onChange={e => {
                                        if (mask & obj.valueNum) {
                                            mask &= (~obj.valueNum) & 0xFFFF;
                                            setMask(mask);
                                        }
                                        let newValue = value;
                                        if (!e.target.checked) {
                                            newValue &= (~obj.valueNum) & 0xFFFF;
                                        } else {
                                            newValue |= obj.valueNum;
                                        }
                                        setValue(newValue);
                                    }}
                                />
                            </div>
                        </div>
                    })}
                </div>
            </div>
        })}
    </div>;
}

const ObjectEditOfAccessControl = ({ onClose, onApply, open, selected, extendObject, objects, t, modalEmptyId, themeType }) => {
    const [stateOwnerUser, setStateOwnerUser] = useState(null);
    const [stateOwnerGroup, setStateOwnerGroup] = useState(null);
    const [ownerUsers, setOwnerUsers] = useState([]);
    const [ownerGroups, setOwnerGroups] = useState([]);
    const [applyToChildren, setApplyToChildren] = useState(false);
    const [checkState, setCheckState] = useState(false);
    const [childrenCount, setChildrenCount] = useState(0);
    const [valueObjectAccessControl, setValueObjectAccessControl] = useState(null);
    const [valueStateAccessControl, setValueStateAccessControl] = useState(null);
    const [differentOwner, setDifferentOwner] = useState(false);
    const [differentGroup, setDifferentGroup] = useState(false);
    const [differentState, setDifferentState] = useState([]);
    const [differentObject, setDifferentObject] = useState([]);
    const [maskState, setMaskState] = useState(0);
    const [maskObject, setMaskObject] = useState(0);
    const [ids, setIds] = useState([]);
    const [progress, setProgress] = useState(false);

    const [disabledButton, setDisabledButton] = useState(true);

    const different = t('different');

    useEffect(() => {
        let count = 0
        let _differentState = [];
        let _differentObject = [];

        let id = selected || modalEmptyId;
        let idWithDot = id + '.';
        const keys = Object.keys(objects).sort();
        let _checkState = false;
        let groups = [];
        let users = [];
        const lang = I18n.getLanguage();

        let _differentOwner = false;
        let _differentGroup = false;
        let _stateOwnerUser = null;
        let _stateOwnerGroup = null;
        let _valueObjectAccessControl = null;
        let _valueStateAccessControl = null;
        const _ids = [];

        for (let k = 0; k < keys.length; k++) {
            const key = keys[k];
            const obj = objects[key];
            if (obj && (key === id || key.startsWith(idWithDot))) {
                count++;
                _ids.push(key);
                if (!obj.acl) {
                    continue;
                }

                if (_valueObjectAccessControl === null && obj.acl.object !== undefined) {
                    _valueObjectAccessControl = obj.acl.object;
                }
                if (_valueStateAccessControl === null && obj.acl.state !== undefined) {
                    _valueStateAccessControl = obj.acl.state;
                }
                if (_stateOwnerUser === null && obj.acl.owner !== undefined) {
                    _stateOwnerUser = obj.acl.owner;
                }
                if (_stateOwnerGroup === null && obj.acl.ownerGroup !== undefined) {
                    _stateOwnerGroup = obj.acl.ownerGroup;
                }

                if (!differentOwner && _stateOwnerUser !== obj.acl.owner && obj.acl.owner !== undefined) {
                    _differentOwner = true;
                }
                if (!differentGroup && _stateOwnerGroup !== obj.acl.ownerGroup && obj.acl.ownerGroup !== undefined) {
                    _differentGroup = true;
                }
                if (obj.acl.state !== undefined && _valueStateAccessControl !== obj.acl.state && !_differentState.includes(obj.acl.state)) {
                    _differentState.push(obj.acl.state);
                }
                if (obj.acl.object !== undefined && _valueObjectAccessControl !== obj.acl.object && !_differentObject.includes(obj.acl.object)) {
                    _differentObject.push(obj.acl.object);
                }
                if (obj.type === 'state') {
                    _checkState = true;
                }
            }

            if (key.startsWith('system.group.') && obj?.type === 'group') {
                groups.push({
                    name: Utils.getObjectNameFromObj(obj, lang).replace('system.group.', ''),
                    value: key,
                    icon: obj.common?.icon,
                    color: obj.common?.color,
                });
            } else
                if (key.startsWith('system.user.') && obj?.type === 'user') {
                    users.push({
                        name: Utils.getObjectNameFromObj(obj, lang).replace('system.user.', ''),
                        value: key,
                        icon: obj.common?.icon,
                        color: obj.common?.color,
                    });
                }
        }

        _stateOwnerUser = _stateOwnerUser || objects['system.config'].common.defaultNewAcl.owner;
        _stateOwnerGroup = _stateOwnerGroup || objects['system.config'].common.defaultNewAcl.ownerGroup;
        _valueObjectAccessControl = _valueObjectAccessControl || objects['system.config'].common.defaultNewAcl.object;
        setValueObjectAccessControl(isNaN(_valueObjectAccessControl) ? objects['system.config'].common.defaultNewAcl.object : _valueObjectAccessControl);

        if (_checkState) {
            _valueStateAccessControl = _valueStateAccessControl || objects['system.config'].common.defaultNewAcl.state;
            setValueStateAccessControl(isNaN(_valueStateAccessControl) ? objects['system.config'].common.defaultNewAcl.state : _valueStateAccessControl);
        }

        const userItem = users.find(item => item.value === _stateOwnerUser);
        const groupItem = groups.find(item => item.value === _stateOwnerGroup);

        setStateOwnerUser(userItem);
        setStateOwnerGroup(groupItem);

        setDifferentOwner(_differentOwner);
        setDifferentGroup(_differentGroup);

        setOwnerUsers(users);
        setOwnerGroups(groups);

        _checkState && setCheckState(true);
        modalEmptyId && setApplyToChildren(true);
        setChildrenCount(count);

        setDifferentState(_differentState);
        setDifferentObject(_differentObject);

        setIds(_ids);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [objects, selected]);

    useEffect(() => {
        if (applyToChildren) {
            if (differentGroup) {
                stateOwnerGroup.value !== 'different' && setStateOwnerGroup({ name: different, value: 'different' });
                if (!ownerGroups.find(item => item.value === 'different')) {
                    setOwnerGroups(el => ([{
                        name: different,
                        value: 'different'
                    }, ...el]));
                }
            }

            if (differentOwner) {
                stateOwnerUser.value !== 'different' && setStateOwnerUser({ name: different, value: 'different' });
                if (!ownerUsers.find(item => item.value === 'different')) {
                    setOwnerUsers(el => ([{
                        name: different,
                        value: 'different'
                    }, ...el]));
                }
            }
        } else {
            if (stateOwnerUser && stateOwnerUser.value === 'different') {
                setStateOwnerUser(objects[selected].acl.owner);
            }
            if (stateOwnerGroup && stateOwnerGroup.value === 'different') {
                setStateOwnerGroup(objects[selected].acl.ownerGroup);
            }
            // remove different from list
            setOwnerGroups(el => el.filter(({ value }) => value !== 'different'));
            setOwnerUsers(el => el.filter(({ value }) => value !== 'different'));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applyToChildren, stateOwnerUser, stateOwnerGroup, differentOwner, differentGroup]);

    if (!ids.length) {
        return <LinearProgress />;
    } else {
        return <CustomModal
            open={open}
            titleButtonApply="apply"
            overflowHidden
            applyDisabled={disabledButton}
            progress={progress}
            onClose={onClose}
            onApply={() => {
                setProgress(true);
                setTimeout(async () => {
                    if (!applyToChildren) {
                        let newAcl = JSON.parse(JSON.stringify(objects[selected].acl || {}));
                        newAcl.object = valueObjectAccessControl;
                        newAcl.owner = stateOwnerUser.value;
                        newAcl.ownerGroup = stateOwnerGroup.value;

                        if (objects[selected].type === 'state') {
                            newAcl.state = valueStateAccessControl;
                        }
                        extendObject(selected, { acl: newAcl });
                    }
                    else {
                        //let maskState = Object.keys(differentHexState).reduce((sum, key) => sum | (differentHexState[key] ? parseInt(key, 16) : 0), 0);
                        let _maskState = ~maskState & 0xFFFF;

                        //let maskObject = Object.keys(differentHexObject).reduce((sum, key) => sum | (differentHexObject[key] ? parseInt(key, 16) : 0), 0);
                        let _maskObject = ~maskObject & 0xFFFF;

                        for (let i = 0; i < ids.length; i++) {
                            const key = ids[i];
                            const obj = objects[key];
                            let newAcl = JSON.parse(JSON.stringify(obj.acl || {}));
                            newAcl.object = newValueAccessControl(obj.acl.object, valueObjectAccessControl, _maskState);
                            if (stateOwnerUser.value !== 'different') {
                                newAcl.owner = stateOwnerUser.value;
                            }
                            if (stateOwnerGroup.value !== 'different') {
                                newAcl.ownerGroup = stateOwnerGroup.value;
                            }
                            if (obj.type === 'state') {
                                newAcl.state = newValueAccessControl(obj.acl.state, valueStateAccessControl, _maskObject);
                            }
                            await extendObject(key, { acl: newAcl });
                        }
                    }

                    setProgress(false);
                    onApply();
                }, 200);
            }}>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{
                    margin: 10,
                    fontSize: 20
                }}>{t('Access control list: %s', selected || modalEmptyId)}</div>
                <div style={{ display: 'flex' }}>
                    <FormControl fullWidth style={{ marginRight: 10 }}>
                        <InputLabel>{t('Owner user')}</InputLabel>
                        <Select
                            disabled={progress}
                            value={stateOwnerUser.value}
                            renderValue={value => <span>{stateOwnerUser.icon ? <Icon src={stateOwnerUser.icon} style={{ width: 16, height: 16, marginRight: 8 }} /> : null}{stateOwnerUser.name}</span>}
                            style={stateOwnerUser.value === 'different' ? { opacity: 0.5 } : { color: stateOwnerUser.color || undefined, backgroundColor: Utils.getInvertedColor(stateOwnerUser.color, themeType) }}
                            onChange={el => {
                                const userItem = ownerUsers.find(item => item.value === el.target.value);
                                setStateOwnerUser(userItem);
                                setDisabledButton(false);
                            }}
                        >
                            {ownerUsers.map(el => <MenuItem style={el.value === 'different' ? { opacity: 0.5 } : { color: el.color || undefined, backgroundColor: Utils.getInvertedColor(el.color, themeType) }} key={el.value} value={el.value}>
                                {el.icon ? <Icon src={el.icon} style={{ width: 16, height: 16, marginRight: 8 }} /> : null}
                                {el.name}
                            </MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>{t('Owner group')}</InputLabel>
                        <Select
                            disabled={progress}
                            value={stateOwnerGroup.value}
                            renderValue={value => <span>{stateOwnerGroup.icon ? <Icon src={stateOwnerGroup.icon} style={{ width: 16, height: 16, marginRight: 8 }} /> : null}{stateOwnerGroup.name}</span>}
                            style={stateOwnerGroup.value === 'different' ? { opacity: 0.5 } : { color: stateOwnerGroup.color || undefined, backgroundColor: Utils.getInvertedColor(stateOwnerGroup.color, themeType) }}
                            onChange={el => {
                                const groupItem = ownerGroups.find(item => item.value === el.target.value);
                                setStateOwnerGroup(groupItem);
                                setDisabledButton(false);
                            }}
                        >
                            {ownerGroups.map(el => <MenuItem key={el.value} value={el.value} style={el.value === 'different' ? { opacity: 0.5 } : { color: el.color || undefined, backgroundColor: Utils.getInvertedColor(el.color, themeType) }}>
                                {el.icon ? <Icon src={el.icon} style={{ width: 16, height: 16, marginRight: 8 }} /> : null}
                                {el.name}
                            </MenuItem>)}
                        </Select>
                    </FormControl>
                </div>

                <div style={{
                    display: 'flex',
                    margin: 10,
                    alignItems: 'center',
                    fontSize: 10,
                    marginLeft: 0,
                    color: 'silver'
                }}>
                    <div style={!applyToChildren ? { color: 'green' } : null}>{t('to apply one item')}</div>
                    <Switch
                        disabled={progress || !!modalEmptyId || childrenCount === 1}
                        checked={!!modalEmptyId || applyToChildren}
                        onChange={e => {
                            setApplyToChildren(e.target.checked);
                            setDisabledButton(false);
                        }}
                        color="primary"
                    />
                    <div style={applyToChildren ? { color: 'green' } : null}>{t('to apply with children')} {(modalEmptyId || childrenCount > 1) ? `(${childrenCount} ${t('object(s)')})` : ''}</div>
                </div>

                {progress && <LinearProgress />}

                <div style={{ overflowY: 'auto' }}>
                    <div>
                        <h2>{t('Object rights')}</h2>
                        <ObjectRights
                            mask={maskObject}
                            disabled={progress}
                            setMask={setMaskObject}
                            applyToChildren={applyToChildren}
                            differentValues={differentObject}
                            t={t}
                            setValue={e => {
                                setValueObjectAccessControl(e);
                                setDisabledButton(false);
                            }}
                            value={valueObjectAccessControl} />
                    </div>
                    {checkState && <div>
                        <h2>{t('States rights')}</h2>
                        <ObjectRights
                            mask={maskState}
                            disabled={progress}
                            setMask={setMaskState}
                            applyToChildren={applyToChildren}
                            differentValues={applyToChildren ? differentState : []}
                            t={t}
                            setValue={e => {
                                setValueStateAccessControl(e);
                                setDisabledButton(false);
                            }}
                            value={valueStateAccessControl} />
                    </div>}
                </div>
            </div>
        </CustomModal>;
    }
}

export default ObjectEditOfAccessControl;