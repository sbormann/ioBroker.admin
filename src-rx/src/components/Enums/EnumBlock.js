import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import Color from 'color';

import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Icon from '@iobroker/adapter-react/Components/Icon';
import Tooltip from '@material-ui/core/Tooltip';

import IconButton from '@material-ui/core/IconButton';
import ListIcon from '@material-ui/icons/List';
import ClearIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import DownIcon from '@material-ui/icons/KeyboardArrowDown';
import UpIcon from '@material-ui/icons/KeyboardArrowUp';
import AddIcon from '@material-ui/icons/Add';
import IconChannel from '@iobroker/adapter-react/icons/IconChannel';
import IconDevice from '@iobroker/adapter-react/icons/IconDevice';
import IconState from '@iobroker/adapter-react/icons/IconState';


function EnumBlock(props) {
    const opacity = props.isDragging ? 0 : 1;

    let textColor = !props.enum || !props.enum.common || !props.enum.common.color || Color(props.enum.common.color).hsl().object().l > 50 ? '#000000' : '#FFFFFF';

    if (!props.enum.common.color) {
        textColor = null;
    }

    let style = { opacity, color: textColor };

    if (props.enum.common.color) {
        style.backgroundColor = props.enum.common.color;
    }

    return <Card
        style={ style }
        className={props.classes.enumGroupCard2}
    >
        <div className={props.classes.enumCardContent}>
            <div className={props.classes.right}>
                <IconButton
                    size="small"
                    onClick={() => {props.showEnumEditDialog(props.enum, false)}}
                >
                    <Tooltip title={props.t('Edit')} placement="top">
                        <EditIcon style={{ color: textColor }} />
                    </Tooltip>
                </IconButton>
                <IconButton
                    size="small"
                    onClick={() => {props.copyEnum(props.enum._id)}}
                >
                    <Tooltip title={props.t('Clone')} placement="top">
                        <FileCopyIcon style={{ color: textColor }} />
                    </Tooltip>
                </IconButton>
                <IconButton
                    size="small"
                    onClick={() => {props.showEnumDeleteDialog(props.enum)}}
                    disabled={props.enum.common.dontDelete}
                >
                    <Tooltip title={props.t('Delete')} placement="top">
                        <DeleteIcon style={props.enum.common.dontDelete ? null : { color: textColor }} />
                    </Tooltip>
                </IconButton>
            </div>
            <CardContent>
                <Typography gutterBottom component="div" className={props.classes.enumGroupTitle}>
                    {
                        props.enum.common.icon ?
                            <Icon
                                className={ props.classes.icon }
                                src={props.enum.common.icon}
                            />
                            :
                            <ListIcon className={props.classes.icon} />
                    }
                    <div>
                        <div>
                            <span className={props.classes.enumGroupEnumName}>
                                {props.getName(props.enum.common.name)}
                            </span>
                            <span className={props.classes.enumGroupEnumID}>
                                {props.enum._id}
                            </span>
                        </div>
                        <span>
                        {
                            props.enum.common.desc !== '' ?
                                <div className={props.classes.enumName}>
                                    {props.getName(props.enum.common.desc)}
                                </div>
                                :
                                null
                        }
                        </span>
                    </div>
                </Typography>
                <div>
                    {props.enum?.common?.members ? props.enum.common.members.map(memberId => {
                        let member = props.members[memberId];
                        if (!member) {
                            return null;
                        }

                        const name = member.common?.name && props.getName(member.common?.name);

                        let icon = member.common?.icon;
                        if (!icon) {
                            // try to find by channel and device

                        }

                        return <Card
                            key={member._id}
                            title={name ? props.t('Name: %s', name) + '\nID: ' +  member._id : member._id}
                            variant="outlined"
                            className={props.classes.enumGroupMember}
                            style={{ color: textColor, borderColor: textColor + '40' }}
                        >
                            {
                                icon ?
                                    <Icon
                                        className={ props.classes.icon }
                                        src={member.common.icon}
                                    />
                                    :
                                    (member.type === 'state' ? <IconState className={props.classes.icon} />
                                    : (member.type === 'channel' ? <IconChannel className={props.classes.icon} />
                                        : member.type === 'device' ? <IconDevice className={props.classes.icon} /> : <ListIcon className={props.classes.icon} />
                                        )
                                    )
                                }
                            {name || member._id}
                            {name ? <div className={props.classes.secondLine}>{member._id}</div> : null}
                            <IconButton
                                size="small"
                                onClick={() => props.removeMemberFromEnum(member._id, props.enum._id)}
                            >
                                <Tooltip title={props.t('Remove')} placement="top">
                                    <ClearIcon style={{ color: textColor }} />
                                </Tooltip>
                            </IconButton>
                        </Card>
                    }) : null}
                </div>
            </CardContent>
        </div>
        <span style={{position: 'absolute', right: 0, bottom: 0}}>
            <IconButton
                size="small"
                onClick={() => {
                    if (['functions', 'rooms'].includes(props.currentCategory)) {
                        props.showEnumTemplateDialog(props.enum._id);
                    } else {
                        props.showEnumEditDialog(props.getEnumTemplate(props.enum._id), true);
                    }
                }}
            >
                <Tooltip title={props.t('Add child')} placement="top">
                    <AddIcon style={{ color: textColor }} />
                </Tooltip>
            </IconButton>
            {props.hasChildren ?
                <IconButton onClick={() => props.toggleEnum(props.enum._id)}>
                    <Tooltip title={props.closed ? props.t('Expand') : props.t('Collapse')} placement="top">
                    {props.closed ?
                        <DownIcon style={{ color: textColor }}/>
                    :
                        <UpIcon style={{ color: textColor }}/>
                    }
                    </Tooltip>
                </IconButton>
            : null}
        </span>
    </Card>;
}

const EnumBlockDrag = props => {
    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: ['object', 'enum'],
        drop: () => ({ enumId: props.enum._id }),
        canDrop: (item, monitor) => canMeDrop(monitor, props),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }), [props.enum.common.members]);

    const widthRef = useRef();

    const [{ isDragging }, dragRef, preview] = useDrag(
        {
            type: 'enum',
            item: () => {return {enumId: props.enum._id, preview: <div style={{width: widthRef.current.offsetWidth}}><EnumBlock {...props}/></div>}},
            end: (item, monitor) => {
                const dropResult = monitor.getDropResult();
                props.moveEnum(item.enumId, dropResult.enumId);
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
                handlerId: monitor.getHandlerId(),
            }),
        }
    );

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div ref={drop} style={{opacity: canDrop && isOver ? 0.5 : 1 }}>
        <div ref={dragRef}>
            <div ref={widthRef}>
                <EnumBlock isDragging={isDragging} widthRef={widthRef} {...props}/>
            </div>
        </div>
    </div>;
}

EnumBlockDrag.propTypes = {
    enum: PropTypes.object,
    members: PropTypes.object,
    moveEnum: PropTypes.func,
    removeMemberFromEnum: PropTypes.func,
    showEnumEditDialog: PropTypes.func,
    showEnumDeleteDialog: PropTypes.func,
    copyEnum: PropTypes.func,
    getName: PropTypes.func,
    hasChildren: PropTypes.bool,
    closed: PropTypes.bool,
    toggleEnum: PropTypes.func,
    showEnumTemplateDialog: PropTypes.func,
    currentCategory: PropTypes.string,
    classes: PropTypes.object,
    t: PropTypes.func,
    lang: PropTypes.string,
    socket: PropTypes.object,
};

export default EnumBlockDrag;

function canMeDrop(monitor, props ) {
    if (!monitor.getItem() || !monitor.getItem().data) {
        return true;
    }

    return props.enum.common.members ?
        !props.enum.common.members.includes(monitor.getItem().data.id)
        :
        true;
}